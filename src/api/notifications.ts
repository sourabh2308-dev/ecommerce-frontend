import api from './client'
import type { Notification, LoyaltyBalance, LoyaltyPoint } from '@/types'

// ─── Notifications ────────────────────────────────────────────────────────
export const getNotifications = () =>
  api.get<Notification[]>('/user/notifications').then((r) => r.data)

export const getUnreadNotificationsCount = () =>
  api.get<{ count: number }>('/user/notifications/unread-count').then((r) => r.data)

export const markNotificationAsRead = (uuid: string) =>
  api.put<{ success: boolean }>(`/user/notifications/${uuid}/read`).then((r) => r.data)

export const markAllNotificationsAsRead = () =>
  api.put<{ success: boolean }>('/user/notifications/read-all').then((r) => r.data)

export const deleteNotification = (uuid: string) =>
  api.delete(`/user/notifications/${uuid}`).then((r) => r.data)

// ─── Loyalty Points ───────────────────────────────────────────────────────
export const getLoyaltyBalance = () =>
  api.get<LoyaltyBalance>('/user/loyalty/balance').then((r) => r.data)

export const getLoyaltyHistory = () =>
  api.get<LoyaltyPoint[]>('/user/loyalty/history').then((r) => r.data)

export const redeemPoints = (points: number) =>
  api.post<{ success: boolean; message: string; newBalance: number }>('/user/loyalty/redeem', { points }).then((r) => r.data)
