import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import * as ordersApi from '@/api/orders'
import { StatusBadge } from '@/components/StatusBadge'
import { Spinner } from '@/components/Spinner'
import { ErrorMessage } from '@/components/ErrorMessage'
import toast from 'react-hot-toast'
import type { OrderStatus } from '@/types'
import { useState } from 'react'
import { Modal } from '@/components/Modal'
import { MapPin } from 'lucide-react'
import { toOrderId, toProductId } from '@/utils/displayIds'
import { AxiosError } from 'axios'

type SellerAction = { status: OrderStatus; label: string; kind?: 'outline' | 'danger' }

const getSellerActions = (status: OrderStatus, returnType?: 'REFUND' | 'EXCHANGE'): SellerAction[] => {
  switch (status) {
    case 'CREATED':
      return [{ status: 'CONFIRMED', label: 'Confirm Order' }]
    case 'CONFIRMED':
      return [{ status: 'SHIPPED', label: 'Mark Shipped' }]
    case 'SHIPPED':
      return [{ status: 'DELIVERED', label: 'Mark Delivered' }]
    case 'RETURN_REQUESTED':
      return [
        { status: 'PICKUP_SCHEDULED', label: 'Schedule Pickup' },
        { status: 'RETURN_REJECTED', label: 'Reject Return', kind: 'danger' },
      ]
    case 'PICKUP_SCHEDULED':
      return [{ status: 'PICKED_UP', label: 'Mark Picked Up' }]
    case 'PICKED_UP':
      return [{ status: 'RETURN_RECEIVED', label: 'Mark Received Back' }]
    case 'RETURN_RECEIVED':
      return [
        {
          status: returnType === 'EXCHANGE' ? 'EXCHANGE_ISSUED' : 'REFUND_ISSUED',
          label: returnType === 'EXCHANGE' ? 'Issue Exchange' : 'Issue Refund',
        },
      ]
    default:
      return []
  }
}

export function SellerOrdersPage() {
  useAuthStore()
  const qc = useQueryClient()
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [updatingOrderUuid, setUpdatingOrderUuid] = useState<string | null>(null)

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: ordersApi.getSellerOrders,
    retry: (failureCount, err) => {
      const status = (err as AxiosError)?.response?.status
      if (status === 503 && failureCount < 5) return true
      return failureCount < 2
    },
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  })

  const updateMut = useMutation({
    mutationFn: async ({ uuid, status }: { uuid: string; status: string }) => {
      setUpdatingOrderUuid(uuid)
      return ordersApi.updateOrderStatus(uuid, status)
    },
    onSuccess: () => { toast.success('Order updated'); qc.invalidateQueries({ queryKey: ['seller-orders'] }) },
    onError: (err: unknown) => {
      const message =
        (err as AxiosError<{ message?: string }>)?.response?.data?.message ||
        (err as Error)?.message ||
        'Failed to update order'
      toast.error(message)
    },
    onSettled: () => setUpdatingOrderUuid(null),
  })

  const detail = orders?.find(o => o.uuid === selectedOrder)

  if (isLoading) return <Spinner message="Loading orders…" />
  if (error) return <ErrorMessage message="Failed to load orders" />

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>
      {!orders?.length ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">No orders yet</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Order ID', 'Items', 'Total', 'Status', 'Payment', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => {
                const actions = getSellerActions(order.status as OrderStatus, order.returnType)
                return (
                  <tr key={order.uuid} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedOrder(order.uuid)} className="text-xs text-blue-600 hover:underline">
                        {toOrderId(order.uuid)}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <div>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {order.items.slice(0, 2).map((item) => item.productName || toProductId(item.productUuid)).join(', ')}
                        {order.items.length > 2 ? ` +${order.items.length - 2} more` : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">₹{order.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3"><StatusBadge status={order.paymentStatus} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {actions.map((action) => (
                          <button
                            key={action.status}
                            onClick={() => updateMut.mutate({ uuid: order.uuid, status: action.status })}
                            disabled={updateMut.isPending && updatingOrderUuid === order.uuid}
                            className={action.kind === 'danger' ? 'btn-danger text-xs py-1.5 px-3' : 'btn-primary text-xs py-1.5 px-3'}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Order detail modal with shipping address */}
      <Modal open={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Order Details">
        {detail && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Order ID: {toOrderId(detail.uuid)}</span>
              <div className="flex gap-2">
                <StatusBadge status={detail.status} />
                <StatusBadge status={detail.paymentStatus} />
              </div>
            </div>

            {detail.shippingName && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-sm text-gray-900">Shipping Address</span>
                </div>
                <p className="text-sm text-gray-700">{detail.shippingName}</p>
                <p className="text-sm text-gray-600">{detail.shippingAddress}</p>
                <p className="text-sm text-gray-600">{detail.shippingCity}, {detail.shippingState} - {detail.shippingPincode}</p>
                <p className="text-sm text-gray-600">Phone: {detail.shippingPhone}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-sm text-gray-900 mb-2">Items</h3>
              <div className="divide-y">
                {detail.items.map((item) => (
                  <div key={item.productUuid} className="py-2 flex justify-between gap-4 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center text-xs text-gray-400">
                        {item.productImageUrl ? (
                          <img src={item.productImageUrl.split(';')[0].trim()} alt={item.productName || 'Product'} className="w-full h-full object-cover" />
                        ) : (
                          'IMG'
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{item.productName || 'Product'}</p>
                        <p className="text-gray-600 text-xs">Product ID: {toProductId(item.productUuid)}</p>
                        <p className="text-gray-500 text-xs">Category: {item.productCategory || 'N/A'} • Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {(detail.returnType || detail.returnReason) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-sm text-gray-900 mb-2">Return / Exchange Details</h3>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Type:</span> {detail.returnType ?? '-'}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-medium">Reason:</span> {detail.returnReason ?? '-'}
                </p>
              </div>
            )}

            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span>₹{detail.totalAmount.toFixed(2)}</span>
            </div>

            {getSellerActions(detail.status as OrderStatus, detail.returnType).length > 0 && (
              <div className="flex flex-col gap-2">
                {getSellerActions(detail.status as OrderStatus, detail.returnType).map((action) => (
                  <button
                    key={action.status}
                    onClick={() => {
                      updateMut.mutate({ uuid: detail.uuid, status: action.status })
                      setSelectedOrder(null)
                    }}
                    disabled={updateMut.isPending && updatingOrderUuid === detail.uuid}
                    className={action.kind === 'danger' ? 'btn-danger w-full py-2' : 'btn-primary w-full py-2'}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
