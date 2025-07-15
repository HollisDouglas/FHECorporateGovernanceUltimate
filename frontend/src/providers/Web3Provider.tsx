import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

import {
  WalletState,
  ContractState,
  Web3ProviderContext,
  Web3Error,
  Web3ErrorCode,
} from '@/types/web3'
import {
  isMetaMaskInstalled,
  getProvider,
  requestAccounts,
  getCurrentChainId,
  switchToSepolia,
  getBalance,
  handleMetaMaskError,
} from '@/utils/web3'
import { CONTRACT_ADDRESS, CONTRACT_ABI, SEPOLIA_CONFIG } from '@/utils/constants'

// Provider state type
interface Web3State {
  wallet: WalletState
  contract: ContractState
}

// Action type
type Web3Action =
  | { type: 'SET_CONNECTING'; payload: boolean }
  | { type: 'SET_WALLET'; payload: Partial<WalletState> }
  | { type: 'SET_CONTRACT'; payload: Partial<ContractState> }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET_WALLET' }

// Initial state
const initialState: Web3State = {
  wallet: {
    account: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    error: null,
    balance: null,
  },
  contract: {
    contract: null,
    isLoading: false,
    error: null,
  },
}

// Reducer
const web3Reducer = (state: Web3State, action: Web3Action): Web3State => {
  switch (action.type) {
    case 'SET_CONNECTING':
      return {
        ...state,
        wallet: { ...state.wallet, isConnecting: action.payload, error: null },
      }
    case 'SET_WALLET':
      return {
        ...state,
        wallet: { ...state.wallet, ...action.payload },
      }
    case 'SET_CONTRACT':
      return {
        ...state,
        contract: { ...state.contract, ...action.payload },
      }
    case 'SET_ERROR':
      return {
        ...state,
        wallet: { ...state.wallet, error: action.payload },
      }
    case 'RESET_WALLET':
      return {
        ...state,
        wallet: initialState.wallet,
        contract: initialState.contract,
      }
    default:
      return state
  }
}

// Context creation
const Web3Context = createContext<Web3ProviderContext | null>(null)

// Provider component properties
interface Web3ProviderProps {
  children: React.ReactNode
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(web3Reducer, initialState)

  // Initialize contract instance
  const initializeContract = useCallback(async (signer: ethers.Signer) => {
    try {
      dispatch({ type: 'SET_CONTRACT', payload: { isLoading: true, error: null } })
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      
      // Test contract connection
      try {
        await contract.companyName()
      } catch (error: any) {
        console.warn('Contract test call failed:', error.message)
        // Continue using contract, may be newly deployed contract
      }
      
      dispatch({
        type: 'SET_CONTRACT',
        payload: { contract, isLoading: false, error: null },
      })
    } catch (error: any) {
      const errorMessage = `Failed to initialize contract: ${error.message}`
      dispatch({
        type: 'SET_CONTRACT',
        payload: { contract: null, isLoading: false, error: errorMessage },
      })
      toast.error(errorMessage)
    }
  }, [])

  // Get balance
  const getWalletBalance = useCallback(async (): Promise<string> => {
    if (!state.wallet.account) {
      throw new Web3Error('Wallet not connected', Web3ErrorCode.NOT_AUTHORIZED)
    }
    
    try {
      const balance = await getBalance(state.wallet.account)
      dispatch({ type: 'SET_WALLET', payload: { balance } })
      return balance
    } catch (error: any) {
      const errorMessage = `Failed to get balance: ${error.message}`
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      throw new Web3Error(errorMessage, Web3ErrorCode.NETWORK_ERROR)
    }
  }, [state.wallet.account])

  // Connect wallet with 7-step process
  const connectWallet = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_CONNECTING', payload: true })

      // Step 1: Detection - Check window.ethereum (MetaMask provider)
      if (!isMetaMaskInstalled()) {
        const errorMessage = 'Please install MetaMask wallet'
        toast.error(errorMessage)
        dispatch({ type: 'SET_ERROR', payload: errorMessage })
        return
      }

      // Step 2: Request Access - Use eth_requestAccounts to get user permission
      const accounts = await requestAccounts()
      const account = accounts[0]

      // Step 3: Network Verification - Verify connection to Sepolia testnet (0xaa36a7)
      const chainId = await getCurrentChainId()
      const expectedChainId = SEPOLIA_CONFIG.chainId // 11155111 (0xaa36a7)

      // Step 4: Network Switching - Auto switch/add Sepolia if needed
      if (chainId !== expectedChainId) {
        try {
          await switchToSepolia()
          // Verify the switch was successful
          const newChainId = await getCurrentChainId()
          if (newChainId !== expectedChainId) {
            throw new Error('Failed to switch to Sepolia testnet')
          }
        } catch (switchError: any) {
          const errorMessage = 'Please manually switch to Sepolia testnet'
          toast.error(errorMessage)
          dispatch({ type: 'SET_ERROR', payload: errorMessage })
          return
        }
      }

