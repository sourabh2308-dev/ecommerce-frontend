// ─── Auth ──────────────────────────────────────────────────────────────────
export interface LoginRequest { email: string; password: string }
export interface RegisterRequest { name: string; email: string; password: string; role: 'BUYER' | 'SELLER' }
export interface AuthResponse { accessToken: string; refreshToken: string }

// ─── User ──────────────────────────────────────────────────────────────────
export type UserStatus = 'PENDING_VERIFICATION' | 'PENDING_DETAILS' | 'PENDING_APPROVAL' | 'ACTIVE' | 'BLOCKED' | 'DELETED'
export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN'
export interface User {
  uuid: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  role: UserRole
  status: UserStatus
  emailVerified: boolean
  approved: boolean
}
export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  phoneNumber?: string
}
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

// ─── Seller Details ────────────────────────────────────────────────────────
export interface SellerDetailRequest {
  businessName: string
  businessType: string
  gstNumber?: string
  panNumber?: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  idType: string
  idNumber: string
  bankAccountNumber: string
  bankIfscCode: string
  bankName: string
}
export interface SellerDetailResponse {
  businessName: string
  businessType: string
  gstNumber?: string
  panNumber?: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  idType: string
  idNumber: string
  bankAccountNumber: string
  bankIfscCode: string
  bankName: string
  submittedAt?: string
  verifiedAt?: string
}

// ─── Product ───────────────────────────────────────────────────────────────
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'BLOCKED' | 'OUT_OF_STOCK'
export interface Product {
  uuid: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  sellerUuid: string
  status: ProductStatus
  averageRating: number
  totalReviews: number
  imageUrl?: string
}
export interface CreateProductRequest { name: string; description: string; price: number; stock: number; category: string; imageUrl?: string }

// ─── Order ─────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'CREATED'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'PICKUP_SCHEDULED'
  | 'PICKED_UP'
  | 'RETURN_RECEIVED'
  | 'EXCHANGE_ISSUED'
  | 'REFUND_ISSUED'
  | 'RETURN_REJECTED'
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
export type ReturnType = 'REFUND' | 'EXCHANGE'
export interface OrderItem {
  productUuid: string
  productName?: string
  productCategory?: string
  productImageUrl?: string
  sellerUuid: string
  price: number
  quantity: number
}
export interface Order {
  uuid: string
  buyerUuid: string
  totalAmount: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  items: OrderItem[]
  shippingName?: string
  shippingAddress?: string
  shippingCity?: string
  shippingState?: string
  shippingPincode?: string
  shippingPhone?: string
  returnType?: ReturnType
  returnReason?: string
  taxPercent?: number
  taxAmount?: number
  currency?: string
  couponCode?: string
  discountAmount?: number
  orderType?: 'MAIN' | 'SUB'
  parentOrderUuid?: string
  orderGroupId?: string
  createdAt?: string
  updatedAt?: string
}
export interface OrderItemRequest { productUuid: string; quantity: number }
export interface CreateOrderRequest {
  items: OrderItemRequest[]
  shippingName: string
  shippingAddress: string
  shippingCity: string
  shippingState: string
  shippingPincode: string
  shippingPhone: string
}

// ─── Payment ───────────────────────────────────────────────────────────────
export interface PaymentSplit {
  sellerUuid: string
  productUuid: string
  itemAmount: number
  platformFeePercent: number
  platformFee: number
  deliveryFee: number
  sellerPayout: number
  status: string
}
export interface Payment {
  uuid: string
  orderUuid: string
  buyerUuid: string
  amount: number
  status: string
  splits: PaymentSplit[]
  createdAt: string
}
export interface SellerDashboard {
  sellerUuid: string
  totalEarnings: number
  pendingPayouts: number
  completedPayouts: number
  totalOrders: number
}
export interface AdminDashboard {
  totalGrossRevenue: number
  totalPlatformEarnings: number
  totalDeliveryFees: number
  totalSellerPayouts: number
  totalCompletedOrders: number
  activeSellers: number
}

// ─── Review ────────────────────────────────────────────────────────────────
export interface Review {
  id?: number
  uuid: string
  productUuid: string
  sellerUuid: string
  buyerUuid: string
  rating: number
  comment: string
  verifiedPurchase?: boolean
  imageUrls?: string[]
  helpfulCount?: number
  notHelpfulCount?: number
  createdAt: string
}
export interface CreateReviewRequest { orderUuid: string; productUuid: string; rating: number; comment: string }

// ─── User: Addresses ───────────────────────────────────────────────────────
export interface AddressRequest {
  label?: string
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  isDefault?: boolean
}
export interface Address {
  uuid: string
  label?: string
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
  createdAt?: string
  updatedAt?: string
}

