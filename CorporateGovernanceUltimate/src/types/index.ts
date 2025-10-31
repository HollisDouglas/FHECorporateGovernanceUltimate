import type { Contract } from 'ethers'
import type { FHEVMInstance } from 'fhevmjs'

export interface WalletState {
  account: string | null
  chainId: number | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  balance: string | null
}

export interface ContractState {
  contract: Contract | null
  isLoading: boolean
  error: string | null
}

export enum ProposalType {
  BOARD = 0,
  BUDGET = 1,
  MERGER = 2,
  DIVIDEND = 3,
  BYLAW = 4,
  STRATEGIC = 5
}

export const ProposalTypeLabels: Record<ProposalType, string> = {
  [ProposalType.BOARD]: 'Board Election',
  [ProposalType.BUDGET]: 'Budget Approval',
  [ProposalType.MERGER]: 'Merger & Acquisition',
  [ProposalType.DIVIDEND]: 'Dividend Distribution',
  [ProposalType.BYLAW]: 'Bylaw Amendment',
  [ProposalType.STRATEGIC]: 'Strategic Decision'
}

export interface Proposal {
  id: number
  proposalType: ProposalType
  title: string
  description: string
  proposer: string
  deadline: number
  startTime: number
  active: boolean
  executed: boolean
  forVotes: number
  againstVotes: number
  threshold: number
  hasVoted?: boolean
  isExpired?: boolean
  isPassed?: boolean
}

export enum VoteChoice {
  ABSTAIN = 0,
  FOR = 1,
  AGAINST = 2
}

export const VoteChoiceLabels: Record<VoteChoice, string> = {
  [VoteChoice.ABSTAIN]: 'Abstain',
  [VoteChoice.FOR]: 'For',
  [VoteChoice.AGAINST]: 'Against'
}

export interface Shareholder {
  address: string
  shares: number
  name: string
  active: boolean
}

export interface CompanyInfo {
  name: string
  symbol: string
  totalShares: number
  totalShareholders: number
  boardMembers: string[]
}

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

export interface FHEVMState {
  instance: FHEVMInstance | null
  isInitialized: boolean
  isInitializing: boolean
  error: string | null
}

export interface TransactionState {
  hash?: string
  status: 'idle' | 'pending' | 'success' | 'error'
  error?: string
}

export interface ToastMessage {
  id?: string
  type: 'success' | 'error' | 'info' | 'loading'
  message: string
  duration?: number
}
