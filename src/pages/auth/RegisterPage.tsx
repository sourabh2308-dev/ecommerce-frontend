import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Package } from 'lucide-react'
import { useState } from 'react'
import axios from 'axios'
import * as authApi from '@/api/auth'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'One uppercase letter')
    .regex(/[0-9]/, 'One number')
    .regex(/[^a-zA-Z0-9]/, 'One special character'),
  role: z.enum(['BUYER', 'SELLER']),
})
type Form = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'BUYER' },
  })
  const role = watch('role')

  const onSubmit = async (data: Form) => {
    setLoading(true)
    try {
      const normalized = { ...data, email: data.email.trim().toLowerCase() }
      await authApi.register(normalized)
      toast.success('Account created! Please verify your email.')
      navigate(`/verify-otp?email=${encodeURIComponent(normalized.email)}&role=${data.role}`)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data as {
          message?: string
          details?: string[]
          errorCode?: string
        } | undefined

        const status = err.response?.status

        if (status === 409) {
          toast.error(responseData?.message ?? 'Email already registered')
        } else if (status === 400) {
          toast.error(responseData?.details?.[0] ?? responseData?.message ?? 'Please check your input and try again')
        } else if (err.code === 'ERR_NETWORK') {
          toast.error('Cannot reach server. Please check backend containers.')
        } else {
          toast.error(responseData?.message ?? 'Registration failed')
        }
      } else {
        toast.error('Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="card p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-3">
            <Package className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 text-sm mt-1">Join SourHub today</p>
        </div>

        {/* Role toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-5">
          {(['BUYER', 'SELLER'] as const).map((r) => (
            <label key={r} className={`flex-1 text-center py-2 text-sm font-medium rounded-md cursor-pointer transition-all ${
              role === r ? 'bg-white shadow text-blue-600' : 'text-gray-500'
            }`}>
              <input type="radio" value={r} {...register('role')} className="sr-only" />
              {r === 'BUYER' ? '🛍 Buyer' : '🏪 Seller'}
            </label>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="label">Full Name</label>
            <input {...register('name')} className="input" placeholder="John Doe" />
            {errors.name && <p className="error-msg">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Email</label>
            <input {...register('email')} type="email" className="input" placeholder="you@example.com" />
            {errors.email && <p className="error-msg">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Password</label>
            <input {...register('password')} type="password" className="input" placeholder="••••••••" />
            {errors.password && <p className="error-msg">{errors.password.message}</p>}
            <p className="text-xs text-gray-400 mt-1">Min 8 chars, 1 uppercase, 1 number, 1 special char</p>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
