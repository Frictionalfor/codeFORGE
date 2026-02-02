import React from 'react'
import { useAuth } from '../../contexts/FirebaseAuthContext'

interface RoleGuardProps {
  allowedRoles: ('teacher' | 'student')[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  allowedRoles,
  children,
  fallback 
}) => {
  const { userProfile } = useAuth()

  console.log('🛡️ RoleGuard Debug:', {
    userProfile: !!userProfile,
    userRole: userProfile?.role,
    allowedRoles,
    hasAccess: userProfile ? allowedRoles.includes(userProfile.role) : false
  });

  if (!userProfile) {
    console.log('⏳ RoleGuard: No user profile, showing fallback or null');
    return fallback ? <>{fallback}</> : null
  }

  if (allowedRoles.includes(userProfile.role)) {
    console.log('✅ RoleGuard: Access granted, showing children');
    return <>{children}</>
  }

  console.log('🚫 RoleGuard: Access denied, showing fallback or null');
  return fallback ? <>{fallback}</> : null
}