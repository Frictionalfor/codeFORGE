import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User as FirebaseUser, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification as firebaseSendEmailVerification,
  onAuthStateChanged,
  AuthError
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV === true;
const devMode = import.meta.env.VITE_DEV_MODE === 'true';
const isDevMode = isDevelopment && devMode;

// Types
interface UserProfile {
  id: string;
  firebaseUid: string;
  email: string;
  role: 'teacher' | 'student';
  name: string; // Add name to UserProfile
  emailVerified: boolean;
  bio?: string;
  institution?: string;
  major?: string;
  year?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ExtendedFirebaseUser extends FirebaseUser {
  profile?: UserProfile;
  hasSelectedRole: boolean;
}

interface AuthContextType {
  // Firebase user (for auth operations)
  firebaseUser: FirebaseUser | null;
  // User profile (for app data)
  userProfile: UserProfile | null;
  // Combined user state (for convenience)
  user: ExtendedFirebaseUser | null;
  // Auth states
  loading: boolean;
  needsRoleSelection: boolean;
  needsEmailVerification: boolean;
  error: string | null;
  // Auth methods
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (_email: string, _password: string) => Promise<void>;
  signUpWithEmail: (_email: string, _password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (_email: string) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  selectRole: (_role: 'teacher' | 'student') => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to convert Firebase auth errors to user-friendly messages
const getErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/invalid-email':
      return 'Please enter a valid email address';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again';
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled';
    case 'auth/popup-blocked':
      return 'Pop-up was blocked. Please allow pop-ups and try again';
    default:
      return 'An error occurred during authentication. Please try again';
  }
};

// API service functions
const apiService = {
  async getUserProfile(firebaseUid: string, token: string): Promise<UserProfile | null> {
    try {
      console.log('🌐 Fetching user profile for UID:', firebaseUid);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/firebase-auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Profile API response status:', response.status);

      if (response.status === 404) {
        console.log('👤 User profile not found - new user needs role selection');
        return null; // User profile doesn't exist yet
      }

      if (!response.ok) {
        console.error('❌ Profile API error:', response.status, response.statusText);
        throw new Error(`Failed to fetch user profile: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ User profile fetched successfully:', data.user);
      
      // Check if this was a migration response
      if (data.message && data.message.includes('migrated')) {
        console.log('🔄 User was migrated from legacy account');
      }
      
      return data.user;
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      throw error; // Re-throw to handle in loadUserProfile
    }
  },

  async createUserProfile(firebaseUid: string, _email: string, _role: 'teacher' | 'student', token: string): Promise<UserProfile> {
    console.log('🌐 API createUserProfile called');
    console.log('UID:', firebaseUid);
    console.log('Email:', _email);
    console.log('Role:', _role);
    console.log('Token length:', token.length);
    
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/firebase-auth/select-role`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: _role })
    });

    console.log('📡 Create profile API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Create profile API error:', errorData);
      
      // Handle specific error cases
      if (response.status === 409) {
        if (errorData.existingProfile) {
          console.log('🚫 Profile already exists:', errorData.existingProfile);
          // If profile exists, return it instead of throwing error
          return errorData.existingProfile;
        }
        throw new Error(errorData.error?.message || 'User profile already exists with a different role');
      }
      
      throw new Error(errorData.error?.message || 'Failed to create user profile');
    }

    const data = await response.json();
    console.log('✅ User profile created successfully:', data.user);
    return data.user;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Firebase user state (for auth operations)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  // User profile state (for app data)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  // Combined user state (for convenience)
  const [user, setUser] = useState<ExtendedFirebaseUser | null>(null);
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derived state - CRITICAL: Only show role selection for authenticated users without profiles
  const needsRoleSelection = firebaseUser && firebaseUser.emailVerified && !userProfile && !loading;
  const needsEmailVerification = firebaseUser && !firebaseUser.emailVerified;

  // Clear error function
  const clearError = () => setError(null);

