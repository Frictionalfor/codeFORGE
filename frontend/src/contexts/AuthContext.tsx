import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '../services/authService'
import { User } from '../types/auth'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }

interface AuthContextType extends AuthState {
  login: (_userEmail: string, _userPassword: string) => Promise<void>
  register: (_userEmail: string, _userPassword: string, _userName: string, _userRole: 'teacher' | 'student') => Promise<void>
  updateProfile: (_profileData: { name?: string; bio?: string; institution?: string; major?: string; year?: string }) => Promise<void>
  changePassword: (_currentPassword: string, _newPassword: string) => Promise<void>
  logout: () => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      }
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    default:
      return state
  }
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (token) {
          const user = await authService.getProfile()
          dispatch({ type: 'AUTH_SUCCESS', payload: user })
        } else {
          dispatch({ type: 'AUTH_LOGOUT' })
        }
      } catch (error) {
        // Token might be expired or invalid
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        dispatch({ type: 'AUTH_LOGOUT' })
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' })
      const { user, tokens } = await authService.login(email, password)
      
      // Store tokens
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
      
      dispatch({ type: 'AUTH_SUCCESS', payload: user })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      dispatch({ type: 'AUTH_ERROR', payload: message })
      throw error
    }
  }

  const register = async (email: string, password: string, name: string, role: 'teacher' | 'student') => {
    try {
      dispatch({ type: 'AUTH_START' })
      const { user, tokens } = await authService.register(email, password, name, role)
      
      // Store tokens
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
      
      dispatch({ type: 'AUTH_SUCCESS', payload: user })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed'
      dispatch({ type: 'AUTH_ERROR', payload: message })
      throw error
    }
  }

  const updateProfile = async (profileData: { name?: string; bio?: string; institution?: string; major?: string; year?: string }) => {
    try {
      const updatedUser = await authService.updateProfile(profileData)
      dispatch({ type: 'AUTH_SUCCESS', payload: updatedUser })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Profile update failed'
      dispatch({ type: 'AUTH_ERROR', payload: message })
      throw error
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await authService.changePassword(currentPassword, newPassword)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password change failed'
      dispatch({ type: 'AUTH_ERROR', payload: message })
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    dispatch({ type: 'AUTH_LOGOUT' })
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value: AuthContextType = {
    ...state,
    login,
    register,
    updateProfile,
    changePassword,
    logout,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}