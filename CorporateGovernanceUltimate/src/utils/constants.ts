import type { NetworkConfig } from '@/types'

export const CONTRACT_ADDRESS = (import.meta as any).env?.VITE_CONTRACT_ADDRESS || '0x7c04dD380e26B56899493ec7A654EdEf108A2414'

export const SEPOLIA_CONFIG: NetworkConfig = {
  chainId: 11155111,
  name: 'Sepolia Testnet',
  rpcUrl: (import.meta as any).env?.VITE_RPC_URL || 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  blockExplorer: 'https://sepolia.etherscan.io',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'SEP',
    decimals: 18
  }
}

export const SUPPORTED_NETWORKS: Record<number, NetworkConfig> = {
  [SEPOLIA_CONFIG.chainId]: SEPOLIA_CONFIG
}

export const CONTRACT_ABI = [
  "function initCompany(string memory _name, uint256 _shares) external",
  "function companyName() public view returns (string memory)",
  "function totalShares() public view returns (uint256)",
  "function initialized() public view returns (bool)",
  "function addBoard(address _member) external",
  "function isBoardMember(address _member) external view returns (bool)",
  "function addShareholder(address _addr, uint32 _shares, string memory _name) external",
  "function getShareholderInfo(address _addr) external view returns (bool, uint32, string memory, string memory, bool)",
  "function createProposal(uint8 _type, string memory _title, uint256 _days) external returns (uint256)",
  "function getTotalProposals() external view returns (uint256)",
  "function getProposalInfo(uint256 _id) external view returns (uint256, uint8, string memory, string memory, address, uint256, uint256, bool, bool, uint256, uint256)",
  "function vote(uint256 _id, uint8 _choice) public",
  "function voteConfidential(uint256 _id, uint8 _choice) external",
  "function hasVotedOn(uint256 _id, address _voter) external view returns (bool)",
  "function finalize(uint256 _id) public",
  "function getResults(uint256 _id) public view returns (uint32, uint32, bool)",
  "function getCompanyInfo() external view returns (string memory, string memory, string memory, uint256, uint256, address[] memory)",
  "event CompanyInit(string name)",
  "event ShareholderAdd(address indexed addr)",
  "event ProposalAdd(uint256 indexed id)",
  "event VoteAdd(uint256 indexed id, address indexed voter)"
] as const

export const ERROR_MESSAGES: Record<string, string> = {
  4001: 'User rejected the request',
  4100: 'The requested method has not been authorized',
  4200: 'The provider does not support the requested method',
  4900: 'The provider is disconnected',
  4901: 'The provider is not connected to the requested chain',
  'NETWORK_ERROR': 'Network connection error',
  'UNSUPPORTED_NETWORK': 'Please switch to Sepolia testnet',
  'EXECUTION_REVERTED': 'Transaction was reverted',
  'INSUFFICIENT_FUNDS': 'Insufficient balance',
  'ALREADY_VOTED': 'You have already voted',
  'NOT_BOARD_MEMBER': 'You are not a board member',
  'NOT_SHAREHOLDER': 'You are not a shareholder',
  'PROPOSAL_EXPIRED': 'Proposal has expired',
  'PROPOSAL_NOT_ACTIVE': 'Proposal is not active'
}

export const GAS_LIMITS = {
  VOTE: 100000,
  CREATE_PROPOSAL: 200000,
  ADD_SHAREHOLDER: 150000,
  INIT_COMPANY: 300000
}

export const APP_CONFIG = {
  name: 'Corporate Governance',
  description: 'Confidential Shareholder Voting with FHE',
  version: '1.0.0'
}
