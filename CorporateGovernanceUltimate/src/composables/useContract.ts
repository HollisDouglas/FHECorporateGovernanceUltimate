import { ref, computed, watch } from 'vue'
import { ethers } from 'ethers'
import { useWallet } from './useWallet'
import { useFHEVM } from './useFHEVM'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/utils/constants'
import { toast } from '@/utils/toast'
import type { Proposal, ProposalType } from '@/types'

const contract = ref<ethers.Contract | null>(null)
const contractState = ref({
  isInitialized: false,
  companyName: '',
  totalShares: 0,
  totalProposals: 0
})
const proposals = ref<Proposal[]>([])
const isLoading = ref(false)

export function useContract() {
  const { walletState, signer } = useWallet()
  const { fhevmInstance, isInitialized: fhevmInitialized, encryptVote } = useFHEVM()

  function initContract() {
    if (!signer.value) {
      contract.value = null
      return
    }

    contract.value = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer.value
    )
  }

  async function loadContractState() {
    if (!contract.value) return

    try {
      isLoading.value = true

      const [initialized, name, shares, totalProposals] = await Promise.all([
        contract.value.initialized().catch(() => false),
        contract.value.companyName().catch(() => 'CorporateDAO'),
        contract.value.totalShares().catch(() => 0n),
        contract.value.getTotalProposals().catch(() => 0n)
      ])

      contractState.value = {
        isInitialized: initialized,
        companyName: name,
        totalShares: Number(shares),
        totalProposals: Number(totalProposals)
      }
    } catch (error: any) {
      console.error('Error loading contract state:', error)
      toast.error('Failed to load contract state')
    } finally {
      isLoading.value = false
    }
  }

  async function loadProposals() {
    if (!contract.value || contractState.value.totalProposals === 0) return

    try {
      isLoading.value = true
      const proposalPromises: Promise<Proposal | null>[] = []

      for (let i = 1; i <= contractState.value.totalProposals; i++) {
        proposalPromises.push(loadSingleProposal(i))
      }

      const loadedProposals = await Promise.all(proposalPromises)
      proposals.value = loadedProposals.filter(p => p !== null) as Proposal[]
    } catch (error: any) {
      console.error('Error loading proposals:', error)
      toast.error('Failed to load proposals')
    } finally {
      isLoading.value = false
    }
  }

  async function loadSingleProposal(id: number): Promise<Proposal | null> {
    if (!contract.value) return null

    try {
      const [startTime, proposalType, title, description, proposer, deadline, , active, executed] =
        await contract.value.getProposalInfo(id)

      return {
        id,
        proposalType: proposalType as ProposalType,
        title: title || `Proposal ${id}`,
        description: description || '',
        proposer,
        deadline: Number(deadline),
        startTime: Number(startTime),
        active,
        executed,
        forVotes: 0,
        againstVotes: 0,
        threshold: 50
      }
    } catch (error) {
      console.error(`Error loading proposal ${id}:`, error)
      return null
    }
  }

  async function castVote(proposalId: number, choice: number, useEncryption = false): Promise<boolean> {
    if (!contract.value || !walletState.value.account) {
      toast.error('Please connect your wallet')
      return false
    }

    try {
      let toastId = ''

      if (useEncryption && fhevmInitialized.value) {
        toastId = toast.loading('Encrypting your vote with FHE...')
        try {
          await encryptVote(choice)
          toast.success('Vote encrypted successfully!', { id: toastId })
        } catch (encError) {
          console.warn('Encryption failed, using plain vote:', encError)
          toast.info('Using unencrypted vote', { id: toastId })
        }
      }

      toastId = toast.loading('Preparing transaction...', { id: toastId })

      try {
        const [isRegistered] = await contract.value.getShareholderInfo(walletState.value.account)
        if (!isRegistered) {
          toast.error('You are not a registered shareholder', { id: toastId })
          return false
        }
      } catch (error) {
        console.warn('Could not verify shareholder status')
      }

      let gasEstimate = 200000n
      try {
        const estimate = await contract.value.vote.estimateGas(proposalId, choice)
        gasEstimate = BigInt(estimate.toString())
      } catch (error) {
        console.error('Gas estimation failed:', error)
      }

      const gasLimit = (gasEstimate * 120n) / 100n

      toast.loading('Please confirm transaction in MetaMask...', { id: toastId })

      const tx = await contract.value.vote(proposalId, choice, {
        gasLimit: gasLimit.toString()
      })

      toast.loading(`Transaction sent: ${tx.hash.slice(0, 10)}...`, { id: toastId })

      const receipt = await tx.wait()

      if (receipt.status === 1) {
        toast.success('Vote cast successfully!', { id: toastId })
        await loadProposals()
        return true
      } else {
        toast.error('Transaction failed', { id: toastId })
        return false
      }
    } catch (error: any) {
      console.error('Voting error:', error)

      let errorMessage = 'Transaction failed'
      if (error.code === 4001) {
        errorMessage = 'User rejected transaction'
      } else if (error.reason) {
        errorMessage = error.reason
      } else if (error.message) {
        errorMessage = error.message
      }

      toast.error(errorMessage)
      return false
    }
  }

  async function createProposal(
    proposalType: number,
    title: string,
    durationDays: number = 7
  ): Promise<boolean> {
    if (!contract.value || !walletState.value.account) {
      toast.error('Please connect your wallet')
      return false
    }

    try {
      const toastId = toast.loading('Creating proposal...')

      try {
        const isBoardMember = await contract.value.isBoardMember(walletState.value.account)
        if (!isBoardMember) {
          toast.error('Only board members can create proposals', { id: toastId })
          return false
        }
      } catch (error) {
        console.warn('Could not verify board member status')
      }

      let gasEstimate = 300000n
      try {
        const estimate = await contract.value.createProposal.estimateGas(
          proposalType,
          title,
          durationDays
        )
        gasEstimate = BigInt(estimate.toString())
      } catch (error) {
        console.error('Gas estimation failed:', error)
      }

      const gasLimit = (gasEstimate * 120n) / 100n

      toast.loading('Please confirm transaction in MetaMask...', { id: toastId })

      const tx = await contract.value.createProposal(proposalType, title, durationDays, {
        gasLimit: gasLimit.toString()
      })

      toast.loading(`Transaction sent: ${tx.hash.slice(0, 10)}...`, { id: toastId })

      const receipt = await tx.wait()

      if (receipt.status === 1) {
        toast.success('Proposal created successfully!', { id: toastId })
        await loadContractState()
        await loadProposals()
        return true
      } else {
        toast.error('Transaction failed', { id: toastId })
        return false
      }
    } catch (error: any) {
      console.error('Create proposal error:', error)

      let errorMessage = 'Failed to create proposal'
      if (error.code === 4001) {
        errorMessage = 'User rejected transaction'
      } else if (error.reason) {
        errorMessage = error.reason
      }

      toast.error(errorMessage)
      return false
    }
  }

  watch(
    () => walletState.value.isConnected,
    (connected) => {
      if (connected) {
        initContract()
        loadContractState()
      } else {
        contract.value = null
      }
    },
    { immediate: true }
  )

  watch(
    () => contractState.value.totalProposals,
    (total) => {
      if (total > 0) {
        loadProposals()
      }
    }
  )

  return {
    contract: computed(() => contract.value),
    contractState: computed(() => contractState.value),
    proposals: computed(() => proposals.value),
    isLoading: computed(() => isLoading.value),
    activeProposals: computed(() => proposals.value.filter(p => p.active && !p.executed)),
    completedProposals: computed(() => proposals.value.filter(p => !p.active || p.executed)),
    fhevmAvailable: computed(() => fhevmInitialized.value),
    loadContractState,
    loadProposals,
    castVote,
    createProposal
  }
}
