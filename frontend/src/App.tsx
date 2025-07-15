import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useWeb3 } from '@/providers/Web3Provider'

// Components
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'

// Pages
import HomePage from '@/components/pages/HomePage'
import VotingPage from '@/components/pages/VotingPage'
import ProposalsPage from '@/components/pages/ProposalsPage'
import DashboardPage from '@/components/pages/DashboardPage'
import NotFoundPage from '@/components/pages/NotFoundPage'

const App: React.FC = () => {
  const { wallet, contract } = useWeb3()

  // Show loading state
  if (wallet.isConnecting || contract.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Connecting to blockchain..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Header navigation */}
      <Header />
      
      {/* Main content area */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Routes>
          {/* Home page */}
          <Route path="/" element={<HomePage />} />
          
          {/* Voting page */}
          <Route path="/vote" element={<VotingPage />} />
          <Route path="/vote/:proposalId" element={<VotingPage />} />
          
          {/* Proposals page */}
          <Route path="/proposals" element={<ProposalsPage />} />
          <Route path="/proposals/create" element={<ProposalsPage />} />
          
          {/* Dashboard page */}
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* 404 page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Global error notifications */}
      {wallet.error && (
        <div className="fixed bottom-4 right-4 max-w-sm">
          <div className="bg-red-500/90 backdrop-blur-md text-white px-4 py-3 rounded-lg shadow-lg border border-red-400/30">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-200" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium">{wallet.error}</p>
            </div>
          </div>
        </div>
      )}
      
      {contract.error && (
        <div className="fixed bottom-4 left-4 max-w-sm">
          <div className="bg-orange-500/90 backdrop-blur-md text-white px-4 py-3 rounded-lg shadow-lg border border-orange-400/30">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-orange-200" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium">{contract.error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App