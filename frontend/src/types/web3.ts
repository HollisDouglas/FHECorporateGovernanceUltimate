import { ethers } from 'ethers'

// Network configuration
export interface NetworkConfig {
  chainId: number
  name: string
  rpcUrl: string
  blockExplorer: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}

// Wallet state
export interface WalletState {
  account: string | null
  chainId: number | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  balance: string | null
}

// Contract interaction state
export interface ContractState {
  contract: ethers.Contract | null
  isLoading: boolean
  error: string | null
}

// Proposal type
export enum ProposalType {
  BOARD = 0,
  BUDGET = 1,
  MERGER = 2,
  DIVIDEND = 3,
  BYLAW = 4,
  STRATEGIC = 5
}

export const ProposalTypeLabels = {
  [ProposalType.BOARD]: 'Board Election',
  [ProposalType.BUDGET]: 'Budget Approval',
  [ProposalType.MERGER]: 'Merger & Acquisition',
  [ProposalType.DIVIDEND]: 'Dividend Distribution',
  [ProposalType.BYLAW]: 'Bylaw Amendment',
  [ProposalType.STRATEGIC]: 'Strategic Decision'
}

// Proposal state
export interface Proposal {
  id: number
  proposalType: ProposalType
  title: string
  description: string
  proposer: string
  deadline: number
  active: boolean
  forVotes: number
  againstVotes: number
  threshold: number
  hasVoted?: boolean
  isExpired?: boolean
  isPassed?: boolean
}

// Shareholder information
export interface Shareholder {
  address: string
  shares: number
  name: string
  active: boolean
}

// Company information
export interface CompanyInfo {
  name: string
  symbol: string
  totalShares: number
  totalShareholders: number
  boardMembers: string[]
}

// Transaction state
export interface TransactionState {
  hash?: string
  status: 'idle' | 'pending' | 'success' | 'error'
  error?: string
}

// Vote choice
export enum VoteChoice {
  ABSTAIN = 0,
  FOR = 1,
  AGAINST = 2
}

export const VoteChoiceLabels = {
  [VoteChoice.ABSTAIN]: 'Abstain',
  [VoteChoice.FOR]: 'For',
  [VoteChoice.AGAINST]: 'Against'
}

// Web3 Provider interface
export interface Web3ProviderContext {
  // Wallet state
  wallet: WalletState
  
  // Contract state
  contract: ContractState
  
  // Wallet operations
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchToSepolia: () => Promise<void>
  
  // Contract operations
  getBalance: () => Promise<string>
  refreshWallet: () => Promise<void>
}

// Error type
export class Web3Error extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'Web3Error'
  }
}

// Common Web3 error codes
export enum Web3ErrorCode {
  USER_REJECTED = 'USER_REJECTED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  ALREADY_VOTED = 'ALREADY_VOTED',
  NOT_AUTHORIZED = 'NOT_AUTHORIZED',
  PROPOSAL_EXPIRED = 'PROPOSAL_EXPIRED'
}

// MetaMask specific errors
export interface MetaMaskError {
  code: number
  message: string
  data?: any
}

// Event types
export interface ProposalCreatedEvent {
  proposalId: number
  proposer: string
  title: string
  proposalType: ProposalType
}

export interface VoteCastEvent {
  proposalId: number
  voter: string
  choice: VoteChoice
  weight: number
}

export interface ShareholderRegisteredEvent {
  shareholder: string
  shares: number
  name: string
}