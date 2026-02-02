import React, { useState } from 'react';
import { GraduationCap, Users } from 'lucide-react';

interface RoleSelectionProps {
  onRoleSelected: (role: 'teacher' | 'student') => Promise<void>;
  loading: boolean;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onRoleSelected, loading }) => {
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false); // Prevent multiple submissions

  const handleRoleSelect = (role: 'teacher' | 'student') => {
    if (!loading && !submitting && !hasSubmitted) {
      setSelectedRole(role);
    }
  };

  const handleSubmit = async () => {
    if (!selectedRole || submitting || hasSubmitted) return;

    try {
      setSubmitting(true);
      setHasSubmitted(true); // Mark as submitted to prevent double-submission
      
      console.log('🔥 Starting role selection process...');
      console.log('Selected role:', selectedRole);
      console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
      
      await onRoleSelected(selectedRole);
      console.log('✅ Role selection completed successfully');
    } catch (error) {
      console.error('❌ Error selecting role:', error);
      
      // Reset submission state on error so user can try again
      setHasSubmitted(false);
      
      // Show user-friendly error message
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          alert('You already have an account with a role assigned. The page will refresh.');
          window.location.reload();
        } else {
          alert(`Failed to select role: ${error.message}`);
        }
      } else {
        alert('Failed to select role. Please try again.');
      }
      
      setSubmitting(false);
    }
  };

  const isDisabled = loading || submitting || hasSubmitted;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated Background - Same as landing page */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Welcome to <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">CodeForge!</span>
            </h1>
            <p className="text-xl text-gray-300">Please select your role to get started</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Teacher Role */}
            <div 
              className={`group bg-gray-900/50 border rounded-2xl p-8 cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl backdrop-blur-sm ${
                selectedRole === 'teacher'
                  ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/25'
                  : 'border-gray-800 hover:border-gray-700 hover:bg-gray-800/50'
              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleRoleSelect('teacher')}
            >
              <div className="text-center">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 transition-all duration-300 ${
                  selectedRole === 'teacher' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 scale-110' 
                    : 'bg-gray-800 group-hover:bg-gray-700'
                }`}>
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors duration-300">
                  Teacher
                </h3>
                <p className="text-gray-300 leading-relaxed mb-6 group-hover:text-gray-200 transition-colors duration-300">
                  Create classes, manage assignments, and track student progress
                </p>
                <ul className="text-sm text-gray-400 space-y-2 group-hover:text-gray-300 transition-colors duration-300">
                  <li>• Create and manage classes</li>
                  <li>• Design coding assignments</li>
                  <li>• Review student submissions</li>
                  <li>• Track class analytics</li>
                </ul>
              </div>
            </div>

            {/* Student Role */}
            <div 
              className={`group bg-gray-900/50 border rounded-2xl p-8 cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl backdrop-blur-sm ${
                selectedRole === 'student'
                  ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/25'
                  : 'border-gray-800 hover:border-gray-700 hover:bg-gray-800/50'
              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleRoleSelect('student')}
            >
              <div className="text-center">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 transition-all duration-300 ${
                  selectedRole === 'student' 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 scale-110' 
                    : 'bg-gray-800 group-hover:bg-gray-700'
                }`}>
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors duration-300">
                  Student
                </h3>
                <p className="text-gray-300 leading-relaxed mb-6 group-hover:text-gray-200 transition-colors duration-300">
                  Join classes, complete assignments, and learn to code
                </p>
                <ul className="text-sm text-gray-400 space-y-2 group-hover:text-gray-300 transition-colors duration-300">
                  <li>• Join classes with invite codes</li>
                  <li>• Complete coding assignments</li>
                  <li>• Submit and test your code</li>
                  <li>• Track your progress</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={!selectedRole || isDisabled}
              className={`group relative px-10 py-5 rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                selectedRole === 'teacher'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/25'
                  : selectedRole === 'student'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-green-500/25'
                  : 'bg-gray-600'
              }`}
            >
              <span className="relative z-10 flex items-center justify-center">
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Setting up your account...
                  </>
                ) : selectedRole ? (
                  `Continue as ${selectedRole === 'teacher' ? 'Teacher' : 'Student'}`
                ) : (
                  'Select a role to continue'
                )}
              </span>
              {selectedRole && !isDisabled && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              )}
            </button>
            
            {selectedRole && (
              <p className="mt-4 text-sm text-gray-400">
                <strong>Important:</strong> Your role selection is permanent and cannot be changed later.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};