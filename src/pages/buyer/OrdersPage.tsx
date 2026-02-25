import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import * as ordersApi from '@/api/orders'
import { StatusBadge } from '@/components/StatusBadge'
import { Spinner } from '@/components/Spinner'
import { ErrorMessage } from '@/components/ErrorMessage'

export function OrdersPage() {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['my-orders'],
    queryFn: ordersApi.getMyOrders,
  })

  if (isLoading) return <Spinner message="Loading orders…" />
  if (error) return <ErrorMessage message="Failed to load orders" />

  if (!orders || orders.length === 0) return (
    <div className="text-center py-20">
      <Package className="w-14 h-14 text-gray-200 mx-auto mb-3" />
      <h2 className="text-lg font-semibold text-gray-600">No orders yet</h2>
      <p className="text-gray-400 text-sm mt-1">Your orders will appear here</p>
      <Link to="/products" className="btn-primary mt-4 inline-flex">Start Shopping</Link>
    </div>
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <Link key={order.uuid} to={`/orders/${order.uuid}`} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-gray-400 mb-1">#{order.uuid.slice(0, 8).toUpperCase()}</p>
                <p className="font-semibold text-gray-900">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                <p className="text-sm text-gray-500 mt-0.5">₹{order.totalAmount.toFixed(2)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={order.status} />
                <StatusBadge status={order.paymentStatus} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
