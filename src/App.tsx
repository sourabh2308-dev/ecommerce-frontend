import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { MainLayout } from '@/layouts/MainLayout'
import { ProtectedRoute } from '@/layouts/ProtectedRoute'

// Auth
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { VerifyOtpPage } from '@/pages/auth/VerifyOtpPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'

// Buyer
import { ProductsPage } from '@/pages/buyer/ProductsPage'
import { ProductDetailPage } from '@/pages/buyer/ProductDetailPage'
import { CartPage } from '@/pages/buyer/CartPage'
import { CheckoutPage } from '@/pages/buyer/CheckoutPage'
import { OrdersPage } from '@/pages/buyer/OrdersPage'
import { OrderDetailPage } from '@/pages/buyer/OrderDetailPage'

// Seller
import { SellerProductsPage } from '@/pages/seller/SellerProductsPage'
import { SellerOrdersPage } from '@/pages/seller/SellerOrdersPage'
import { SellerDashboardPage } from '@/pages/seller/SellerDashboardPage'

// Admin
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage'
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'

// Shared
import { ProfilePage } from '@/pages/ProfilePage'

function RootRedirect() {
  const role = useAuthStore((s) => s.role)
  if (role === 'ADMIN') return <Navigate to="/admin/users" replace />
  if (role === 'SELLER') return <Navigate to="/seller/products" replace />
  return <Navigate to="/products" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public – no layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* App layout */}
        <Route element={<MainLayout />}>
          <Route index element={<RootRedirect />} />

          {/* Public product browsing */}
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:uuid" element={<ProductDetailPage />} />

          {/* Profile — any authenticated user */}
          <Route element={<ProtectedRoute roles={['BUYER', 'SELLER', 'ADMIN']} />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Buyer */}
          <Route element={<ProtectedRoute roles={['BUYER']} />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:uuid" element={<OrderDetailPage />} />
          </Route>

          {/* Seller */}
          <Route element={<ProtectedRoute roles={['SELLER']} />}>
            <Route path="/seller/products" element={<SellerProductsPage />} />
            <Route path="/seller/orders" element={<SellerOrdersPage />} />
            <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute roles={['ADMIN']} />}>
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
