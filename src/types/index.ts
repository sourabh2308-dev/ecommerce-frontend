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
export type OrderStatus = 'CREATED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED'
export interface OrderItem { productUuid: string; sellerUuid: string; price: number; quantity: number }
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
  id: number
  uuid: string
  productUuid: string
  sellerUuid: string
  buyerUuid: string
  rating: number
  comment: string
  createdAt: string
}
export interface CreateReviewRequest { orderUuid: string; productUuid: string; rating: number; comment: string }

// ─── Cart (local) ──────────────────────────────────────────────────────────
export interface CartItem { product: Product; quantity: number }

// ─── Pages ─────────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> { content: T[]; totalPages: number; totalElements: number }
