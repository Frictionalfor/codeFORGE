import React from 'react'
import { clsx } from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'hover' | 'glow' | 'glass'
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className,
  padding = 'md',
  variant = 'default',
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const variantClasses = {
    default: 'card',
    hover: 'card-hover',
    glow: 'card-glow',
    glass: 'glass p-6 rounded-xl'
  }

  return (
    <div 
      className={clsx(
        variantClasses[variant],
        variant !== 'glass' && paddingClasses[padding],
        'animate-fade-in',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card