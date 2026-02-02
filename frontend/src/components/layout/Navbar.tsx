import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Code2, BookOpen, FileText, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/FirebaseAuthContext'

const Navbar: React.FC = () => {
  const { firebaseUser, userProfile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    signOut()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 navbar-ultra-transparent no-select">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3 hover-lift focus-ring group">
              <div className="w-12 h-12 flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="CodeForge Logo" 
                  className="logo-lg logo-hover"
                  onError={(e) => {
                    // Fallback to icon if logo fails to load
                    const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback') as HTMLElement;
                    e.currentTarget.style.display = 'none';
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl items-center justify-center logo-fallback" style={{ display: 'none' }}>
                  <Code2 className="w-6 h-6 text-black" />
                </div>
              </div>
              <span className="text-2xl font-bold text-white/95 group-hover:text-blue-400 transition-colors duration-300">
                CodeForge
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          {firebaseUser && userProfile && (
            <div className="hidden md:flex items-center space-x-8">
              {userProfile.role === 'teacher' ? (
                <>
                  <Link
                    to="/teacher/classes"
                    className="text-white/80 hover:text-white transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-white/10"
                  >
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5" />
                      <span>Classes</span>
                    </div>
                  </Link>
                  <Link
                    to="/teacher/submissions"
                    className="text-white/80 hover:text-white transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-white/10"
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Submissions</span>
                    </div>
                  </Link>
                  <Link
                    to="/teacher/settings"
                    className="text-white/80 hover:text-white transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-white/10"
                  >
                    <div className="flex items-center space-x-2">
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/student/classes"
                    className="text-white/80 hover:text-white transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-white/10"
                  >
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5" />
                      <span>Classes</span>
                    </div>
                  </Link>
                  <Link
                    to="/student/settings"
                    className="text-white/80 hover:text-white transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-white/10"
                  >
                    <div className="flex items-center space-x-2">
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </div>
                  </Link>
                </>
              )}
            </div>
          )}
          
          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {firebaseUser && userProfile ? (
              <>
                {/* User Profile */}
                <div className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white/95 text-selectable">{userProfile.name}</p>
                    <p className="text-xs text-white/70 capitalize">{userProfile.role}</p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {userProfile.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="text-white/70 hover:text-red-400 transition-all duration-300 hover:scale-110 p-2 rounded-lg hover:bg-red-500/20"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white/80 hover:text-white transition-all duration-300 px-4 py-2 rounded-lg hover:bg-white/10"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar