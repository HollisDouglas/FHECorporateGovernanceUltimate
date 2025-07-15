import { ProposalType } from '@/types/web3'

export interface MockProposal {
  id: number
  title: string
  description: string
  type: ProposalType
  creator: string
  startTime: number
  endTime: number
  totalVotes: number
  forVotes: number
  againstVotes: number
  abstainVotes: number
  status: 'active' | 'pending' | 'completed' | 'executed'
  requiredMajority: number
  isActive: boolean
}

export const mockProposals: MockProposal[] = [
  {
    id: 1,
    title: "Annual Budget Approval for 2025",
    description: "Proposal to approve the annual budget allocation of $50M for fiscal year 2025, including operational expenses, capital investments, and strategic initiatives. This budget includes increased R&D spending and market expansion plans.",
    type: ProposalType.BUDGET,
    creator: "0x1234...5678",
    startTime: Date.now() - 86400000, // Started 1 day ago
    endTime: Date.now() + 604800000, // Ends in 7 days
    totalVotes: 45,
    forVotes: 32,
    againstVotes: 8,
    abstainVotes: 5,
    status: 'active',
    requiredMajority: 60,
    isActive: true
  },
  {
    id: 2,
    title: "Board of Directors Election - Q1 2025",
    description: "Election of new board members for the upcoming term. This proposal includes the nomination of 3 new directors with expertise in technology, finance, and sustainability to guide the company's strategic direction.",
    type: ProposalType.BOARD,
    creator: "0x2345...6789",
    startTime: Date.now() - 172800000, // Started 2 days ago
    endTime: Date.now() + 432000000, // Ends in 5 days
    totalVotes: 38,
    forVotes: 28,
    againstVotes: 7,
    abstainVotes: 3,
    status: 'active',
    requiredMajority: 50,
    isActive: true
  },
  {
    id: 3,
    title: "Strategic Merger with TechCorp Inc.",
    description: "Proposal to approve the strategic merger with TechCorp Inc., valued at $2.5B. This merger will strengthen our market position and provide access to new technologies and markets in the Asia-Pacific region.",
    type: ProposalType.MERGER,
    creator: "0x3456...7890",
    startTime: Date.now() - 259200000, // Started 3 days ago
    endTime: Date.now() + 345600000, // Ends in 4 days
    totalVotes: 67,
    forVotes: 41,
    againstVotes: 18,
    abstainVotes: 8,
    status: 'active',
    requiredMajority: 75,
    isActive: true
  },
  {
    id: 4,
    title: "Quarterly Dividend Distribution",
    description: "Proposal to distribute quarterly dividends of $2.50 per share to all shareholders. This distribution represents a 15% increase from the previous quarter, reflecting strong financial performance.",
    type: ProposalType.DIVIDEND,
    creator: "0x4567...8901",
    startTime: Date.now() - 86400000, // Started 1 day ago
    endTime: Date.now() + 518400000, // Ends in 6 days
    totalVotes: 23,
    forVotes: 19,
    againstVotes: 2,
    abstainVotes: 2,
    status: 'active',
    requiredMajority: 60,
    isActive: true
  },
  {
    id: 5,
    title: "Amendment to Corporate Bylaws - Remote Work Policy",
    description: "Proposal to amend corporate bylaws to formalize remote work policies and hybrid work arrangements. This includes guidelines for employee flexibility, productivity standards, and office space optimization.",
    type: ProposalType.BYLAW,
    creator: "0x5678...9012",
    startTime: Date.now() - 432000000, // Started 5 days ago
    endTime: Date.now() + 172800000, // Ends in 2 days
    totalVotes: 56,
    forVotes: 42,
    againstVotes: 9,
    abstainVotes: 5,
    status: 'active',
    requiredMajority: 65,
    isActive: true
  },
  {
    id: 6,
    title: "Green Energy Initiative Investment",
    description: "Strategic proposal to invest $100M in renewable energy infrastructure and carbon neutrality initiatives. This includes solar panel installations, electric vehicle fleet, and sustainable office practices.",
    type: ProposalType.STRATEGIC,
    creator: "0x6789...0123",
    startTime: Date.now() - 604800000, // Started 7 days ago
    endTime: Date.now() - 86400000, // Ended 1 day ago
    totalVotes: 89,
    forVotes: 67,
    againstVotes: 15,
    abstainVotes: 7,
    status: 'completed',
    requiredMajority: 60,
    isActive: false
  }
]

export const getActiveProposals = (): MockProposal[] => {
  return mockProposals.filter(proposal => proposal.status === 'active')
}

export const getProposalById = (id: number): MockProposal | undefined => {
  return mockProposals.find(proposal => proposal.id === id)
}

export const getVotingProgress = (proposal: MockProposal) => {
  if (proposal.totalVotes === 0) return { forPercent: 0, againstPercent: 0, abstainPercent: 0 }
  
  return {
    forPercent: (proposal.forVotes / proposal.totalVotes) * 100,
    againstPercent: (proposal.againstVotes / proposal.totalVotes) * 100,
    abstainPercent: (proposal.abstainVotes / proposal.totalVotes) * 100
  }
}

export const formatTimeRemaining = (endTime: number): string => {
  const now = Date.now()
  const diff = endTime - now
  
  if (diff <= 0) return 'Voting ended'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) return `${days}d ${hours}h remaining`
  if (hours > 0) return `${hours}h ${minutes}m remaining`
  return `${minutes}m remaining`
}