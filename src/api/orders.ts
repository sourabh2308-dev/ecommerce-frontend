import api from './client'
import type { Order, CreateOrderRequest, PaginatedResponse, Coupon, CouponValidation, ReturnRequest, TrackingEvent } from '@/types'

export const placeOrder = (data: CreateOrderRequest) =>
  api.post<Order>('/order', data).then((r) => r.data)

export const getMyOrders = () =>
  api.get<PaginatedResponse<Order>>('/order', { params: { size: 100 } }).then((r) => r.data.content)

export const getOrder = (uuid: string) =>
  api.get<Order>(`/order/${uuid}`).then((r) => r.data)

export const cancelOrder = (uuid: string) =>
  api.put<Order>(`/order/${uuid}/status`, null, { params: { status: 'CANCELLED' } }).then((r) => r.data)

export const updateOrderStatus = (uuid: string, status: string) =>
  api.put<Order>(`/order/${uuid}/status`, null, { params: { status } }).then((r) => r.data)

export const requestReturn = (uuid: string, returnType: 'REFUND' | 'EXCHANGE', returnReason: string) =>
  api.put<Order>(`/order/${uuid}/status`, null, {
    params: { status: 'RETURN_REQUESTED', returnType, returnReason },
  }).then((r) => r.data)

export const getSellerOrders = () =>
  api.get<PaginatedResponse<Order>>('/order/seller', { params: { size: 100 } }).then((r) => r.data.content)

export const getAllOrders = () =>
  api.get<PaginatedResponse<Order>>('/order', { params: { size: 100 } }).then((r) => r.data.content)

// ─── Coupons ──────────────────────────────────────────────────────────────
export const validateCoupon = (code: string, orderAmount: number) =>
  api.post<CouponValidation>('/order/coupons/validate', { code, orderAmount }).then((r) => r.data)

export const getAllCoupons = () =>
  api.get<Coupon[]>('/order/coupons').then((r) => r.data)

export const getCouponByCode = (code: string) =>
  api.get<Coupon>(`/order/coupons/${code}`).then((r) => r.data)

export const createCoupon = (data: Omit<Coupon, 'usedCount'>) =>
  api.post<Coupon>('/order/coupons', data).then((r) => r.data)

export const updateCoupon = (code: string, data: Partial<Coupon>) =>
  api.put<Coupon>(`/order/coupons/${code}`, data).then((r) => r.data)

export const deleteCoupon = (code: string) =>
  api.delete(`/order/coupons/${code}`).then((r) => r.data)

// ─── Returns ──────────────────────────────────────────────────────────────
export const createReturnRequest = (orderUuid: string, returnType: 'REFUND' | 'EXCHANGE', reason: string) =>
  api.post<ReturnRequest>('/order/returns', { orderUuid, returnType, reason }).then((r) => r.data)

export const getMyReturns = () =>
  api.get<ReturnRequest[]>('/order/returns/my-returns').then((r) => r.data)

export const getReturnByUuid = (uuid: string) =>
  api.get<ReturnRequest>(`/order/returns/${uuid}`).then((r) => r.data)

export const getAllReturns = () =>
  api.get<ReturnRequest[]>('/order/returns').then((r) => r.data)

export const updateReturnStatus = (uuid: string, status: string, adminNotes?: string, refundAmount?: number) =>
  api.put<ReturnRequest>(`/order/returns/${uuid}/status`, { status, adminNotes, refundAmount }).then((r) => r.data)

// ─── Tracking ─────────────────────────────────────────────────────────────
export const getOrderTracking = (orderUuid: string) =>
  api.get<TrackingEvent[]>(`/order/tracking/${orderUuid}`).then((r) => r.data)

export const addTrackingEvent = (orderUuid: string, status: string, location?: string, description?: string, carrier?: string, trackingNumber?: string) =>
  api.post<TrackingEvent>('/order/tracking', { orderUuid, status, location, description, carrier, trackingNumber }).then((r) => r.data)

// ─── Invoice ──────────────────────────────────────────────────────────────
export const downloadInvoice = (orderUuid: string) =>
  api.get(`/order/invoice/${orderUuid}`, { responseType: 'blob' }).then((r) => r.data)

// ─── Audit Logs (Admin) ───────────────────────────────────────────────────
export const getOrderAuditLogs = (orderUuid: string) =>
  api.get<any[]>(`/order/audit/${orderUuid}`).then((r) => r.data)


