import api from './client'
import type { Product, CreateProductRequest } from '@/types'

interface ProductListParams {
  keyword?: string
  page?: number
  size?: number
  sortBy?: string
  direction?: string
}

// Backend returns PageResponse<ProductResponse>; we unwrap to Product[]
export const getProducts = (params?: ProductListParams) =>
  api.get<{ content: Product[] }>('/product', { params }).then((r) => r.data.content)

export const getProduct = (uuid: string) =>
  api.get<Product>(`/product/${uuid}`).then((r) => r.data)

export const createProduct = (data: CreateProductRequest) =>
  api.post<Product>('/product', data).then((r) => r.data)

export const updateProduct = (uuid: string, data: Partial<CreateProductRequest>) =>
  api.put<Product>(`/product/${uuid}`, data).then((r) => r.data)

export const deleteProduct = (uuid: string) =>
  api.delete(`/product/${uuid}`).then((r) => r.data)

// Admin endpoints
export const approveProduct = (uuid: string) =>
  api.put<string>(`/product/admin/approve/${uuid}`).then((r) => r.data)

export const blockProduct = (uuid: string) =>
  api.put<string>(`/product/admin/block/${uuid}`).then((r) => r.data)

export const unblockProduct = (uuid: string) =>
  api.put<string>(`/product/admin/unblock/${uuid}`).then((r) => r.data)

// Seller & Admin — same endpoint, role is injected by gateway
export const getMyProducts = () =>
  api.get<{ content: Product[] }>('/product').then((r) => r.data.content)
