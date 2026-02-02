import { apiService } from './api'
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../types/auth'

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const loginData: LoginRequest = { email, password }
    const response = await apiService.post<AuthResponse>('/auth/login', loginData)
    return response
  }

  async register(email: string, password: string, name: string, role: 'teacher' | 'student'): Promise<AuthResponse> {
    const registerData: RegisterRequest = { email, password, name, role }
    const response = await apiService.post<AuthResponse>('/auth/register', registerData)
    return response
  }

  async getProfile(): Promise<User> {
    const response = await apiService.get<{ user: User }>('/auth/profile')
    return response.user
  }

  async updateProfile(profileData: { name?: string; bio?: string; institution?: string; major?: string; year?: string }): Promise<User> {
    const response = await apiService.put<{ user: User }>('/auth/profile', profileData)
    return response.user
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return apiService.post<void>('/auth/change-password', { currentPassword, newPassword })
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return apiService.post<{ accessToken: string }>('/auth/refresh', { refreshToken })
  }

  async logout(): Promise<void> {
    return apiService.post<void>('/auth/logout')
  }
}

export const authService = new AuthService()