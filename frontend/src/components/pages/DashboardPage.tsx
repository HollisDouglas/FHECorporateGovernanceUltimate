import React from 'react'
import { useWeb3 } from '@/providers/Web3Provider'
import { BarChart3, Users, Vote, TrendingUp, Wallet } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'

const DashboardPage: React.FC = () => {
  const { wallet, contract } = useWeb3()

  // If wallet is not connected
  if (!wallet.isConnected) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md mx-auto">
          <Wallet className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet</h2>
          <p className="text-gray-300 mb-6">
            Please connect your MetaMask wallet to access the dashboard
          </p>
        </div>
      </div>
    )
  }

  // If contract is loading
  if (contract.isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading dashboard data..." />
      </div>
    )
  }

  const mockStats = [
    { label: 'My Votes', value: '12', icon: Vote, color: 'text-blue-400' },
    { label: 'Participated Proposals', value: '8', icon: BarChart3, color: 'text-green-400' },
    { label: 'Shareholding Ratio', value: '2.5%', icon: TrendingUp, color: 'text-purple-400' },
    { label: 'Voting Power', value: '125', icon: Users, color: 'text-orange-400' }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center space-x-3">
          <BarChart3 className="h-8 w-8 text-blue-400" />
          <span>Dashboard</span>
        </h1>
        <p className="text-gray-400">
          View your voting records and participation statistics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="glass-card p-6 text-center">
              <Icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-gray-300 text-sm">{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4 animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-white/10 rounded w-1/3"></div>
                <div className="h-3 bg-white/10 rounded w-20"></div>
              </div>
              <div className="h-3 bg-white/10 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon */}
      <div className="glass-card p-8 text-center">
        <BarChart3 className="h-16 w-16 text-blue-400 mx-auto mb-4 opacity-50" />
        <h2 className="text-2xl font-bold text-white mb-4">Full Dashboard Coming Soon</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Detailed voting statistics, historical records, and personal analytics features are in development
        </p>
      </div>
    </div>
  )
}

export default DashboardPage