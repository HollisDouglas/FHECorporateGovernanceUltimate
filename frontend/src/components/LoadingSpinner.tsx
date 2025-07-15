import React from 'react'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  text?: string
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  text,
  className = ''
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  }

  const spinnerClass = `animate-spin rounded-full border-2 border-blue-200 border-t-blue-600 ${sizeClasses[size]}`

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <div className={spinnerClass} />
      {text && (
        <p className="text-gray-300 text-sm font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

export default LoadingSpinner