import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/FirebaseAuthContext'
import { 
  BookOpen, 
  Users, 
  FileText, 
  Settings, 
  ArrowLeft, 
  BarChart3, 
  Home,
  Code2,
  Trophy,
  Clock,
  TrendingUp,
  UserCheck,
  Plus,
  Activity,
  Target,
  User,
  Download
} from 'lucide-react'
import ClassList from '../../components/teacher/ClassList'
import ClassDetail from '../../components/teacher/ClassDetail'
import StudentRoster from '../../components/teacher/StudentRoster'
import AllSubmissionsList from '../../components/teacher/AllSubmissionsList'
import TeacherSettings from '../../components/teacher/TeacherSettings'
import TeacherAnalytics from '../../components/teacher/TeacherAnalytics'
import Button from '../../components/ui/Button'
import { Class } from '../../types/api'
import { dashboardService, TeacherStats, RecentActivity } from '../../services/dashboardService'
import toast from 'react-hot-toast'

// Create a simple LoadingSpinner component
const LoadingSpinner: React.FC<{ size?: 'sm' | 'lg' }> = ({ size = 'sm' }) => (
  <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${
    size === 'lg' ? 'h-8 w-8' : 'h-4 w-4'
  }`}></div>
)

type ViewState = 'dashboard' | 'classes' | 'classDetail' | 'students' | 'submissions' | 'settings' | 'analytics'

const TeacherDashboard: React.FC = () => {
  const { userProfile, loading } = useAuth()
  const [currentView, setCurrentView] = useState<ViewState>('dashboard')
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [teacherStats, setTeacherStats] = useState<TeacherStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filteredSubmissions, setFilteredSubmissions] = useState<any[]>([])

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
      const [stats, activity] = await Promise.all([
        dashboardService.getTeacherStats(),
        dashboardService.getRecentActivity()
      ])
      setTeacherStats(stats)
      setRecentActivity(activity)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // Set default values on error
      setTeacherStats({
        totalClasses: 0,
        totalStudents: 0,
        totalAssignments: 0,
        pendingSubmissions: 0,
        averageScore: 0,
        activeStudents: 0
      })
      setRecentActivity([])
    } finally {
      setIsLoadingStats(false)
    }
  }

  const handleClassSelect = (classItem: Class) => {
    setSelectedClass(classItem)
    setCurrentView('classDetail')
  }

  const handleViewStudents = (classItem: Class) => {
    setSelectedClass(classItem)
    setCurrentView('students')
  }

  const handleDownloadCSV = () => {
    if (filteredSubmissions.length === 0) {
      toast.error('No submissions to download')
      return
    }

    // CSV Headers
    const headers = [
      'Student Name',
      'Student Email', 
      'Class Name',
      'Assignment Title',
      'Submission Date',
      'Code Length (chars)',
      'Code Preview (first 100 chars)'
    ]

    // Helper function to escape CSV values
    const escapeCSV = (value: string | number) => {
      if (typeof value === 'number') return value.toString()
      const stringValue = value.toString()
      // Escape quotes by doubling them and wrap in quotes if contains comma, quote, or newline
      if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('\r')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return `"${stringValue}"`
    }

    // Convert submissions to CSV rows
    const csvRows = filteredSubmissions.map(submission => {
      const submissionDate = new Date(submission.submitted_at).toLocaleString()
      const codePreview = submission.code.replace(/[\r\n]+/g, ' ').substring(0, 100)
      
      return [
        escapeCSV(submission.student.name || 'Unknown'),
        escapeCSV(submission.student.email || 'No email'),
        escapeCSV(submission.class.name || 'Unknown Class'),
        escapeCSV(submission.assignment.title || 'Unknown Assignment'),
        escapeCSV(submissionDate),
        submission.code ? submission.code.length : 0,
        escapeCSV(codePreview + (submission.code && submission.code.length > 100 ? '...' : ''))
      ].join(',')
    })

    // Combine headers and rows
    const csvContent = [headers.map(h => escapeCSV(h)).join(','), ...csvRows].join('\n')
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `all_submissions_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success(`Downloaded ${filteredSubmissions.length} submissions as CSV`)
  }

  const handleBackToClasses = () => {
    setSelectedClass(null)
    setCurrentView('classes')
  }

  const handleBackToDashboard = () => {
    setSelectedClass(null)
    setCurrentView('dashboard')
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
      case 'submission_received':
        return <FileText className="h-4 w-4" />
      case 'student_enrolled':
        return <UserCheck className="h-4 w-4" />
      case 'assignment_created':
        return <Plus className="h-4 w-4" />
      case 'class_created':
        return <BookOpen className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (status?: string) => {
    switch (status) {
      case 'graded':
        return 'text-green-400'
      case 'new':
        return 'text-blue-400'
      case 'reviewed':
        return 'text-yellow-400'
      default:
        return 'text-purple-400'
    }
  }

  const renderDashboardOverview = () => {
    // Check if user is properly authenticated
    if (!userProfile || !userProfile.id) {
      return (
        <div className="text-center py-20">
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-white mb-4">Authentication Required</h3>
            <p className="text-gray-300 mb-6">
              Please log out and log back in to refresh your authentication token.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      )
    }

    return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-8 backdrop-blur-sm">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome back, {userProfile?.name}! 👋
          </h2>
          <p className="text-gray-300">
            Here's what's happening with your classes today
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {isLoadingStats ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25">
              <div className="flex items-center justify-between mb-4">
                <BookOpen className="h-8 w-8 text-blue-400" />
                <span className="text-xs text-blue-300 font-medium">CLASSES</span>
              </div>
              <p className="text-2xl font-bold text-white">{teacherStats?.totalClasses || 0}</p>
              <p className="text-blue-300 text-sm">Active Classes</p>
            </div>

            <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25">
              <div className="flex items-center justify-between mb-4">
                <Users className="h-8 w-8 text-green-400" />
                <span className="text-xs text-green-300 font-medium">STUDENTS</span>
              </div>
              <p className="text-2xl font-bold text-white">{teacherStats?.totalStudents || 0}</p>
              <p className="text-green-300 text-sm">Total Enrolled</p>
            </div>

            <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25">
              <div className="flex items-center justify-between mb-4">
                <FileText className="h-8 w-8 text-purple-400" />
                <span className="text-xs text-purple-300 font-medium">ASSIGNMENTS</span>
              </div>
              <p className="text-2xl font-bold text-white">{teacherStats?.totalAssignments || 0}</p>
              <p className="text-purple-300 text-sm">Created</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 rounded-xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/25">
              <div className="flex items-center justify-between mb-4">
                <Clock className="h-8 w-8 text-yellow-400" />
                <span className="text-xs text-yellow-300 font-medium">PENDING</span>
              </div>
              <p className="text-2xl font-bold text-white">{teacherStats?.pendingSubmissions || 0}</p>
              <p className="text-yellow-300 text-sm">To Review</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 border border-cyan-500/30 rounded-xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25">
              <div className="flex items-center justify-between mb-4">
                <Trophy className="h-8 w-8 text-cyan-400" />
                <span className="text-xs text-cyan-300 font-medium">AVERAGE</span>
              </div>
              <p className="text-2xl font-bold text-white">{teacherStats?.averageScore || 0}%</p>
              <p className="text-cyan-300 text-sm">Class Score</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-800/20 border border-indigo-500/30 rounded-xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="h-8 w-8 text-indigo-400" />
                <span className="text-xs text-indigo-300 font-medium">ACTIVE</span>
              </div>
              <p className="text-2xl font-bold text-white">{teacherStats?.activeStudents || 0}</p>
              <p className="text-indigo-300 text-sm">This Week</p>
            </div>
          </>
        )}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-400" />
              <span>Recent Activity</span>
            </h3>
            <button
              onClick={loadDashboardData}
              className="text-sm text-gray-400 hover:text-white transition-colors duration-300 px-3 py-1 rounded-lg hover:bg-gray-800/50"
            >
              Refresh
            </button>
          </div>
          
          {recentActivity.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No recent activity</p>
              <p className="text-gray-500 text-sm">Activity will appear here as students interact with your classes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-800/30 rounded-xl hover:bg-gray-700/50 transition-all duration-300 group">
                  <div className={`${getActivityColor(activity.status)} mt-1`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-white text-sm font-medium">{activity.title}</p>
                      <span className="text-gray-500 text-xs whitespace-nowrap">{formatTimeAgo(activity.timestamp)}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{activity.description}</p>
                    {activity.className && (
                      <span className="inline-block mt-2 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-lg">
                        {activity.className}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-400" />
            <span>Quick Actions</span>
          </h3>
          
          <div className="space-y-4">
            <button
              onClick={() => setCurrentView('classes')}
              className="w-full bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 text-white p-4 rounded-xl hover:from-blue-500/30 hover:to-blue-600/30 transition-all duration-300 hover:scale-105 flex items-center space-x-3"
            >
              <Plus className="h-5 w-5" />
              <span>Create New Class</span>
            </button>
            
            <button
              onClick={() => setCurrentView('submissions')}
              className="w-full bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 text-white p-4 rounded-xl hover:from-purple-500/30 hover:to-purple-600/30 transition-all duration-300 hover:scale-105 flex items-center space-x-3"
            >
              <FileText className="h-5 w-5" />
              <span>Review Submissions</span>
            </button>
            
            <button
              onClick={() => setCurrentView('analytics')}
              className="w-full bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 text-white p-4 rounded-xl hover:from-green-500/30 hover:to-green-600/30 transition-all duration-300 hover:scale-105 flex items-center space-x-3"
            >
              <BarChart3 className="h-5 w-5" />
              <span>View Analytics</span>
            </button>
            
            <button
              onClick={() => setCurrentView('settings')}
              className="w-full bg-gradient-to-r from-gray-500/20 to-gray-600/20 border border-gray-500/30 text-white p-4 rounded-xl hover:from-gray-500/30 hover:to-gray-600/30 transition-all duration-300 hover:scale-105 flex items-center space-x-3"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    )
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboardOverview()
        
      case 'classes':
        return (
          <div className="space-y-6">
            {/* Classes Header with Create Button */}
            <div className="flex items-center justify-between mb-6 no-select">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white text-shadow">My Classes</h2>
                <p className="text-gray-400 text-selectable">Manage your classes and assignments</p>
              </div>
              <div className="flex-shrink-0 ml-6">
                <Button onClick={() => setShowCreateModal(true)} className="hover-lift">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Class
                </Button>
              </div>
            </div>
            
            <ClassList 
              onClassSelect={handleClassSelect}
              showCreateModal={showCreateModal}
              onShowCreateModal={() => setShowCreateModal(true)}
              onCloseCreateModal={() => setShowCreateModal(false)}
            />
          </div>
        )
      
      case 'classDetail':
        return selectedClass ? (
          <ClassDetail 
            classItem={selectedClass}
            onBack={handleBackToClasses}
            onViewStudents={handleViewStudents}
          />
        ) : null
      
      case 'students':
        return selectedClass ? (
          <StudentRoster 
            classItem={selectedClass}
            onBack={handleBackToClasses}
          />
        ) : null
      
      case 'submissions':
        return (
          <div className="space-y-6">
            {/* Submissions Header with Download Button */}
            <div className="flex items-center justify-between mb-6 no-select">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white text-shadow">All Submissions</h2>
                <p className="text-gray-400 text-selectable">View submissions from all your classes</p>
              </div>
              <div className="flex-shrink-0 ml-6">
                <Button
                  onClick={handleDownloadCSV}
                  variant="info"
                  size="md"
                  disabled={filteredSubmissions.length === 0}
                  className="hover-lift"
                  title={filteredSubmissions.length === 0 ? "No submissions available to download" : `Download ${filteredSubmissions.length} submissions as CSV`}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV ({filteredSubmissions.length})
                </Button>
              </div>
            </div>
            
            <AllSubmissionsList onSubmissionsChange={setFilteredSubmissions} />
          </div>
        )
      
      case 'settings':
        return <TeacherSettings />

      case 'analytics':
        return <TeacherAnalytics onBack={handleBackToDashboard} />
      
      default:
        return null
    }
  }

  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Teacher Dashboard'
      case 'classes':
        return 'My Classes'
      case 'classDetail':
        return selectedClass ? selectedClass.name : 'Class Details'
      case 'students':
        return selectedClass ? `${selectedClass.name} - Students` : 'Students'
      case 'submissions':
        return 'All Submissions'
      case 'settings':
        return 'Settings'
      case 'analytics':
        return 'Analytics Dashboard'
      default:
        return 'Dashboard'
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden flex">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
      </div>

      {/* Enhanced Sidebar */}
      <div className="relative z-10 w-80 flex flex-col">
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
                  {userProfile?.name}
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
                  currentView === 'classes' && !selectedClass
                    ? 'group flex items-center space-x-4 w-full text-left px-5 py-4 rounded-2xl bg-gradient-to-r from-blue-600/30 to-purple-600/20 border border-blue-500/40 text-white font-semibold transition-all duration-500 shadow-lg shadow-blue-500/10 transform hover:scale-[1.02]'
                    : 'group flex items-center space-x-4 w-full text-left px-5 py-4 rounded-2xl text-gray-300 hover:text-white hover:bg-gray-800/60 transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-lg'
                }
              >
                <div className={currentView === 'classes' && !selectedClass ? 'p-2 bg-blue-500/20 rounded-xl' : 'p-2 group-hover:bg-gray-700/50 rounded-xl transition-colors'}>
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="text-base">My Classes</span>
                {currentView === 'classes' && !selectedClass && (
                  <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                )}
              </button>
              
              <button
                onClick={() => setCurrentView('submissions')}
                className={
                  currentView === 'submissions'
                    ? 'group flex items-center space-x-4 w-full text-left px-5 py-4 rounded-2xl bg-gradient-to-r from-blue-600/30 to-purple-600/20 border border-blue-500/40 text-white font-semibold transition-all duration-500 shadow-lg shadow-blue-500/10 transform hover:scale-[1.02]'
                    : 'group flex items-center space-x-4 w-full text-left px-5 py-4 rounded-2xl text-gray-300 hover:text-white hover:bg-gray-800/60 transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-lg'
                }
              >
                <div className={currentView === 'submissions' ? 'p-2 bg-blue-500/20 rounded-xl' : 'p-2 group-hover:bg-gray-700/50 rounded-xl transition-colors'}>
                  <FileText className="h-5 w-5" />
                </div>
                <span className="text-base">All Submissions</span>
                {currentView === 'submissions' && (
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

          {/* Enhanced Breadcrumb Navigation */}
          {selectedClass && (
            <div className="pt-6 border-t border-gray-700/30 animate-fade-in">
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
              
              <button
                onClick={handleBackToClasses}
                className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition-all duration-300 text-sm mb-4 group"
              >
                <div className="p-1 group-hover:bg-gray-700/50 rounded-lg transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </div>
                <span>Back to Classes</span>
              </button>
              
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

              {/* Class-specific navigation */}
              <div className="space-y-2">
                <button
                  onClick={() => setCurrentView('classDetail')}
                  className={
                    currentView === 'classDetail'
                      ? 'group flex items-center space-x-4 w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600/30 to-purple-600/20 border border-blue-500/40 text-white font-semibold transition-all duration-500 shadow-lg shadow-blue-500/10'
                      : 'group flex items-center space-x-4 w-full text-left px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800/60 transition-all duration-300 hover:transform hover:scale-[1.02]'
                  }
                >
                  <div className={currentView === 'classDetail' ? 'p-1 bg-blue-500/20 rounded-lg' : 'p-1 group-hover:bg-gray-700/50 rounded-lg transition-colors'}>
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <span className="text-sm">Class Overview</span>
                  {currentView === 'classDetail' && (
                    <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  )}
                </button>
                
                <button
                  onClick={() => setCurrentView('students')}
                  className={
                    currentView === 'students'
                      ? 'group flex items-center space-x-4 w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600/30 to-blue-600/20 border border-purple-500/40 text-white font-semibold transition-all duration-500 shadow-lg shadow-purple-500/10'
                      : 'group flex items-center space-x-4 w-full text-left px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800/60 transition-all duration-300 hover:transform hover:scale-[1.02]'
                  }
                >
                  <div className={currentView === 'students' ? 'p-1 bg-purple-500/20 rounded-lg' : 'p-1 group-hover:bg-gray-700/50 rounded-lg transition-colors'}>
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="text-sm">Student Roster</span>
                  {currentView === 'students' && (
                    <div className="ml-auto w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  )}
                </button>
              </div>
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
                <p className="text-white font-semibold text-sm truncate">{userProfile?.name}</p>
                <p className="text-gray-400 text-xs truncate">{userProfile?.email}</p>
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
                  Manage your classes, track student progress, and create engaging assignments.
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

export default TeacherDashboard