import { create } from 'zustand';
import { User, Cart, Product, StoreSettings } from '../../types/index.js';
import { api } from '../services/api.js';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppState {
  // Auth state
  user: User | null;
  userPermissions: string[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAuthLoading: boolean;

  // Cart state
  cart: Cart;
  isCartOpen: boolean;
  isCartLoading: boolean;

  // Wishlist state
  wishlistIds: string[];

  // Modals & UI
  isAgeVerified: boolean;
  isSearchOpen: boolean;
  quickViewProduct: Product | null;
  toasts: ToastNotification[];

  // Settings
  settings: StoreSettings | null;

  // Auth actions
  setUser: (user: User | null, permissions?: string[]) => void;
  loadCurrentUser: () => Promise<void>;
  logout: () => void;

  // Cart actions
  setCartOpen: (open: boolean) => void;
  loadCart: (coupon?: string) => Promise<void>;
  addToCart: (productId: string, quantity?: number, flavor?: string, color?: string) => Promise<void>;
  updateCartQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeCartItem: (itemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;

  // Wishlist actions
  loadWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;

  // UI actions
  setAgeVerified: (verified: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setQuickViewProduct: (product: Product | null) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  loadSettings: () => Promise<void>;
}

const emptyCart: Cart = {
  items: [],
  subtotal: 0,
  discountTotal: 0,
  couponDiscount: 0,
  shippingFee: 0,
  estimatedTax: 0,
  grandTotal: 0,
  itemCount: 0
};

export const useStore = create<AppState>((set, get) => ({
  user: null,
  userPermissions: [],
  isAuthenticated: false,
  isAdmin: false,
  isAuthLoading: true,

  cart: emptyCart,
  isCartOpen: false,
  isCartLoading: false,

  wishlistIds: [],

  isAgeVerified: localStorage.getItem('sultan_age_verified') === 'true',
  isSearchOpen: false,
  quickViewProduct: null,
  toasts: [],
  settings: null,

  setUser: (user, permissions = []) => {
    const isAdmin = !!user && user.role !== 'CUSTOMER';
    set({
      user,
      userPermissions: permissions,
      isAuthenticated: !!user,
      isAdmin,
      isAuthLoading: false
    });
  },

  loadCurrentUser: async () => {
    const token = localStorage.getItem('sultan_auth_token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isAdmin: false, isAuthLoading: false });
      return;
    }

    try {
      const res = await api.getMe();
      if (res.success && res.data) {
        get().setUser(res.data.user, res.data.permissions);
      } else {
        localStorage.removeItem('sultan_auth_token');
        set({ user: null, isAuthenticated: false, isAdmin: false, isAuthLoading: false });
      }
    } catch {
      localStorage.removeItem('sultan_auth_token');
      set({ user: null, isAuthenticated: false, isAdmin: false, isAuthLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('sultan_auth_token');
    set({
      user: null,
      userPermissions: [],
      isAuthenticated: false,
      isAdmin: false
    });
    get().showToast('You have been signed out.', 'info');
  },

  setCartOpen: (open) => set({ isCartOpen: open }),

  loadCart: async (coupon) => {
    try {
      set({ isCartLoading: true });
      const res = await api.getCart(coupon);
      if (res.success && res.data) {
        set({ cart: res.data });
      }
    } catch (err) {
      console.error('Error loading cart:', err);
    } finally {
      set({ isCartLoading: false });
    }
  },

  addToCart: async (productId, quantity = 1, flavor, color) => {
    try {
      set({ isCartLoading: true });
      const res = await api.addToCart(productId, quantity, flavor, color);
      if (res.success && res.data) {
        set({ cart: res.data, isCartOpen: true });
        get().showToast('Artifact added to shopping bag', 'success');
      }
    } catch (err: any) {
      get().showToast(err.message || 'Failed to add item', 'error');
    } finally {
      set({ isCartLoading: false });
    }
  },

  updateCartQuantity: async (itemId, quantity) => {
    try {
      const res = await api.updateCartItem(itemId, quantity);
      if (res.success && res.data) {
        set({ cart: res.data });
      }
    } catch (err: any) {
      get().showToast(err.message || 'Failed to update quantity', 'error');
    }
  },

  removeCartItem: async (itemId) => {
    try {
      const res = await api.removeCartItem(itemId);
      if (res.success && res.data) {
        set({ cart: res.data });
        get().showToast('Item removed from bag', 'info');
      }
    } catch (err: any) {
      get().showToast(err.message || 'Failed to remove item', 'error');
    }
  },

  applyCoupon: async (code) => {
    try {
      const res = await api.applyCoupon(code);
      if (res.success && res.data) {
        set({ cart: res.data });
        get().showToast(res.message || 'Coupon code applied!', 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      get().showToast(err.message || 'Invalid coupon code', 'error');
      return false;
    }
  },

  loadWishlist: async () => {
    try {
      const res = await api.getWishlist();
      if (res.success && res.data) {
        set({ wishlistIds: res.data.productIds || [] });
      }
    } catch (err) {
      console.error('Error loading wishlist:', err);
    }
  },

  toggleWishlist: async (productId) => {
    const isSaved = get().wishlistIds.includes(productId);
    try {
      const res = await api.toggleWishlist(productId, isSaved);
      if (res.success && res.data) {
        set({ wishlistIds: res.data.productIds });
        get().showToast(isSaved ? 'Removed from wishlist' : 'Saved to your luxury wishlist', 'success');
      }
    } catch (err: any) {
      get().showToast(err.message || 'Error updating wishlist', 'error');
    }
  },

  setAgeVerified: (verified) => {
    if (verified) {
      localStorage.setItem('sultan_age_verified', 'true');
    } else {
      localStorage.removeItem('sultan_age_verified');
    }
    set({ isAgeVerified: verified });
  },

  setSearchOpen: (open) => set({ isSearchOpen: open }),

  setQuickViewProduct: (product) => set({ quickViewProduct: product }),

  showToast: (message, type = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }]
    }));

    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  },

  loadSettings: async () => {
    try {
      const res = await api.getSettings();
      if (res.success && res.data) {
        set({ settings: res.data });
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  }
}));
