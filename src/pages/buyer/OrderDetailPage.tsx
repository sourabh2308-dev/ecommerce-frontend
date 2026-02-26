import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Star, PackageCheck, Truck, CheckCircle2, Clock, MapPin, FileDown } from 'lucide-react'
import * as ordersApi from '@/api/orders'
import * as reviewsApi from '@/api/reviews'
import { StatusBadge } from '@/components/StatusBadge'
import { Spinner } from '@/components/Spinner'
import { ErrorMessage } from '@/components/ErrorMessage'
import { Modal } from '@/components/Modal'
import { StarRating } from '@/components/StarRating'
import toast from 'react-hot-toast'
import type { OrderStatus, ReturnType } from '@/types'
import { toOrderId, toProductId } from '@/utils/displayIds'

const TRACKING_STEPS: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'CREATED', label: 'Order Placed', icon: <Clock className="w-5 h-5" /> },
  { status: 'CONFIRMED', label: 'Confirmed', icon: <PackageCheck className="w-5 h-5" /> },
  { status: 'SHIPPED', label: 'Shipped', icon: <Truck className="w-5 h-5" /> },
  { status: 'DELIVERED', label: 'Delivered', icon: <CheckCircle2 className="w-5 h-5" /> },
]
const STATUS_ORDER: OrderStatus[] = ['CREATED', 'CONFIRMED', 'SHIPPED', 'DELIVERED']

const RETURN_STEPS: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'RETURN_REQUESTED', label: 'Return Requested', icon: <Clock className="w-5 h-5" /> },
  { status: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled', icon: <PackageCheck className="w-5 h-5" /> },
  { status: 'PICKED_UP', label: 'Picked Up', icon: <Truck className="w-5 h-5" /> },
  { status: 'RETURN_RECEIVED', label: 'Received Back', icon: <PackageCheck className="w-5 h-5" /> },
]
const RETURN_FLOW_STATUSES: OrderStatus[] = [
  'RETURN_REQUESTED',
  'PICKUP_SCHEDULED',
  'PICKED_UP',
  'RETURN_RECEIVED',
  'EXCHANGE_ISSUED',
  'REFUND_ISSUED',
  'RETURN_REJECTED',
]

