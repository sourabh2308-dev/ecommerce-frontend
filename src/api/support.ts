import api from './client'
import type { SupportTicket, TicketCategory } from '@/types'

export const getMyTickets = () =>
  api.get<SupportTicket[]>('/user/support/my-tickets').then((r) => r.data)

export const getTicketByUuid = (uuid: string) =>
  api.get<SupportTicket>(`/user/support/tickets/${uuid}`).then((r) => r.data)

export const createTicket = (subject: string, description: string, category: TicketCategory, orderUuid?: string) =>
  api.post<SupportTicket>('/user/support/tickets', { subject, description, category, orderUuid }).then((r) => r.data)

export const addMessageToTicket = (ticketUuid: string, content: string) =>
  api.post<{ success: boolean; message: string }>(`/user/support/tickets/${ticketUuid}/messages`, { content }).then((r) => r.data)

export const closeTicket = (uuid: string) =>
  api.put<{ success: boolean }>(`/user/support/tickets/${uuid}/close`).then((r) => r.data)

// Admin endpoints (for admin/support role)
export const getAllTickets = () =>
  api.get<SupportTicket[]>('/user/support/admin/tickets').then((r) => r.data)

export const assignTicket = (uuid: string, adminUuid: string) =>
  api.put<{ success: boolean }>(`/user/support/admin/tickets/${uuid}/assign`, { adminUuid }).then((r) => r.data)

export const updateTicketStatus = (uuid: string, status: string) =>
  api.put<{ success: boolean }>(`/user/support/admin/tickets/${uuid}/status`, { status }).then((r) => r.data)
