import api from './client'
import type { Order, CreateOrderRequest, PaginatedResponse } from '@/types'

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

export const getSellerOrders = () =>
  api.get<PaginatedResponse<Order>>('/order/seller', { params: { size: 100 } }).then((r) => r.data.content)

export const getAllOrders = () =>
  api.get<PaginatedResponse<Order>>('/order', { params: { size: 100 } }).then((r) => r.data.content)

