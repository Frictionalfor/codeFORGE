import React from 'react';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import { RoleSelection } from './RoleSelection';
import { EmailVerification } from './EmailVerification';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface AuthAppProps {
  children: React.ReactNode;
}

export const AuthApp: React.FC<AuthAppProps> = ({ children }) => {
  const { 
    firebaseUser, 
    userProfile,
    loading, 
    needsRoleSelection, 
    needsEmailVerification, 
    selectRole, 
    sendEmailVerification 
  } = useAuth();

  // Debug logging
  console.log('🔍 AuthApp Debug:', {
    firebaseUser: !!firebaseUser,
    userProfile: !!userProfile,
    userRole: userProfile?.role,
    loading,
    needsRoleSelection,
    needsEmailVerification,
    currentPath: window.location.pathname
  });

  // Show loading spinner while authentication state is being determined
  if (loading) {
    console.log('⏳ AuthApp: Showing loading spinner');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-slate-300 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, let the routing handle login/register pages
  if (!firebaseUser) {
    console.log('🚫 AuthApp: No Firebase user, showing children');
    return <>{children}</>;
  }

  // If user needs to select a role, show role selection
  if (needsRoleSelection) {
    console.log('🎯 AuthApp: Showing role selection');
    return (
      <RoleSelection
        onRoleSelected={selectRole}
        loading={loading}
      />
    );
  }

  // If user needs email verification, show verification screen
  if (needsEmailVerification) {
    console.log('📧 AuthApp: Showing email verification');
    return (
      <EmailVerification
        email={firebaseUser.email!}
        onResendVerification={sendEmailVerification}
        onRefresh={() => window.location.reload()}
        loading={loading}
      />
    );
  }

  // User is fully authenticated and verified, show the app
  console.log('✅ AuthApp: User fully authenticated, showing app');
  return <>{children}</>;
};