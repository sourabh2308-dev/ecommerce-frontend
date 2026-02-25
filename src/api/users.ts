import api from './client'
import type { User, UpdateProfileRequest, ChangePasswordRequest, PaginatedResponse, SellerDetailRequest, SellerDetailResponse } from '@/types'

// ─── Authenticated user endpoints ──────────────────────────────────────────
export const getProfile = () =>
  api.get<{ data: User }>('/user/me').then((r) => r.data.data)

export const updateProfile = (data: UpdateProfileRequest) =>
  api.put<{ data: User }>('/user/me', data).then((r) => r.data.data)

export const changePassword = (data: ChangePasswordRequest) =>
  api.put<{ message: string }>('/user/me/change-password', data).then((r) => r.data)

// ─── Admin endpoints ───────────────────────────────────────────────────────
export const getAllUsers = (params?: { page?: number; size?: number; role?: string; status?: string }) =>
  api.get<{ data: PaginatedResponse<User> }>('/user', { params: { size: 100, ...params } }).then((r) => r.data.data.content)

export const approveSeller = (uuid: string) =>
  api.put<{ message: string }>(`/user/admin/approve/${uuid}`).then((r) => r.data)

export const rejectSeller = (uuid: string) =>
  api.put<{ message: string }>(`/user/admin/reject/${uuid}`).then((r) => r.data)

export const blockUser = (uuid: string) =>
  api.put<{ message: string }>(`/user/admin/block/${uuid}`).then((r) => r.data)

export const unblockUser = (uuid: string) =>
  api.put<{ message: string }>(`/user/admin/unblock/${uuid}`).then((r) => r.data)

export const softDeleteUser = (uuid: string) =>
  api.delete<{ message: string }>(`/user/${uuid}`).then((r) => r.data)

export const restoreUser = (uuid: string) =>
  api.put<{ message: string }>(`/user/restore/${uuid}`).then((r) => r.data)

// ─── Seller detail endpoints ───────────────────────────────────────────────
export const submitSellerDetails = (data: SellerDetailRequest) =>
  api.post<{ data: SellerDetailResponse }>('/user/me/seller-details', data).then((r) => r.data.data)

export const getSellerDetails = () =>
  api.get<{ data: SellerDetailResponse }>('/user/me/seller-details').then((r) => r.data.data)

export const getSellerDetailsByAdmin = (uuid: string) =>
  api.get<{ data: SellerDetailResponse }>(`/user/admin/seller-details/${uuid}`).then((r) => r.data.data)

