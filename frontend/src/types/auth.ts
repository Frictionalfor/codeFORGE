export interface User {
  id: string
  email: string
  name: string
  role: 'teacher' | 'student'
  bio?: string
  institution?: string
  major?: string
  year?: string
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  role: 'teacher' | 'student'
}

export interface AuthResponse {
  message: string
  user: User
  tokens: {
    accessToken: string
    refreshToken: string
  }
}

export interface ApiError {
  error: string
  message: string
  timestamp?: string
  path?: string
  statusCode?: number
}