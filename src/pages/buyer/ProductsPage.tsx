import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Sparkles } from 'lucide-react'
import * as productsApi from '@/api/products'
import { ProductCard } from '@/components/ProductCard'
import { Spinner } from '@/components/Spinner'
import { ErrorMessage } from '@/components/ErrorMessage'
import { useAuthStore } from '@/store/authStore'

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Toys', 'Food']

const CATEGORY_ICONS: Record<string, string> = {
  All: '🛍️', Electronics: '💻', Clothing: '👕', Books: '📚',
  Home: '🏠', Sports: '⚽', Beauty: '💄', Toys: '🧸', Food: '🍎',
}

export function ProductsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const { isAuthenticated } = useAuthStore()

  const { data: allProducts, isLoading, error } = useQuery({
    queryKey: ['products', search],
    queryFn: () => productsApi.getProducts({
      keyword: search || undefined,
      size: 100,
    }),
    staleTime: 30_000,
  })

  // Filter by category client-side
  const products = !allProducts ? [] : category === 'All'
    ? allProducts
    : allProducts.filter((p) => p.category === category)

  if (isLoading) return <Spinner message="Loading products…" />
  if (error) return <ErrorMessage message="Failed to load products" />

  return (
    <div>
      {/* Hero banner — shown to guests */}
      {!isAuthenticated && (
        <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-white">
          <div className="relative z-10 max-w-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-medium text-blue-100 uppercase tracking-wider">New arrivals every day</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3">
              Shop the Latest<br />Products & Deals
            </h1>
            <p className="text-blue-100 text-sm sm:text-base mb-5">
              Browse thousands of products. Sign in to start shopping.
            </p>
            <a href="/register" className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm shadow-md">
              Get started free →
            </a>
          </div>
          {/* Decorative circles */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute right-16 bottom-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/3" />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">
            {category === 'All' ? 'All Products' : `${CATEGORY_ICONS[category]} ${category}`}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">{products?.length ?? 0} products available</p>
        </div>

        {/* Search */}
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
            placeholder="Search products…"
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
              category === c
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {CATEGORY_ICONS[c]} {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p) => <ProductCard key={p.uuid} product={p} />)}
        </div>
      ) : (
        <div className="card p-16 text-center text-gray-400">
          <p className="text-5xl mb-4">😕</p>
          <p className="font-semibold text-gray-600">No products found</p>
          <p className="text-sm mt-1">Try a different category or search term</p>
          {category !== 'All' && (
            <button onClick={() => setCategory('All')} className="btn-outline mt-4 text-xs">
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}

