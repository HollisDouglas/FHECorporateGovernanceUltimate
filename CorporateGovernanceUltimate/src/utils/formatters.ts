export function formatAddress(address: string, chars = 4): string {
  if (!address) return ''
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function formatBalance(balance: string, decimals = 4): string {
  const num = parseFloat(balance)
  if (isNaN(num)) return '0'
  return num.toFixed(decimals)
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatTimeRemaining(deadline: number): string {
  const now = Math.floor(Date.now() / 1000)
  const remaining = deadline - now

  if (remaining <= 0) return 'Expired'

  const days = Math.floor(remaining / 86400)
  const hours = Math.floor((remaining % 86400) / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)

  if (days > 0) return `${days}d ${hours}h remaining`
  if (hours > 0) return `${hours}h ${minutes}m remaining`
  return `${minutes}m remaining`
}

export function calculatePercentage(votes: number, total: number): number {
  if (total === 0) return 0
  return Math.round((votes / total) * 100)
}

export function getProposalStatus(proposal: {
  active: boolean
  executed: boolean
  deadline: number
}): 'active' | 'expired' | 'executed' {
  if (proposal.executed) return 'executed'
  if (!proposal.active) return 'expired'
  const now = Math.floor(Date.now() / 1000)
  if (now > proposal.deadline) return 'expired'
  return 'active'
}