// ─── User: Cart & Wishlist ────────────────────────────────────────────────
export interface CartItemResponse {
  id: number
  productUuid: string
  productName?: string
  productImage?: string
  price: number
  quantity: number
  subtotal: number
  createdAt?: string
}
export interface CartResponse {
  items: CartItemResponse[]
  totalItems: number
  totalAmount: number
}
export interface WishlistItem {
  id: number
  productUuid: string
  productName?: string
  productImage?: string
  price: number
  createdAt?: string
}

// ─── User: Notifications ──────────────────────────────────────────────────
export type NotificationType =
  | 'ORDER_PLACED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_SHIPPED'
  | 'ORDER_DELIVERED'
  | 'ORDER_CANCELLED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'RETURN_APPROVED'
  | 'RETURN_REJECTED'
  | 'REFUND_PROCESSED'
  | 'PROMOTION'
  | 'LOYALTY_POINTS'
  | 'SYSTEM'
export interface Notification {
  uuid: string
  type: NotificationType
  title: string
  message: string
  referenceId?: string
  isRead: boolean
  createdAt: string
}

// ─── User: Loyalty ────────────────────────────────────────────────────────
export type PointsTransactionType =
  | 'EARNED_ORDER'
  | 'EARNED_REVIEW'
  | 'EARNED_REFERRAL'
  | 'REDEEMED'
  | 'EXPIRED'
  | 'ADMIN_ADJUSTMENT'
export interface LoyaltyBalance {
  userUuid: string
  balance: number
  monetaryValue: number
}
export interface LoyaltyPoint {
  type: PointsTransactionType
  points: number
  balanceAfter: number
  referenceId?: string
  description?: string
  createdAt: string
}

// ─── User: Support Tickets ────────────────────────────────────────────────
export type TicketCategory =
  | 'ORDER_ISSUE'
  | 'PAYMENT_ISSUE'
  | 'PRODUCT_INQUIRY'
  | 'DELIVERY_ISSUE'
  | 'RETURN_REFUND'
  | 'ACCOUNT_ISSUE'
  | 'OTHER'
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'AWAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED'
export interface SupportMessage {
  id: number
  senderUuid: string
  senderRole: UserRole
  content: string
  createdAt: string
}
export interface SupportTicket {
  uuid: string
  userUuid: string
  subject: string
  description: string
  category: TicketCategory
  status: TicketStatus
  orderUuid?: string
  assignedAdminUuid?: string
  messages: SupportMessage[]
  createdAt: string
  resolvedAt?: string
}

// ─── Order: Coupons / Returns / Tracking ──────────────────────────────────
export interface Coupon {
  code: string
  discountType: 'PERCENTAGE' | 'FLAT'
  discountValue: number
  minOrderAmount?: number
  maxDiscount?: number
  totalUsageLimit?: number
  usedCount?: number
  perUserLimit?: number
  validFrom: string
  validUntil: string
  isActive: boolean
  sellerUuid?: string
}
export interface CouponValidation {
  valid: boolean
  message: string
  discountAmount?: number
  finalAmount?: number
}
export interface ReturnRequest {
  uuid: string
  orderUuid: string
  buyerUuid: string
  returnType: ReturnType
  reason: string
  status: string
  adminNotes?: string
  refundAmount?: number
  resolvedAt?: string
  createdAt: string
}
export interface TrackingEvent {
  orderUuid: string
  status: string
  location?: string
  description?: string
  carrier?: string
  trackingNumber?: string
  eventTime: string
}

// ─── Dashboards (Order Service) ───────────────────────────────────────────
export interface AdminOrderDashboard {
  totalOrders: number
  confirmedOrders: number
  deliveredOrders: number
  cancelledOrders: number
  returnRequests: number
  totalRevenue: number
}
export interface SellerOrderDashboard {
  totalOrders: number
  pendingOrders: number
  deliveredOrders: number
  returnedOrders: number
  totalRevenue: number
}

// ─── Catalog: Categories / Images / Variants / Deals ──────────────────────
export interface Category {
  uuid: string
  name: string
  description?: string
  imageUrl?: string
  parentUuid?: string
  displayOrder?: number
  isActive?: boolean
  children?: Category[]
  createdAt?: string
}
export interface ProductImage {
  id: number
  imageUrl: string
  displayOrder?: number
  altText?: string
}
export interface ProductVariant {
  uuid: string
  variantName: string
  variantValue: string
  priceOverride?: number
  stock: number
  sku: string
  isActive?: boolean
}
export interface FlashDeal {
  uuid: string
  productUuid: string
  productName: string
  originalPrice: number
  discountPercent: number
  discountedPrice: number
  startTime: string
  endTime: string
  isActive: boolean
}
export interface StockMovement {
  id: number
  productUuid: string
  type: string
  quantity: number
  stockAfter: number
  reference?: string
  createdAt: string
}

// ─── Cart (local) ──────────────────────────────────────────────────────────
export interface CartItem { product: Product; quantity: number }

// ─── Pages ─────────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> { content: T[]; totalPages: number; totalElements: number }