  // Load user profile from backend
  const loadUserProfile = async (firebaseUser: FirebaseUser) => {
    try {
      console.log('🔄 Loading user profile for:', firebaseUser.uid);
      
      const token = await firebaseUser.getIdToken();
      const profile = await apiService.getUserProfile(firebaseUser.uid, token);
      
      // Update all user states
      setFirebaseUser(firebaseUser);
      setUserProfile(profile);
      
      // Create extended user object
      const extendedUser: ExtendedFirebaseUser = {
        ...firebaseUser,
        profile: profile || undefined,
        hasSelectedRole: !!profile
      };
      
      setUser(extendedUser);
      
      if (profile) {
        console.log('✅ Existing user found with role:', profile.role);
        console.log('🔒 Role is immutable - user cannot change from:', profile.role);
        
        // If user has a profile and we're not on the dashboard, redirect
        const currentPath = window.location.pathname;
        if (currentPath !== '/dashboard' && !currentPath.startsWith('/student') && !currentPath.startsWith('/teacher')) {
          console.log('🔄 Redirecting authenticated user to dashboard from:', currentPath);
          window.location.href = '/dashboard';
        }
      } else {
        console.log('⚠️ New user - needs role selection (one-time only)');
      }
      
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      
      // Set Firebase user even if profile loading fails
      setFirebaseUser(firebaseUser);
      setUserProfile(null);
      
      const extendedUser: ExtendedFirebaseUser = {
        ...firebaseUser,
        hasSelectedRole: false
      };
      
      setUser(extendedUser);
      
      // Only show role selection if it's a 404 (user not found)
      if (error instanceof Error && error.message.includes('404')) {
        console.log('⚠️ User not found in database - needs role selection');
      } else {
        console.log('⚠️ API error loading profile - may need role selection');
        // For non-404 errors, we should be more cautious about showing role selection
        // This prevents role selection from appearing due to temporary API issues
      }
    }
  };

