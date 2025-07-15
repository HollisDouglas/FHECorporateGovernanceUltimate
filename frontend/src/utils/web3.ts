import { ethers } from 'ethers'
import { MetaMaskError, NetworkConfig, Web3Error, Web3ErrorCode } from '@/types/web3'
import { SEPOLIA_CONFIG, ERROR_MESSAGES } from './constants'

// Check if MetaMask is available
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && Boolean(window.ethereum?.isMetaMask)
}

// Get MetaMask provider
export const getProvider = (): ethers.BrowserProvider | null => {
  if (!isMetaMaskInstalled()) {
    return null
  }
  return new ethers.BrowserProvider(window.ethereum!)
}

// Request account connection
export const requestAccounts = async (): Promise<string[]> => {
  if (!isMetaMaskInstalled()) {
    throw new Web3Error('Please install MetaMask wallet', Web3ErrorCode.NETWORK_ERROR)
  }
  
  try {
    const accounts = await window.ethereum!.request({
      method: 'eth_requestAccounts',
    }) as string[]
    
    if (accounts.length === 0) {
      throw new Web3Error('No available accounts found', Web3ErrorCode.USER_REJECTED)
    }
    
    return accounts
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Web3Error('User rejected wallet connection', Web3ErrorCode.USER_REJECTED)
    }
    throw new Web3Error(`Failed to connect wallet: ${error.message}`, Web3ErrorCode.NETWORK_ERROR)
  }
}

// Get current network ID
export const getCurrentChainId = async (): Promise<number> => {
  if (!isMetaMaskInstalled()) {
    throw new Web3Error('MetaMask not installed', Web3ErrorCode.NETWORK_ERROR)
  }
  
  const chainId = await window.ethereum!.request({
    method: 'eth_chainId',
  }) as string
  
  return parseInt(chainId, 16)
}

// Switch network
export const switchToNetwork = async (networkConfig: NetworkConfig): Promise<void> => {
  if (!isMetaMaskInstalled()) {
    throw new Web3Error('MetaMask not installed', Web3ErrorCode.NETWORK_ERROR)
  }
  
  const chainIdHex = `0x${networkConfig.chainId.toString(16)}`
  
  try {
    // Try to switch to specified network
    await window.ethereum!.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    })
  } catch (error: any) {
    // If network doesn't exist, try to add network
    if (error.code === 4902) {
      try {
        await window.ethereum!.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chainIdHex,
              chainName: networkConfig.name,
              rpcUrls: [networkConfig.rpcUrl],
              blockExplorerUrls: [networkConfig.blockExplorer],
              nativeCurrency: networkConfig.nativeCurrency,
            },
          ],
        })
      } catch (addError: any) {
        throw new Web3Error(
          `Failed to add network: ${addError.message}`,
          Web3ErrorCode.NETWORK_ERROR
        )
      }
    } else {
      throw new Web3Error(
        `Failed to switch network: ${error.message}`,
        Web3ErrorCode.NETWORK_ERROR
      )
    }
  }
}

// Switch to Sepolia testnet
export const switchToSepolia = async (): Promise<void> => {
  await switchToNetwork(SEPOLIA_CONFIG)
}

// Get account balance
export const getBalance = async (address: string): Promise<string> => {
  const provider = getProvider()
  if (!provider) {
    throw new Web3Error('Unable to get provider', Web3ErrorCode.NETWORK_ERROR)
  }
  
  try {
    const balance = await provider.getBalance(address)
    return ethers.formatEther(balance)
  } catch (error: any) {
    throw new Web3Error(`Failed to get balance: ${error.message}`, Web3ErrorCode.NETWORK_ERROR)
  }
}

// Format address (show first 6 and last 4 characters)
export const formatAddress = (address: string): string => {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Validate Ethereum address
export const isValidAddress = (address: string): boolean => {
  try {
    return ethers.isAddress(address)
  } catch {
    return false
  }
}

// Format Ether amount
export const formatEther = (value: string | bigint): string => {
  try {
    const formatted = ethers.formatEther(value)
    const num = parseFloat(formatted)
    
    if (num < 0.0001 && num > 0) {
      return '< 0.0001'
    }
    
    return num.toFixed(4)
  } catch {
    return '0.0000'
  }
}

// Parse Ether amount
export const parseEther = (value: string): bigint => {
  try {
    return ethers.parseEther(value)
  } catch (error: any) {
    throw new Web3Error(`Failed to parse amount: ${error.message}`, Web3ErrorCode.NETWORK_ERROR)
  }
}

// Handle MetaMask errors
export const handleMetaMaskError = (error: MetaMaskError): Web3Error => {
  const message = ERROR_MESSAGES[error.code] || error.message || 'Unknown error'
  
  // Map common error codes
  let code: Web3ErrorCode = Web3ErrorCode.NETWORK_ERROR
  
  switch (error.code) {
    case 4001:
      code = Web3ErrorCode.USER_REJECTED
      break
    case 4100:
      code = Web3ErrorCode.NOT_AUTHORIZED
      break
    case -32602:
      code = Web3ErrorCode.CONTRACT_ERROR
      break
    default:
      if (error.message?.includes('insufficient funds')) {
        code = Web3ErrorCode.INSUFFICIENT_BALANCE
      }
      break
  }
  
  return new Web3Error(message, code, error)
}

// Wait for transaction confirmation
export const waitForTransaction = async (
  hash: string,
  confirmations: number = 2
): Promise<ethers.TransactionReceipt> => {
  const provider = getProvider()
  if (!provider) {
    throw new Web3Error('Unable to get provider', Web3ErrorCode.NETWORK_ERROR)
  }
  
  try {
    const receipt = await provider.waitForTransaction(hash, confirmations)
    if (!receipt) {
      throw new Web3Error('Transaction receipt not found', Web3ErrorCode.NETWORK_ERROR)
    }
    return receipt
  } catch (error: any) {
    throw new Web3Error(
      `Failed to wait for transaction confirmation: ${error.message}`,
      Web3ErrorCode.NETWORK_ERROR
    )
  }
}

// Estimate gas fee
export const estimateGas = async (
  contract: ethers.Contract,
  method: string,
  args: any[] = []
): Promise<bigint> => {
  try {
    return await contract[method].estimateGas(...args)
  } catch (error: any) {
    throw new Web3Error(
      `Failed to estimate gas fee: ${error.message}`,
      Web3ErrorCode.CONTRACT_ERROR
    )
  }
}

// Format timestamp
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Calculate remaining time
export const getRemainingTime = (deadline: number): string => {
  const now = Math.floor(Date.now() / 1000)
  const remaining = deadline - now
  
  if (remaining <= 0) {
    return 'Expired'
  }
  
  const days = Math.floor(remaining / (24 * 60 * 60))
  const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((remaining % (60 * 60)) / 60)
  
  if (days > 0) {
    return `${days}d ${hours}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

// Check if mobile device
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

// Get block explorer link
export const getExplorerLink = (hash: string, type: 'tx' | 'address' = 'tx'): string => {
  return `${SEPOLIA_CONFIG.blockExplorer}/${type}/${hash}`
}

// Delay function
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Retry logic
export const retry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0) {
      await delay(delayMs)
      return retry(fn, retries - 1, delayMs * 2) // Exponential backoff
    }
    throw error
  }
}