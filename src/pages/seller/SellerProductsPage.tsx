import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, ImageOff, X, Link as LinkIcon, Image } from 'lucide-react'
import * as productsApi from '@/api/products'
import { StatusBadge } from '@/components/StatusBadge'
import { Spinner } from '@/components/Spinner'
import { ErrorMessage } from '@/components/ErrorMessage'
import { Modal } from '@/components/Modal'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

const CATS = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Toys', 'Food', 'Other']

/* ────── helpers ────── */
const parseImages = (raw?: string): string[] =>
  raw ? raw.split(';').map((s) => s.trim()).filter(Boolean) : []
const joinImages = (urls: string[]): string => urls.join(';')

/* ────── Multi-image editor component ────── */
function ImageEditor({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [pasteMode, setPasteMode] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [urlInput, setUrlInput] = useState('')

  const addUrl = useCallback(() => {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    try { new URL(trimmed) } catch { toast.error('Invalid URL'); return }
    if (value.includes(trimmed)) { toast.error('Duplicate image'); return }
    onChange([...value, trimmed])
    setUrlInput('')
  }, [urlInput, value, onChange])

  const handlePaste = () => {
    const urls = pasteText
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((u) => { try { new URL(u); return true } catch { return false } })
    if (!urls.length) { toast.error('No valid URLs found'); return }
    const unique = [...new Set([...value, ...urls])]
    onChange(unique)
    setPasteText('')
    setPasteMode(false)
    toast.success(`${urls.length} image(s) added`)
  }

  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="label mb-0">
          Product Images <span className="text-red-500">*</span>
          <span className="text-gray-400 font-normal ml-1">(at least 1 required)</span>
        </label>
        <button
          type="button"
          onClick={() => setPasteMode(!pasteMode)}
          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
        >
          <LinkIcon className="w-3 h-3" />
          {pasteMode ? 'Single add' : 'Paste multiple'}
        </button>
      </div>

      {/* Paste mode: semicolon-separated */}
      {pasteMode ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            className="input h-20 resize-none text-xs font-mono"
            placeholder="Paste semicolon-separated URLs:&#10;https://img1.jpg ; https://img2.jpg ; https://img3.jpg"
          />
          <button type="button" onClick={handlePaste} className="btn-outline text-xs py-1.5 self-start">
            Import URLs
          </button>
        </div>
      ) : (
        /* Single URL add */
        <div className="flex gap-2">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl() } }}
            className="input flex-1 text-sm"
            placeholder="https://example.com/image.jpg"
          />
          <button type="button" onClick={addUrl} className="btn-outline text-xs py-1.5 px-3 shrink-0">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      )}

      {/* Image preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {value.map((url, idx) => (
            <div key={idx} className="relative group rounded-lg overflow-hidden bg-gray-100 aspect-square">
              <img src={url} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '' }} />
              <button
                type="button"
                onClick={() => remove(idx)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {value.length === 0 && (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-400">
          <Image className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Add at least one product image</p>
          <p className="text-xs">Paste a URL above or use "Paste multiple" for bulk import</p>
        </div>
      )}
    </div>
  )
}

/* ────── Main page ────── */
export function SellerProductsPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<{ type: 'create' | 'edit'; product?: Product } | null>(null)

  /* Form state (manual instead of react-hook-form for easier image handling) */
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', category: '', images: [] as string[] })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['my-products'],
    queryFn: productsApi.getMyProducts,
  })

  const openCreate = () => {
    setForm({ name: '', description: '', price: '', stock: '', category: '', images: [] })
    setFormErrors({})
    setModal({ type: 'create' })
  }
  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      stock: String(p.stock),
      category: p.category,
      images: parseImages(p.imageUrl),
    })
    setFormErrors({})
    setModal({ type: 'edit', product: p })
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.name.trim() || form.name.length < 2) errs.name = 'Name is required (min 2 chars)'
    if (!form.description.trim() || form.description.length < 10) errs.description = 'At least 10 characters'
    const price = parseFloat(form.price)
    if (isNaN(price) || price <= 0) errs.price = 'Must be > 0'
    const stock = parseInt(form.stock)
    if (isNaN(stock) || stock < 0) errs.stock = 'Must be ≥ 0'
    if (!form.category) errs.category = 'Required'
    if (form.images.length === 0) errs.images = 'At least 1 image is required'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const saveMut = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        category: form.category,
        imageUrl: joinImages(form.images) || undefined,
      }
      return modal?.type === 'edit' && modal.product
        ? productsApi.updateProduct(modal.product.uuid, payload)
        : productsApi.createProduct(payload)
    },
    onSuccess: () => {
      toast.success(modal?.type === 'edit' ? 'Product updated' : 'Product created — pending approval')
      qc.invalidateQueries({ queryKey: ['my-products'] })
      setModal(null)
    },
    onError: () => toast.error('Failed to save product'),
  })

  const deleteMut = useMutation({
    mutationFn: productsApi.deleteProduct,
    onSuccess: () => { toast.success('Product deleted'); qc.invalidateQueries({ queryKey: ['my-products'] }) },
    onError: () => toast.error('Failed to delete product'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) saveMut.mutate()
  }

  if (isLoading) return <Spinner message="Loading products…" />
  if (error) return <ErrorMessage message="Failed to load products" />

  const firstImage = (p: Product) => parseImages(p.imageUrl)?.[0]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-500 text-sm mt-1">{products?.length ?? 0} products</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {!products?.length ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📦</p>
          <p className="font-medium">No products yet</p>
          <button onClick={openCreate} className="btn-primary mt-4">Add your first product</button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Images', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => {
                const thumb = firstImage(p)
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
                          <p className="text-xs text-gray-400 truncate max-w-[180px]">{p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.category}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">₹{p.price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`${p.stock <= 5 ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{imgCount} img{imgCount !== 1 ? 's' : ''}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { if (confirm('Delete this product?')) deleteMut.mutate(p.uuid) }}
                          className="p-1.5 rounded hover:bg-red-50 text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.type === 'edit' ? 'Edit Product' : 'Add New Product'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Product name" />
            {formErrors.name && <p className="error-msg">{formErrors.name}</p>}
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input h-24 resize-none" placeholder="Describe your product…" />
            {formErrors.description && <p className="error-msg">{formErrors.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Price (₹)</label>
              <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} type="number" step="0.01" className="input" placeholder="0.00" />
              {formErrors.price && <p className="error-msg">{formErrors.price}</p>}
            </div>
            <div>
              <label className="label">Stock</label>
              <input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} type="number" className="input" placeholder="0" />
              {formErrors.stock && <p className="error-msg">{formErrors.stock}</p>}
            </div>
          </div>
          <div>
            <label className="label">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
              <option value="">Select category</option>
              {CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
            {formErrors.category && <p className="error-msg">{formErrors.category}</p>}
          </div>

          {/* Multi-image editor */}
          <ImageEditor value={form.images} onChange={(imgs) => setForm({ ...form, images: imgs })} />
          {formErrors.images && <p className="error-msg">{formErrors.images}</p>}

          <button type="submit" disabled={saveMut.isPending} className="btn-primary py-2.5 mt-1">
            {saveMut.isPending ? 'Saving…' : modal?.type === 'edit' ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
