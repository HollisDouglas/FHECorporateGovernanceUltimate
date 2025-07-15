import { NetworkConfig } from '@/types/web3'

// Contract address
export const CONTRACT_ADDRESS = (import.meta as any).env?.VITE_CONTRACT_ADDRESS || '0x7c04dD380e26B56899493ec7A654EdEf108A2414'

// Sepolia Testnet Configuration  
export const SEPOLIA_CONFIG: NetworkConfig = {
  chainId: 11155111, // 0xaa36a7 in hex
  name: 'Sepolia Testnet',
  rpcUrl: (import.meta as any).env?.VITE_RPC_URL || 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  blockExplorer: 'https://sepolia.etherscan.io',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'SEP',
    decimals: 18
  }
}

// Supported networks
export const SUPPORTED_NETWORKS: Record<number, NetworkConfig> = {
  [SEPOLIA_CONFIG.chainId]: SEPOLIA_CONFIG
}

// Contract ABI - exported from CorporateGovernanceUltimate.sol
export const CONTRACT_ABI = [
  // Company management
  "function initCompany(string memory _name, uint256 _shares) external",
  "function companyName() public view returns (string memory)",
  "function totalShares() public view returns (uint256)",
  "function initialized() public view returns (bool)",
  
  // Board management
  "function addBoard(address _member) external",
  "function isBoardMember(address _member) external view returns (bool)",
  
  // Shareholder management
  "function addShareholder(address _addr, uint32 _shares, string memory _name) external",
  "function registerShareholderPlain(address _addr, uint32 _shares, string memory, string memory _name) external",
  "function getShareholderInfo(address _addr) external view returns (bool, uint32, string memory, string memory, bool)",
  
  // Proposal management
  "function createProposal(uint8 _type, string memory _title, uint256 _days) external returns (uint256)",
  "function getTotalProposals() external view returns (uint256)",
  "function getProposalBasic(uint256 _id) external view returns (uint8, string memory, address)",
  "function getProposalStatus(uint256 _id) external view returns (uint256, bool, uint32)",
  "function getProposalInfo(uint256 _id) external view returns (uint256, uint8, string memory, string memory, address, uint256, uint256, bool, bool, uint256, uint256)",
  
  // Voting
  "function vote(uint256 _id, uint8 _choice) public",
  "function castVotePlain(uint256 _id, uint8 _choice) external",
  "function castConfidentialVote(uint256 _id, uint8 _choice) external",
  "function voteConfidential(uint256 _id, uint8 _choice) external",
  "function hasVotedOn(uint256 _id, address _voter) external view returns (bool)",
  
  // Proposal finalization
  "function finalize(uint256 _id) public",
  "function finalizeProposal(uint256 _id) external",
  "function getResults(uint256 _id) public view returns (uint32, uint32, bool)",
  "function getDecryptedResults(uint256 _id) external view returns (uint32, uint32, uint32, bool)",
  
  // Company info
  "function getCompanyInfo() external view returns (string memory, string memory, string memory, uint256, uint256, address[] memory)",
  
  // Events
  "event CompanyInit(string name)",
  "event ShareholderAdd(address indexed addr)",
  "event ProposalAdd(uint256 indexed id)",
  "event VoteAdd(uint256 indexed id, address indexed voter)"
] as const

// Error Messages Mapping
export const ERROR_MESSAGES: Record<string, string> = {
  // MetaMask Errors
  4001: 'User rejected the request',
  4100: 'The requested method and/or account has not been authorized by the user',
  4200: 'The provider does not support the requested method',
  4900: 'The provider is disconnected from all chains',
  4901: 'The provider is not connected to the requested chain',
  
  // Network Errors
  'NETWORK_ERROR': 'Network connection error, please check your network settings',
  'UNSUPPORTED_NETWORK': 'Unsupported network, please switch to Sepolia testnet',
  
  // Contract Errors
  'EXECUTION_REVERTED': 'Transaction was reverted',
  'INSUFFICIENT_FUNDS': 'Insufficient balance',
  'GAS_LIMIT_EXCEEDED': 'Gas limit exceeded',
  
  // Business Logic Errors
  'ALREADY_VOTED': 'You have already voted',
  'NOT_BOARD_MEMBER': 'You are not a board member',
  'NOT_SHAREHOLDER': 'You are not a shareholder',
  'PROPOSAL_EXPIRED': 'Proposal has expired',
  'PROPOSAL_NOT_ACTIVE': 'Proposal is not active',
  'INVALID_PROPOSAL_ID': 'Invalid proposal ID'
}

// Gas limit configuration
export const GAS_LIMITS = {
  VOTE: 100000,
  CREATE_PROPOSAL: 200000,
  ADD_SHAREHOLDER: 150000,
  INIT_COMPANY: 300000
}

// Application configuration
export const APP_CONFIG = {
  name: (import.meta as any).env?.VITE_APP_NAME || 'Corporate Governance DApp',
  description: (import.meta as any).env?.VITE_APP_DESCRIPTION || 'Confidential Shareholder Voting - Privacy-focused Corporate Decision System',
  version: '1.0.0'
}

// Time constants
export const TIME_CONSTANTS = {
  BLOCK_TIME: 12, // seconds
  CONFIRMATION_BLOCKS: 2,
  POLLING_INTERVAL: 5000, // ms
  RETRY_DELAY: 1000, // ms
  MAX_RETRIES: 3
}

// UI configuration
export const UI_CONFIG = {
  TOAST_DURATION: 4000,
  LOADING_DELAY: 300,
  ANIMATION_DURATION: 300
}

// Local storage keys
export const STORAGE_KEYS = {
  LAST_CONNECTED_ACCOUNT: 'lastConnectedAccount',
  PREFERRED_NETWORK: 'preferredNetwork',
  USER_PREFERENCES: 'userPreferences'
} as const