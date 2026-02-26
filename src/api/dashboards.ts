import api from './client'
import type { AdminOrderDashboard, SellerOrderDashboard } from '@/types'

export const getAdminDashboard = () =>
  api.get<AdminOrderDashboard>('/order/dashboard/admin').then((r) => r.data)

export const getSellerDashboard = () =>
  api.get<SellerOrderDashboard>('/order/dashboard/seller').then((r) => r.data)
