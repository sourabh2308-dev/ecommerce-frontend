import { create } from 'zustand'
import { jwtDecode } from 'jwt-decode'
import type { UserRole } from '@/types'

interface JwtPayload { sub: string; uuid: string; role: UserRole; exp: number }

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  role: UserRole | null
  email: string | null
  uuid: string | null
  isAuthenticated: boolean
  setTokens: (access: string, refresh: string) => void
  logout: () => void
}

function decodeToken(token: string): JwtPayload | null {
  try { return jwtDecode<JwtPayload>(token) } catch { return null }
}

const stored = localStorage.getItem('accessToken')
const refresh = localStorage.getItem('refreshToken')
const decoded = stored ? decodeToken(stored) : null

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: stored,
  refreshToken: refresh,
  role: decoded?.role ?? null,
  email: decoded?.sub ?? null,
  uuid: decoded?.uuid ?? null,
  isAuthenticated: !!stored && !!decoded && decoded.exp * 1000 > Date.now(),

  setTokens(access, refresh) {
    localStorage.setItem('accessToken', access)
    localStorage.setItem('refreshToken', refresh)
    const d = decodeToken(access)
    set({ accessToken: access, refreshToken: refresh, role: d?.role ?? null, email: d?.sub ?? null, uuid: d?.uuid ?? null, isAuthenticated: true })
  },

  logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    set({ accessToken: null, refreshToken: null, role: null, email: null, uuid: null, isAuthenticated: false })
  },
}))
