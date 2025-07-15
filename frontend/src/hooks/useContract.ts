import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWeb3 } from '@/providers/Web3Provider'
import toast from 'react-hot-toast'

export interface OnChainProposal {
  id: number
  proposalType: number
  title: string
  description: string
  proposer: string
  deadline: number
  startTime: number
  active: boolean
  executed: boolean
  forVotes: number
  againstVotes: number
}

export interface ContractState {
  isInitialized: boolean
  companyName: string
  totalShares: number
  totalProposals: number
}

export const useContract = () => {
  const { wallet, contract } = useWeb3()
  const [contractState, setContractState] = useState<ContractState>({
    isInitialized: false,
    companyName: '',
    totalShares: 0,
    totalProposals: 0
  })
  const [proposals, setProposals] = useState<OnChainProposal[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load contract state
  const loadContractState = useCallback(async () => {
    if (!contract.contract) return

    try {
      setLoading(true)
      setError(null)

      const [initialized, name, shares, totalProposals] = await Promise.all([
        contract.contract.initialized().catch(() => false),
        contract.contract.companyName().catch(() => 'CorporateDAO'),
        contract.contract.totalShares().catch(() => ethers.getBigInt(0)),
        contract.contract.getTotalProposals().catch(() => ethers.getBigInt(0))
      ])

      setContractState({
        isInitialized: initialized,
        companyName: name,
        totalShares: Number(shares),
        totalProposals: Number(totalProposals)
      })

    } catch (error: any) {
      console.error('Error loading contract state:', error)
      setError(`Failed to load contract state: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }, [contract.contract])

  // Load all proposals
  const loadProposals = useCallback(async () => {
    if (!contract.contract || contractState.totalProposals === 0) return

    try {
      setLoading(true)
      const proposalPromises = []

      for (let i = 1; i <= contractState.totalProposals; i++) {
        proposalPromises.push(loadSingleProposal(i))
      }

      const loadedProposals = await Promise.all(proposalPromises)
      const validProposals = loadedProposals.filter(p => p !== null) as OnChainProposal[]
      
      setProposals(validProposals)
    } catch (error: any) {
      console.error('Error loading proposals:', error)
      setError(`Failed to load proposals: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }, [contract.contract, contractState.totalProposals])

  // Load single proposal
  const loadSingleProposal = useCallback(async (id: number): Promise<OnChainProposal | null> => {
    if (!contract.contract) return null

    try {
      // Get proposal info
      const [startTime, proposalType, title, description, proposer, deadline, , active, executed, forVotes, againstVotes] = 
        await contract.contract.getProposalInfo(id)

      return {
        id,
        proposalType: proposalType,
        title: title || `Proposal ${id}`,
        description: description || `Description for proposal ${id}`,
        proposer,
        deadline: Number(deadline),
        startTime: Number(startTime),
        active,
        executed,
        forVotes: Number(forVotes),
        againstVotes: Number(againstVotes)
      }
    } catch (error) {
      console.error(`Error loading proposal ${id}:`, error)
      return null
    }
  }, [contract.contract])

  // Cast vote on blockchain
  const castVote = useCallback(async (proposalId: number, choice: number): Promise<boolean> => {
    if (!contract.contract || !wallet.account) {
      toast.error('Please connect your wallet')
      return false
    }

    try {
      // Show loading toast
      const loadingToastId = toast.loading('Preparing transaction...')

      // Check if user is registered shareholder (optional for testing)
      try {
        const [isRegistered] = await contract.contract.getShareholderInfo(wallet.account)
        if (!isRegistered) {
          toast.error('You are not a registered shareholder. Please register first or use the registration button.', { id: loadingToastId })
          return false
        }
      } catch (error) {
        console.warn('Could not verify shareholder status, proceeding with vote anyway for testing')
        // Continue with vote even if registration check fails (for testing)
      }

      // Estimate gas - use the contract method directly
      let gasEstimate: bigint = 200000n
      try {
        const estimate = await contract.contract.vote.estimateGas(proposalId, choice)
        gasEstimate = BigInt(estimate.toString())
        console.log('Gas estimate:', gasEstimate.toString())
      } catch (error: any) {
        console.error('Gas estimation failed:', error)
        console.log('Using default gas limit:', gasEstimate.toString())
      }

      // Prepare transaction - add 20% buffer
      const gasLimit = (gasEstimate * 120n) / 100n
      
      toast.loading('Please confirm transaction in MetaMask...', { id: loadingToastId })

      // Send transaction
      const tx = await contract.contract.vote(proposalId, choice, {
        gasLimit: gasLimit.toString(),
        // gasPrice can be estimated by the wallet
      })

      toast.loading(`Transaction sent: ${tx.hash}`, { id: loadingToastId })

      // Wait for confirmation
      const receipt = await tx.wait()
      
      if (receipt.status === 1) {
        toast.success(`Vote cast successfully! Block: ${receipt.blockNumber}`, { id: loadingToastId })
        
        // Reload proposals to get updated vote counts
        await loadProposals()
        
        return true
      } else {
        toast.error('Transaction failed', { id: loadingToastId })
        return false
      }

    } catch (error: any) {
      console.error('Voting error:', error)
      
      let errorMessage = 'Transaction failed'
      
      if (error.code === 4001) {
        errorMessage = 'User rejected transaction'
      } else if (error.code === -32603) {
        errorMessage = 'Internal JSON-RPC error'
      } else if (error.reason) {
        errorMessage = error.reason
      } else if (error.message) {
        errorMessage = error.message
      }

      toast.error(errorMessage)
      return false
    }
  }, [contract.contract, wallet.account, loadProposals])

  // Create new proposal (for board members)
  const createProposal = useCallback(async (
    proposalType: number,
    title: string,
    durationDays: number = 7
  ): Promise<boolean> => {
    if (!contract.contract || !wallet.account) {
      toast.error('Please connect your wallet')
      return false
    }

    try {
      const loadingToastId = toast.loading('Creating proposal...')

      // Check if user is board member
      try {
        const isBoardMember = await contract.contract.isBoardMember(wallet.account)
        if (!isBoardMember) {
          toast.error('Only board members can create proposals', { id: loadingToastId })
          return false
        }
      } catch (error) {
        console.warn('Could not verify board member status')
      }

      // Estimate gas
      let gasEstimate: bigint = 300000n
      try {
        const estimate = await contract.contract.createProposal.estimateGas(
          proposalType,
          title,
          durationDays
        )
        gasEstimate = BigInt(estimate.toString())
      } catch (error: any) {
        console.error('Gas estimation failed for createProposal:', error)
      }

      const gasLimit = (gasEstimate * 120n) / 100n

      toast.loading('Please confirm transaction in MetaMask...', { id: loadingToastId })

      // Send transaction
      const tx = await contract.contract.createProposal(proposalType, title, durationDays, {
        gasLimit: gasLimit.toString()
      })

      toast.loading(`Transaction sent: ${tx.hash}`, { id: loadingToastId })

      const receipt = await tx.wait()

      if (receipt.status === 1) {
        toast.success(`Proposal created successfully! Block: ${receipt.blockNumber}`, { id: loadingToastId })
        
        // Reload contract state and proposals
        await loadContractState()
        await loadProposals()
        
        return true
      } else {
        toast.error('Transaction failed', { id: loadingToastId })
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
  }, [contract.contract, wallet.account, loadContractState, loadProposals])

  // Check if user has voted on a proposal
  const hasUserVoted = useCallback(async (): Promise<boolean> => {
    if (!contract.contract || !wallet.account) return false

    try {
      // This would require a mapping in the contract to track votes
      // For now, we'll return false and let the user attempt to vote
      return false
    } catch (error) {
      console.error('Error checking vote status:', error)
      return false
    }
  }, [contract.contract, wallet.account])

  // Load data when contract becomes available
  useEffect(() => {
    if (contract.contract && wallet.isConnected) {
      loadContractState()
    }
  }, [contract.contract, wallet.isConnected, loadContractState])

  // Load proposals when contract state is loaded
  useEffect(() => {
    if (contractState.totalProposals > 0) {
      loadProposals()
    }
  }, [contractState.totalProposals, loadProposals])

  return {
    contractState,
    proposals,
    loading,
    error,
    loadContractState,
    loadProposals,
    castVote,
    createProposal,
    hasUserVoted,
    // Helper functions
    getActiveProposals: () => proposals.filter(p => p.active && !p.executed),
    getCompletedProposals: () => proposals.filter(p => !p.active || p.executed),
  }
}