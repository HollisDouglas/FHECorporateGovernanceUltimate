import { ref, computed, onMounted } from 'vue'
import { ethers } from 'ethers'
import type { WalletState } from '@/types'
import { SEPOLIA_CONFIG } from '@/utils/constants'
import { toast } from '@/utils/toast'

const walletState = ref<WalletState>({
  account: null,
  chainId: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  balance: null
})

let provider: ethers.BrowserProvider | null = null
let signer: ethers.JsonRpcSigner | null = null

export function useWallet() {
  const isMetaMaskInstalled = computed(() => {
    return typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined'
  })

  const isCorrectNetwork = computed(() => {
    return walletState.value.chainId === SEPOLIA_CONFIG.chainId
  })

  async function initProvider() {
    if (!isMetaMaskInstalled.value) {
      throw new Error('MetaMask is not installed')
    }

    provider = new ethers.BrowserProvider((window as any).ethereum)
    return provider
  }

  async function updateBalance() {
    if (!provider || !walletState.value.account) return

    try {
      const balance = await provider.getBalance(walletState.value.account)
      walletState.value.balance = ethers.formatEther(balance)
    } catch (error) {
      console.error('Failed to update balance:', error)
    }
  }

  async function connectWallet() {
    if (walletState.value.isConnecting) return

    try {
      walletState.value.isConnecting = true
      walletState.value.error = null

      if (!isMetaMaskInstalled.value) {
        throw new Error('Please install MetaMask to continue')
      }

      const currentProvider = await initProvider()
      const accounts = await currentProvider.send('eth_requestAccounts', [])

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found')
      }

      const network = await currentProvider.getNetwork()
      const account = accounts[0]

      walletState.value.account = account
      walletState.value.chainId = Number(network.chainId)
      walletState.value.isConnected = true

      signer = await currentProvider.getSigner()

      await updateBalance()

      if (!isCorrectNetwork.value) {
        toast.info('Please switch to Sepolia network')
      } else {
        toast.success('Wallet connected successfully')
      }

      setupEventListeners()
    } catch (error: any) {
      console.error('Failed to connect wallet:', error)
      walletState.value.error = error.message
      toast.error(error.message || 'Failed to connect wallet')
    } finally {
      walletState.value.isConnecting = false
    }
  }

  async function disconnectWallet() {
    walletState.value.account = null
    walletState.value.chainId = null
    walletState.value.isConnected = false
    walletState.value.balance = null
    provider = null
    signer = null
    toast.info('Wallet disconnected')
  }

  async function switchToSepolia() {
    if (!provider) return

    try {
      await provider.send('wallet_switchEthereumChain', [
        { chainId: `0x${SEPOLIA_CONFIG.chainId.toString(16)}` }
      ])
      toast.success('Switched to Sepolia network')
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await provider.send('wallet_addEthereumChain', [{
            chainId: `0x${SEPOLIA_CONFIG.chainId.toString(16)}`,
            chainName: SEPOLIA_CONFIG.name,
            nativeCurrency: SEPOLIA_CONFIG.nativeCurrency,
            rpcUrls: [SEPOLIA_CONFIG.rpcUrl],
            blockExplorerUrls: [SEPOLIA_CONFIG.blockExplorer]
          }])
          toast.success('Sepolia network added')
        } catch (addError: any) {
          console.error('Failed to add network:', addError)
          toast.error('Failed to add Sepolia network')
        }
      } else {
        console.error('Failed to switch network:', error)
        toast.error('Failed to switch network')
      }
    }
  }

  function setupEventListeners() {
    if (!isMetaMaskInstalled.value) return

    const ethereum = (window as any).ethereum

    ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else {
        walletState.value.account = accounts[0]
        updateBalance()
      }
    })

    ethereum.on('chainChanged', (chainId: string) => {
      walletState.value.chainId = parseInt(chainId, 16)
      window.location.reload()
    })

    ethereum.on('disconnect', () => {
      disconnectWallet()
    })
  }

  async function checkConnection() {
    if (!isMetaMaskInstalled.value) return

    try {
      const currentProvider = await initProvider()
      const accounts = await currentProvider.send('eth_accounts', [])

      if (accounts && accounts.length > 0) {
        const network = await currentProvider.getNetwork()
        walletState.value.account = accounts[0]
        walletState.value.chainId = Number(network.chainId)
        walletState.value.isConnected = true
        signer = await currentProvider.getSigner()
        await updateBalance()
        setupEventListeners()
      }
    } catch (error) {
      console.error('Failed to check connection:', error)
    }
  }

  onMounted(() => {
    checkConnection()
  })

  return {
    walletState: computed(() => walletState.value),
    provider: computed(() => provider),
    signer: computed(() => signer),
    isMetaMaskInstalled,
    isCorrectNetwork,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
    updateBalance
  }
}
