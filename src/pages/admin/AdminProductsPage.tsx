import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, Ban, Eye, ImageOff, ChevronLeft, ChevronRight, Unlock, Package, User, Tag, ShoppingCart } from 'lucide-react'
import * as productsApi from '@/api/products'
import { StatusBadge } from '@/components/StatusBadge'
import { StarRating } from '@/components/StarRating'
import { Spinner } from '@/components/Spinner'
import { ErrorMessage } from '@/components/ErrorMessage'
import { Modal } from '@/components/Modal'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

const parseImages = (raw?: string): string[] =>
  raw ? raw.split(';').map(s => s.trim()).filter(Boolean) : []

/* ── Product Detail Modal ─────────────────────────────────────── */
function ProductDetailModal({ product, onClose, onApprove, onBlock, onUnblock }: {
  product: Product | null
  onClose: () => void
  onApprove: (uuid: string) => void
  onBlock: (uuid: string) => void
  onUnblock: (uuid: string) => void
}) {
  const [activeImg, setActiveImg] = useState(0)

  if (!product) return null
  const images = parseImages(product.imageUrl)
  const hasImages = images.length > 0
  const safeIdx = Math.min(activeImg, Math.max(0, images.length - 1))

  return (
    <Modal open={!!product} onClose={onClose} title="Product Details">
      <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
        {/* Image gallery */}
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-blue-50 h-56 flex items-center justify-center">
          {hasImages ? (
            <>
              <img src={images[safeIdx]} alt={product.name} className="w-full h-full object-cover" />
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImg((safeIdx - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow">
                    <ChevronLeft className="w-4 h-4 text-gray-700" />
                  </button>
                  <button onClick={() => setActiveImg((safeIdx + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow">
                    <ChevronRight className="w-4 h-4 text-gray-700" />
                  </button>
                  <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">{safeIdx + 1}/{images.length}</span>
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-300">
              <ImageOff className="w-12 h-12" />
              <span className="text-xs">No images</span>
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {images.map((url, idx) => (
              <button key={idx} onClick={() => setActiveImg(idx)} className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${idx === safeIdx ? 'border-blue-500' : 'border-transparent hover:border-gray-300'}`}>
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
            <span className="text-xs font-mono text-gray-400">UUID: {product.uuid}</span>
          </div>
          <StatusBadge status={product.status} />
        </div>

        {/* Key metrics grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <Tag className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Category</p>
              <p className="font-semibold text-gray-900 text-sm">{product.category}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">₹</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Price</p>
              <p className="font-semibold text-gray-900 text-sm">₹{product.price.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Package className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Stock</p>
              <p className={`font-semibold text-sm ${product.stock <= 5 ? 'text-red-600' : 'text-gray-900'}`}>{product.stock} units</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Reviews</p>
              <div className="flex items-center gap-1">
                <StarRating value={Math.round(product.averageRating ?? 0)} size="sm" />
                <span className="text-xs text-gray-500">({product.totalReviews ?? 0})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seller */}
        <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
            <User className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Seller UUID</p>
            <p className="font-mono text-xs text-gray-700">{product.sellerUuid}</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</p>
          <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
            {product.description || <span className="italic text-gray-400">No description provided</span>}
          </p>
        </div>

        {/* Image URLs (raw) */}
        {images.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Image URLs ({images.length})</p>
            <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-1">
              {images.map((url, idx) => (
                <a key={idx} href={url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline truncate block font-mono">
                  {idx + 1}. {url}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-2 border-t">
          {product.status === 'DRAFT' && (
            <button onClick={() => { onApprove(product.uuid); onClose() }} className="btn-primary flex-1 py-2 text-sm">
              <CheckCircle className="w-4 h-4" /> Approve
            </button>
          )}
          {product.status === 'BLOCKED' ? (
            <button onClick={() => { onUnblock(product.uuid); onClose() }} className="btn-outline flex-1 py-2 text-sm text-green-600 border-green-200 hover:bg-green-50">
              <Unlock className="w-4 h-4" /> Unblock
            </button>
          ) : (
            <button onClick={() => { onBlock(product.uuid); onClose() }} className="btn-danger flex-1 py-2 text-sm">
              <Ban className="w-4 h-4" /> Block
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

/* ── Main Page ────────────────────────────────────────────────── */
export function AdminProductsPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'all' | 'pending'>('pending')
  const [selected, setSelected] = useState<Product | null>(null)

  const { data: allProducts, isLoading: loadAll, error: errAll } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => productsApi.getProducts({ size: 200 }),
  })

  const pendingProducts = allProducts?.filter((p) => p.status === 'DRAFT') ?? []

  const approve = useMutation({
    mutationFn: productsApi.approveProduct,
    onSuccess: () => { toast.success('Product approved'); qc.invalidateQueries({ queryKey: ['admin-products'] }) },
    onError: () => toast.error('Failed'),
  })
  const blockP = useMutation({
    mutationFn: productsApi.blockProduct,
    onSuccess: () => { toast.success('Product blocked'); qc.invalidateQueries({ queryKey: ['admin-products'] }) },
    onError: () => toast.error('Failed'),
  })
  const unblockP = useMutation({
    mutationFn: productsApi.unblockProduct,
    onSuccess: () => { toast.success('Product unblocked'); qc.invalidateQueries({ queryKey: ['admin-products'] }) },
    onError: () => toast.error('Failed'),
  })

  const displayed = tab === 'pending' ? pendingProducts : (allProducts ?? [])
  const isLoading = loadAll
  if (isLoading) return <Spinner message="Loading products…" />
  if (errAll) return <ErrorMessage message="Failed to load products" />

  const firstImg = (p: Product) => parseImages(p.imageUrl)?.[0]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Product Management</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
        {(['pending', 'all'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === t ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t === 'pending' ? `Pending Approval (${pendingProducts?.length ?? 0})` : `All Products (${allProducts?.length ?? 0})`}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📦</p>
          <p className="font-medium">{tab === 'pending' ? 'No pending approvals' : 'No products'}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Rating', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {displayed.map((p) => {
                const thumb = firstImg(p)
                const imgCount = parseImages(p.imageUrl).length
                return (
                  <tr key={p.uuid} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                          {thumb ? (
                            <img src={thumb} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageOff className="w-4 h-4 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-[180px]">{p.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{p.uuid.slice(0, 8)}</p>
                        </div>
                        {imgCount > 1 && (
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">{imgCount} imgs</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.category}</td>
                    <td className="px-4 py-3 font-semibold">₹{p.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">{p.stock}</td>
                    <td className="px-4 py-3">
                      <StarRating value={Math.round(p.averageRating ?? 0)} size="sm" />
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setSelected(p)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        {p.status === 'DRAFT' && (
                          <button onClick={() => approve.mutate(p.uuid)} className="p-1.5 rounded hover:bg-green-50 text-green-600" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {p.status === 'BLOCKED' ? (
                          <button onClick={() => unblockP.mutate(p.uuid)} className="p-1.5 rounded hover:bg-green-50 text-green-600" title="Unblock">
                            <Unlock className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={() => blockP.mutate(p.uuid)} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Block">
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selected}
        onClose={() => setSelected(null)}
        onApprove={(uuid) => approve.mutate(uuid)}
        onBlock={(uuid) => blockP.mutate(uuid)}
        onUnblock={(uuid) => unblockP.mutate(uuid)}
      />
    </div>
  )
}
