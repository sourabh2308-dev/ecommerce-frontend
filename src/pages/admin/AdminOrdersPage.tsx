import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as ordersApi from '@/api/orders'
import { StatusBadge } from '@/components/StatusBadge'
import { Spinner } from '@/components/Spinner'
import { ErrorMessage } from '@/components/ErrorMessage'
import toast from 'react-hot-toast'
import type { OrderStatus } from '@/types'

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  CONFIRMED: 'SHIPPED',
  SHIPPED: 'DELIVERED',
}

export function AdminOrdersPage() {
  const qc = useQueryClient()

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: ordersApi.getAllOrders,
  })

  const updateMut = useMutation({
    mutationFn: ({ uuid, status }: { uuid: string; status: string }) => ordersApi.updateOrderStatus(uuid, status),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries({ queryKey: ['admin-orders'] }) },
    onError: () => toast.error('Failed to update'),
  })

  if (isLoading) return <Spinner message="Loading orders…" />
  if (error) return <ErrorMessage message="Failed to load orders" />

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        All Orders <span className="text-lg font-normal text-gray-400">({orders?.length ?? 0})</span>
      </h1>

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
                {['Order ID', 'Buyer', 'Items', 'Total', 'Status', 'Payment', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => {
                const next = NEXT_STATUS[order.status as OrderStatus]
                return (
                  <tr key={order.uuid} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">#{order.uuid.slice(0, 8).toUpperCase()}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{order.buyerUuid.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-gray-600">{order.items.length}</td>
                    <td className="px-4 py-3 font-semibold">₹{order.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3"><StatusBadge status={order.paymentStatus} /></td>
                    <td className="px-4 py-3">
                      {next && order.paymentStatus === 'SUCCESS' && (
                        <button
                          onClick={() => updateMut.mutate({ uuid: order.uuid, status: next })}
                          disabled={updateMut.isPending}
                          className="btn-outline text-xs py-1 px-2"
                        >
                          → {next}
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
    </div>
  )
}
