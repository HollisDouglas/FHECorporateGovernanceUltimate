import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './constants'
import type { PresetProposal } from '@/data/presetProposals'

export const createTestProposal = async () => {
  try {
    // Get provider and signer
    if (!window.ethereum) {
      throw new Error('MetaMask not installed')
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

    console.log('Creating test proposal...')
    console.log('Contract address:', CONTRACT_ADDRESS)
    console.log('Signer address:', await signer.getAddress())

    // Create a test proposal
    const tx = await (contract as any).createProposal(
      1, // _type: 1 = Board Election  
      "Test Proposal: Elect New Board Member", // _title
      7  // _days: duration in days
    )

    console.log('Transaction sent:', tx.hash)
    
    const receipt = await tx.wait()
    console.log('Transaction confirmed in block:', receipt.blockNumber)
    
    return receipt
  } catch (error: any) {
    console.error('Error creating test proposal:', error)
    throw error
  }
}

export const createPresetProposal = async (preset: PresetProposal) => {
  try {
    // Get provider and signer
    if (!window.ethereum) {
      throw new Error('MetaMask not installed')
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

    console.log('Creating test proposal...')
    console.log('Contract address:', CONTRACT_ADDRESS)
    console.log('Signer address:', await signer.getAddress())

    // Create preset proposal with specified parameters
    const tx = await (contract as any).createProposal(
      preset.type, // _type: proposal type
      preset.title, // _title: proposal title
      preset.duration  // _days: duration in days
    )

    console.log('Transaction sent:', tx.hash)
    
    const receipt = await tx.wait()
    console.log('Transaction confirmed in block:', receipt.blockNumber)
    
    return receipt
  } catch (error: any) {
    console.error('Error creating test proposal:', error)
    throw error
  }
}

export const initializeCompany = async () => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed')
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

    console.log('Initializing company...')
    
    // Check if already initialized first
    try {
      const isInitialized = await (contract as any).initialized()
      if (isInitialized) {
        console.log('Company already initialized')
        return { alreadyInitialized: true }
      }
    } catch (error) {
      console.log('Checking initialization status failed, proceeding with init')
    }

    const tx = await (contract as any).initCompany(
      "Test Corporate DAO", // _name: company name
      1000000 // _shares: total shares
    )

    console.log('Transaction sent:', tx.hash)
    
    const receipt = await tx.wait()
    console.log('Company initialized in block:', receipt.blockNumber)
    
    return receipt
  } catch (error: any) {
    console.error('Error initializing company:', error)
    throw error
  }
}

export const addShareholder = async (address: string, shares: number = 1000, name: string = 'Test Shareholder') => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed')
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

    console.log('Adding shareholder:', address)
    
    const tx = await (contract as any).addShareholder(address, shares, name)

    console.log('Transaction sent:', tx.hash)
    
    const receipt = await tx.wait()
    console.log('Shareholder added in block:', receipt.blockNumber)
    
    return receipt
  } catch (error: any) {
    console.error('Error adding shareholder:', error)
    throw error
  }
}

export const addBoardMember = async (memberAddress: string) => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed')
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

    console.log('Adding board member:', memberAddress)
    
    // Check if already a board member
    try {
      const isBoardMember = await (contract as any).isBoardMember(memberAddress)
      if (isBoardMember) {
        console.log('Address is already a board member')
        return { alreadyBoardMember: true }
      }
    } catch (error) {
      console.log('Checking board member status failed, proceeding with add')
    }

    const tx = await (contract as any).addBoard(memberAddress)

    console.log('Transaction sent:', tx.hash)
    
    const receipt = await tx.wait()
    console.log('Board member added in block:', receipt.blockNumber)
    
    return receipt
  } catch (error: any) {
    console.error('Error adding board member:', error)
    throw error
  }
}