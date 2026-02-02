import { apiService } from './api'
import { studentService } from './studentService'
import { Submission } from '../types/api'

export interface CreateSubmissionRequest {
  code: string
}

export interface UpdateSubmissionRequest {
  code: string
}

class SubmissionService {
  // Get student's submission for an assignment (needs to be updated to use class context)
  async getSubmission(assignmentId: string, classId?: string): Promise<{ submission: Submission | null }> {
    try {
      if (classId) {
        // Use the studentService which has the correct API endpoint
        return await studentService.getSubmission(classId, assignmentId)
      } else {
        // Fallback to old endpoint (will likely fail)
        const response = await apiService.get<{ submission: Submission }>(`/assignments/${assignmentId}/submission`)
        return { submission: response.submission }
      }
    } catch (error: any) {
      // If no submission exists, return null
      if (error.statusCode === 404 || error.response?.status === 404) {
        return { submission: null }
      }
      // Log error but don't throw to prevent loading failures
      console.error('Error fetching submission:', error)
      return { submission: null }
    }
  }

  // Create or update submission with class context
  async submitCode(assignmentId: string, data: CreateSubmissionRequest, classId?: string): Promise<{ message: string; submission: Submission }> {
    if (classId) {
      // Use the correct class-based endpoint
      const response = await apiService.post<{ success: boolean; data: Submission }>(`/classes/${classId}/assignments/${assignmentId}/submit`, data)
      return { message: 'Code submitted successfully', submission: response.data }
    } else {
      // Fallback to old endpoint (will likely fail)
      return apiService.post<{ message: string; submission: Submission }>(`/assignments/${assignmentId}/submit`, data)
    }
  }

  // Get submission history for a specific assignment
  async getSubmissionHistory(assignmentId: string, classId: string): Promise<{ submissions: Submission[]; total: number }> {
    try {
      const response = await apiService.get<{ success: boolean; data: { submissions: Submission[]; total: number } }>(`/classes/${classId}/assignments/${assignmentId}/submission-history`)
      return response.data
    } catch (error: any) {
      console.error('Error fetching submission history:', error)
      return { submissions: [], total: 0 }
    }
  }

  // Get all submissions for a student (across all classes)
  async getMySubmissions(): Promise<{ submissions: Submission[] }> {
    return apiService.get<{ submissions: Submission[] }>('/submissions/my')
  }

  // Get submissions for an assignment (teacher view)
  async getAssignmentSubmissions(assignmentId: string): Promise<any[]> {
    const response = await apiService.get<{ submissions: any[] }>(`/assignments/${assignmentId}/submissions`)
    return response.submissions
  }

  // Get all submissions for a teacher across all classes
  async getAllTeacherSubmissions(): Promise<any[]> {
    try {
      const response = await apiService.get<{ success: boolean; data: { submissions: any[] } }>('/submissions/all')
      return response.data?.submissions || []
    } catch (error: any) {
      console.error('Error fetching teacher submissions:', error)
      // Return empty array instead of throwing to prevent loading failures
      return []
    }
  }

  // Get all submissions for a class (teacher view)
  async getClassSubmissions(classId: string): Promise<any[]> {
    const response = await apiService.get<{ success: boolean; data: { submissions: any[] } }>(`/classes/${classId}/submissions`)
    return response.data.submissions
  }
}

export const submissionService = new SubmissionService()