type Status = string

const map: Record<string, string> = {
  ACTIVE: 'badge-green', APPROVED: 'badge-green', SUCCESS: 'badge-green', DELIVERED: 'badge-green',
  PENDING: 'badge-yellow', CONFIRMED: 'badge-yellow', SHIPPED: 'badge-blue',
  PENDING_VERIFICATION: 'badge-yellow', PENDING_DETAILS: 'badge-yellow', PENDING_APPROVAL: 'badge-yellow',  CREATED: 'badge-yellow',
  DRAFT: 'badge-gray', OUT_OF_STOCK: 'badge-yellow',
  BLOCKED: 'badge-red', CANCELLED: 'badge-red', FAILED: 'badge-red', REJECTED: 'badge-red',
  DELETED: 'badge-gray',
  BUYER: 'badge-blue', SELLER: 'badge-yellow', ADMIN: 'badge-purple',
}

export function StatusBadge({ status }: { status: Status }) {
  const cls = map[status?.toUpperCase()] ?? 'badge-gray'
  return <span className={cls}>{status?.replace(/_/g, ' ')}</span>
}

