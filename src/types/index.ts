export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MANAGER'
  | 'PRODUCT_MANAGER'
  | 'ORDER_MANAGER'
  | 'CUSTOMER_SUPPORT'
  | 'MARKETING'
  | 'INVENTORY_MANAGER'
  | 'CONTENT_MANAGER'
  | 'STAFF'
  | 'CUSTOMER';

export interface Permission {
  id: string;
  key: string;
  name: string;
  category: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  isSystem: boolean;
  permissions: string[]; // array of permission keys
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserAddressDetails {
  houseNo?: string;
  areaRoad?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string; // role code
  customPermissions?: string[];
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  avatarUrl?: string;
  totalSpent: number;
  orderCount: number;
  isWholesaleCustomer?: boolean;
  wholesaleCompany?: string;
  address?: string;
  addressDetails?: UserAddressDetails;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
  width?: number;
  height?: number;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription: string;
  price: number;
  salePrice?: number;
  currency: string;
  brand: string;
  brandSlug: string;
  category: string;
  categorySlug: string;
  subcategory?: string;
  images: ProductImage[];
  stock: number;
  lowStockThreshold: number;
  weight?: number; // grams
  flavor?: string;
  material?: string;
  color?: string;
  tags: string[];
  specifications: ProductSpecification[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isOnSale: boolean;
  isActive: boolean;
  ageRestricted: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  bannerUrl?: string;
  subcategories: string[];
  productCount: number;
  isActive: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  origin?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  productCount: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedFlavor?: string;
  selectedColor?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  couponCode?: string;
  couponDiscount: number;
  shippingFee: number;
  estimatedTax: number;
  grandTotal: number;
  itemCount: number;
}

export interface Address {
  id: string;
  userId?: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export type OrderStatus =
  | 'PLACED'
  | 'PAYMENT_CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  productId: string;
  productName: string;
  productSku: string;
  productImage: string;
  price: number;
  quantity: number;
  flavor?: string;
  selectedFlavor?: string;
  color?: string;
  subtotal: number;
  totalPrice?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  grandTotal?: number;
  couponCode?: string;
  paymentMethod: 'STRIPE' | 'CREDIT_CARD' | 'BANK_TRANSFER' | string;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  orderStatus: OrderStatus | string;
  status?: string;
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
  timeline: {
    status: OrderStatus | string;
    timestamp: string;
    note?: string;
    actor?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productName?: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  applicableCategories?: string[];
  applicableBrands?: string[];
  createdAt: string;
}

export interface WholesaleApplication {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  businessType: 'LOUNGE' | 'RETAIL_STORE' | 'DISTRIBUTOR' | 'ONLINE_STORE' | 'OTHER';
  taxId?: string;
  website?: string;
  estimatedMonthlyVolume: string;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  previousStock: number;
  newStock: number;
  adjustment: number;
  reason: 'ORDER_PLACED' | 'ORDER_CANCELLED' | 'MANUAL_ADJUSTMENT' | 'RESTOCK' | 'DAMAGE_WRITE_OFF' | 'BULK_CSV_UPDATE';
  orderId?: string;
  actor: string;
  notes?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  currencySymbol: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  taxRatePercent?: number;
  taxRate?: number;
  ageVerificationRequired?: boolean;
  minimumPurchaseAge?: number;
  stripeEnabled?: boolean;
  resendEnabled?: boolean;
  smsProvider?: 'twilio' | 'msg91' | 'mock';
  bannerAnnouncement?: string;
  announcement?: string;
  maintenanceMode?: boolean;
  [key: string]: any;
}

export interface AdminNotification {
  id: string;
  type: 'ORDER' | 'STOCK' | 'WHOLESALE' | 'REVIEW' | 'REFUND' | 'SYSTEM';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}
