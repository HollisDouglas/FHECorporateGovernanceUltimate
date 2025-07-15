import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useWeb3 } from '@/providers/Web3Provider'
import { formatAddress, isMetaMaskInstalled } from '@/utils/web3'
import { Shield, Menu, X, Wallet, LogOut, ChevronDown } from 'lucide-react'

const Header: React.FC = () => {
  const { wallet, connectWallet, disconnectWallet } = useWeb3()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false)

  const navigation = [
    { name: 'Home', href: '/', current: location.pathname === '/' },
    { name: 'Vote', href: '/vote', current: location.pathname.startsWith('/vote') },
    { name: 'Proposals', href: '/proposals', current: location.pathname.startsWith('/proposals') },
    { name: 'Dashboard', href: '/dashboard', current: location.pathname.startsWith('/dashboard') },
  ]

  const handleConnectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      window.open('https://metamask.io/download/', '_blank')
      return
    }
    await connectWallet()
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleWalletMenu = () => {
    setIsWalletMenuOpen(!isWalletMenuOpen)
  }

  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-400" />
              <div className="flex flex-col">
                <span className="font-bold text-white text-lg">CorporateDAO</span>
                <span className="text-xs text-blue-200">Corporate Governance</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    item.current
                      ? 'bg-blue-500/20 text-blue-300 border-b-2 border-blue-400'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:block">
            {wallet.isConnected ? (
              <div className="relative">
                <button
                  onClick={toggleWalletMenu}
                  className="flex items-center space-x-2 bg-green-500/20 text-green-300 px-4 py-2 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-all duration-200"
                >
                  <Wallet className="h-4 w-4" />
                  <span className="font-mono text-sm">
                    {formatAddress(wallet.account!)}
                  </span>
                  {wallet.balance && (
                    <span className="text-xs bg-green-500/30 px-2 py-1 rounded">
                      {parseFloat(wallet.balance).toFixed(4)} SEP
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* Wallet Dropdown */}
                {isWalletMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-gray-800/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-600 z-10">
                    <div className="p-4 border-b border-gray-600">
                      <div className="text-sm text-gray-300">Wallet Address</div>
                      <div className="font-mono text-sm text-white break-all">
                        {wallet.account}
                      </div>
                      <div className="text-sm text-gray-300 mt-2">Balance</div>
                      <div className="text-lg font-semibold text-green-400">
                        {wallet.balance ? `${parseFloat(wallet.balance).toFixed(4)} SEP` : 'Loading...'}
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          disconnectWallet()
                          setIsWalletMenuOpen(false)
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-red-300 hover:bg-red-500/20 rounded-md transition-all duration-200"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Disconnect</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={wallet.isConnecting}
                className="gradient-button flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {wallet.isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    <span>Connect Wallet</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-white p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 mt-4 pt-4 pb-4">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                    item.current
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile Wallet Section */}
            <div className="mt-4 pt-4 border-t border-white/20">
              {wallet.isConnected ? (
                <div className="space-y-2">
                  <div className="px-3 py-2">
                    <div className="text-sm text-gray-300">Connected Address</div>
                    <div className="font-mono text-sm text-white">
                      {formatAddress(wallet.account!)}
                    </div>
                    {wallet.balance && (
                      <div className="text-sm text-green-400 mt-1">
                        Balance: {parseFloat(wallet.balance).toFixed(4)} SEP
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      disconnectWallet()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-500/20 text-red-300 rounded-md"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Disconnect</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    handleConnectWallet()
                    setIsMobileMenuOpen(false)
                  }}
                  disabled={wallet.isConnecting}
                  className="w-full gradient-button flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {wallet.isConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4" />
                      <span>Connect Wallet</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Click outside to close dropdown menu */}
      {isWalletMenuOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsWalletMenuOpen(false)}
        />
      )}
    </header>
  )
}

export default Header