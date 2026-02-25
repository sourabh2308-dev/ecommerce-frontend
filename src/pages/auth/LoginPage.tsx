import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Package } from 'lucide-react'
import { useState } from 'react'
import * as authApi from '@/api/auth'
import * as usersApi from '@/api/users'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Required'),
})
type Form = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const setTokens = useAuthStore((s) => s.setTokens)
  const role = useAuthStore((s) => s.role)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: Form) => {
    setLoading(true)
    try {
      const res = await authApi.login(data)
      setTokens(res.accessToken, res.refreshToken)
      toast.success('Welcome back!')
      // Redirect based on role stored after setTokens
      const r = useAuthStore.getState().role
      if (r === 'SELLER') {
        // Check if seller needs to complete profile details
        try {
          const profile = await usersApi.getProfile()
          if (profile.status === 'PENDING_DETAILS') {
            toast('Please complete your seller profile to get started', { icon: '📋' })
            navigate('/profile')
            return
          }
        } catch { /* proceed with normal redirect */ }
        navigate('/seller/products')
      } else if (r === 'ADMIN') {
        navigate('/admin/users')
      } else {
        navigate('/products')
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  // Already logged in
  if (useAuthStore.getState().isAuthenticated) {
    if (role === 'ADMIN') navigate('/admin/users')
    else if (role === 'SELLER') navigate('/seller/products')
    else navigate('/products')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="card p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-3">
            <Package className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your ShopHub account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="label">Email</label>
            <input {...register('email')} type="email" className="input" placeholder="you@example.com" />
            {errors.email && <p className="error-msg">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Password</label>
            <input {...register('password')} type="password" className="input" placeholder="••••••••" />
            {errors.password && <p className="error-msg">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          No account?{' '}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">Register</Link>
        </p>
      </div>
    </div>
  )
}