      // Step 5: Provider Setup - Create ethers.js BrowserProvider and signer
      const provider = getProvider()
      if (!provider) {
        throw new Error('Failed to get provider')
      }
      const signer = await provider.getSigner()

      // Step 6: Contract Initialization - Create game contract instance
      await initializeContract(signer)

      // Step 7: State Update - Update React state with account and contract
      dispatch({
        type: 'SET_WALLET',
        payload: {
          account,
          chainId: expectedChainId,
          isConnected: true,
          isConnecting: false,
          error: null,
        },
      })

      // Get initial state - fetch balance
      try {
        const balance = await getBalance(account)
        dispatch({ type: 'SET_WALLET', payload: { balance } })
      } catch (balanceError) {
        console.warn('Failed to fetch balance:', balanceError)
      }

      // Success handling
      toast.success(`Connected to Sepolia! ✅`)
      
      // Save to local storage
      localStorage.setItem('lastConnectedAccount', account)
      
    } catch (error: any) {
      const web3Error = error instanceof Web3Error ? error : handleMetaMaskError(error)
      
      dispatch({
        type: 'SET_WALLET',
        payload: {
          isConnecting: false,
          error: web3Error.message,
        },
      })
      
      toast.error(web3Error.message)
    }
  }, [getWalletBalance, initializeContract])

  // Disconnect wallet
  const disconnectWallet = useCallback((): void => {
    dispatch({ type: 'RESET_WALLET' })
    localStorage.removeItem('lastConnectedAccount')
    toast.success('Wallet disconnected')
  }, [])

  // Refresh wallet information
  const refreshWallet = useCallback(async (): Promise<void> => {
    if (!state.wallet.isConnected || !state.wallet.account) {
      return
    }

    try {
      // Refresh balance
      const balance = await getBalance(state.wallet.account)
      dispatch({ type: 'SET_WALLET', payload: { balance } })
      
      // Reinitialize contract
      const provider = getProvider()
      if (provider) {
        const signer = await provider.getSigner()
        await initializeContract(signer)
      }
    } catch (error: any) {
      console.error('Failed to refresh wallet information:', error)
    }
  }, [state.wallet.isConnected, state.wallet.account, getWalletBalance, initializeContract])

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else if (accounts[0] !== state.wallet.account) {
        // Account changed, reconnect
        connectWallet()
      }
    }

    const handleChainChanged = (chainId: string) => {
      const newChainId = parseInt(chainId, 16)
      if (newChainId !== SEPOLIA_CONFIG.chainId && state.wallet.isConnected) {
        toast.error('Please switch to Sepolia testnet')
        dispatch({
          type: 'SET_WALLET',
          payload: { chainId: newChainId, error: 'Network mismatch' },
        })
      } else if (newChainId === SEPOLIA_CONFIG.chainId) {
        dispatch({
          type: 'SET_WALLET',
          payload: { chainId: newChainId, error: null },
        })
        refreshWallet()
      }
    }

    const handleDisconnect = () => {
      disconnectWallet()
    }

    // Add event listeners
    window.ethereum?.on('accountsChanged', handleAccountsChanged)
    window.ethereum?.on('chainChanged', handleChainChanged)
    window.ethereum?.on('disconnect', handleDisconnect)

    // Cleanup function
    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum?.removeListener('chainChanged', handleChainChanged)
      window.ethereum?.removeListener('disconnect', handleDisconnect)
    }
  }, [state.wallet.account, state.wallet.isConnected, connectWallet, disconnectWallet, refreshWallet])

  // Auto-connect to last used account
  useEffect(() => {
    const autoConnect = async () => {
      const lastAccount = localStorage.getItem('lastConnectedAccount')
      if (lastAccount && isMetaMaskInstalled()) {
        try {
          const accounts = await window.ethereum!.request({ method: 'eth_accounts' }) as string[]
          if (accounts.includes(lastAccount)) {
            await connectWallet()
          }
        } catch (error) {
          console.warn('Auto-connect failed:', error)
        }
      }
    }

    autoConnect()
  }, []) // Only execute when component mounts

  // Context value
  const contextValue: Web3ProviderContext = {
    wallet: state.wallet,
    contract: state.contract,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
    getBalance: getWalletBalance,
    refreshWallet,
  }

  return <Web3Context.Provider value={contextValue}>{children}</Web3Context.Provider>
}

// Hook using Context
export const useWeb3 = (): Web3ProviderContext => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

// Extend window type to support ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request: (request: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeListener: (event: string, callback: (...args: any[]) => void) => void
    }
  }
}