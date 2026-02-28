import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { forgotPassword } from '@/api/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (data) => {
      setMessage(data.message || 'Password reset OTP sent to your email')
      // after showing success, navigate to reset page so user can enter OTP
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`)
      }, 1200)
    },
    onError: (error: any) => {
      setMessage(error.response?.data?.message || 'Failed to send reset OTP')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setMessage('Please enter your email')
      return
    }
    mutation.mutate(email)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>
        <p className="text-gray-600 text-center mb-6">
          Enter your email address and we'll send you an OTP to reset your password.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>

          {message && (
            <div className={`p-3 rounded-md ${mutation.isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {mutation.isPending ? 'Sending...' : 'Send Reset OTP'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:underline text-sm"
          >
            Back to Login
          </button>
          {mutation.isSuccess && (
            <div className="mt-4 text-center text-sm text-gray-600">
              Redirecting to reset page…
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
