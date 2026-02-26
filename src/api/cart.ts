import api from './client'
import type { CartResponse, WishlistItem } from '@/types'

// ─── Cart APIs ─────────────────────────────────────────────────────────────
export const getCart = () =>
  api.get<CartResponse>('/user/cart').then((r) => r.data)

export const addToCart = (productUuid: string, quantity: number) =>
  api.post<{ success: boolean; message: string }>('/user/cart/add', { productUuid, quantity }).then((r) => r.data)

export const updateCartItem = (productUuid: string, quantity: number) =>
  api.put<{ success: boolean; message: string }>('/user/cart/update', { productUuid, quantity }).then((r) => r.data)

export const removeFromCart = (productUuid: string) =>
  api.delete(`/user/cart/remove/${productUuid}`).then((r) => r.data)

export const clearCart = () =>
  api.delete('/user/cart/clear').then((r) => r.data)

// ─── Wishlist APIs ────────────────────────────────────────────────────────
export const getWishlist = () =>
  api.get<WishlistItem[]>('/user/wishlist').then((r) => r.data)

export const addToWishlist = (productUuid: string) =>
  api.post<{ success: boolean; message: string }>('/user/wishlist/add', { productUuid }).then((r) => r.data)

export const removeFromWishlist = (productUuid: string) =>
  api.delete(`/user/wishlist/remove/${productUuid}`).then((r) => r.data)
