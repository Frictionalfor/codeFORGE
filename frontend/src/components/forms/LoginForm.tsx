import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/FirebaseAuthContext'
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import toast from 'react-hot-toast'

interface LoginFormProps {
  onSuccess?: () => void
  redirectTo?: string
  onGoogleSignIn?: () => Promise<void>
  onForgotPassword?: (email: string) => Promise<void>
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess, 
  redirectTo = '/dashboard',
  onGoogleSignIn,
  onForgotPassword
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  
  // Prevent unused variable warning
  if (showForgotPassword) {
    // This will be used for forgot password modal in the future
  }
  
  const { signInWithEmail, signInWithGoogle, sendPasswordReset, error, clearError } = useAuth()
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    clearError()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      await signInWithEmail(formData.email, formData.password)
      toast.success('Welcome back!')
      
      if (onSuccess) {
        onSuccess()
      } else {
        navigate(redirectTo)
      }
    } catch (error) {
      // Error is handled by the auth context
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      if (onGoogleSignIn) {
        await onGoogleSignIn()
      } else {
        await signInWithGoogle()
        toast.success('Welcome!')
        
        if (onSuccess) {
          onSuccess()
        } else {
          navigate(redirectTo)
        }
      }
    } catch (error) {
      // Error is handled by the auth context
      console.error('Google sign-in error:', error)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setErrors({ email: 'Please enter your email address first' })
      return
    }

    try {
      if (onForgotPassword) {
        await onForgotPassword(formData.email)
      } else {
        await sendPasswordReset(formData.email)
      }
      toast.success('Password reset email sent!')
      setShowForgotPassword(false)
    } catch (error) {
      // Error is handled by the auth context
      console.error('Password reset error:', error)
    }
  }

  const displayError = error || errors.general

  return (
    <div className="space-y-6">
      {displayError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 no-select">
          <p className="text-red-400 text-sm text-selectable">{displayError}</p>
        </div>
      )}

      {/* Google Sign In Button */}
      <Button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading || isGoogleLoading}
        variant="outline"
        className="w-full hover-lift"
        size="lg"
      >
        {isGoogleLoading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
            Signing in with Google...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </>
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-slate-900 text-slate-400">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email"
          error={errors.email}
          leftIcon={<Mail className="h-5 w-5" />}
          className="smooth-transition"
          disabled={isLoading || isGoogleLoading}
        />

        <Input
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Enter your password"
          error={errors.password}
          leftIcon={<Lock className="h-5 w-5" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-300 transition-colors no-select hover-lift focus-ring rounded p-1"
              disabled={isLoading || isGoogleLoading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          }
          className="smooth-transition"
          disabled={isLoading || isGoogleLoading}
        />

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            disabled={isLoading || isGoogleLoading}
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          loading={isLoading}
          disabled={isGoogleLoading}
          className="w-full hover-lift"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Signing in...
            </>
          ) : (
            'Sign in with Email'
          )}
        </Button>
      </form>
    </div>
  )
}

export default LoginForm