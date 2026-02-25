import { useState, useRef } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import * as authApi from '@/api/auth'
import toast from 'react-hot-toast'

export function VerifyOtpPage() {
  const [params] = useSearchParams()
  const email = params.get('email') ?? ''
  const role = params.get('role') ?? ''
  const navigate = useNavigate()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 5) inputs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) return toast.error('Enter all 6 digits')
    setLoading(true)
    try {
      await authApi.verifyOtp(email, code)
      if (role === 'SELLER') {
        toast.success('Email verified! Please log in to complete your seller profile.')
        navigate('/login?seller_onboard=1')
      } else {
        toast.success('Email verified! Please log in.')
        navigate('/login')
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await authApi.resendOtp(email)
      toast.success('OTP resent!')
    } catch {
      toast.error('Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="card p-8 w-full max-w-md text-center">
        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-7 h-7 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
        <p className="text-gray-500 text-sm mt-2">
          We sent a 6-digit code to{' '}
          <span className="font-medium text-gray-800">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputs.current[i] = el }}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                maxLength={1}
                className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              />
            ))}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Verifying…' : 'Verify email'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <span>Didn't get a code?</span>
          <button onClick={handleResend} disabled={resending} className="text-blue-600 font-medium hover:underline disabled:opacity-50">
            {resending ? 'Sending…' : 'Resend'}
          </button>
        </div>
        <Link to="/login" className="inline-block mt-4 text-sm text-gray-400 hover:text-gray-600">
          ← Back to login
        </Link>
      </div>
    </div>
  )
}
