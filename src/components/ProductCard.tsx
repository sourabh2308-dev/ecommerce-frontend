import { ShoppingCart, ImageOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import type { Product } from '@/types'
import { StarRating } from './StarRating'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'

const firstImg = (raw?: string) => raw?.split(';').map(s => s.trim()).find(Boolean) || ''

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const [imgError, setImgError] = useState(false)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product)
    toast.success(`${product.name} added to cart`)
  }

  const imgUrl = firstImg(product.imageUrl)
  const showImage = imgUrl && !imgError

  return (
    <Link
      to={`/products/${product.uuid}`}
      className="card flex flex-col overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
    >
      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-slate-100 to-blue-50 overflow-hidden">
        {showImage ? (
          <img
            src={imgUrl}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
            <ImageOff className="w-10 h-10" />
            <span className="text-xs">No image</span>
          </div>
        )}
        {product.stock === 0 && (
          <span className="absolute top-2 left-2 badge bg-red-100 text-red-700">Out of stock</span>
        )}
        {product.stock > 0 && product.stock < 10 && (
          <span className="absolute top-2 left-2 badge bg-orange-100 text-orange-700">
            Only {product.stock} left
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">{product.category}</p>
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
          {product.name}
        </h3>
        <p className="text-gray-400 text-xs line-clamp-2 flex-1">{product.description}</p>

        <div className="flex items-center gap-1.5 mt-auto pt-1">
          <StarRating value={Math.round(product.averageRating ?? 0)} size="sm" />
          <span className="text-xs text-gray-400">({product.totalReviews ?? 0})</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <span className="text-lg font-bold text-gray-900">₹{product.price.toFixed(2)}</span>
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="btn-primary text-xs py-1.5 px-3"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
          </button>
        </div>
      </div>
    </Link>
  )
}
