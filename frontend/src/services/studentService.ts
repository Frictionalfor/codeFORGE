import { apiService } from './api'
import { Class, Assignment, Submission } from '../types/api'

class StudentService {
  // Get enrolled classes
  async getEnrolledClasses(): Promise<{ classes: Class[] }> {
    const response = await apiService.get<{ success: boolean; data: { classes: Class[]; total: number } }>('/classes')
    return { classes: response.data.classes }
  }

  // Get assignments for a class (student view)
  async getClassAssignments(classId: string): Promise<{ assignments: Assignment[] }> {
    try {
      const response = await apiService.get<{ success: boolean; data: { assignments: Assignment[] } }>(`/classes/${classId}/assignments`)
      return { assignments: response.data?.assignments || [] }
    } catch (error: any) {
      console.error('Error fetching class assignments:', error)
      // Return empty array instead of throwing error to prevent loading failures
      return { assignments: [] }
    }
  }

  // Get assignment details (student view)
  async getAssignment(classId: string, assignmentId: string): Promise<{ assignment: Assignment }> {
    const response = await apiService.get<{ success: boolean; data: Assignment }>(`/classes/${classId}/assignments/${assignmentId}`)
    return { assignment: response.data }
  }

  // Submit code for an assignment
  async submitAssignment(classId: string, assignmentId: string, code: string): Promise<{ submission: Submission }> {
    const response = await apiService.post<{ success: boolean; data: Submission }>(`/classes/${classId}/assignments/${assignmentId}/submit`, { code })
    return { submission: response.data }
  }

  // Get student's submission for an assignment
  async getSubmission(classId: string, assignmentId: string): Promise<{ submission: Submission | null }> {
    try {
      const response = await apiService.get<{ success: boolean; data: Submission }>(`/classes/${classId}/assignments/${assignmentId}/submission`)
      return { submission: response.data }
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { submission: null }
      }
      // Log error but don't throw to prevent loading failures
      console.error('Error fetching submission:', error)
      return { submission: null }
    }
  }
}

export const studentService = new StudentService()