import { apiService } from './api'

export interface DashboardStats {
  totalClasses: number
  totalAssignments: number
  completedAssignments: number
  pendingAssignments: number
  totalPoints: number
}

export interface AssignmentStatus {
  id: string
  title: string
  className: string
  dueDate: string | null
  totalPoints: number
  status: 'completed' | 'pending' | 'overdue'
  submission: {
    id: string
    status: 'pending' | 'running' | 'completed' | 'failed'
    pointsEarned: number
    submittedAt: string
  } | null
}

export interface AssignmentStatusResponse {
  assignments: AssignmentStatus[]
  summary: {
    total: number
    completed: number
    pending: number
    overdue: number
  }
}

export interface TeacherStats {
  totalClasses: number
  totalStudents: number
  totalAssignments: number
  pendingSubmissions: number
  averageScore: number
  activeStudents: number
}

export interface RecentActivity {
  id: string
  type: 'submission' | 'enrollment' | 'assignment_published' | 'submission_received' | 'student_enrolled' | 'assignment_created' | 'class_created'
  title: string
  description: string
  timestamp: string
  status?: 'completed' | 'pending' | 'failed' | 'new' | 'reviewed' | 'graded'
  studentName?: string
  className?: string
}

class DashboardService {
  async getStudentStats(): Promise<DashboardStats> {
    try {
      const response = await apiService.get<{ success: boolean; data: DashboardStats }>('/dashboard/stats')
      return response.data
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      // Return default stats if API fails
      return {
        totalClasses: 0,
        totalAssignments: 0,
        completedAssignments: 0,
        pendingAssignments: 0,
        totalPoints: 0
      }
    }
  }

  async getStudentAssignmentStatus(): Promise<AssignmentStatusResponse> {
    try {
      const response = await apiService.get<{ success: boolean; data: AssignmentStatusResponse }>('/dashboard/assignment-status')
      return response.data
    } catch (error) {
      console.error('Error fetching assignment status:', error)
      // Return default data if API fails
      return {
        assignments: [],
        summary: {
          total: 0,
          completed: 0,
          pending: 0,
          overdue: 0
        }
      }
    }
  }

  async getTeacherStats(): Promise<TeacherStats> {
    try {
      const response = await apiService.get<{ success: boolean; data: TeacherStats }>('/dashboard/stats')
      return response.data
    } catch (error) {
      console.error('Error fetching teacher dashboard stats:', error)
      // Return default stats if API fails
      return {
        totalClasses: 0,
        totalStudents: 0,
        totalAssignments: 0,
        pendingSubmissions: 0,
        averageScore: 0,
        activeStudents: 0
      }
    }
  }

  async getRecentActivity(): Promise<RecentActivity[]> {
    try {
      const response = await apiService.get<{ success: boolean; data: { activities: RecentActivity[] } }>('/dashboard/activity')
      return response.data.activities || []
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      // Return empty array if API fails
      return []
    }
  }
}

export const dashboardService = new DashboardService()