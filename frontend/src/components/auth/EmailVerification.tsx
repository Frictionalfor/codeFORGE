import React, { useState } from 'react';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface EmailVerificationProps {
  email: string;
  onResendVerification: () => Promise<void>;
  onRefresh: () => void;
  loading?: boolean;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onResendVerification,
  onRefresh,
  loading = false
}) => {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    try {
      setResending(true);
      await onResendVerification();
      setResent(true);
      setTimeout(() => setResent(false), 3000);
    } catch (error) {
      console.error('Error resending verification:', error);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-slate-800/50 border-slate-700">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email</h1>
          <p className="text-slate-300 mb-6">
            We've sent a verification link to:
          </p>
          
          <div className="bg-slate-700/50 rounded-lg p-3 mb-6">
            <p className="text-white font-medium">{email}</p>
          </div>
          
          <p className="text-slate-400 text-sm mb-8">
            Click the link in your email to verify your account. You may need to check your spam folder.
          </p>
          
          <div className="space-y-4">
            <Button
              onClick={handleResend}
              disabled={resending || loading}
              variant="outline"
              className="w-full"
            >
              {resending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </div>
              ) : resent ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Email sent!</span>
                </div>
              ) : (
                'Resend verification email'
              )}
            </Button>
            
            <Button
              onClick={onRefresh}
              disabled={loading}
              className="w-full"
            >
              <div className="flex items-center space-x-2">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>I've verified my email</span>
              </div>
            </Button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-slate-400 text-xs">
              Having trouble? Contact support for assistance.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Inline verification prompt component for use within the app
interface InlineEmailVerificationProps {
  onResendVerification: () => Promise<void>;
  onDismiss?: () => void;
}

export const InlineEmailVerification: React.FC<InlineEmailVerificationProps> = ({
  onResendVerification,
  onDismiss
}) => {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    try {
      setResending(true);
      await onResendVerification();
      setResent(true);
      setTimeout(() => setResent(false), 3000);
    } catch (error) {
      console.error('Error resending verification:', error);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <Mail className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-200 mb-1">
            Email verification required
          </h3>
          <p className="text-sm text-yellow-300/80 mb-3">
            Please verify your email address to access all features.
          </p>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleResend}
              disabled={resending}
              size="sm"
              variant="outline"
              className="text-yellow-200 border-yellow-500/30 hover:bg-yellow-500/10"
            >
              {resending ? (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </div>
              ) : resent ? (
                'Email sent!'
              ) : (
                'Resend email'
              )}
            </Button>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-sm text-yellow-300/60 hover:text-yellow-300"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};