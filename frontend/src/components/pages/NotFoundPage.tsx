import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* 404 Number */}
        <div className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          404
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Page Not Found
          </h1>
          <p className="text-gray-400 max-w-md mx-auto">
            Sorry, the page you are looking for does not exist or has been removed.
          </p>
        </div>

        {/* Back Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/"
            className="gradient-button flex items-center space-x-2 px-6 py-3"
          >
            <Home className="h-5 w-5" />
            <span>Return Home</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="btn-secondary flex items-center space-x-2 px-6 py-3"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Helpful Links */}
        <div className="pt-8 border-t border-white/10">
          <p className="text-gray-400 text-sm mb-4">You might want to visit:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/vote" className="text-blue-400 hover:text-blue-300 transition-colors">
              Participate in Voting
            </Link>
            <Link to="/proposals" className="text-blue-400 hover:text-blue-300 transition-colors">
              View Proposals
            </Link>
            <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage