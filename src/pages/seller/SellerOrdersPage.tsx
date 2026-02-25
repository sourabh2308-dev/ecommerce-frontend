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

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  CREATED: 'CONFIRMED',
  CONFIRMED: 'SHIPPED',
  SHIPPED: 'DELIVERED',
}

const ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  CREATED: 'Confirm Order',
  CONFIRMED: 'Mark Shipped',
  SHIPPED: 'Mark Delivered',
}

export function SellerOrdersPage() {
  useAuthStore()
  const qc = useQueryClient()
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: ordersApi.getSellerOrders,
  })

  const updateMut = useMutation({
    mutationFn: ({ uuid, status }: { uuid: string; status: string }) => ordersApi.updateOrderStatus(uuid, status),
    onSuccess: () => { toast.success('Order updated'); qc.invalidateQueries({ queryKey: ['seller-orders'] }) },
    onError: () => toast.error('Failed to update order'),
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
                const next = NEXT_STATUS[order.status as OrderStatus]
                const label = ACTION_LABELS[order.status as OrderStatus]
                return (
                  <tr key={order.uuid} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedOrder(order.uuid)} className="font-mono text-xs text-blue-600 hover:underline">
                        #{order.uuid.slice(0, 8).toUpperCase()}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                    <td className="px-4 py-3 font-semibold">₹{order.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3"><StatusBadge status={order.paymentStatus} /></td>
                    <td className="px-4 py-3">
                      {next && order.paymentStatus === 'SUCCESS' && (
                        <button
                          onClick={() => updateMut.mutate({ uuid: order.uuid, status: next })}
                          disabled={updateMut.isPending}
                          className="btn-primary text-xs py-1.5 px-3"
                        >
                          {label}
                        </button>
                      )}
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
              <span className="font-mono text-sm text-gray-500">#{detail.uuid.slice(0, 12)}</span>
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
                  <div key={item.productUuid} className="py-2 flex justify-between text-sm">
                    <span className="text-gray-600 font-mono text-xs">#{item.productUuid.slice(0, 8)} ×{item.quantity}</span>
                    <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span>₹{detail.totalAmount.toFixed(2)}</span>
            </div>

            {NEXT_STATUS[detail.status as OrderStatus] && detail.paymentStatus === 'SUCCESS' && (
              <button
                onClick={() => { updateMut.mutate({ uuid: detail.uuid, status: NEXT_STATUS[detail.status as OrderStatus]! }); setSelectedOrder(null) }}
                className="btn-primary w-full py-2"
              >
                {ACTION_LABELS[detail.status as OrderStatus]}
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
