import api from './client'
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types'

export const login = (data: LoginRequest) =>
  api.post<AuthResponse>('/auth/login', { ...data, email: data.email.trim().toLowerCase() }).then((r) => r.data)

export const register = (data: RegisterRequest) => {
  const parts = data.name.trim().split(/\s+/)
  const firstName = parts[0] ?? 'User'
  const lastName = parts.slice(1).join(' ') || 'User'

  return api
    .post<{ success: boolean; message: string }>('/user/register', {
      firstName,
      lastName,
      email: data.email.trim().toLowerCase(),
      password: data.password,
      role: data.role,
    })
    .then((r) => r.data)
}

export const verifyOtp = (email: string, otp: string) =>
  api.post<{ success: boolean; message: string }>('/user/verify-otp', { email: email.trim().toLowerCase(), otpCode: otp }).then((r) => r.data)

export const resendOtp = (email: string) =>
  api.post<{ success: boolean; message: string }>(`/user/resend-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`).then((r) => r.data)

export const refreshToken = (refreshToken: string) =>
  api.post<AuthResponse>(`/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`).then((r) => r.data)

export const logout = () => {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) return Promise.resolve(null)

  return api
    .post(`/auth/logout?refreshToken=${encodeURIComponent(refreshToken)}`)
    .then((r) => r.data)
}

export const forgotPassword = (email: string) =>
  api.post<{ success: boolean; message: string }>('/auth/forgot-password', { email: email.trim().toLowerCase() }).then((r) => r.data)

export const resetPassword = (email: string, otp: string, newPassword: string) =>
  api
    .post<{ success: boolean; message: string }>('/auth/reset-password', {
      email: email.trim().toLowerCase(),
      otpCode: otp,
      newPassword,
    })
    .then((r) => r.data)
