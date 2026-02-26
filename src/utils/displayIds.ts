export const toDisplayId = (prefix: string, value?: string | null, size = 8): string => {
  if (!value) return `${prefix}-NA`
  return `${prefix}-${value.replace(/-/g, '').slice(0, size).toUpperCase()}`
}

export const toOrderId = (uuid?: string | null) => toDisplayId('ORD', uuid)
export const toProductId = (uuid?: string | null) => toDisplayId('PRD', uuid)
export const toTransactionNo = (uuid?: string | null) => toDisplayId('TXN', uuid, 10)
export const toCustomerId = (uuid?: string | null) => toDisplayId('CST', uuid)
export const toSellerId = (uuid?: string | null) => toDisplayId('SLR', uuid)
