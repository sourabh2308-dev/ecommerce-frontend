import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, ShieldOff, Trash2, Eye, RotateCcw } from 'lucide-react'
import * as usersApi from '@/api/users'
import type { User, SellerDetailResponse } from '@/types'
import { StatusBadge } from '@/components/StatusBadge'
import { Spinner } from '@/components/Spinner'
import { ErrorMessage } from '@/components/ErrorMessage'
import { Modal } from '@/components/Modal'
import toast from 'react-hot-toast'

export function AdminUsersPage() {
  const qc = useQueryClient()
  const [detailModal, setDetailModal] = useState<{ user: User; detail: SellerDetailResponse | null } | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => usersApi.getAllUsers(),
  })

  const approve = useMutation({
    mutationFn: usersApi.approveSeller,
    onSuccess: () => { toast.success('Seller approved'); setDetailModal(null); qc.invalidateQueries({ queryKey: ['all-users'] }) },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to approve')
    },
  })
  const reject = useMutation({
    mutationFn: usersApi.rejectSeller,
    onSuccess: () => { toast.success('Seller rejected'); setDetailModal(null); qc.invalidateQueries({ queryKey: ['all-users'] }) },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to reject')
    },
  })
  const block = useMutation({
    mutationFn: usersApi.blockUser,
    onSuccess: () => { toast.success('User blocked'); qc.invalidateQueries({ queryKey: ['all-users'] }) },
    onError: () => toast.error('Failed'),
  })
  const unblock = useMutation({
    mutationFn: usersApi.unblockUser,
    onSuccess: () => { toast.success('User unblocked'); qc.invalidateQueries({ queryKey: ['all-users'] }) },
    onError: () => toast.error('Failed'),
  })
  const del = useMutation({
    mutationFn: usersApi.softDeleteUser,
    onSuccess: () => { toast.success('User deleted'); qc.invalidateQueries({ queryKey: ['all-users'] }) },
    onError: () => toast.error('Failed'),
  })
  const restore = useMutation({
    mutationFn: usersApi.restoreUser,
    onSuccess: () => { toast.success('User restored'); qc.invalidateQueries({ queryKey: ['all-users'] }) },
    onError: () => toast.error('Failed'),
  })

  const viewSellerDetails = async (user: User) => {
    setLoadingDetail(true)
    try {
      const detail = await usersApi.getSellerDetailsByAdmin(user.uuid)
      setDetailModal({ user, detail })
    } catch {
      setDetailModal({ user, detail: null })
    } finally {
      setLoadingDetail(false)
    }
  }

  if (isLoading) return <Spinner message="Loading users…" />
  if (error) return <ErrorMessage message="Failed to load users" />

  const pending = users?.filter((u) => u.status === 'PENDING_APPROVAL') ?? []

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management</h1>

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 mb-3 inline-block">
            ⏳ Pending Seller Approvals ({pending.length})
          </h2>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Name', 'Email', 'Role', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {pending.map((u) => (
                  <tr key={u.uuid} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3"><StatusBadge status={u.role} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => viewSellerDetails(u)} disabled={loadingDetail} className="btn-outline text-xs py-1 px-2">
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                        <button onClick={() => approve.mutate(u.uuid)} disabled={approve.isPending} className="btn-success text-xs py-1 px-2">
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button onClick={() => reject.mutate(u.uuid)} disabled={reject.isPending} className="btn-danger text-xs py-1 px-2">
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">All Users ({users?.length ?? 0})</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              {['Name', 'Email', 'Role', 'Status', 'Verified', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {users?.map((u) => (
              <tr key={u.uuid} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                <td className="px-4 py-3"><StatusBadge status={u.role} /></td>
                <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                <td className="px-4 py-3">
                  <span className={u.emailVerified ? 'badge-green' : 'badge-yellow'}>
                    {u.emailVerified ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {/* View seller details */}
                    {u.role === 'SELLER' && ['PENDING_APPROVAL', 'ACTIVE', 'BLOCKED'].includes(u.status) && (
                      <button onClick={() => viewSellerDetails(u)} disabled={loadingDetail} className="p-1.5 rounded hover:bg-blue-50 text-blue-500" title="View seller details">
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    {/* Approve / Reject for pending sellers */}
                    {u.status === 'PENDING_APPROVAL' && (
                      <>
                        <button onClick={() => approve.mutate(u.uuid)} disabled={approve.isPending} className="p-1.5 rounded hover:bg-green-50 text-green-600" title="Approve seller">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => reject.mutate(u.uuid)} disabled={reject.isPending} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Reject seller">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {/* Block / Unblock */}
                    {u.status === 'BLOCKED' && u.role !== 'ADMIN' && (
                      <button onClick={() => unblock.mutate(u.uuid)} className="p-1.5 rounded hover:bg-green-50 text-green-600" title="Unblock">
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                    {u.status !== 'BLOCKED' && u.status !== 'DELETED' && u.role !== 'ADMIN' && (
                      <button onClick={() => block.mutate(u.uuid)} className="p-1.5 rounded hover:bg-orange-50 text-orange-500" title="Block">
                        <ShieldOff className="w-4 h-4" />
                      </button>
                    )}
                    {/* Delete / Restore */}
                    {u.status === 'DELETED' && u.role !== 'ADMIN' && (
                      <button onClick={() => restore.mutate(u.uuid)} className="p-1.5 rounded hover:bg-green-50 text-green-600" title="Restore">
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                    {u.status !== 'DELETED' && u.role !== 'ADMIN' && (
                      <button onClick={() => { if (confirm('Delete user?')) del.mutate(u.uuid) }} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Seller Detail Modal */}
      <Modal open={!!detailModal} onClose={() => setDetailModal(null)} title={`Seller Details — ${detailModal?.user.firstName} ${detailModal?.user.lastName}`}>
        {detailModal && !detailModal.detail ? (
          <p className="text-sm text-gray-500">No seller details submitted yet.</p>
        ) : detailModal?.detail ? (
          <div className="space-y-5 text-sm">
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Business Info</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <div><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-900">{detailModal.detail.businessName}</span></div>
                <div><span className="text-gray-500">Type:</span> <span className="font-medium text-gray-900">{detailModal.detail.businessType}</span></div>
                {detailModal.detail.gstNumber && <div><span className="text-gray-500">GST:</span> <span className="font-medium text-gray-900">{detailModal.detail.gstNumber}</span></div>}
                {detailModal.detail.panNumber && <div><span className="text-gray-500">PAN:</span> <span className="font-medium text-gray-900">{detailModal.detail.panNumber}</span></div>}
              </div>
            </section>
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Address</h3>
              <p className="text-gray-900">
                {detailModal.detail.addressLine1}
                {detailModal.detail.addressLine2 && <>, {detailModal.detail.addressLine2}</>}
                <br />{detailModal.detail.city}, {detailModal.detail.state} — {detailModal.detail.pincode}
              </p>
            </section>
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Identity Verification</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <div><span className="text-gray-500">ID Type:</span> <span className="font-medium text-gray-900">{detailModal.detail.idType}</span></div>
                <div><span className="text-gray-500">ID Number:</span> <span className="font-medium text-gray-900">{detailModal.detail.idNumber}</span></div>
              </div>
            </section>
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Bank Details</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <div><span className="text-gray-500">Bank:</span> <span className="font-medium text-gray-900">{detailModal.detail.bankName}</span></div>
                <div><span className="text-gray-500">Account:</span> <span className="font-medium text-gray-900">{detailModal.detail.bankAccountNumber}</span></div>
                <div><span className="text-gray-500">IFSC:</span> <span className="font-medium text-gray-900">{detailModal.detail.bankIfscCode}</span></div>
              </div>
            </section>
            {detailModal.detail.submittedAt && (
              <p className="text-xs text-gray-400">Submitted: {new Date(detailModal.detail.submittedAt).toLocaleString()}</p>
            )}
            {detailModal.user.status === 'PENDING_APPROVAL' && (
              <div className="flex gap-3 pt-3 border-t">
                <button onClick={() => approve.mutate(detailModal.user.uuid)} disabled={approve.isPending} className="btn-success py-2 px-4 text-sm">
                  <CheckCircle className="w-4 h-4" /> {approve.isPending ? 'Approving…' : 'Approve Seller'}
                </button>
                <button onClick={() => reject.mutate(detailModal.user.uuid)} disabled={reject.isPending} className="btn-danger py-2 px-4 text-sm">
                  <XCircle className="w-4 h-4" /> {reject.isPending ? 'Rejecting…' : 'Reject Seller'}
                </button>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
