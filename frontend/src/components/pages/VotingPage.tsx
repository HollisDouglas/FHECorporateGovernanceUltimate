import React, { useState } from 'react'
import { useWeb3 } from '@/providers/Web3Provider'
import { Vote, AlertCircle, Wallet, Clock, Users, TrendingUp, CheckCircle, XCircle, MinusCircle, ChevronRight } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useContract, OnChainProposal } from '@/hooks/useContract'
import { ProposalTypeLabels as PROPOSAL_TYPE_LABELS, VoteChoice } from '@/types/web3'
import { formatAddress } from '@/utils/web3'
import { createTestProposal, createPresetProposal, initializeCompany, addBoardMember, addShareholder } from '@/utils/testProposal'
import { PRESET_PROPOSALS, VOTE_OPTIONS } from '@/data/presetProposals'
import { MOCK_ACTIVE_PROPOSALS } from '@/data/mockActiveProposals'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

const VotingPage: React.FC = () => {
  const { wallet, contract } = useWeb3()
  const { castVote, getActiveProposals, loading, error } = useContract()
  const [selectedProposal, setSelectedProposal] = useState<OnChainProposal | null>(null)
  const [votingInProgress, setVotingInProgress] = useState<number | null>(null)
  const [showVoteModal, setShowVoteModal] = useState(false)

  const onChainProposals = getActiveProposals()
  // Combine on-chain proposals with mock active proposals for testing
  const activeProposals = [...onChainProposals, ...MOCK_ACTIVE_PROPOSALS]

  // If wallet is not connected
  if (!wallet.isConnected) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md mx-auto">
          <Wallet className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet</h2>
          <p className="text-gray-300 mb-6">
            Please connect your MetaMask wallet to participate in voting
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  // If contract is loading
  if (contract.isLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading contract data..." />
      </div>
    )
  }

  // If contract failed to load
  if (contract.error || error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md mx-auto">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Contract Connection Failed</h2>
          <p className="text-gray-300 mb-6">{contract.error || error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Reload
          </button>
        </div>
      </div>
    )
  }

  const handleVote = async (proposalId: number, voteChoice: VoteChoice) => {
    if (!wallet.isConnected || !contract.contract) {
      toast.error('Please connect your wallet and ensure contract is loaded')
      return
    }

    setVotingInProgress(proposalId)
    
    try {
      // Cast real vote on blockchain using useContract hook
      // Even mock proposals will trigger real blockchain transactions
      const success = await castVote(proposalId, voteChoice)
      
      if (success) {
        toast.success(`Successfully voted on proposal #${proposalId}!`)
        setShowVoteModal(false)
        setSelectedProposal(null)
      }
      
    } catch (error: any) {
      console.error('Voting error:', error)
      toast.error(`Voting failed: ${error.message || 'Unknown error'}`)
    } finally {
      setVotingInProgress(null)
    }
  }

  const openVoteModal = (proposal: OnChainProposal) => {
    setSelectedProposal(proposal)
    setShowVoteModal(true)
  }

  const getStatusColor = (proposal: OnChainProposal) => {
    const totalVotes = proposal.forVotes + proposal.againstVotes
    if (totalVotes === 0) return 'text-gray-400'
    
    const forPercent = (proposal.forVotes / totalVotes) * 100
    if (forPercent >= 50) return 'text-green-400'
    if (forPercent < 30) return 'text-red-400'
    return 'text-yellow-400'
  }

  const getVotingProgress = (proposal: OnChainProposal) => {
    const totalVotes = proposal.forVotes + proposal.againstVotes
    if (totalVotes === 0) {
      return { forPercent: 0, againstPercent: 0, abstainPercent: 0 }
    }
    
    const forPercent = (proposal.forVotes / totalVotes) * 100
    const againstPercent = (proposal.againstVotes / totalVotes) * 100
    
    return {
      forPercent,
      againstPercent,
      abstainPercent: 0 // abstain votes not implemented in current contract
    }
  }

  const formatTimeRemaining = (deadline: number) => {
    const now = Math.floor(Date.now() / 1000)
    const remaining = deadline - now
    
    if (remaining <= 0) return 'Expired'
    
    const days = Math.floor(remaining / (24 * 60 * 60))
    const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60))
    
    if (days > 0) return `${days}d ${hours}h remaining`
    if (hours > 0) return `${hours}h remaining`
    return 'Less than 1h remaining'
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Vote className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Participate in Voting</h1>
            <p className="text-gray-300">View active proposals and cast your votes</p>
          </div>
        </div>
        
        {/* Test Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={async () => {
              try {
                toast.loading('Registering as shareholder...', { id: 'register' })
                const provider = new ethers.BrowserProvider(window.ethereum!)
                const signer = await provider.getSigner()
                const address = await signer.getAddress()
                await addShareholder(address, 1000, 'Registered Voter')
                toast.success('Successfully registered as shareholder!', { id: 'register' })
              } catch (error: any) {
                console.error('Registration error:', error)
                toast.error(`Registration failed: ${error.reason || error.message}`, { id: 'register' })
              }
            }}
            className="btn-primary text-xs px-4 py-2 bg-green-600 hover:bg-green-700"
          >
            🗳️ Register to Vote
          </button>
          <button
            onClick={async () => {
              try {
                toast.loading('Initializing company...', { id: 'init' })
                const result = await initializeCompany()
                if (result?.alreadyInitialized) {
                  toast.success('Company already initialized!', { id: 'init' })
                } else {
                  toast.success('Company initialized successfully!', { id: 'init' })
                }
              } catch (error: any) {
                console.error('Initialize error:', error)
                toast.error(`Failed to initialize: ${error.reason || error.message}`, { id: 'init' })
              }
            }}
            className="btn-secondary text-xs px-3 py-1"
          >
            Initialize Company
          </button>
          <button
            onClick={async () => {
              try {
                toast.loading('Adding as shareholder...', { id: 'shareholder' })
                const provider = new ethers.BrowserProvider(window.ethereum!)
                const signer = await provider.getSigner()
                const address = await signer.getAddress()
                await addShareholder(address, 1000, 'Test User')
                toast.success('Shareholder added successfully!', { id: 'shareholder' })
              } catch (error: any) {
                console.error('Shareholder error:', error)
                toast.error(`Failed to add shareholder: ${error.reason || error.message}`, { id: 'shareholder' })
              }
            }}
            className="btn-secondary text-xs px-3 py-1"
          >
            Add Self as Shareholder
          </button>
          <button
            onClick={async () => {
              try {
                toast.loading('Adding board member...', { id: 'board' })
                const provider = new ethers.BrowserProvider(window.ethereum!)
                const signer = await provider.getSigner()
                const address = await signer.getAddress()
                const result = await addBoardMember(address)
                if (result?.alreadyBoardMember) {
                  toast.success('Already a board member!', { id: 'board' })
                } else {
                  toast.success('Board member added successfully!', { id: 'board' })
                }
              } catch (error: any) {
                console.error('Board member error:', error)
                toast.error(`Failed to add board member: ${error.reason || error.message}`, { id: 'board' })
              }
            }}
            className="btn-secondary text-xs px-3 py-1"
          >
            Add Self as Board
          </button>
          <button
            onClick={async () => {
              try {
                toast.loading('Creating test proposal...', { id: 'proposal' })
                await createTestProposal()
                toast.success('Test proposal created successfully!', { id: 'proposal' })
                // Refresh the page to load new proposal
                setTimeout(() => window.location.reload(), 1000)
              } catch (error: any) {
                console.error('Create proposal error:', error)
                toast.error(`Failed to create proposal: ${error.reason || error.message}`, { id: 'proposal' })
              }
            }}
            className="btn-secondary text-xs px-3 py-1"
          >
            Create Test Proposal
          </button>
        </div>
      </div>

      {/* Wallet Info */}
      <div className="glass-card p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Wallet Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-gray-300">
            <span className="text-white font-medium">Address:</span>{' '}
            <span className="font-mono">{formatAddress(wallet.account || '')}</span>
          </div>
          <div className="text-gray-300">
            <span className="text-white font-medium">Balance:</span>{' '}
            <span className="text-green-400">{wallet.balance || '0'} SEP</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-400 font-medium">Connected</span>
          </div>
        </div>
      </div>

      {/* Preset Proposals for Testing */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Quick Create Proposals (Test Real Transactions)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRESET_PROPOSALS.map((preset) => (
            <div key={preset.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2 text-sm">{preset.title}</h3>
              <p className="text-gray-300 text-xs mb-3 line-clamp-2">{preset.description}</p>
              <div className="flex justify-between items-center text-xs text-gray-400 mb-3">
                <span>Type: {preset.type}</span>
                <span>{preset.duration} days</span>
              </div>
              <button
                onClick={async () => {
                  try {
                    toast.loading(`Creating: ${preset.title}...`, { id: `create-${preset.id}` })
                    await createPresetProposal(preset)
                    toast.success('Proposal created! Refresh to see it.', { id: `create-${preset.id}` })
                    setTimeout(() => window.location.reload(), 1000)
                  } catch (error: any) {
                    console.error('Create preset proposal error:', error)
                    toast.error(`Failed: ${error.reason || error.message}`, { id: `create-${preset.id}` })
                  }
                }}
                className="w-full btn-primary text-xs py-2"
              >
                Create This Proposal
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Proposals - Real + Mock for Testing */}
      {activeProposals.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Active Proposals ({activeProposals.length})</h2>
          <p className="text-gray-300 text-sm">Click "Vote Now" on any proposal to test real MetaMask transactions</p>
          
          {activeProposals.map((proposal) => {
            const progress = getVotingProgress(proposal)
            const isMockProposal = MOCK_ACTIVE_PROPOSALS.find(mock => mock.id === proposal.id)
            return (
              <div key={proposal.id} className="glass-card p-6 hover:bg-white/5 transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">
                        {PROPOSAL_TYPE_LABELS[proposal.proposalType as keyof typeof PROPOSAL_TYPE_LABELS]}
                      </span>
                      {isMockProposal && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs border border-green-500/30">
                          Test Proposal - Real Transactions
                        </span>
                      )}
                      <span className="text-gray-400 text-sm">ID #{proposal.id}</span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white mb-2">{proposal.title}</h3>
                    <p className="text-gray-300 mb-4 line-clamp-2">{proposal.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-400 mb-4">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{proposal.forVotes + proposal.againstVotes} votes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatTimeRemaining(proposal.deadline)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4" />
                        <span className={getStatusColor(proposal)}>
                          {progress.forPercent.toFixed(1)}% approval
                        </span>
                      </div>
                    </div>

                    {/* Voting Progress Bar */}
                    <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                      <div className="relative h-full rounded-full overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-300"
                          style={{ width: `${progress.forPercent}%` }}
                        />
                        <div 
                          className="absolute top-0 h-full bg-red-500 transition-all duration-300"
                          style={{ 
                            left: `${progress.forPercent}%`, 
                            width: `${progress.againstPercent}%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Vote Counts */}
                    <div className="flex space-x-6 text-sm">
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-300">For: {proposal.forVotes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-gray-300">Against: {proposal.againstVotes}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-6">
                    <button
                      onClick={() => openVoteModal(proposal)}
                      disabled={votingInProgress === proposal.id}
                      className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                    >
                      {votingInProgress === proposal.id ? (
                        <>
                          <LoadingSpinner size="small" />
                          <span>Voting...</span>
                        </>
                      ) : (
                        <>
                          <Vote className="h-4 w-4" />
                          <span>Vote Now</span>
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Vote className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">No Active Proposals</h2>
          <p className="text-gray-400 mb-6">
            There are currently no active proposals available for voting.
          </p>
        </div>
      )}

      {/* Voting Modal */}
      {showVoteModal && selectedProposal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Cast Your Vote</h2>
              <button
                onClick={() => setShowVoteModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">{selectedProposal.title}</h3>
              <p className="text-gray-300 text-sm mb-4">{selectedProposal.description}</p>
              
              {MOCK_ACTIVE_PROPOSALS.find(mock => mock.id === selectedProposal.id) && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <p className="text-green-300 text-sm font-medium">Test Proposal</p>
                  </div>
                  <p className="text-green-200/80 text-xs mt-1">
                    This is a test proposal. Your vote will trigger a real MetaMask transaction on Sepolia testnet.
                  </p>
                </div>
              )}
              
              <div className="text-sm text-gray-400">
                <div>Proposal Type: {PROPOSAL_TYPE_LABELS[selectedProposal.proposalType as keyof typeof PROPOSAL_TYPE_LABELS]}</div>
                <div>Total votes: {selectedProposal.forVotes + selectedProposal.againstVotes}</div>
                <div>Time remaining: {formatTimeRemaining(selectedProposal.deadline)}</div>
                <div>Status: {selectedProposal.active ? 'Active' : 'Inactive'}</div>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              {VOTE_OPTIONS.map((option) => {
                const IconComponent = option.value === 1 ? CheckCircle : option.value === 2 ? XCircle : MinusCircle
                const colorClasses = {
                  green: 'bg-green-500/20 hover:bg-green-500/30 border-green-500/50 text-green-300',
                  red: 'bg-red-500/20 hover:bg-red-500/30 border-red-500/50 text-red-300',
                  yellow: 'bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/50 text-yellow-300'
                }
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleVote(selectedProposal.id, option.value)}
                    disabled={votingInProgress !== null}
                    className={`w-full border py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 disabled:opacity-50 ${
                      colorClasses[option.color as keyof typeof colorClasses]
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <div className="text-left">
                      <div>{option.label}</div>
                      <div className="text-xs opacity-75">{option.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-blue-300 text-sm font-semibold mb-1">Private Voting</p>
                  <p className="text-blue-200/80 text-xs">
                    Your vote will be encrypted using FHE technology to ensure complete privacy while maintaining verifiability.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Registration Notice */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-yellow-300 text-sm font-semibold mb-1">Shareholder Registration Required</p>
                  <p className="text-yellow-200/80 text-xs mb-2">
                    You need to be a registered shareholder to vote. If you're not registered, click the button below.
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        toast.loading('Registering as shareholder...', { id: 'register-modal' })
                        const provider = new ethers.BrowserProvider(window.ethereum!)
                        const signer = await provider.getSigner()
                        const address = await signer.getAddress()
                        await addShareholder(address, 1000, 'Registered Voter')
                        toast.success('Successfully registered as shareholder!', { id: 'register-modal' })
                      } catch (error: any) {
                        console.error('Registration error:', error)
                        toast.error(`Registration failed: ${error.reason || error.message}`, { id: 'register-modal' })
                      }
                    }}
                    className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 px-3 py-1 rounded text-xs font-medium transition-all"
                  >
                    Register as Shareholder
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowVoteModal(false)}
              className="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg font-semibold transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default VotingPage