import type { OnChainProposal } from '@/hooks/useContract'

export const MOCK_ACTIVE_PROPOSALS: OnChainProposal[] = [
  {
    id: 1,
    proposalType: 1,
    title: "Elect Sarah Johnson as New Board Member",
    description: "Proposal to elect Sarah Johnson as a new board member. Sarah has 12 years of experience in corporate strategy and has successfully led digital transformation initiatives at Fortune 500 companies.",
    proposer: "0x742d35Cc6474C4f0D1c6B2f0B9b8E99a8c123456",
    deadline: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days from now
    startTime: Math.floor(Date.now() / 1000) - (2 * 24 * 60 * 60), // started 2 days ago
    active: true,
    executed: false,
    forVotes: 2150,
    againstVotes: 380
  },
  {
    id: 2,
    proposalType: 2,
    title: "Approve Q4 2026 Marketing Budget",
    description: "Proposal to approve $3.2M marketing budget for Q4 2026, focusing on digital advertising, brand partnerships, and customer acquisition campaigns across North American and European markets.",
    proposer: "0x8b7c4A9e8D2F3B1c6e5A9B3F7d2E8c4A9e8D2F3B",
    deadline: Math.floor(Date.now() / 1000) + (5 * 24 * 60 * 60), // 5 days from now
    startTime: Math.floor(Date.now() / 1000) - (1 * 24 * 60 * 60), // started 1 day ago
    active: true,
    executed: false,
    forVotes: 1890,
    againstVotes: 125
  },
  {
    id: 3,
    proposalType: 3,
    title: "Quarterly Dividend Distribution - $0.75 per Share",
    description: "Proposal to declare and distribute quarterly dividends of $0.75 per share to all registered shareholders, payable on March 15, 2025 to shareholders of record as of March 1, 2025.",
    proposer: "0x3e5B8f9A2c7d6e4F1a8c5B9e3f7d2a6c4e8B1f5a",
    deadline: Math.floor(Date.now() / 1000) + (10 * 24 * 60 * 60), // 10 days from now
    startTime: Math.floor(Date.now() / 1000) - (3 * 24 * 60 * 60), // started 3 days ago
    active: true,
    executed: false,
    forVotes: 3240,
    againstVotes: 180
  },
  {
    id: 4,
    proposalType: 4,
    title: "Update Remote Work Policy Framework",
    description: "Proposal to update the company's remote work policy to include hybrid work arrangements, flexible scheduling, and enhanced digital collaboration tools budget allocation.",
    proposer: "0x9c2e5f8b1a4d7e3c6f9a2e5b8c1f4d7a3e6c9f2b",
    deadline: Math.floor(Date.now() / 1000) + (6 * 24 * 60 * 60), // 6 days from now
    startTime: Math.floor(Date.now() / 1000) - (4 * 24 * 60 * 60), // started 4 days ago
    active: true,
    executed: false,
    forVotes: 2750,
    againstVotes: 420
  },
  {
    id: 5,
    proposalType: 5,
    title: "Strategic Partnership with GreenTech Solutions",
    description: "Proposal to enter into a strategic partnership with GreenTech Solutions Inc. to develop sustainable technology solutions and expand into the renewable energy market sector.",
    proposer: "0x6f3a8c1e5b9d2f7a4c8e1b5f9d3a7c2e6f8b1a4d",
    deadline: Math.floor(Date.now() / 1000) + (14 * 24 * 60 * 60), // 14 days from now
    startTime: Math.floor(Date.now() / 1000) - (1 * 24 * 60 * 60), // started 1 day ago
    active: true,
    executed: false,
    forVotes: 1625,
    againstVotes: 890
  }
]