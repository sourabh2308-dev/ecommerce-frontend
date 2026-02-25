import api from './client'
import type { Payment, SellerDashboard, AdminDashboard, PaginatedResponse } from '@/types'

export const getSellerPayments = (params?: { page?: number; size?: number }) =>
  api.get<PaginatedResponse<Payment>>('/payment/seller', { params: { size: 100, ...params } }).then((r) => r.data)

export const getSellerDashboard = () =>
  api.get<SellerDashboard>('/payment/seller/dashboard').then((r) => r.data)

export const getAdminDashboard = () =>
  api.get<AdminDashboard>('/payment/admin/dashboard').then((r) => r.data)
