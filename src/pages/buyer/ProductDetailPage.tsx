import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShoppingCart, Minus, Plus, ArrowLeft, ImageOff, ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown, BadgeCheck } from 'lucide-react'
import * as productsApi from '@/api/products'
import * as reviewsApi from '@/api/reviews'
import { StarRating } from '@/components/StarRating'
import { StatusBadge } from '@/components/StatusBadge'
import { Spinner } from '@/components/Spinner'
import { ErrorMessage } from '@/components/ErrorMessage'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const parseImages = (raw?: string): string[] =>
  raw ? raw.split(';').map(s => s.trim()).filter(Boolean) : []

export function ProductDetailPage() {
  const { uuid } = useParams<{ uuid: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const addItem = useCartStore((s) => s.addItem)
  const { isAuthenticated, role } = useAuthStore()
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set())

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', uuid],
    queryFn: () => productsApi.getProduct(uuid!),
    enabled: !!uuid,
  })

  const { data: reviews } = useQuery({
    queryKey: ['reviews', uuid],
    queryFn: () => reviewsApi.getProductReviews(uuid!),
    enabled: !!uuid,
  })

  const voteMut = useMutation({
    mutationFn: ({ reviewUuid, helpful }: { reviewUuid: string; helpful: boolean }) =>
      reviewsApi.voteReview(reviewUuid, helpful),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', uuid] })
    },
    onError: () => toast.error('Failed to record vote'),
  })

  const reviewCount = reviews?.length ?? (product?.totalReviews ?? 0)
  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : (product?.averageRating ?? 0)

  if (isLoading) return <Spinner message="Loading product…" />
  if (error || !product) return <ErrorMessage message="Product not found" />

  const images = parseImages(product.imageUrl).filter((_, i) => !imgErrors.has(i))
  const hasImages = images.length > 0
  const safeIdx = Math.min(activeImg, images.length - 1)

  const handleAdd = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    addItem(product, qty)
    toast.success(`${qty}× ${product.name} added to cart`)
  }

  const handleImgError = (idx: number) => {
    setImgErrors(prev => new Set(prev).add(idx))
  }

  const handleVote = (reviewUuid: string, helpful: boolean) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    voteMut.mutate({ reviewUuid, helpful })
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Image Gallery */}
        <div className="flex flex-col gap-3">
          {/* Main image */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-blue-50 h-72 lg:h-[420px] flex items-center justify-center">
            {hasImages ? (
              <>
                <img
                  src={images[safeIdx]}
                  alt={`${product.name} - image ${safeIdx + 1}`}
                  onError={() => handleImgError(safeIdx)}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImg((safeIdx - 1 + images.length) % images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={() => setActiveImg((safeIdx + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                    <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      {safeIdx + 1} / {images.length}
                    </span>
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-300">
                <ImageOff className="w-16 h-16" />
                <span className="text-sm">No image available</span>
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    idx === safeIdx ? 'border-blue-500 shadow-md' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" onError={() => handleImgError(idx)} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-blue-600 font-semibold uppercase tracking-wider">{product.category}</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1 leading-tight">{product.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <StarRating value={Math.round(averageRating)} />
            <span className="text-sm text-gray-600 font-medium">{averageRating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
            <StatusBadge status={product.status} />
          </div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          <div className="flex items-baseline gap-3 py-2 border-y border-gray-100">
            <span className="text-3xl font-bold text-gray-900">₹{product.price.toFixed(2)}</span>
            <span className={`text-sm font-medium ${product.stock === 0 ? 'text-red-500' : 'text-green-600'}`}>
              {product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
            </span>
          </div>

          {product.status === 'ACTIVE' && product.stock > 0 && role !== 'SELLER' && role !== 'ADMIN' && (
            <>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="btn-outline w-9 h-9 p-0 flex items-center justify-center">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-semibold text-lg">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="btn-outline w-9 h-9 p-0 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button onClick={handleAdd} className="btn-primary py-3 text-base">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart · ₹{(product.price * qty).toFixed(2)}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Customer Reviews <span className="text-gray-400 font-normal text-base">({reviews?.length ?? 0})</span>
        </h2>
        {reviews && reviews.length > 0 ? (
          <div className="flex flex-col gap-3">
            {reviews.map((r) => (
              <div key={r.uuid} className="card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <StarRating value={r.rating} size="sm" />
                      {r.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                          <BadgeCheck className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mt-2 text-sm leading-relaxed">{r.comment}</p>
                    {r.imageUrls && r.imageUrls.length > 0 && (
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {r.imageUrls.map((url, idx) => (
                          <img
                            key={`${r.uuid}-${idx}`}
                            src={url}
                            alt="Review"
                            className="w-16 h-16 rounded-lg object-cover border border-gray-100"
                          />
                        ))}
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={() => handleVote(r.uuid, true)}
                        className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-green-700"
                      >
                        <ThumbsUp className="w-4 h-4" /> Helpful {r.helpfulCount ?? 0}
                      </button>
                      <button
                        onClick={() => handleVote(r.uuid, false)}
                        className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-red-700"
                      >
                        <ThumbsDown className="w-4 h-4" /> Not helpful {r.notHelpfulCount ?? 0}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 shrink-0 mt-0.5">
                    {format(new Date(r.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center text-gray-400">
            <p className="text-3xl mb-2">💬</p>
            <p className="font-medium">No reviews yet</p>
            <p className="text-sm">Be the first to review this product</p>
          </div>
        )}
      </div>
    </div>
  )
}
