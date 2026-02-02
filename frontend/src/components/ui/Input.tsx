import React from 'react'
import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'glow'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  variant = 'default',
  className,
  id,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

  // Wrapper classes that handle focus and error states
  const wrapperClasses = clsx(
    // Base wrapper styles - flex container with consistent dimensions
    'flex items-center w-full rounded-lg border bg-slate-800 transition-all duration-200',
    // Default state
    'border-slate-600',
    // Focus state - applied to wrapper, not input
    'focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20',
    // Glow variant
    variant === 'glow' && 'focus-within:ring-4 focus-within:ring-primary-500/30',
    // Error state - applied to wrapper, not input
    error && 'border-error-500 focus-within:border-error-500 focus-within:ring-error-500/20',
    // Shadow for depth
    'shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.2)]'
  )

  // Input classes - minimal styling, no borders or focus states
  const inputClasses = clsx(
    // Base input styles - no borders, backgrounds, or focus states
    'flex-1 bg-transparent text-gray-100 placeholder-gray-400 outline-none',
    // Padding based on icon presence
    leftIcon ? 'pl-3' : 'pl-4',
    rightIcon ? 'pr-3' : 'pr-4',
    'py-3',
    // Custom className overrides
    className
  )

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      
      {/* Flex wrapper that maintains consistent dimensions */}
      <div className={wrapperClasses}>
        {/* Left icon - perfectly centered in flex container */}
        {leftIcon && (
          <div className="flex items-center justify-center pl-4 pr-1">
            <div className="text-gray-400 no-select">
              {leftIcon}
            </div>
          </div>
        )}
        
        {/* Input field - no styling that affects layout */}
        <input
          id={inputId}
          className={inputClasses}
          {...props}
        />
        
        {/* Right icon - perfectly centered in flex container */}
        {rightIcon && (
          <div className="flex items-center justify-center pl-1 pr-4">
            <div className="text-gray-400">
              {rightIcon}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-error-400 animate-slide-down">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
}

export default Input