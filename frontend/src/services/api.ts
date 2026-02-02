import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { ApiError } from '../types/auth'
import { auth } from '../config/firebase'

// Extend the request config to include _retry property
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add Firebase auth token
    this.api.interceptors.request.use(
      async (config) => {
        try {
          // Get current Firebase user
          const currentUser = auth?.currentUser
          if (currentUser) {
            // Get fresh Firebase ID token
            const token = await currentUser.getIdToken()
            config.headers.Authorization = `Bearer ${token}`
          }
        } catch (error) {
          console.error('Error getting Firebase token:', error)
          // Continue without token - let the backend handle the 401
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as ExtendedAxiosRequestConfig

        // If token is expired or invalid, try to get a fresh token
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const currentUser = auth?.currentUser
            if (currentUser) {
              // Force refresh the Firebase token
              const freshToken = await currentUser.getIdToken(true)
              originalRequest.headers.Authorization = `Bearer ${freshToken}`
              return this.api(originalRequest)
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError)
            // If refresh fails, redirect to login
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }

        // Transform error response
        const errorData = error.response?.data as any
        const apiError: ApiError = {
          error: errorData?.error || 'Network Error',
          message: errorData?.message || error.message || 'An unexpected error occurred',
          statusCode: error.response?.status,
          timestamp: errorData?.timestamp,
          path: errorData?.path,
        }

        return Promise.reject(apiError)
      }
    )
  }

  // Generic request methods
  async get<T>(url: string): Promise<T> {
    const response = await this.api.get<T>(url)
    return response.data
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.post<T>(url, data)
    return response.data
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.put<T>(url, data)
    return response.data
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.api.delete<T>(url)
    return response.data
  }
}

export const apiService = new ApiService()