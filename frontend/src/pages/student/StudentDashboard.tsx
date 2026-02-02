import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/FirebaseAuthContext'
import { BookOpen, Code2, Calendar, Settings, User, Home, FileText, Clock, Trophy, Plus } from 'lucide-react'
import EnrolledClassList from '../../components/student/EnrolledClassList'
import ClassAssignments from '../../components/student/ClassAssignments'
import CodeEditor from '../../components/student/CodeEditor'
import AssignmentSchedule from '../../components/student/AssignmentSchedule'
import StudentSettings from '../../components/student/StudentSettings'
import Button from '../../components/ui/Button'
import { Class, Assignment } from '../../types/api'
import { dashboardService, DashboardStats, RecentActivity } from '../../services/dashboardService'

// Create a simple LoadingSpinner component since it's not found
const LoadingSpinner: React.FC<{ size?: 'sm' | 'lg' }> = ({ size = 'sm' }) => (
  <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${
    size === 'lg' ? 'h-8 w-8' : 'h-4 w-4'
  }`}></div>
)

type ViewState = 'dashboard' | 'classes' | 'assignments' | 'editor' | 'schedule' | 'settings'

const StudentDashboard: React.FC = () => {
  const { userProfile, loading } = useAuth()
  const [currentView, setCurrentView] = useState<ViewState>('dashboard')
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [showJoinModal, setShowJoinModal] = useState(false)

  // Show loading spinner while auth is resolving
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Show error if user profile is not available
  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-4">Profile Not Found</h2>
          <p className="text-gray-400">Unable to load your profile. Please try refreshing the page.</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (currentView === 'dashboard') {
      loadDashboardData()
    }
  }, [currentView])

  const loadDashboardData = async () => {
    try {
      setIsLoadingStats(true)
      const [stats, activity, assignmentStatus] = await Promise.all([
        dashboardService.getStudentStats(),
        dashboardService.getRecentActivity(),
        dashboardService.getStudentAssignmentStatus()
      ])
      setDashboardStats(stats)
      setRecentActivity(activity)
      
      // Update stats with real-time assignment status
      if (assignmentStatus.summary) {
        setDashboardStats(prevStats => ({
          totalAssignments: assignmentStatus.summary.total,
          completedAssignments: assignmentStatus.summary.completed,
          pendingAssignments: assignmentStatus.summary.pending + assignmentStatus.summary.overdue,
          totalClasses: prevStats?.totalClasses || 0,
          totalPoints: prevStats?.totalPoints || 0
        }))
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  const handleClassSelect = (classItem: Class) => {
    setSelectedClass(classItem)
    setCurrentView('assignments')
  }

  const handleAssignmentSelect = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setCurrentView('editor')
  }

  const handleBackToClasses = () => {
    setSelectedClass(null)
    setSelectedAssignment(null)
    setCurrentView('classes')
  }

  const handleBackToAssignments = () => {
    setSelectedAssignment(null)
    setCurrentView('assignments')
    // Refresh dashboard data when returning from code editor
    if (currentView === 'editor') {
      loadDashboardData()
    }
  }

  const handleBackToDashboard = () => {
    setSelectedClass(null)
    setSelectedAssignment(null)
    setCurrentView('dashboard')
    // Always refresh when returning to dashboard
    loadDashboardData()
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'submission':
        return <Code2 className="h-4 w-4" />
      case 'enrollment':
        return <BookOpen className="h-4 w-4" />
      case 'assignment_published':
        return <FileText className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getActivityColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400'
      case 'pending':
        return 'text-yellow-400'
      case 'failed':
        return 'text-red-400'
      default:
        return 'text-blue-400'
    }
  }

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {/* Real-time Stats Cards */}
        {isLoadingStats ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-6 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm font-medium">My Classes</p>
                  <p className="text-2xl font-bold text-white">{dashboardStats?.totalClasses || 0}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-6 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm font-medium">Total Assignments</p>
                  <p className="text-2xl font-bold text-white">{dashboardStats?.totalAssignments || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-6 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm font-medium">Completed</p>
                  <p className="text-2xl font-bold text-white">{dashboardStats?.completedAssignments || 0}</p>
                </div>
                <Trophy className="h-8 w-8 text-green-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 rounded-xl p-6 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-300 text-sm font-medium">Pending</p>
                  <p className="text-2xl font-bold text-white">{dashboardStats?.pendingAssignments || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-800/20 border border-indigo-500/30 rounded-xl p-6 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-300 text-sm font-medium">Total Points</p>
                  <p className="text-2xl font-bold text-white">{dashboardStats?.totalPoints || 0}</p>
                </div>
                <Trophy className="h-8 w-8 text-indigo-400" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <button
            onClick={loadDashboardData}
            className="text-sm text-gray-400 hover:text-white transition-colors duration-300"
          >
            Refresh
          </button>
        </div>
        
        {recentActivity.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No recent activity</p>
            <p className="text-gray-500 text-sm">Start by joining a class or submitting an assignment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-700/50 transition-all duration-300">
                <div className={`${getActivityColor(activity.status)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-300 text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-gray-500 text-xs">{activity.description}</p>
                </div>
                <span className="text-gray-500 text-xs whitespace-nowrap">{formatTimeAgo(activity.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboardOverview()
      
      case 'classes':
        return (
          <div className="space-y-6">
            {/* Classes Header with Join Button */}
            <div className="flex items-center justify-between mb-6 no-select">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white text-shadow">My Classes</h2>
                <p className="text-gray-400 text-selectable">View your enrolled classes and assignments</p>
              </div>
              <div className="flex-shrink-0 ml-6">
                <Button onClick={() => setShowJoinModal(true)} className="hover-lift">
                  <Plus className="h-5 w-5 mr-2" />
                  Join Class
                </Button>
              </div>
            </div>
            
            <EnrolledClassList 
              onClassSelect={handleClassSelect}
              showJoinModal={showJoinModal}
              onShowJoinModal={() => setShowJoinModal(true)}
              onCloseJoinModal={() => setShowJoinModal(false)}
            />
          </div>
        )
      
      case 'assignments':
        return selectedClass ? (
          <ClassAssignments 
            classItem={selectedClass}
            onBack={handleBackToClasses}
            onAssignmentSelect={handleAssignmentSelect}
          />
        ) : null
      
      case 'editor':
        return selectedAssignment && selectedClass ? (
          <CodeEditor 
            assignment={selectedAssignment}
            classId={selectedClass.id}
            onBack={handleBackToAssignments}
            onSubmissionComplete={loadDashboardData}
          />
        ) : null
      
      case 'schedule':
        return <AssignmentSchedule />
      
      case 'settings':
        return <StudentSettings />
      
      default:
        return null
    }
  }

  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Dashboard'
      case 'classes':
        return 'My Classes'
      case 'assignments':
        return selectedClass ? selectedClass.name : 'Assignments'
      case 'editor':
        return selectedAssignment ? selectedAssignment.title : 'Code Editor'
      case 'schedule':
        return 'Schedule'
      case 'settings':
        return 'Settings'
      default:
        return 'Dashboard'
    }
  }

  return (
    <div className="min-h-screen bg-black flex relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>

      {/* Enhanced Sidebar */}
      <div className="relative z-10 w-72 flex flex-col">
        {/* Sidebar Background with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-900/95 backdrop-blur-2xl border-r border-gray-700/50 shadow-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5"></div>
        
        {/* Logo & Welcome Section */}
        <div className="relative z-10 p-6 border-b border-gray-700/20">
          {/* Clean Logo-Centric Identity Card */}
          <div className="identity-card rounded-3xl p-6">
            <div className="flex flex-col items-center space-y-4">
              {/* Primary Logo - Prominent Display */}
              <div className="relative">
                <div className="logo-container w-20 h-20 rounded-3xl flex items-center justify-center">
                  <img 
                    src="/dashboardLogo.png" 
                    alt="Dashboard Logo" 
                    className="w-12 h-12 object-contain relative z-10"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      const fallback = target.nextElementSibling as HTMLElement;
                      target.style.display = 'none';
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                  <Code2 className="h-8 w-8 text-white relative z-10" style={{ display: 'none' }} />
                </div>
                {/* Status indicator */}
                <div className="status-indicator absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-900/50 shadow-sm">
                  <div className="status-indicator-inner w-full h-full rounded-full"></div>
                </div>
              </div>
              
              {/* Essential User Information Only */}
              <div className="text-center space-y-2">
                <p className="text-gray-400 text-sm">Welcome back,</p>
                <p className="username-text text-xl font-semibold leading-tight">
                  {userProfile.name}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Section */}
        <nav className="relative z-10 px-6 py-8 space-y-3 flex-1">
          <div className="mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold px-2 mb-4">Main Navigation</p>
            <div className="space-y-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={
                  currentView === 'dashboard'
                    ? 'group flex items-center space-x-4 w-full text-left px-5 py-4 rounded-2xl bg-gradient-to-r from-blue-600/30 to-purple-600/20 border border-blue-500/40 text-white font-semibold transition-all duration-500 shadow-lg shadow-blue-500/10 transform hover:scale-[1.02]'
                    : 'group flex items-center space-x-4 w-full text-left px-5 py-4 rounded-2xl text-gray-300 hover:text-white hover:bg-gray-800/60 transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-lg'
                }
              >
                <div className={currentView === 'dashboard' ? 'p-2 bg-blue-500/20 rounded-xl' : 'p-2 group-hover:bg-gray-700/50 rounded-xl transition-colors'}>
                  <Home className="h-5 w-5" />
                </div>
                <span className="text-base">Dashboard</span>
                {currentView === 'dashboard' && (
                  <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                )}
              </button>

              <button
                onClick={() => setCurrentView('classes')}
                className={
                  currentView === 'classes' && !selectedClass && !selectedAssignment
                    ? 'group flex items-center space-x-4 w-full text-left px-5 py-4 rounded-2xl bg-gradient-to-r from-blue-600/30 to-purple-600/20 border border-blue-500/40 text-white font-semibold transition-all duration-500 shadow-lg shadow-blue-500/10 transform hover:scale-[1.02]'
                    : 'group flex items-center space-x-4 w-full text-left px-5 py-4 rounded-2xl text-gray-300 hover:text-white hover:bg-gray-800/60 transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-lg'
                }
              >
                <div className={currentView === 'classes' && !selectedClass && !selectedAssignment ? 'p-2 bg-blue-500/20 rounded-xl' : 'p-2 group-hover:bg-gray-700/50 rounded-xl transition-colors'}>
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="text-base">My Classes</span>
                {currentView === 'classes' && !selectedClass && !selectedAssignment && (
                  <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                )}
              </button>
              
              <button
                onClick={() => setCurrentView('schedule')}
                className={
                  currentView === 'schedule'
                    ? 'group flex items-center space-x-4 w-full text-left px-5 py-4 rounded-2xl bg-gradient-to-r from-blue-600/30 to-purple-600/20 border border-blue-500/40 text-white font-semibold transition-all duration-500 shadow-lg shadow-blue-500/10 transform hover:scale-[1.02]'
                    : 'group flex items-center space-x-4 w-full text-left px-5 py-4 rounded-2xl text-gray-300 hover:text-white hover:bg-gray-800/60 transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-lg'
                }
              >
                <div className={currentView === 'schedule' ? 'p-2 bg-blue-500/20 rounded-xl' : 'p-2 group-hover:bg-gray-700/50 rounded-xl transition-colors'}>
                  <Calendar className="h-5 w-5" />
                </div>
                <span className="text-base">Schedule</span>
                {currentView === 'schedule' && (
                  <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                )}
              </button>
            </div>
          </div>

          {/* Settings Section */}
          <div className="pt-4 border-t border-gray-700/30">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold px-2 mb-4">Account</p>
            <button
              onClick={() => setCurrentView('settings')}
              className={
                currentView === 'settings'
                  ? 'group flex items-center space-x-4 w-full text-left px-5 py-4 rounded-2xl bg-gradient-to-r from-blue-600/30 to-purple-600/20 border border-blue-500/40 text-white font-semibold transition-all duration-500 shadow-lg shadow-blue-500/10 transform hover:scale-[1.02]'
                  : 'group flex items-center space-x-4 w-full text-left px-5 py-4 rounded-2xl text-gray-300 hover:text-white hover:bg-gray-800/60 transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-lg'
              }
            >
              <div className={currentView === 'settings' ? 'p-2 bg-blue-500/20 rounded-xl' : 'p-2 group-hover:bg-gray-700/50 rounded-xl transition-colors'}>
                <Settings className="h-5 w-5" />
              </div>
              <span className="text-base">Settings</span>
              {currentView === 'settings' && (
                <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              )}
            </button>
          </div>

          {/* Breadcrumb Navigation */}
          {(selectedClass || selectedAssignment) && (
            <div className="pt-6 border-t border-gray-700/30 animate-slide-down">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold px-2 mb-4">Class Navigation</p>
              
              <button
                onClick={handleBackToDashboard}
                className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition-all duration-300 text-sm mb-2 group"
              >
                <div className="p-1 group-hover:bg-gray-700/50 rounded-lg transition-colors">
                  <Home className="h-4 w-4" />
                </div>
                <span>Back to Dashboard</span>
              </button>

              {selectedClass && (
                <button
                  onClick={handleBackToClasses}
                  className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition-all duration-300 text-sm mb-4 group"
                >
                  <div className="p-1 group-hover:bg-gray-700/50 rounded-lg transition-colors">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <span>Back to Classes</span>
                </button>
              )}
              
              {selectedClass && (
                <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Current Class</p>
                      <p className="text-white font-semibold text-sm truncate">{selectedClass.name}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedAssignment && (
                <>
                  <button
                    onClick={handleBackToAssignments}
                    className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition-all duration-300 text-sm mb-4 group"
                  >
                    <div className="p-1 group-hover:bg-gray-700/50 rounded-lg transition-colors">
                      <Code2 className="h-4 w-4" />
                    </div>
                    <span>Back to Assignments</span>
                  </button>
                  <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Current Assignment</p>
                        <p className="text-white font-semibold text-sm truncate">{selectedAssignment.title}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </nav>

        {/* User Profile Section */}
        <div className="relative z-10 p-6 border-t border-gray-700/30">
          <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{userProfile.name}</p>
                <p className="text-gray-400 text-xs truncate">{userProfile.email}</p>
              </div>
              <button 
                onClick={() => setCurrentView('settings')}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-colors"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative z-10">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">{getPageTitle()}</h1>
              {currentView === 'dashboard' && (
                <p className="text-gray-400 mt-2">
                  Track your progress, manage assignments, and stay organized with your coding journey.
                </p>
              )}
            </div>
            
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard