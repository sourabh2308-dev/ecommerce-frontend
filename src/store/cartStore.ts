import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from '@/types'

interface CartState {
  items: CartItem[]
  addItem: (product: Product, qty?: number) => void
  removeItem: (productUuid: string) => void
  updateQty: (productUuid: string, qty: number) => void
  clear: () => void
  total: () => number
  count: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem(product, qty = 1) {
        set((s) => {
          const existing = s.items.find((i) => i.product.uuid === product.uuid)
          if (existing) {
            return { items: s.items.map((i) => i.product.uuid === product.uuid ? { ...i, quantity: i.quantity + qty } : i) }
          }
          return { items: [...s.items, { product, quantity: qty }] }
        })
      },
      removeItem(uuid) {
        set((s) => ({ items: s.items.filter((i) => i.product.uuid !== uuid) }))
      },
      updateQty(uuid, qty) {
        if (qty <= 0) { get().removeItem(uuid); return }
        set((s) => ({ items: s.items.map((i) => i.product.uuid === uuid ? { ...i, quantity: qty } : i) }))
      },
      clear() { set({ items: [] }) },
      total() { return get().items.reduce((acc, i) => acc + i.product.price * i.quantity, 0) },
      count() { return get().items.reduce((acc, i) => acc + i.quantity, 0) },
    }),
    { name: 'cart' }
  )
)
