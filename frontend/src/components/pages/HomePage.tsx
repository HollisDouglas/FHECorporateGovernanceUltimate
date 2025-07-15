import React from 'react'
import { Link } from 'react-router-dom'
import { useWeb3 } from '@/providers/Web3Provider'
import { 
  Shield, 
  Vote, 
  Users, 
  TrendingUp, 
  Lock, 
  CheckCircle,
  ArrowRight,
  Zap,
  Globe
} from 'lucide-react'

const HomePage: React.FC = () => {
  const { wallet } = useWeb3()

  const features = [
    {
      icon: Shield,
      title: 'Blockchain Security',
      description: 'Built on Ethereum smart contracts ensuring transparent and immutable voting process'
    },
    {
      icon: Lock,
      title: 'Private Voting',
      description: 'Support confidential voting features, protecting voter privacy while ensuring verifiable results'
    },
    {
      icon: Users,
      title: 'Governance Transparency',
      description: 'Complete corporate governance workflow from proposal creation to transparent voting results'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Real-time voting progress and results display, supporting multiple proposal types'
    }
  ]

  const stats = [
    { label: 'Total Proposals', value: '156', icon: Vote },
    { label: 'Active Shareholders', value: '42', icon: Users },
    { label: 'Participation Rate', value: '89%', icon: TrendingUp },
    { label: 'Successful Governance', value: '134', icon: CheckCircle }
  ]

  const proposalTypes = [
    { name: 'Board Election', desc: 'Election and appointment of board members', color: 'from-blue-500 to-purple-500' },
    { name: 'Budget Approval', desc: 'Annual budget and major expenditure approval', color: 'from-green-500 to-teal-500' },
    { name: 'Mergers & Acquisitions', desc: 'Corporate merger and acquisition decisions', color: 'from-red-500 to-pink-500' },
    { name: 'Strategic Decisions', desc: 'Corporate development strategy and major decisions', color: 'from-orange-500 to-yellow-500' }
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-12">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            CorporateDAO
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Blockchain-Based Corporate Governance Voting System
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Utilizing Ethereum smart contract technology to achieve transparent, fair, and immutable corporate decision-making voting processes
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {wallet.isConnected ? (
            <>
              <Link
                to="/vote"
                className="gradient-button flex items-center space-x-2 text-lg px-8 py-4"
              >
                <Vote className="h-5 w-5" />
                <span>Start Voting</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/proposals"
                className="btn-secondary flex items-center space-x-2 text-lg px-8 py-4"
              >
                <Users className="h-5 w-5" />
                <span>View Proposals</span>
              </Link>
            </>
          ) : (
            <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-6 py-3 rounded-lg flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Please connect your wallet to get started</span>
            </div>
          )}
        </div>

        {/* Network Info */}
        <div className="flex justify-center">
          <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-2 rounded-full text-sm flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Running on Sepolia Testnet</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="glass-card text-center p-6 hover:scale-105 transition-transform">
              <Icon className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-gray-300 text-sm">{stat.label}</div>
            </div>
          )
        })}
      </section>

      {/* Features Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Core Features</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our platform provides comprehensive corporate governance solutions, ensuring every decision is transparent and fair
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="glass-card p-6 hover:bg-white/15 transition-all duration-300 group"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-500/20 p-3 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                    <Icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Proposal Types */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Supported Proposal Types</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            We support various types of corporate governance proposals to meet different decision-making needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {proposalTypes.map((type, index) => (
            <div
              key={index}
              className="glass-card p-6 hover:scale-105 transition-transform cursor-pointer group"
            >
              <div className={`h-2 w-full bg-gradient-to-r ${type.color} rounded-full mb-4 opacity-70 group-hover:opacity-100 transition-opacity`} />
              <h3 className="text-xl font-semibold text-white mb-2">
                {type.name}
              </h3>
              <p className="text-gray-300">
                {type.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Complete corporate governance voting in four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Connect Wallet', desc: 'Connect to Sepolia testnet using MetaMask' },
            { step: '2', title: 'View Proposals', desc: 'Browse currently active voting proposals' },
            { step: '3', title: 'Participate in Voting', desc: 'Choose support or opposition, submit your vote' },
            { step: '4', title: 'View Results', desc: 'Monitor voting progress and final results in real-time' }
          ].map((item, index) => (
            <div key={index} className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 group-hover:scale-110 transition-transform">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-gray-400 text-sm">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-8 text-center border border-blue-500/30">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Start Corporate Governance Voting?
        </h2>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          Join our decentralized governance platform and participate in transparent, fair corporate decision-making processes
        </p>
        {wallet.isConnected ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="gradient-button flex items-center space-x-2 text-lg px-8 py-4"
            >
              <TrendingUp className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/vote"
              className="btn-secondary flex items-center space-x-2 text-lg px-8 py-4"
            >
              <Vote className="h-5 w-5" />
              <span>Vote Now</span>
            </Link>
          </div>
        ) : (
          <div className="bg-orange-500/20 border border-orange-500/30 text-orange-300 px-6 py-3 rounded-lg inline-flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Connect MetaMask wallet to continue</span>
          </div>
        )}
      </section>
    </div>
  )
}

export default HomePage