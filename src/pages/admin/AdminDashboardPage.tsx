import { useQuery } from '@tanstack/react-query'
import { DollarSign, TrendingUp, Truck, Users, ShoppingBag, PieChart } from 'lucide-react'
import * as paymentsApi from '@/api/payments'
import { Spinner } from '@/components/Spinner'
import { ErrorMessage } from '@/components/ErrorMessage'

function StatCard({ icon: Icon, label, value, color, sub }: { icon: React.ElementType; label: string; value: string; color: string; sub?: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export function AdminDashboardPage() {
  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: paymentsApi.getAdminDashboard,
  })

  if (isLoading) return <Spinner message="Loading dashboard…" />
  if (error || !dashboard) return <ErrorMessage message="Failed to load dashboard" />

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const breakdown = [
    { label: 'Platform Earnings', value: dashboard.totalPlatformEarnings, color: 'bg-blue-500' },
    { label: 'Delivery Fees', value: dashboard.totalDeliveryFees, color: 'bg-amber-500' },
    { label: 'Seller Payouts', value: dashboard.totalSellerPayouts, color: 'bg-green-500' },
  ]

  const gross = dashboard.totalGrossRevenue || 1 // avoid divide-by-zero

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard icon={DollarSign} label="Gross Revenue" value={fmt(dashboard.totalGrossRevenue)} color="bg-emerald-500" />
        <StatCard icon={TrendingUp} label="Platform Earnings" value={fmt(dashboard.totalPlatformEarnings)} color="bg-blue-500" sub={`${((dashboard.totalPlatformEarnings / gross) * 100).toFixed(1)}% of gross`} />
        <StatCard icon={Truck} label="Delivery Fees" value={fmt(dashboard.totalDeliveryFees)} color="bg-amber-500" />
        <StatCard icon={PieChart} label="Seller Payouts" value={fmt(dashboard.totalSellerPayouts)} color="bg-green-500" sub={`${((dashboard.totalSellerPayouts / gross) * 100).toFixed(1)}% of gross`} />
        <StatCard icon={ShoppingBag} label="Completed Orders" value={String(dashboard.totalCompletedOrders)} color="bg-indigo-500" />
        <StatCard icon={Users} label="Active Sellers" value={String(dashboard.activeSellers)} color="bg-violet-500" />
      </div>

      {/* Revenue Breakdown Bar */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Revenue Breakdown</h2>
        <div className="flex h-6 rounded-full overflow-hidden bg-gray-100 mb-4">
          {breakdown.map((b) => {
            const pct = (b.value / gross) * 100
            return pct > 0 ? (
              <div key={b.label} className={`${b.color} transition-all`} style={{ width: `${pct}%` }} title={`${b.label}: ${pct.toFixed(1)}%`} />
            ) : null
          })}
        </div>
        <div className="flex flex-wrap gap-6">
          {breakdown.map((b) => (
            <div key={b.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${b.color}`} />
              <span className="text-sm text-gray-600">{b.label}</span>
              <span className="text-sm font-semibold text-gray-900">{fmt(b.value)}</span>
              <span className="text-xs text-gray-400">({((b.value / gross) * 100).toFixed(1)}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
