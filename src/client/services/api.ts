import {
  User,
  Product,
  Category,
  Brand,
  Cart,
  Order,
  Review,
  Coupon,
  WholesaleApplication,
  Role,
  Permission,
  AuditLog,
  StoreSettings
} from '../../types/index.js';

// Base API URL configuration supporting standalone frontend deployment pointing to remote/local backend
export const getApiBaseUrl = (): string => {
  const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
  const envUrl = (metaEnv?.VITE_API_BASE_URL || metaEnv?.VITE_API_URL) as string | undefined;
  if (envUrl) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  return '/api';
};

const API_BASE = getApiBaseUrl();

export async function translateTexts(texts: string[], target: string): Promise<string[]> {
  const response = await fetch(`${API_BASE}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts, target })
  });
  const payload = await response.json() as { success?: boolean; data?: string[] };
  if (!response.ok || !payload.success || !payload.data) {
    throw new Error('Translation service unavailable');
  }
  return payload.data;
}

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    // Check for guest ID
    let guestId = localStorage.getItem('sultan_guest_id');
    if (!guestId) {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem('sultan_guest_id', guestId);
    }
    headers['x-guest-id'] = guestId;

    // Attach auth token if available
    const token = localStorage.getItem('sultan_auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = { ...this.getHeaders(), ...(options.headers || {}) };

    try {
      const response = await fetch(url, { ...options, headers });
      const contentType = response.headers.get('content-type') || '';

      let data: any;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = {
            success: false,
            error: {
              code: response.ok ? 'INVALID_FORMAT' : 'HTTP_ERROR',
              message: response.ok
                ? 'Server returned non-JSON response format.'
                : `Request failed with HTTP status ${response.status} (${response.statusText || 'Error'})`
            }
          };
        }
      }

      if (!response.ok) {
        // Only clear stored auth token if the session token itself is invalid or expired
        if (response.status === 401 && data?.error?.code === 'INVALID_TOKEN') {
          localStorage.removeItem('sultan_auth_token');
        }
        throw new Error(data?.error?.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (err: any) {
      // Don't format expected user-level authentication responses as system-level [API Error] crashes
      if (endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/admin-login') || endpoint.startsWith('/auth/otp')) {
        console.warn(`[Auth Notice] ${options.method || 'GET'} ${endpoint}:`, err.message);
      } else {
        console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, err);
      }
      throw err;
    }
  }

  // --- Auth Endpoints ---
  public async register(payload: {
    email?: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    addressDetails?: {
      houseNo?: string;
      areaRoad?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
    otpCode?: string;
  }) {
    return this.request<{ success: boolean; data: { user: User; token: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async updateAddress(payload: {
    address?: string;
    addressDetails?: {
      houseNo?: string;
      areaRoad?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
  }) {
    return this.request<{ success: boolean; data: { user: User } }>('/auth/address', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  public async login(credentials: { user?: string; email?: string; password: string }) {
    return this.request<{ success: boolean; data: { user: User; token: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  public async sendOTP(identifier: string, type?: 'EMAIL' | 'SMS') {
    return this.request<{ success: boolean; message: string; devOtp?: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, type })
    });
  }

  public async verifyOTP(identifier: string, code: string) {
    return this.request<{ success: boolean; message: string }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, code })
    });
  }

  public async resetPasswordOTP(payload: { identifier: string; code: string; newPassword: string }) {
    return this.request<{ success: boolean; message: string }>('/auth/reset-password-otp', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async adminLogin(credentials: { email: string; password: string }) {
    return this.request<{ success: boolean; data: { user: User; permissions: string[]; token: string } }>('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  public async getMe() {
    return this.request<{ success: boolean; data: { user: User; permissions: string[] } }>('/auth/me');
  }

  public async sendEmailOTP(email: string) {
    return this.request<{ success: boolean; message: string }>('/auth/send-email-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  public async verifyEmailOTP(email: string, code: string) {
    return this.request<{ success: boolean; data: { user: User; token: string } }>('/auth/verify-email-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code })
    });
  }

  public async sendSmsOTP(phone: string) {
    return this.request<{ success: boolean; message: string }>('/auth/send-sms-otp', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  }

  public async verifySmsOTP(phone: string, code: string, extra?: { email?: string; firstName?: string }) {
    return this.request<{ success: boolean; data: { user: User; token: string } }>('/auth/verify-sms-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, code, ...extra })
    });
  }

  public async googleLogin(payload: { email: string; name?: string; avatarUrl?: string }) {
    return this.request<{ success: boolean; data: { user: User; token: string } }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async forgotPassword(email: string) {
    return this.request<{ success: boolean; message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  public async resetPassword(token: string, newPassword: string) {
    return this.request<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword })
    });
  }

  // --- Products & Catalog ---
  public async getProducts(params: Record<string, any> = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        qs.append(key, String(val));
      }
    });
    return this.request<{ success: boolean; data: { products: Product[]; pagination: any } }>(`/products?${qs.toString()}`);
  }

  public async searchProducts(query: string) {
    return this.request<{ success: boolean; data: { results: Product[]; suggestions: any[] } }>(`/products/search?q=${encodeURIComponent(query)}`);
  }

  public async getProductBySlug(slug: string) {
    return this.request<{ success: boolean; data: { product: Product; relatedProducts: Product[]; frequentlyBoughtTogether: Product[]; reviews: Review[] } }>(`/products/${slug}`);
  }

  public async getCategories() {
    return this.request<{ success: boolean; data: Category[] }>('/categories');
  }

  public async getBrands() {
    return this.request<{ success: boolean; data: Brand[] }>('/brands');
  }

  // --- Cart & Checkout ---
  public async getCart(coupon?: string) {
    const qs = coupon ? `?coupon=${encodeURIComponent(coupon)}` : '';
    return this.request<{ success: boolean; data: Cart }>(`/cart${qs}`);
  }

  public async addToCart(productId: string, quantity = 1, selectedFlavor?: string, selectedColor?: string) {
    return this.request<{ success: boolean; data: Cart }>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, selectedFlavor, selectedColor })
    });
  }

  public async updateCartItem(itemId: string, quantity: number) {
    return this.request<{ success: boolean; data: Cart }>(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  }

  public async removeCartItem(itemId: string) {
    return this.request<{ success: boolean; data: Cart }>(`/cart/items/${itemId}`, {
      method: 'DELETE'
    });
  }

  public async applyCoupon(code: string) {
    return this.request<{ success: boolean; message: string; data: Cart }>('/cart/apply-coupon', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  }

  public async validateCheckout(payload: { couponCode?: string; ageConfirmed: boolean }) {
    return this.request<{ success: boolean; data: { cart: Cart; storeSettings: any } }>('/checkout/validate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async createPayment(payload: any) {
    return this.request<{ success: boolean; data: { order: Order; clientSecret: string; paymentIntentId: string } }>('/payments/create-payment', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async confirmSimulatedPayment(orderId: string, paymentIntentId: string) {
    return this.request<{ success: boolean; data: { order: Order } }>('/payments/confirm-simulated', {
      method: 'POST',
      body: JSON.stringify({ orderId, paymentIntentId })
    });
  }

  // --- Wishlist ---
  public async getWishlist() {
    return this.request<{ success: boolean; data: { items: Product[]; productIds: string[] } }>('/wishlist');
  }

  public async toggleWishlist(productId: string, isSaved: boolean) {
    if (isSaved) {
      return this.request<{ success: boolean; data: { productIds: string[] } }>(`/wishlist/${productId}`, {
        method: 'DELETE'
      });
    } else {
      return this.request<{ success: boolean; data: { productIds: string[] } }>(`/wishlist/${productId}`, {
        method: 'POST'
      });
    }
  }

  // --- Orders ---
  public async getMyOrders() {
    return this.request<{ success: boolean; data: { orders: Order[] } }>('/orders');
  }

  public async getOrderById(orderId: string) {
    return this.request<{ success: boolean; data: { order: Order } }>(`/orders/${orderId}`);
  }

  public async trackOrder(query: string, email?: string) {
    const qs = email ? `?email=${encodeURIComponent(email)}` : '';
    return this.request<{
      success: boolean;
      data: {
        order: Order;
        trackingInfo: {
          carrier: string;
          trackingNumber: string;
          trackingUrl: string;
          status: string;
          statusBadge: string;
          progressPercent: number;
          estimatedDelivery: string;
          isDelivered: boolean;
          isOutForDelivery: boolean;
          isInTransit: boolean;
        };
      };
    }>(`/orders/track/${encodeURIComponent(query.trim())}${qs}`);
  }

  public async emailOrderPdf(orderId: string, email: string, pdfBase64?: string, customNote?: string) {
    return this.request<{
      success: boolean;
      message: string;
      recipient?: string;
    }>(`/orders/${encodeURIComponent(orderId)}/email-pdf`, {
      method: 'POST',
      body: JSON.stringify({ email, pdfBase64, customNote })
    });
  }

  // --- Reviews, Wholesale, Contact, Newsletter ---
  public async submitReview(productId: string, review: { rating: number; title: string; comment: string; userName?: string; userEmail?: string }) {
    return this.request<{ success: boolean; message: string; data: Review }>(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review)
    });
  }

  public async applyWholesale(form: any) {
    return this.request<{ success: boolean; message: string }>('/wholesale/apply', {
      method: 'POST',
      body: JSON.stringify(form)
    });
  }

  public async subscribeNewsletter(email: string) {
    return this.request<{ success: boolean; message: string }>('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  public async sendContactMessage(payload: any) {
    return this.request<{ success: boolean; message: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async getSettings() {
    return this.request<{ success: boolean; data: StoreSettings }>('/settings');
  }

  // ==========================================
  // ADMIN API CALLS
  // ==========================================
  public async getAdminDashboard() {
    return this.request<{ success: boolean; data: any }>('/admin/dashboard');
  }

  public async getAdminProducts(params?: any) {
    const qs = new URLSearchParams(params || {}).toString();
    return this.request<{ success: boolean; data: Product[] }>(`/admin/products?${qs}`);
  }

  public async createAdminProduct(product: any) {
    return this.request<{ success: boolean; data: Product }>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });
  }

  public async updateAdminProduct(id: string, product: any) {
    return this.request<{ success: boolean; data: Product }>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product)
    });
  }

  public async deleteAdminProduct(id: string) {
    return this.request<{ success: boolean; message: string }>(`/admin/products/${id}`, {
      method: 'DELETE'
    });
  }

  public async importAdminProducts(products: any[]) {
    return this.request<{ success: boolean; data: any }>('/admin/products/import', {
      method: 'POST',
      body: JSON.stringify({ products })
    });
  }

  public async bulkUpdateProducts(updates: any[]) {
    return this.request<{
      success: boolean;
      data: {
        total: number;
        updated: number;
        skipped: number;
        updatedItems: any[];
        errors: string[];
      };
      message: string;
    }>('/admin/products/bulk-update', {
      method: 'POST',
      body: JSON.stringify({ updates })
    });
  }

  public async getAdminOrders(params?: any) {
    const qs = new URLSearchParams(params || {}).toString();
    return this.request<{ success: boolean; data: Order[] }>(`/admin/orders?${qs}`);
  }

  public async updateAdminOrderStatus(id: string, payload: { status: string; trackingNumber?: string; carrier?: string; note?: string }) {
    return this.request<{ success: boolean; data: Order }>(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  public async refundAdminOrder(id: string, payload: { amount?: number; reason: string }) {
    return this.request<{ success: boolean; message: string; data: Order }>(`/admin/orders/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async getAdminCustomers() {
    return this.request<{ success: boolean; data: User[] }>('/admin/customers');
  }

  public async downloadCustomersExcel(): Promise<Blob> {
    const res = await fetch(`${API_BASE}/admin/export/customers/excel`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to export customer data');
    return res.blob();
  }

  public async downloadInventoryExcel(): Promise<Blob> {
    const res = await fetch(`${API_BASE}/admin/export/inventory/excel`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to export inventory data');
    return res.blob();
  }

  public async toggleSuspendCustomer(id: string) {
    return this.request<{ success: boolean; message: string }>(`/admin/customers/${id}/suspend`, {
      method: 'POST'
    });
  }

  public async getAdminInventory() {
    return this.request<{ success: boolean; data: any }>('/admin/inventory');
  }

  public async adjustAdminInventory(id: string, payload: { adjustment: number; reason: string; notes?: string }) {
    return this.request<{ success: boolean; message: string; data: any }>(`/admin/inventory/${id}/adjust`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async getAdminCoupons() {
    return this.request<{ success: boolean; data: Coupon[] }>('/admin/coupons');
  }

  public async createAdminCoupon(coupon: any) {
    return this.request<{ success: boolean; data: Coupon }>('/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(coupon)
    });
  }

  public async deleteAdminCoupon(id: string) {
    return this.request<{ success: boolean; message: string }>(`/admin/coupons/${id}`, {
      method: 'DELETE'
    });
  }

  // Categories Admin
  public async getAdminCategories() {
    return this.request<{ success: boolean; data: Category[] }>('/admin/categories');
  }

  public async createAdminCategory(category: Partial<Category>) {
    return this.request<{ success: boolean; data: Category }>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(category)
    });
  }

  public async updateAdminCategory(id: string, category: Partial<Category>) {
    return this.request<{ success: boolean; data: Category }>(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category)
    });
  }

  public async deleteAdminCategory(id: string) {
    return this.request<{ success: boolean; message: string }>(`/admin/categories/${id}`, {
      method: 'DELETE'
    });
  }

  // Brands Admin
  public async getAdminBrands() {
    return this.request<{ success: boolean; data: Brand[] }>('/admin/brands');
  }

  public async createAdminBrand(brand: Partial<Brand>) {
    return this.request<{ success: boolean; data: Brand }>('/admin/brands', {
      method: 'POST',
      body: JSON.stringify(brand)
    });
  }

  public async updateAdminBrand(id: string, brand: Partial<Brand>) {
    return this.request<{ success: boolean; data: Brand }>(`/admin/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(brand)
    });
  }

  public async deleteAdminBrand(id: string) {
    return this.request<{ success: boolean; message: string }>(`/admin/brands/${id}`, {
      method: 'DELETE'
    });
  }

  public async getAdminReviews() {
    return this.request<{ success: boolean; data: Review[] }>('/admin/reviews');
  }

  public async moderateAdminReview(id: string, status: 'APPROVED' | 'REJECTED') {
    return this.request<{ success: boolean; data: Review }>(`/admin/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  public async getAdminWholesale() {
    return this.request<{ success: boolean; data: WholesaleApplication[] }>('/admin/wholesale');
  }

  public async updateAdminWholesale(id: string, payload: { status: string; adminNotes?: string }) {
    return this.request<{ success: boolean; data: WholesaleApplication }>(`/admin/wholesale/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  public async getAdminStaff() {
    return this.request<{ success: boolean; data: User[] }>('/admin/staff');
  }

  public async createAdminStaff(staff: any) {
    return this.request<{ success: boolean; data: User }>('/admin/staff', {
      method: 'POST',
      body: JSON.stringify(staff)
    });
  }

  public async updateAdminStaff(id: string, payload: any) {
    return this.request<{ success: boolean; data: User }>(`/admin/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  public async deleteAdminStaff(id: string) {
    return this.request<{ success: boolean; message: string }>(`/admin/staff/${id}`, {
      method: 'DELETE'
    });
  }

  public async getAdminRoles() {
    return this.request<{ success: boolean; data: Role[] }>('/admin/roles');
  }

  public async createAdminRole(role: any) {
    return this.request<{ success: boolean; data: Role }>('/admin/roles', {
      method: 'POST',
      body: JSON.stringify(role)
    });
  }

  public async updateAdminRole(id: string, role: any) {
    return this.request<{ success: boolean; data: Role }>(`/admin/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(role)
    });
  }

  public async getAdminPermissions() {
    return this.request<{ success: boolean; data: Permission[] }>('/admin/permissions');
  }

  public async getAdminAuditLogs(params?: any) {
    const qs = new URLSearchParams(params || {}).toString();
    return this.request<{ success: boolean; data: AuditLog[] }>(`/admin/audit-logs?${qs}`);
  }

  public async getAdminSettings() {
    return this.request<{ success: boolean; data: StoreSettings }>('/admin/settings');
  }

  public async updateAdminSettings(settings: Partial<StoreSettings>) {
    return this.request<{ success: boolean; data: StoreSettings }>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  // --- MongoDB Operations ---
  public async getMongoStatus() {
    return this.request<{
      success: boolean;
      data: {
        isConnected: boolean;
        isConnecting: boolean;
        uriConfigured: boolean;
        dbName: string;
        collectionCounts: Record<string, number>;
        lastSyncAt: string | null;
        lastError: string | null;
      };
    }>('/admin/mongodb/status');
  }

  public async syncMongo() {
    return this.request<{
      success: boolean;
      message: string;
      data: any;
    }>('/admin/mongodb/sync', {
      method: 'POST'
    });
  }

  public async reconnectMongo() {
    return this.request<{
      success: boolean;
      data: any;
    }>('/admin/mongodb/reconnect', {
      method: 'POST'
    });
  }

  public async loginWithPassword(email: string, password: string) {
    return this.login({ email, password });
  }

  public async sendEmailOtp(email: string) {
    return this.sendEmailOTP(email);
  }

  public async verifyEmailOtp(email: string, code: string) {
    return this.verifyEmailOTP(email, code);
  }

  public async sendSmsOtp(phone: string) {
    return this.sendSmsOTP(phone);
  }

  public async verifySmsOtp(phone: string, code: string) {
    return this.verifySmsOTP(phone, code);
  }

  public async submitWholesaleApplication(form: any) {
    return this.applyWholesale(form);
  }

  public async submitContactMessage(payload: any) {
    return this.sendContactMessage(payload);
  }

  public async getAnalytics() {
    return this.getAdminDashboard();
  }

  public async getWholesaleApplications() {
    return this.getAdminWholesale();
  }

  public async createProduct(product: any) {
    return this.createAdminProduct(product);
  }

  public async updateProduct(id: string, product: any) {
    return this.updateAdminProduct(id, product);
  }

  public async deleteProduct(id: string) {
    return this.deleteAdminProduct(id);
  }

  public async updateOrderStatus(id: string, status: string, trackingNumber?: string) {
    return this.updateAdminOrderStatus(id, { status, trackingNumber });
  }

  public async reviewWholesaleApplication(id: string, status: 'APPROVED' | 'REJECTED') {
    return this.updateAdminWholesale(id, { status });
  }

  public async createStaffAccount(staff: any) {
    return this.createAdminStaff(staff);
  }

  public async createOrder(payload: any) {
    return this.createPayment(payload);
  }
}

export const api = new ApiClient();
