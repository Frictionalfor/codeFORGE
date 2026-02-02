import React from 'react'
import Navbar from './Navbar'

interface LayoutProps {
  children: React.ReactNode
  showNavbar?: boolean
}

const Layout: React.FC<LayoutProps> = ({ children, showNavbar = true }) => {
  return (
    <div className="min-h-screen bg-black">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
      
      {showNavbar && <Navbar />}
      <main className={`relative z-10 ${showNavbar ? 'pt-20' : ''}`}>
        {children}
      </main>
    </div>
  )
}

export default Layout