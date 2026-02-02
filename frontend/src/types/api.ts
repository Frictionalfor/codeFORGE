export interface Class {
  id: string
  teacher_id: string
  name: string
  description: string
  visibility: 'public' | 'private'
  join_code?: string
  max_students?: number | null
  current_students?: number
  assignment_count?: number
  join_method?: 'code' | 'approval' | 'invitation'
  is_active?: boolean
  created_at: string
  updated_at: string
  enrolled_at?: string
  teacher?: {
    id: string
    name: string
    email: string
  }
}

export interface Assignment {
  id: string
  class_id: string
  title: string
  problem_description: string
  language: 'c' | 'cpp' | 'java' | 'python' | 'javascript'
  time_limit: number
  memory_limit: number
  total_points: number
  due_date: string | null
  allow_late_submission: boolean
  late_penalty_per_day: number
  max_late_days: number
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  test_cases?: TestCase[]
}

export interface TestCase {
  id: string
  assignment_id: string
  input: string
  expected_output: string
  is_hidden: boolean
  points: number
  time_limit: number
  memory_limit: number
  created_at: string
  updated_at: string
}

export interface Submission {
  id: string
  assignment_id: string
  student_id: string
  code: string
  language: 'c' | 'cpp' | 'java' | 'python' | 'javascript'
  status: 'pending' | 'running' | 'completed' | 'failed'
  total_points: number
  points_earned: number
  compilation_error: string | null
  submitted_at: string
  updated_at: string
  student?: {
    id: string
    name: string
    email: string
  }
  assignment?: {
    id: string
    title: string
    language: string
    total_points: number
  }
  executionResults?: ExecutionResult[]
}

export interface ExecutionResult {
  id: string
  submission_id: string
  test_case_id: string
  status: 'pending' | 'running' | 'passed' | 'failed' | 'timeout' | 'memory_exceeded' | 'runtime_error' | 'compilation_error'
  actual_output: string | null
  error_message: string | null
  execution_time: number | null
  memory_used: number | null
  points_earned: number
  created_at: string
  updated_at: string
  testCase?: TestCase
}

export interface Submission {
  id: string
  assignment_id: string
  student_id: string
  code: string
  submitted_at: string
  student?: {
    id: string
    name: string
    email: string
  }
}

export interface Enrollment {
  id: string
  student_id: string
  class_id: string
  status: 'active' | 'pending' | 'suspended' | 'withdrawn'
  enrolled_at: string
  enrolled_by?: string
}