  // Auth state listener
  useEffect(() => {
    if (isDevMode) {
      // Development mode - simulate authentication
      console.log('Development mode: Simulating authentication state');
      setLoading(false);
      return;
    }

    if (!auth) {
      console.error('Firebase auth not initialized');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔥 Auth state changed:', firebaseUser ? 'User signed in' : 'User signed out');
      setLoading(true);
      
      if (firebaseUser) {
        await loadUserProfile(firebaseUser);
      } else {
        // Clear all user states
        setFirebaseUser(null);
        setUserProfile(null);
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    if (isDevMode) {
      setError('Development mode: Firebase authentication disabled. Please set up Firebase credentials.');
      return;
    }

    if (!auth || !googleProvider) {
      setError('Firebase not initialized');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      // User state will be updated by the auth state listener
    } catch (error) {
      const authError = error as AuthError;
      setError(getErrorMessage(authError));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signInWithEmail = async (_email: string, _password: string) => {
    if (isDevMode) {
      console.log('Development mode: Firebase authentication disabled for', _email);
      // Reference parameters to avoid ESLint warnings
      console.log('Password length:', _password.length);
      setError('Development mode: Firebase authentication disabled. Please set up Firebase credentials.');
      return;
    }

    if (!auth) {
      setError('Firebase not initialized');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await signInWithEmailAndPassword(auth, _email, _password);
      // User state will be updated by the auth state listener
    } catch (error) {
      const authError = error as AuthError;
      setError(getErrorMessage(authError));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUpWithEmail = async (_email: string, _password: string) => {
    try {
      setError(null);
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth!, _email, _password);
      
      // Send email verification
      await firebaseSendEmailVerification(result.user);
      
      // User state will be updated by the auth state listener
    } catch (error) {
      const authError = error as AuthError;
      setError(getErrorMessage(authError));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth!);
      // User state will be cleared by the auth state listener
    } catch (error) {
      const authError = error as AuthError;
      setError(getErrorMessage(authError));
      throw error;
    }
  };

  // Send password reset email
  const sendPasswordReset = async (_email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth!, _email);
    } catch (error) {
      const authError = error as AuthError;
      setError(getErrorMessage(authError));
      throw error;
    }
  };

  // Send email verification
  const sendEmailVerification = async () => {
    try {
      setError(null);
      if (auth?.currentUser) {
        await firebaseSendEmailVerification(auth.currentUser);
      } else {
        throw new Error('No user is currently signed in');
      }
    } catch (error) {
      const authError = error as AuthError;
      setError(getErrorMessage(authError));
      throw error;
    }
  };

  // Select user role
  const selectRole = async (_role: 'teacher' | 'student') => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('🔥 Firebase selectRole called with:', _role);

      if (!firebaseUser) {
        throw new Error('No Firebase user is currently signed in');
      }

      console.log('👤 Current Firebase user:', firebaseUser.uid, firebaseUser.email);
      
      // CRITICAL: Double-check if user already has a profile before attempting role selection
      console.log('🔍 Double-checking for existing profile before role selection...');
      try {
        const token = await firebaseUser.getIdToken();
        const existingProfile = await apiService.getUserProfile(firebaseUser.uid, token);
        
        if (existingProfile) {
          console.log('⚠️ User already has profile with role:', existingProfile.role);
          console.log('🔄 Using existing profile instead of creating new one');
          
          // Update all user states with existing profile
          setUserProfile(existingProfile);
          
          const updatedUser: ExtendedFirebaseUser = {
            ...firebaseUser,
            profile: existingProfile,
            hasSelectedRole: true
          };
          
          setUser(updatedUser);
          
          // Redirect to dashboard
          console.log('🔄 Redirecting to dashboard with existing profile');
          window.location.href = '/dashboard';
          return;
        }
      } catch (profileCheckError) {
        console.log('🔍 No existing profile found, proceeding with role selection');
      }
      
      const token = await firebaseUser.getIdToken();
      console.log('🎫 Got Firebase token, length:', token.length);
      
      console.log('📡 Calling API to create user profile...');
      const profile = await apiService.createUserProfile(firebaseUser.uid, firebaseUser.email!, _role, token);

      // Update all user states immediately
      setUserProfile(profile);
      
      const updatedUser: ExtendedFirebaseUser = {
        ...firebaseUser,
        profile: profile,
        hasSelectedRole: true
      };
      
      setUser(updatedUser);
      console.log('🎉 Role selection completed successfully! User is now:', profile.role);
      
      // Force a small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect to dashboard after role selection
      console.log('🔄 Redirecting to dashboard after role selection');
      window.location.href = '/dashboard';
      
    } catch (error) {
      console.error('❌ Error in selectRole:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          console.log('🔄 Profile already exists, attempting to fetch existing profile...');
          // Try to fetch the existing profile
          try {
            if (!firebaseUser) {
              throw new Error('Firebase user is null');
            }
            
            const token = await firebaseUser.getIdToken();
            const existingProfile = await apiService.getUserProfile(firebaseUser.uid, token);
            
            if (existingProfile) {
              console.log('✅ Found existing profile:', existingProfile.role);
              setUserProfile(existingProfile);
              
              const updatedUser: ExtendedFirebaseUser = {
                ...firebaseUser,
                profile: existingProfile,
                hasSelectedRole: true,
                emailVerified: firebaseUser.emailVerified || false
              };
              
              setUser(updatedUser);
              window.location.href = '/dashboard';
              return;
            }
          } catch (fetchError) {
            console.error('❌ Failed to fetch existing profile:', fetchError);
          }
          
          setError('You already have an account with a role assigned. Please refresh the page.');
        } else {
          setError(error.message);
        }
      } else {
        setError('Failed to select role');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    firebaseUser,
    userProfile,
    user,
    loading,
    needsRoleSelection: !!needsRoleSelection,
    needsEmailVerification: !!needsEmailVerification,
    error,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    sendPasswordReset,
    sendEmailVerification,
    selectRole,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};