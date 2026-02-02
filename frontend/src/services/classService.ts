import { apiService } from './api'
import { Class, Assignment } from '../types/api'

export interface CreateClassRequest {
  name: string
  description: string
  visibility?: 'public' | 'private'
  max_students?: number
  join_method?: 'code' | 'approval' | 'invitation'
}

export interface UpdateClassRequest {
  name?: string
  description?: string
  visibility?: 'public' | 'private'
  max_students?: number
  join_method?: 'code' | 'approval' | 'invitation'
  is_active?: boolean
}

export interface JoinClassRequest {
  join_code?: string
}

export interface InviteStudentsRequest {
  emails: string[]
  message?: string
}

export interface CreateAssignmentRequest {
  title: string
  problem_description: string
}

export interface UpdateAssignmentRequest {
  title?: string
  problem_description?: string
}

export interface ClassInfo {
  id: string
  name: string
  description: string
  teacher_name: string
  current_students: number
  max_students: number | null
  can_join: boolean
  already_enrolled: boolean
  at_capacity?: boolean
  created_at: string
}

export interface EnhancedClass extends Class {
  join_code?: string
  max_students: number | null
  current_students?: number
  join_method: 'code' | 'approval' | 'invitation'
  is_active: boolean
  enrollment_stats?: {
    total: number
    active: number
    pending: number
    withdrawn: number
  }
}

export interface ClassStudent {
  id: string
  name: string
  email: string
  enrolled_at: string
  status: 'active' | 'pending' | 'suspended' | 'withdrawn'
}

class ClassService {
  // Class management
  async getClasses(): Promise<{ classes: EnhancedClass[]; total: number }> {
    const response = await apiService.get<{ success: boolean; data: { classes: EnhancedClass[]; total: number } }>('/classes')
    return response.data
  }

  async getClass(classId: string): Promise<{ class: EnhancedClass }> {
    const response = await apiService.get<{ success: boolean; data: { class: EnhancedClass } }>(`/classes/${classId}`)
    return response.data
  }

  async createClass(data: CreateClassRequest): Promise<{ class: EnhancedClass }> {
    const response = await apiService.post<{ success: boolean; data: EnhancedClass }>('/classes', data)
    return { class: response.data }
  }

  async updateClass(classId: string, data: UpdateClassRequest): Promise<{ class: EnhancedClass }> {
    const response = await apiService.put<{ success: boolean; data: { class: EnhancedClass } }>(`/classes/${classId}`, data)
    return response.data
  }

  async deleteClass(classId: string): Promise<{ message: string }> {
    const response = await apiService.delete<{ success: boolean; data: { message: string } }>(`/classes/${classId}`)
    return response.data
  }

  // Join code functionality
  async getClassByJoinCode(joinCode: string): Promise<ClassInfo> {
    const response = await apiService.get<{ success: boolean; data: ClassInfo }>(`/classes/join/${joinCode}`)
    return response.data
  }

  async joinClass(data: JoinClassRequest): Promise<{ enrollment_id: string; status: string; enrolled_at: string; class: { id: string; name: string; teacher_name: string } }> {
    const response = await apiService.post<{ success: boolean; data: any }>('/classes/join', data)
    return response.data
  }

  async regenerateJoinCode(classId: string): Promise<{ join_code: string; message: string }> {
    const response = await apiService.post<{ success: boolean; data: { join_code: string; message: string } }>(`/classes/${classId}/regenerate-code`)
    return response.data
  }

  // Student enrollment and management
  async getClassStudents(classId: string): Promise<{ students: ClassStudent[]; statistics: any }> {
    const response = await apiService.get<{ success: boolean; data: { students: ClassStudent[]; statistics: any } }>(`/classes/${classId}/students`)
    return response.data
  }

  async removeStudentFromClass(classId: string, studentId: string): Promise<{ message: string }> {
    const response = await apiService.delete<{ success: boolean; data: { message: string } }>(`/classes/${classId}/students/${studentId}`)
    return response.data
  }

  // Invitations
  async inviteStudentsToClass(classId: string, data: InviteStudentsRequest): Promise<{ invitations_sent: number; failed_emails: any[]; invitations: any[] }> {
    const response = await apiService.post<{ success: boolean; data: any }>(`/classes/${classId}/invite`, data)
    return response.data
  }

  async acceptClassInvitation(token: string): Promise<{ class: { id: string; name: string; teacher_name: string }; enrollment_id: string; enrolled_at: string }> {
    const response = await apiService.post<{ success: boolean; data: any }>(`/invitations/${token}/accept`)
    return response.data
  }

  // Legacy methods for backward compatibility
  async enrollStudent(): Promise<{ message: string }> {
    // This is now handled by joinClass method
    return { message: 'Successfully enrolled in class' }
  }

  async getEnrolledStudents(classId: string): Promise<{ students: ClassStudent[] }> {
    const result = await this.getClassStudents(classId)
    return { students: result.students }
  }

  // Get assignments for a class (both teachers and students can access)
  async getAssignments(classId: string): Promise<{ assignments: Assignment[] }> {
    try {
      const response = await apiService.get<{ success: boolean; data: { assignments: Assignment[] } }>(`/classes/${classId}/assignments`)
      return { assignments: response.data?.assignments || [] }
    } catch (error: any) {
      console.error('Error fetching assignments:', error)
      // Return empty array instead of throwing error
      return { assignments: [] }
    }
  }

  async getAssignment(classId: string, assignmentId: string): Promise<{ assignment: Assignment }> {
    const response = await apiService.get<{ success: boolean; data: Assignment }>(`/classes/${classId}/assignments/${assignmentId}`)
    return { assignment: response.data }
  }

  async createAssignment(classId: string, data: CreateAssignmentRequest): Promise<{ message: string; assignment: Assignment }> {
    const response = await apiService.post<{ success: boolean; data: Assignment }>(`/classes/${classId}/assignments`, data)
    return { message: 'Assignment created successfully', assignment: response.data }
  }

  // Enhanced assignment creation with test cases
  async createAssignmentWithTestCases(classId: string, data: any): Promise<{ message: string; assignment: Assignment }> {
    const response = await apiService.post<{ success: boolean; data: { assignment: Assignment } }>(`/classes/${classId}/assignments`, data)
    return { message: 'Assignment created successfully', assignment: response.data.assignment }
  }

  // Get test cases for an assignment
  async getAssignmentTestCases(classId: string, assignmentId: string): Promise<{ test_cases: any[] }> {
    const response = await apiService.get<{ success: boolean; data: { test_cases: any[] } }>(`/classes/${classId}/assignments/${assignmentId}/test-cases`)
    return response.data
  }

  // Submit code for an assignment
  async submitAssignmentCode(classId: string, assignmentId: string, data: { code: string; language?: string }): Promise<{ submission: any }> {
    const response = await apiService.post<{ success: boolean; data: { submission: any } }>(`/classes/${classId}/assignments/${assignmentId}/submit`, data)
    return response.data
  }

  async updateAssignment(classId: string, assignmentId: string, data: UpdateAssignmentRequest): Promise<{ message: string; assignment: Assignment }> {
    const response = await apiService.put<{ success: boolean; data: { assignment: Assignment } }>(`/classes/${classId}/assignments/${assignmentId}`, data)
    return { message: 'Assignment updated successfully', assignment: response.data.assignment }
  }

  async deleteAssignment(classId: string, assignmentId: string): Promise<{ message: string }> {
    const response = await apiService.delete<{ success: boolean; data: { message: string } }>(`/classes/${classId}/assignments/${assignmentId}`)
    return { message: response.data.message }
  }

  // Get submissions for an assignment (teacher view)
  async getAssignmentSubmissions(classId: string, assignmentId: string): Promise<{ submissions: any[] }> {
    try {
      const response = await apiService.get<{ success: boolean; data: { submissions: any[] } }>(`/classes/${classId}/assignments/${assignmentId}/submissions`)
      return { submissions: response.data.submissions || [] }
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { submissions: [] }
      }
      throw error
    }
  }

  // Get detailed submission information
  async getSubmissionDetails(classId: string, assignmentId: string, submissionId: string): Promise<{ submission: any }> {
    const response = await apiService.get<{ success: boolean; data: { submission: any } }>(`/classes/${classId}/assignments/${assignmentId}/submissions/${submissionId}`)
    return response.data
  }
}

export const classService = new ClassService()