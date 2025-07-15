import React from 'react'
import { Shield, Github, ExternalLink } from 'lucide-react'
import { getExplorerLink } from '@/utils/web3'
import { CONTRACT_ADDRESS } from '@/utils/constants'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black/20 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-8 w-8 text-blue-400" />
              <div>
                <h3 className="text-white font-bold text-lg">CorporateDAO</h3>
                <p className="text-blue-200 text-sm">Corporate Governance Voting System</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md">
              Blockchain-based corporate governance voting platform supporting confidential voting and transparent decision-making.
              Smart contracts ensure fairness and immutability of the voting process.
            </p>
            <div className="mt-4 flex items-center space-x-4">
              <div className="text-xs text-gray-400">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Sepolia Testnet
              </div>
              <a
                href={getExplorerLink(CONTRACT_ADDRESS, 'address')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
              >
                <span>View Contract</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/vote" className="text-gray-300 hover:text-white transition-colors">
                  Participate in Voting
                </a>
              </li>
              <li>
                <a href="/proposals" className="text-gray-300 hover:text-white transition-colors">
                  View Proposals
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Management Dashboard
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://docs.metamask.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
                >
                  <span>MetaMask Documentation</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://sepolia.etherscan.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
                >
                  <span>Sepolia Explorer</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://sepoliafaucet.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
                >
                  <span>Get Test Tokens</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://ethereum.org/zh/developers/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
                >
                  <span>Ethereum Development</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {currentYear} CorporateDAO. Blockchain-based corporate governance voting platform.
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Technical Info */}
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>React + TypeScript</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Ethers.js</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Solidity</span>
                </span>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-3">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  title="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Contract Address */}
          <div className="mt-4 text-center">
            <div className="text-xs text-gray-500">
              Contract Address: 
              <a
                href={getExplorerLink(CONTRACT_ADDRESS, 'address')}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-blue-400 hover:text-blue-300 font-mono"
              >
                {CONTRACT_ADDRESS}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer