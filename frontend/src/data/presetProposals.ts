export interface PresetProposal {
  id: string
  type: number
  title: string
  description: string
  duration: number
}

export const PRESET_PROPOSALS: PresetProposal[] = [
  {
    id: 'board-election-1',
    type: 1,
    title: 'Elect New Board Member - John Smith',
    description: 'Proposal to elect John Smith as a new board member. John has 15 years of experience in corporate governance and strategic planning.',
    duration: 7
  },
  {
    id: 'budget-approval',
    type: 2,
    title: 'Approve Q4 2024 Budget Allocation',
    description: 'Proposal to approve the quarterly budget allocation of $2.5M for operations, $1M for R&D, and $500K for marketing initiatives.',
    duration: 5
  },
  {
    id: 'dividend-distribution',
    type: 3,
    title: 'Declare Annual Dividend Distribution',
    description: 'Proposal to declare and distribute annual dividends of $0.50 per share to all registered shareholders.',
    duration: 10
  },
  {
    id: 'policy-update',
    type: 4,
    title: 'Update Corporate Privacy Policy',
    description: 'Proposal to update the corporate privacy policy to comply with new data protection regulations and enhance user privacy protection.',
    duration: 7
  },
  {
    id: 'merger-proposal',
    type: 5,
    title: 'Strategic Merger with TechCorp Inc.',
    description: 'Proposal to enter into a strategic merger agreement with TechCorp Inc. to expand market presence and technological capabilities.',
    duration: 14
  },
  {
    id: 'compensation-plan',
    type: 2,
    title: 'Executive Compensation Plan Revision',
    description: 'Proposal to revise the executive compensation plan including salary adjustments, performance bonuses, and equity incentives.',
    duration: 7
  }
]

export interface VoteOption {
  id: string
  label: string
  value: number
  description: string
  color: string
}

export const VOTE_OPTIONS: VoteOption[] = [
  {
    id: 'vote-for',
    label: 'Vote For',
    value: 1,
    description: 'Support this proposal',
    color: 'green'
  },
  {
    id: 'vote-against',
    label: 'Vote Against',
    value: 2,
    description: 'Oppose this proposal',
    color: 'red'
  },
  {
    id: 'abstain',
    label: 'Abstain',
    value: 0,
    description: 'Neither support nor oppose',
    color: 'yellow'
  }
]