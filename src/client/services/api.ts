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
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('sultan_auth_token');
        }
        throw new Error(data.error?.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (err: any) {
      console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, err);
      throw err;
    }
  }

  // --- Auth Endpoints ---
  public async register(payload: { email: string; password: string; firstName: string; lastName: string; phone?: string }) {
    return this.request<{ success: boolean; data: { user: User; token: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async login(credentials: { email: string; password: string }) {
    return this.request<{ success: boolean; data: { user: User; token: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
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
