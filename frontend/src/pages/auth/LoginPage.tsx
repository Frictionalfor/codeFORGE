import React from 'react'
import { Link } from 'react-router-dom'
import { Code2 } from 'lucide-react'
import LoginForm from '../../components/forms/LoginForm'

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8 no-select">
          <Link to="/" className="inline-flex items-center space-x-3 mb-6 hover-lift focus-ring">
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="CodeForge Logo" 
                className="w-12 h-12 object-contain logo-hover"
                onError={(e) => {
                  // Fallback to icon if logo fails to load
                  const target = e.currentTarget as HTMLImageElement;
                  const fallback = target.nextElementSibling as HTMLElement;
                  target.style.display = 'none';
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
              />
              <div className="w-10 h-10 bg-white rounded-xl items-center justify-center" style={{ display: 'none' }}>
                <Code2 className="h-6 w-6 text-black" />
              </div>
            </div>
            <span className="text-2xl font-bold text-white">CodeForge</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-400 text-selectable">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-500">
          <LoginForm />

          <div className="mt-6 text-center no-select">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage