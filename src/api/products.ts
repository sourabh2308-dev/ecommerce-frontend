import api from './client'
import type { Product, CreateProductRequest, Category, ProductImage, ProductVariant, FlashDeal, StockMovement } from '@/types'

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

// ─── Categories ───────────────────────────────────────────────────────────
export const getAllCategories = () =>
  api.get<Category[]>('/product/categories').then((r) => r.data)

export const getCategoryByUuid = (uuid: string) =>
  api.get<Category>(`/product/categories/${uuid}`).then((r) => r.data)

export const getCategoryTree = () =>
  api.get<Category[]>('/product/categories/tree').then((r) => r.data)

export const createCategory = (data: Omit<Category, 'uuid' | 'createdAt' | 'children'>) =>
  api.post<Category>('/product/categories', data).then((r) => r.data)

export const updateCategory = (uuid: string, data: Partial<Category>) =>
  api.put<Category>(`/product/categories/${uuid}`, data).then((r) => r.data)

export const deleteCategory = (uuid: string) =>
  api.delete(`/product/categories/${uuid}`).then((r) => r.data)

// ─── Product Images ───────────────────────────────────────────────────────
export const getProductImages = (productUuid: string) =>
  api.get<ProductImage[]>(`/product/${productUuid}/images`).then((r) => r.data)

export const addProductImage = (productUuid: string, imageUrl: string, displayOrder?: number, altText?: string) =>
  api.post<ProductImage>(`/product/${productUuid}/images`, { imageUrl, displayOrder, altText }).then((r) => r.data)

export const updateProductImage = (productUuid: string, imageId: number, data: Partial<ProductImage>) =>
  api.put<ProductImage>(`/product/${productUuid}/images/${imageId}`, data).then((r) => r.data)

export const deleteProductImage = (productUuid: string, imageId: number) =>
  api.delete(`/product/${productUuid}/images/${imageId}`).then((r) => r.data)

// ─── Product Variants ─────────────────────────────────────────────────────
export const getProductVariants = (productUuid: string) =>
  api.get<ProductVariant[]>(`/product/${productUuid}/variants`).then((r) => r.data)

export const getVariantByUuid = (productUuid: string, variantUuid: string) =>
  api.get<ProductVariant>(`/product/${productUuid}/variants/${variantUuid}`).then((r) => r.data)

export const createVariant = (productUuid: string, data: Omit<ProductVariant, 'uuid'>) =>
  api.post<ProductVariant>(`/product/${productUuid}/variants`, data).then((r) => r.data)

export const updateVariant = (productUuid: string, variantUuid: string, data: Partial<ProductVariant>) =>
  api.put<ProductVariant>(`/product/${productUuid}/variants/${variantUuid}`, data).then((r) => r.data)

export const deleteVariant = (productUuid: string, variantUuid: string) =>
  api.delete(`/product/${productUuid}/variants/${variantUuid}`).then((r) => r.data)

// ─── Inventory ────────────────────────────────────────────────────────────
export const getStockMovements = (productUuid: string) =>
  api.get<StockMovement[]>(`/product/inventory/${productUuid}/movements`).then((r) => r.data)

export const addStock = (productUuid: string, quantity: number, reference?: string) =>
  api.post<{ success: boolean; newStock: number }>(`/product/inventory/${productUuid}/add`, { quantity, reference }).then((r) => r.data)

export const removeStock = (productUuid: string, quantity: number, reference?: string) =>
  api.post<{ success: boolean; newStock: number }>(`/product/inventory/${productUuid}/remove`, { quantity, reference }).then((r) => r.data)

export const setStock = (productUuid: string, stock: number, reference?: string) =>
  api.put<{ success: boolean; newStock: number }>(`/product/inventory/${productUuid}/set`, { stock, reference }).then((r) => r.data)

// ─── Flash Deals ──────────────────────────────────────────────────────────
export const getActiveFlashDeals = () =>
  api.get<FlashDeal[]>('/product/flash-deals/active').then((r) => r.data)

export const getAllFlashDeals = () =>
  api.get<FlashDeal[]>('/product/flash-deals').then((r) => r.data)

export const getFlashDealByUuid = (uuid: string) =>
  api.get<FlashDeal>(`/product/flash-deals/${uuid}`).then((r) => r.data)

export const createFlashDeal = (data: Omit<FlashDeal, 'uuid' | 'discountedPrice'>) =>
  api.post<FlashDeal>('/product/flash-deals', data).then((r) => r.data)

export const updateFlashDeal = (uuid: string, data: Partial<FlashDeal>) =>
  api.put<FlashDeal>(`/product/flash-deals/${uuid}`, data).then((r) => r.data)

export const deleteFlashDeal = (uuid: string) =>
  api.delete(`/product/flash-deals/${uuid}`).then((r) => r.data)

// ─── Recommendations ──────────────────────────────────────────────────────
export const getRecommendations = (productUuid: string) =>
  api.get<Product[]>(`/product/${productUuid}/recommendations`).then((r) => r.data)

// ─── Search ───────────────────────────────────────────────────────────────
export const searchProducts = (query: string, page = 0, size = 20) =>
  api.get<{ content: Product[] }>('/product/search', { params: { query, page, size } }).then((r) => r.data.content)

