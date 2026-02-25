import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, LogOut, User, Package, ShieldCheck, Menu, X, Store } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import * as authApi from '@/api/auth'
import toast from 'react-hot-toast'

export function Navbar() {
  const { role, email, isAuthenticated, logout } = useAuthStore()
  const cartCount = useCartStore((s) => s.count())
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  const navLinks = () => {
    if (!isAuthenticated) return (
      <>
        <Link to="/products" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">Products</Link>
        <Link to="/login" className="btn-outline text-xs py-1.5">Login</Link>
        <Link to="/register" className="btn-primary text-xs py-1.5">Register</Link>
      </>
    )
    if (role === 'BUYER') return (
      <>
        <Link to="/products" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">Products</Link>
        <Link to="/orders" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">My Orders</Link>
      </>
    )
    if (role === 'SELLER') return (
      <>
        <Link to="/seller/products" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">My Products</Link>
        <Link to="/seller/orders" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">Orders</Link>
        <Link to="/seller/dashboard" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">Dashboard</Link>
      </>
    )
    if (role === 'ADMIN') return (
      <>
        <Link to="/admin/users" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">Users</Link>
        <Link to="/admin/products" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">Products</Link>
        <Link to="/admin/orders" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">Orders</Link>
        <Link to="/admin/dashboard" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">Dashboard</Link>
      </>
    )
  }

  const roleBadgeColor = role === 'ADMIN'
    ? 'bg-purple-50 border-purple-200 text-purple-700'
    : role === 'SELLER'
      ? 'bg-amber-50 border-amber-200 text-amber-700'
      : 'bg-blue-50 border-blue-200 text-blue-700'

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
              {role === 'SELLER' ? (
                <Store className="w-4.5 h-4.5 text-white" />
              ) : (
                <Package className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-gray-900 text-base tracking-tight">ShopHub</span>
              {role && <span className="text-[10px] text-gray-400 leading-none capitalize">{role.toLowerCase()} portal</span>}
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks()}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isAuthenticated && role === 'BUYER' && (
              <Link to="/cart" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            )}
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${roleBadgeColor}`}>
                  {role === 'ADMIN' ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  <Link to="/profile" className="max-w-[130px] truncate hover:underline">{email}</Link>
                </div>
                <button onClick={handleLogout} className="btn-outline text-xs py-1.5 gap-1.5">
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            )}
            <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden py-3 border-t border-gray-100 flex flex-col gap-3">
            {navLinks()}
            {isAuthenticated && (
              <button onClick={handleLogout} className="btn-outline text-sm w-full mt-1">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
