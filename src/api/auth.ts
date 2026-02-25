import api from './client'
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types'

export const login = (data: LoginRequest) =>
  api.post<AuthResponse>('/auth/login', data).then((r) => r.data)

export const register = (data: RegisterRequest) => {
  const parts = data.name.trim().split(/\s+/)
  const firstName = parts[0] ?? 'User'
  const lastName = parts.slice(1).join(' ') || 'User'

  return api
    .post<{ success: boolean; message: string }>('/user/register', {
      firstName,
      lastName,
      email: data.email,
      password: data.password,
      role: data.role,
    })
    .then((r) => r.data)
}

export const verifyOtp = (email: string, otp: string) =>
  api.post<{ success: boolean; message: string }>('/user/verify-otp', { email, otpCode: otp }).then((r) => r.data)

export const resendOtp = (email: string) =>
  api.post<{ success: boolean; message: string }>(`/user/resend-otp?email=${encodeURIComponent(email)}`).then((r) => r.data)

export const refreshToken = (refreshToken: string) =>
  api.post<AuthResponse>(`/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`).then((r) => r.data)

export const logout = () => {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) return Promise.resolve(null)

  return api
    .post(`/auth/logout?refreshToken=${encodeURIComponent(refreshToken)}`)
    .then((r) => r.data)
}
