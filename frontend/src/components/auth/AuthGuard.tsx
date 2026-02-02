import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/FirebaseAuthContext'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true,
  redirectTo = '/login'
}) => {
  const { firebaseUser, userProfile, loading, needsRoleSelection, needsEmailVerification } = useAuth()
  const location = useLocation()

  const isAuthenticated = !!firebaseUser
  const isFullyAuthenticated = isAuthenticated && !!userProfile && !needsRoleSelection && !needsEmailVerification

  console.log('🛡️ AuthGuard Debug:', {
    firebaseUser: !!firebaseUser,
    userProfile: !!userProfile,
    userRole: userProfile?.role,
    loading,
    needsRoleSelection,
    needsEmailVerification,
    isAuthenticated,
    isFullyAuthenticated,
    requireAuth,
    currentPath: location.pathname
  });

  if (loading) {
    console.log('⏳ AuthGuard: Loading, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    console.log('🚫 AuthGuard: Auth required but not authenticated, redirecting to', redirectTo);
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // If authentication is required but user hasn't completed setup
  if (requireAuth && isAuthenticated && (needsRoleSelection || needsEmailVerification)) {
    console.log('⚠️ AuthGuard: Auth required but setup incomplete, letting AuthApp handle');
    // Let AuthApp handle role selection and email verification
    return <>{children}</>
  }

  // If authentication is not required but user is fully authenticated (e.g., login page)
  if (!requireAuth && isFullyAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard'
    console.log('↩️ AuthGuard: Not required but fully authenticated, redirecting to', from);
    return <Navigate to={from} replace />
  }

  // Special case: if user is fully authenticated but on landing page, redirect to dashboard
  if (isFullyAuthenticated && location.pathname === '/') {
    console.log('🏠 AuthGuard: Fully authenticated user on landing page, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />
  }

  console.log('✅ AuthGuard: Showing children');
  return <>{children}</>
}