export function OrderDetailPage() {
  const { uuid } = useParams<{ uuid: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [reviewModal, setReviewModal] = useState<{ productUuid: string } | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [returnType, setReturnType] = useState<ReturnType>('REFUND')
  const [returnReason, setReturnReason] = useState('')
  const [showReturnModal, setShowReturnModal] = useState(false)

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', uuid],
    queryFn: () => ordersApi.getOrder(uuid!),
    enabled: !!uuid,
    refetchInterval: (query) => {
      const d = query.state.data
      return d && d.paymentStatus === 'PENDING' ? 2000 : false
    },
  })

  const cancelMut = useMutation({
    mutationFn: () => ordersApi.cancelOrder(uuid!),
    onSuccess: () => { toast.success('Order cancelled'); qc.invalidateQueries({ queryKey: ['order', uuid] }) },
    onError: () => toast.error('Cannot cancel order'),
  })

  const reviewMut = useMutation({
    mutationFn: () => reviewsApi.createReview({ orderUuid: uuid!, productUuid: reviewModal!.productUuid, rating, comment }),
    onSuccess: () => {
      toast.success('Review submitted!')
      setReviewModal(null)
      setRating(5)
      setComment('')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to submit review')
    },
  })

  const requestReturnMut = useMutation({
    mutationFn: () => ordersApi.requestReturn(uuid!, returnType, returnReason),
    onSuccess: () => {
      toast.success(`${returnType === 'REFUND' ? 'Refund' : 'Exchange'} requested`)
      setShowReturnModal(false)
      setReturnReason('')
      qc.invalidateQueries({ queryKey: ['order', uuid] })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to request return')
    },
  })

  const handleDownloadInvoice = async () => {
    if (!order) return
    try {
      toast.loading('Downloading invoice...')
      const blob = await ordersApi.downloadInvoice(uuid!)
      const url = window.URL.createObjectURL(blob as Blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${toOrderId(order.uuid)}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.dismiss()
      toast.success('Invoice downloaded')
    } catch {
      toast.dismiss()
      toast.error('Failed to download invoice')
    }
  }

  if (isLoading) return <Spinner message="Loading order…" />
  if (error || !order) return <ErrorMessage message="Order not found" />

  const currentIdx = STATUS_ORDER.indexOf(order.status as OrderStatus)
  const isCancelled = order.status === 'CANCELLED'
  const isReturnFlow = RETURN_FLOW_STATUSES.includes(order.status as OrderStatus)
  const returnCurrentIdx = RETURN_STEPS.findIndex((s) => s.status === order.status)
  const canRequestReturn =
    order.status === 'DELIVERED' && order.paymentStatus === 'SUCCESS' && !isReturnFlow

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          <p className="text-sm text-gray-500 mt-1">Order ID: {toOrderId(order.uuid)}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={order.status} />
          <StatusBadge status={order.paymentStatus} />
        </div>
      </div>

      {/* ── Tracking Timeline ─────────────────────────────────── */}
      {!isCancelled && !isReturnFlow && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-5">Order Tracking</h2>
          <div className="flex items-center justify-between">
            {TRACKING_STEPS.map((step, idx) => {
              const isCompleted = currentIdx >= idx
              const isActive = currentIdx === idx
              return (
                <div key={step.status} className="flex-1 flex flex-col items-center relative">
                  {/* connector line */}
                  {idx > 0 && (
                    <div className={`absolute top-5 right-1/2 w-full h-0.5 -z-10 ${currentIdx >= idx ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 ${
                    isCompleted
                      ? 'bg-green-500 text-white shadow-md shadow-green-200'
                      : 'bg-gray-100 text-gray-400'
                  } ${isActive ? 'ring-4 ring-green-100' : ''}`}>
                    {step.icon}
                  </div>
                  <p className={`text-xs mt-2 font-medium ${isCompleted ? 'text-green-700' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {isReturnFlow && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-5">Return / Exchange Tracking</h2>
          <div className="flex items-center justify-between">
            {RETURN_STEPS.map((step, idx) => {
              const isCompleted = returnCurrentIdx >= idx || order.status === 'EXCHANGE_ISSUED' || order.status === 'REFUND_ISSUED'
              const isActive = returnCurrentIdx === idx
              return (
                <div key={step.status} className="flex-1 flex flex-col items-center relative">
                  {idx > 0 && (
                    <div className={`absolute top-5 right-1/2 w-full h-0.5 -z-10 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 ${
                    isCompleted ? 'bg-green-500 text-white shadow-md shadow-green-200' : 'bg-gray-100 text-gray-400'
                  } ${isActive ? 'ring-4 ring-green-100' : ''}`}>
                    {step.icon}
                  </div>
                  <p className={`text-xs mt-2 font-medium ${isCompleted ? 'text-green-700' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                </div>
              )
            })}
          </div>
          <div className="mt-5 text-sm text-gray-600">
            <p><span className="font-medium text-gray-900">Type:</span> {order.returnType ?? '-'}</p>
            <p><span className="font-medium text-gray-900">Reason:</span> {order.returnReason ?? '-'}</p>
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="card p-6 mb-6 bg-red-50 border-red-200">
          <p className="text-red-700 font-semibold text-center">This order has been cancelled.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Items */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Items</h2>
            <div className="flex flex-col divide-y">
              {order.items.map((item) => (
                <div key={item.productUuid} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center text-xl">📦</div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.productName || 'Product'}</p>
                      <p className="text-xs text-gray-500">Product ID: {toProductId(item.productUuid)}</p>
                      <p className="font-medium text-gray-900 text-sm">Qty: {item.quantity}</p>
                      <p className="text-blue-600 text-sm font-semibold">₹{item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                    {order.status === 'DELIVERED' && (
                      <button
                        onClick={() => setReviewModal({ productUuid: item.productUuid })}
                        className="btn-outline text-xs py-1 px-2"
                      >
                        <Star className="w-3 h-3" /> Review
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingName && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-green-600" />
                <h2 className="font-semibold text-gray-900">Shipping Address</h2>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{order.shippingName}</p>
                <p>{order.shippingAddress}</p>
                <p>{order.shippingCity}, {order.shippingState} - {order.shippingPincode}</p>
                <p>Phone: {order.shippingPhone}</p>
              </div>
            </div>
          )}

          {(order.returnType || order.returnReason) && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Return Details</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium text-gray-900">Type:</span> {order.returnType ?? '-'}</p>
                <p><span className="font-medium text-gray-900">Reason:</span> {order.returnReason ?? '-'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Summary sidebar */}
        <div className="card p-5 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4">Summary</h2>
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex justify-between">
              <span>Items</span>
              <span>{order.items.length}</span>
            </div>
            {order.createdAt && (
              <div className="flex justify-between">
                <span>Placed</span>
                <span className="text-xs">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t">
              <span>Total</span>
          {(order.status === 'DELIVERED' || order.paymentStatus === 'SUCCESS') && (
            <button
              onClick={handleDownloadInvoice}
              className="btn-outline w-full py-2 text-sm mt-2 flex items-center justify-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              Download Invoice
            </button>
          )}
              <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
          {order.status === 'CREATED' && (
            <button
              onClick={() => cancelMut.mutate()}
              disabled={cancelMut.isPending}
              className="btn-danger w-full py-2 text-sm"
            >
              {cancelMut.isPending ? 'Cancelling…' : 'Cancel Order'}
            </button>
          )}
          {canRequestReturn && (
            <button
              onClick={() => setShowReturnModal(true)}
              className="btn-outline w-full py-2 text-sm mt-2"
            >
              Request Return / Exchange
            </button>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Modal open={!!reviewModal} onClose={() => setReviewModal(null)} title="Write a Review">
        <div className="flex flex-col gap-4">
          <div>
            <label className="label">Rating</label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="label">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input h-28 resize-none"
              placeholder="Share your experience…"
            />
          </div>
          <button
            onClick={() => reviewMut.mutate()}
            disabled={reviewMut.isPending || !comment.trim()}
            className="btn-primary py-2.5"
          >
            {reviewMut.isPending ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      </Modal>

      <Modal open={showReturnModal} onClose={() => setShowReturnModal(false)} title="Request Return / Exchange">
        <div className="flex flex-col gap-4">
          <div>
            <label className="label">Request Type</label>
            <select className="input" value={returnType} onChange={(e) => setReturnType(e.target.value as ReturnType)}>
              <option value="REFUND">Refund</option>
              <option value="EXCHANGE">Exchange</option>
            </select>
          </div>
          <div>
            <label className="label">Reason</label>
            <textarea
              className="input h-28 resize-none"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Describe why you want to return/exchange this order"
            />
          </div>
          <button
            onClick={() => requestReturnMut.mutate()}
            disabled={requestReturnMut.isPending || returnReason.trim().length < 5}
            className="btn-primary py-2.5"
          >
            {requestReturnMut.isPending ? 'Submitting…' : 'Submit Request'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
