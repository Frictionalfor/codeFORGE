import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Clock, 
  Trophy,
  ArrowLeft,
  Target,
  Activity
} from 'lucide-react'
import { dashboardService, TeacherStats } from '../../services/dashboardService'

interface AnalyticsData {
  classPerformance: {
    className: string
    totalStudents: number
    averageScore: number
    completionRate: number
    assignmentCount: number
  }[]
  submissionTrends: {
    date: string
    submissions: number
    averageScore: number
  }[]
  topPerformers: {
    studentName: string
    className: string
    score: number
    submissionCount: number
  }[]
  languageUsage: {
    language: string
    count: number
    percentage: number
  }[]
}

interface TeacherAnalyticsProps {
  onBack: () => void
}

const TeacherAnalytics: React.FC<TeacherAnalyticsProps> = ({ onBack }) => {
  const [stats, setStats] = useState<TeacherStats | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    loadAnalyticsData()
  }, [selectedTimeRange])

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true)
      
      // Get basic stats
      const teacherStats = await dashboardService.getTeacherStats()
      setStats(teacherStats)

      // Mock analytics data - in real app, this would come from API
      const mockAnalytics: AnalyticsData = {
        classPerformance: [
          {
            className: 'Introduction to C Programming',
            totalStudents: 2,
            averageScore: 0,
            completionRate: 0,
            assignmentCount: 1
          }
        ],
        submissionTrends: [
          { date: '2026-01-01', submissions: 0, averageScore: 0 },
          { date: '2026-01-02', submissions: 0, averageScore: 0 },
          { date: '2026-01-03', submissions: 0, averageScore: 0 }
        ],
        topPerformers: [],
        languageUsage: [
          { language: 'C', count: 1, percentage: 100 },
          { language: 'C++', count: 0, percentage: 0 },
          { language: 'Python', count: 0, percentage: 0 },
          { language: 'JavaScript', count: 0, percentage: 0 }
        ]
      }

      setAnalyticsData(mockAnalytics)
    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-400 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-white transition-colors duration-300 rounded-lg hover:bg-gray-800/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-gray-400 mt-1">Comprehensive insights into your teaching performance</p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg p-1">
          {[
            { key: '7d', label: '7 Days' },
            { key: '30d', label: '30 Days' },
            { key: '90d', label: '90 Days' }
          ].map((range) => (
            <button
              key={range.key}
              onClick={() => setSelectedTimeRange(range.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                selectedTimeRange === range.key
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 text-blue-400" />
            <span className="text-xs text-blue-300 font-medium">TOTAL STUDENTS</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.totalStudents || 0}</p>
          <p className="text-blue-300 text-sm mt-1">Across all classes</p>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Trophy className="h-8 w-8 text-green-400" />
            <span className="text-xs text-green-300 font-medium">AVG SCORE</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.averageScore || 0}%</p>
          <p className="text-green-300 text-sm mt-1">Class average</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <FileText className="h-8 w-8 text-purple-400" />
            <span className="text-xs text-purple-300 font-medium">ASSIGNMENTS</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.totalAssignments || 0}</p>
          <p className="text-purple-300 text-sm mt-1">Total created</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Clock className="h-8 w-8 text-yellow-400" />
            <span className="text-xs text-yellow-300 font-medium">PENDING</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.pendingSubmissions || 0}</p>
          <p className="text-yellow-300 text-sm mt-1">To review</p>
        </div>
      </div>

      {/* Class Performance */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-blue-400" />
          <span>Class Performance Overview</span>
        </h3>

        <div className="space-y-4">
          {analyticsData?.classPerformance.map((classData, index) => (
            <div key={index} className="bg-gray-800/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-white">{classData.className}</h4>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>{classData.totalStudents} students</span>
                  <span>{classData.assignmentCount} assignments</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{classData.averageScore}%</p>
                  <p className="text-gray-400 text-sm">Average Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{classData.completionRate}%</p>
                  <p className="text-gray-400 text-sm">Completion Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">{classData.totalStudents}</p>
                  <p className="text-gray-400 text-sm">Active Students</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Language Usage */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-400" />
            <span>Programming Language Usage</span>
          </h3>

          <div className="space-y-4">
            {analyticsData?.languageUsage.map((lang, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    lang.language === 'C' ? 'bg-blue-400' :
                    lang.language === 'C++' ? 'bg-green-400' :
                    lang.language === 'Python' ? 'bg-yellow-400' :
                    'bg-purple-400'
                  }`}></div>
                  <span className="text-white font-medium">{lang.language}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        lang.language === 'C' ? 'bg-blue-400' :
                        lang.language === 'C++' ? 'bg-green-400' :
                        lang.language === 'Python' ? 'bg-yellow-400' :
                        'bg-purple-400'
                      }`}
                      style={{ width: `${lang.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-400 text-sm w-12 text-right">{lang.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <Activity className="h-5 w-5 text-green-400" />
            <span>Recent Activity Summary</span>
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
              <div>
                <p className="text-white font-medium">Classes Created</p>
                <p className="text-gray-400 text-sm">This month</p>
              </div>
              <span className="text-2xl font-bold text-blue-400">{stats?.totalClasses || 0}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
              <div>
                <p className="text-white font-medium">Assignments Published</p>
                <p className="text-gray-400 text-sm">This month</p>
              </div>
              <span className="text-2xl font-bold text-purple-400">{stats?.totalAssignments || 0}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
              <div>
                <p className="text-white font-medium">Active Students</p>
                <p className="text-gray-400 text-sm">Last 7 days</p>
              </div>
              <span className="text-2xl font-bold text-green-400">{stats?.activeStudents || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-8 backdrop-blur-sm">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          <span>Key Insights</span>
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium text-white mb-2">Teaching Performance</h4>
            <ul className="space-y-2 text-gray-300">
              <li>• You have {stats?.totalClasses || 0} active classes with {stats?.totalStudents || 0} total students</li>
              <li>• {stats?.totalAssignments || 0} assignments have been created</li>
              <li>• {stats?.pendingSubmissions || 0} submissions are pending review</li>
              <li>• Current class average is {stats?.averageScore || 0}%</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-medium text-white mb-2">Recommendations</h4>
            <ul className="space-y-2 text-gray-300">
              <li>• Consider creating more assignments to increase engagement</li>
              <li>• Review pending submissions to provide timely feedback</li>
              <li>• Monitor student progress and offer additional support</li>
              <li>• Explore different programming languages for variety</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherAnalytics