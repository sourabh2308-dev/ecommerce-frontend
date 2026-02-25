import { useQuery } from '@tanstack/react-query'
import { DollarSign, TrendingUp, Clock, ShoppingBag, ArrowUpRight } from 'lucide-react'
import * as paymentsApi from '@/api/payments'
import { Spinner } from '@/components/Spinner'
import { ErrorMessage } from '@/components/ErrorMessage'
import { StatusBadge } from '@/components/StatusBadge'

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

export function SellerDashboardPage() {
  const { data: dashboard, isLoading: loadingDash, error: dashErr } = useQuery({
    queryKey: ['seller-dashboard'],
    queryFn: paymentsApi.getSellerDashboard,
  })

  const { data: payments, isLoading: loadingPay } = useQuery({
    queryKey: ['seller-payments'],
    queryFn: () => paymentsApi.getSellerPayments({ size: 10 }),
  })

  if (loadingDash) return <Spinner message="Loading dashboard…" />
  if (dashErr || !dashboard) return <ErrorMessage message="Failed to load dashboard" />

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Seller Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={DollarSign} label="Total Earnings" value={fmt(dashboard.totalEarnings)} color="bg-green-500" />
        <StatCard icon={Clock} label="Pending Payouts" value={fmt(dashboard.pendingPayouts)} color="bg-yellow-500" />
        <StatCard icon={TrendingUp} label="Completed Payouts" value={fmt(dashboard.completedPayouts)} color="bg-blue-500" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={String(dashboard.totalOrders)} color="bg-indigo-500" />
      </div>

      {/* Recent payments */}
      <div className="card">
        <div className="px-5 pt-5 pb-3 border-b">
          <h2 className="font-semibold text-gray-900">Recent Payments</h2>
        </div>
        {loadingPay ? (
          <div className="p-6"><Spinner message="Loading…" /></div>
        ) : !payments || payments.content.length === 0 ? (
          <p className="text-sm text-gray-500 p-6">No payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-500 text-xs uppercase bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left">Order</th>
                  <th className="px-5 py-3 text-left">Amount</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Your Payout</th>
                  <th className="px-5 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.content.map((p) => {
                  const mySplits = p.splits ?? []
                  const myPayout = mySplits.reduce((s, sp) => s + sp.sellerPayout, 0)
                  return (
                    <tr key={p.uuid} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-mono text-xs">{p.orderUuid.slice(0, 8)}…</td>
                      <td className="px-5 py-3 font-medium">{fmt(p.amount)}</td>
                      <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-5 py-3 font-semibold text-green-600 flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5" />{fmt(myPayout)}
                      </td>
                      <td className="px-5 py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
