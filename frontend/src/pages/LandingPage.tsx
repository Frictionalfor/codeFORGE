import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Code2,
  Users, 
  BookOpen, 
  ArrowRight, 
  Shield, 
  CheckCircle2,
  Play,
  Github,
  Instagram,
  X,
  Mail,
  Terminal,
  Layers,
  BarChart3,
  Clock,
  Globe,
  Menu
} from 'lucide-react'

const LandingPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    
    // Handle scroll for navbar background
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated Background - FIXED but not affecting layout */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
      </div>

      {/* Main Content Flow - This allows sticky to work */}
      <div className="relative z-10">
        {/* Floating Navbar - Properly positioned for sticky */}
        <div className="sticky top-4 md:top-6 z-50 px-4 md:px-6 mb-8">
          <nav className={`max-w-6xl mx-auto transition-all duration-300 ${
            isScrolled 
              ? 'bg-slate-900/40 backdrop-blur-xl border border-white/20 rounded-2xl md:rounded-full shadow-2xl shadow-blue-500/10' 
              : 'bg-transparent'
          }`}>
            <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-5">
              {/* Logo - Left */}
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 flex items-center justify-center">
                  <img 
                    src="/logo.png" 
                    alt="CodeForge Logo" 
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback') as HTMLElement;
                      e.currentTarget.style.display = 'none';
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="w-6 h-6 bg-white rounded items-center justify-center logo-fallback" style={{ display: 'none' }}>
                    <Code2 className="w-4 h-4 text-black" />
                  </div>
                </div>
                <span className="text-base md:text-lg font-semibold text-white">
                  CodeForge
                </span>
              </div>
              
              {/* Center Navigation - Desktop Only */}
              <div className="hidden md:flex items-center space-x-8">
                <a 
                  href="#features" 
                  className="text-white/80 hover:text-white transition-colors duration-200 text-sm"
                >
                  Features
                </a>
                <a 
                  href="#how-it-works" 
                  className="text-white/80 hover:text-white transition-colors duration-200 text-sm"
                >
                  How it works
                </a>
                <a 
                  href="#contact" 
                  className="text-white/80 hover:text-white transition-colors duration-200 text-sm"
                >
                  Contact
                </a>
              </div>
              
              {/* Actions - Right - Desktop */}
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-white/80 hover:text-white transition-colors duration-200 text-sm"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-medium hover:bg-white/90 transition-colors duration-200"
                >
                  Get started
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-white p-2"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="md:hidden border-t border-white/10 mt-2 py-4 px-4 space-y-4">
                <a 
                  href="#features" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-white/80 hover:text-white transition-colors duration-200 py-2"
                >
                  Features
                </a>
                <a 
                  href="#how-it-works" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-white/80 hover:text-white transition-colors duration-200 py-2"
                >
                  How it works
                </a>
                <a 
                  href="#contact" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-white/80 hover:text-white transition-colors duration-200 py-2"
                >
                  Contact
                </a>
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <Link
                    to="/login"
                    className="block text-center text-white/80 hover:text-white transition-colors duration-200 py-2"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="block text-center bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-white/90 transition-colors duration-200"
                  >
                    Get started
                  </Link>
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* Hero Section */}
        <section className="px-4 md:px-6 pb-20 md:pb-32">
          <div className="max-w-7xl mx-auto">
            <div className={`text-center max-w-5xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold mb-6 md:mb-8 leading-tight px-4">
                <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                  Code Education
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x">
                  Reimagined
                </span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 md:mb-12 leading-relaxed max-w-4xl mx-auto px-4">
                The ultimate platform for coding assignments and education. 
                <br className="hidden sm:block" />
                <span className="text-blue-400">Teachers create.</span> <span className="text-purple-400">Students code.</span> <span className="text-cyan-400">Everyone learns.</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center mb-12 md:mb-16 px-4">
                <Link
                  to="/register"
                  className="group relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-bold text-base md:text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Start Creating
                    <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </Link>
                
                <button className="group border-2 border-gray-600 hover:border-blue-400 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 hover:bg-blue-400/10 flex items-center justify-center">
                  <Play className="mr-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                  Watch Demo
                </button>
              </div>
              
              {/* Floating Code Elements */}
              <div className="relative">
                <div className="absolute -top-20 -left-20 opacity-20 animate-float">
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 backdrop-blur-sm">
                    <code className="text-blue-400 text-sm">function solve() {`{}`}</code>
                  </div>
                </div>
                <div className="absolute -top-16 -right-16 opacity-20 animate-float" style={{ animationDelay: '2s' }}>
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 backdrop-blur-sm">
                    <code className="text-green-400 text-sm">console.log("Hello World")</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Everything you need to 
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> teach code</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Powerful tools designed for modern coding education
              </p>
            </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: 'Assignment Builder',
                description: 'Create coding assignments with test cases, starter code, and detailed instructions in minutes.',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Terminal,
                title: 'Code Editor',
                description: 'Professional code editor with syntax highlighting, auto-completion, and real-time feedback.',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: CheckCircle2,
                title: 'Auto Grading',
                description: 'Automated testing and grading with instant feedback and detailed error reporting.',
                gradient: 'from-green-500 to-emerald-500'
              },
              {
                icon: BarChart3,
                title: 'Analytics Dashboard',
                description: 'Track student progress, identify learning patterns, and measure success rates.',
                gradient: 'from-orange-500 to-red-500'
              },
              {
                icon: Users,
                title: 'Class Management',
                description: 'Organize students, manage enrollments, and collaborate with teaching assistants.',
                gradient: 'from-indigo-500 to-blue-500'
              },
              {
                icon: Shield,
                title: 'Secure & Fast',
                description: 'Enterprise-grade security with lightning-fast performance and 99.9% uptime.',
                gradient: 'from-gray-500 to-slate-500'
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="group bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:bg-gray-800/50 hover:border-gray-700 transition-all duration-500 hover:scale-105 hover:shadow-2xl backdrop-blur-sm"
              >
                <div className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

        {/* How it works */}
        <section id="how-it-works" className="py-24 px-6 bg-gradient-to-b from-transparent to-gray-900/20">
          <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Simple workflow, 
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> powerful results</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get started in minutes with our streamlined process
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Create Assignment',
                description: 'Design your coding challenge with our intuitive assignment builder. Add test cases, starter code, and clear instructions.',
                icon: BookOpen,
                color: 'blue'
              },
              {
                step: '02',
                title: 'Students Code',
                description: 'Students write and test their solutions in our professional development environment with real-time feedback.',
                icon: Code2,
                color: 'purple'
              },
              {
                step: '03',
                title: 'Review & Grade',
                description: 'Get instant results with automated grading, detailed analytics, and comprehensive performance insights.',
                icon: BarChart3,
                color: 'cyan'
              }
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className={`w-20 h-20 bg-gradient-to-r from-${step.color}-500 to-${step.color}-600 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-${step.color}-500/25`}>
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <div className="text-sm font-mono text-blue-400 mb-3 tracking-wider">STEP {step.step}</div>
                <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-blue-400 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-gray-300 leading-relaxed max-w-sm mx-auto group-hover:text-gray-200 transition-colors duration-300">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

        {/* Stats Section */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '∞', label: 'Possibilities', icon: Layers },
              { number: '24/7', label: 'Available', icon: Clock },
              { number: '100%', label: 'Secure', icon: Shield },
              { number: 'Global', label: 'Access', icon: Globe }
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 px-6 bg-gradient-to-b from-gray-900/20 to-transparent">
          <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to transform 
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> coding education?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Join the future of coding education. Start creating amazing assignments today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link
              to="/register"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
            >
              Start Free Trial
            </Link>
            <a
              href="mailto:codeforge.dev2@gmail.com"
              className="border-2 border-gray-600 hover:border-blue-400 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:bg-blue-400/10 flex items-center justify-center"
            >
              <Mail className="mr-3 w-5 h-5" />
              Send Feedback
            </a>
          </div>
          
          <p className="text-sm text-gray-400 mb-8">
            Free to use • No credit card required • Start immediately
          </p>
        </div>
      </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-12 px-6 bg-black/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 flex items-center justify-center">
                  <img 
                    src="/logo.png" 
                    alt="CodeForge Logo" 
                    className="logo-lg logo-hover"
                    onError={(e) => {
                      const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback') as HTMLElement;
                      e.currentTarget.style.display = 'none';
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl items-center justify-center logo-fallback" style={{ display: 'none' }}>
                    <Code2 className="w-6 h-6 text-black" />
                  </div>
                </div>
                <span className="text-2xl font-bold text-white">
                  CodeForge
                </span>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed mb-6 max-w-md">
                The ultimate platform for coding education, built with passion for teachers and students worldwide.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center space-x-4">
                <a
                  href="https://github.com/Frictionalfor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                >
                  <Github className="w-6 h-6 text-white" />
                </a>
                <a
                  href="https://www.instagram.com/swanand_io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                >
                  <Instagram className="w-6 h-6 text-white" />
                </a>
                <a
                  href="https://x.com/Swanand92092"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                >
                  <X className="w-6 h-6 text-white" />
                </a>
                <a
                  href="mailto:codeforge.dev2@gmail.com"
                  className="w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                >
                  <Mail className="w-6 h-6 text-white" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4 text-lg">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors duration-300">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors duration-300">How it works</a></li>
                <li><Link to="/register" className="hover:text-white transition-colors duration-300">Get started</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors duration-300">Sign in</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4 text-lg">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="mailto:codeforge.dev2@gmail.com" className="hover:text-white transition-colors duration-300">Contact us</a></li>
                <li><a href="mailto:codeforge.dev2@gmail.com" className="hover:text-white transition-colors duration-300">Send feedback</a></li>
                <li><a href="mailto:codeforge.dev2@gmail.com" className="hover:text-white transition-colors duration-300">Report issue</a></li>
                <li><a href="mailto:codeforge.dev2@gmail.com" className="hover:text-white transition-colors duration-300">Help center</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2026 CodeForge. Built with ❤️ for educators worldwide.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
            </div>
          </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default LandingPage