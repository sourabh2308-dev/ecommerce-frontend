import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'

export function CartPage() {
  const { items, removeItem, updateQty, total, clear } = useCartStore()
  const navigate = useNavigate()

  if (items.length === 0) return (
    <div className="text-center py-24">
      <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-700">Your cart is empty</h2>
      <p className="text-gray-400 text-sm mt-2">Add some products to get started</p>
      <Link to="/products" className="btn-primary mt-6 inline-flex">Browse Products</Link>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        <button onClick={clear} className="text-xs text-red-500 hover:text-red-700">Clear all</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {items.map(({ product, quantity }) => (
            <div key={product.uuid} className="card p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-2xl">📦</span>
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${product.uuid}`} className="font-medium text-gray-900 hover:text-blue-600 block truncate">
                  {product.name}
                </Link>
                <p className="text-xs text-gray-500">{product.category}</p>
                <p className="text-blue-600 font-semibold text-sm mt-0.5">₹{product.price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => updateQty(product.uuid, quantity - 1)} className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-md hover:bg-gray-50">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                <button onClick={() => updateQty(product.uuid, Math.min(product.stock, quantity + 1))} className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-md hover:bg-gray-50">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <p className="font-bold text-gray-900 w-20 text-right shrink-0">₹{(product.price * quantity).toFixed(2)}</p>
              <button onClick={() => removeItem(product.uuid)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card p-5 h-fit sticky top-20">
          <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            {items.map(({ product, quantity }) => (
              <div key={product.uuid} className="flex justify-between text-sm text-gray-600">
                <span className="truncate max-w-[150px]">{product.name} ×{quantity}</span>
                <span>₹{(product.price * quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 flex justify-between font-bold text-gray-900 mb-5">
            <span>Total</span>
            <span>₹{total().toFixed(2)}</span>
          </div>
          <button onClick={() => navigate('/checkout')} className="btn-primary w-full py-2.5">
            Proceed to Checkout
          </button>
          <Link to="/products" className="btn-outline w-full py-2 mt-2 text-center block text-sm">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
