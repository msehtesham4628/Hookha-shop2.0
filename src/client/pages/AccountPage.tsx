import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore.js';
import { api } from '../services/api.js';
import { getUserOrders } from '../services/firebase.js';
import { Order, Product } from '../../types/index.js';
import { ProductCard } from '../components/ProductCard.js';
import {
  Package,
  Heart,
  User as UserIcon,
  Shield,
  Truck,
  LogOut,
  MapPin,
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface AccountPageProps {
  initialTab?: string;
  onNavigate: (path: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ initialTab = 'orders', onNavigate }) => {
  const { user, isAuthenticated, logout, wishlistIds, showToast } = useStore();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Address edit state
  const [addressSaved, setAddressSaved] = useState(false);
  const [street, setStreet] = useState('9465 Wilshire Blvd, Suite 800');
  const [city, setCity] = useState('Beverly Hills');
  const [state, setState] = useState('CA');
  const [zip, setZip] = useState('90212');

  useEffect(() => {
    if (!isAuthenticated) {
      // Allow viewing or redirect
    }

    const loadAccountData = async () => {
      try {
        setLoading(true);
        const [orderRes, wishRes] = await Promise.all([
          api.getMyOrders().catch(() => ({ success: false, data: [] })),
          api.getWishlist().catch(() => ({ success: false, data: { items: [] } }))
        ]);

        let combinedOrders: Order[] = [];
        if (orderRes.success && orderRes.data) {
          combinedOrders = Array.isArray(orderRes.data) ? orderRes.data : (orderRes.data as any).orders || [];
        }

        // Also fetch from Firebase if user is authenticated
        if (user?.id) {
          try {
            const cloudOrders = await getUserOrders(user.id);
            if (cloudOrders && cloudOrders.length > 0) {
              const existingIds = new Set(combinedOrders.map(o => o.id));
              for (const co of cloudOrders) {
                if (!existingIds.has(co.id)) {
                  combinedOrders.push(co);
                }
              }
            }
          } catch (cloudErr) {
            console.warn('Firebase orders load notice:', cloudErr);
          }
        }

        setOrders(combinedOrders);

        if (wishRes.success && wishRes.data) {
          setWishlistProducts(wishRes.data.items || []);
        }
      } catch (err) {
        console.error('Failed to load account details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAccountData();
  }, [isAuthenticated]);

  if (!isAuthenticated && !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Sign In to Access Private Reserve</h2>
        <p className="text-xs text-stone-500">Access your historical orders, active shipments, and saved luxury items.</p>
        <button
          onClick={() => onNavigate('/auth/login')}
          className="bg-stone-900 text-white text-xs font-semibold px-6 py-2.5 rounded-xs"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-stone-50/50 py-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Header */}
        <div className="bg-white border border-stone-200 rounded-xs p-6 mb-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-900 text-amber-50 rounded-full flex items-center justify-center font-serif text-xl font-bold">
              {user?.firstName?.[0] || 'V'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                  {user?.firstName} {user?.lastName}
                </h1>
                {user?.role !== 'CUSTOMER' && (
                  <span className="bg-amber-100 text-amber-900 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-xs">
                    {user?.role.replace('_', ' ')}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">{user?.email} • Member Since 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user?.role !== 'CUSTOMER' && (
              <button
                onClick={() => onNavigate('/admin')}
                className="bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold px-4 py-2 rounded-xs transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Admin Suite</span>
              </button>
            )}
            <button
              onClick={() => { logout(); onNavigate('/'); }}
              className="text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xs transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Side Tabs */}
          <div className="lg:col-span-3 bg-white border border-stone-200 rounded-xs p-3 shadow-xs space-y-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors ${
                activeTab === 'orders' ? 'bg-amber-50 text-amber-900 border-l-2 border-amber-900' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Package className="w-4 h-4 text-amber-800" />
              <span>Orders & Shipments ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors ${
                activeTab === 'wishlist' ? 'bg-amber-50 text-amber-900 border-l-2 border-amber-900' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Heart className="w-4 h-4 text-amber-800" />
              <span>Luxury Wishlist ({wishlistIds.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors ${
                activeTab === 'addresses' ? 'bg-amber-50 text-amber-900 border-l-2 border-amber-900' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <MapPin className="w-4 h-4 text-amber-800" />
              <span>Delivery Addresses</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors ${
                activeTab === 'security' ? 'bg-amber-50 text-amber-900 border-l-2 border-amber-900' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-800" />
              <span>Security & Passcodes</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* 1. ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="bg-white border border-stone-200 rounded-xs p-6 shadow-xs space-y-6">
                <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
                  Historical Orders & Deliveries
                </h2>

                {orders.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Package className="w-10 h-10 text-stone-300 mx-auto" />
                    <p className="text-xs text-stone-500">No orders placed under this account yet.</p>
                    <button
                      onClick={() => onNavigate('/shop')}
                      className="bg-stone-900 text-white text-xs font-semibold px-4 py-2 rounded-xs"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-stone-200 rounded-xs p-5 hover:border-amber-700/40 transition-colors space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3 text-xs">
                          <div>
                            <span className="font-bold text-stone-900">Order #{order.orderNumber}</span>
                            <span className="text-stone-400 ml-2">Placed {new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider text-[10px]">
                              {order.status}
                            </span>
                            <span className="font-bold text-stone-900 font-sans">${order.grandTotal.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Items in order */}
                        <div className="space-y-2">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-xs">
                              <span className="text-stone-800 font-medium">{item.productName} <span className="text-stone-400">× {item.quantity}</span></span>
                              <span className="font-mono text-stone-900">${item.totalPrice.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-500 border-t border-stone-100">
                          <div className="flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-amber-800" />
                            <span>UPS Tracking: <strong className="font-mono text-stone-800">{order.trackingNumber || 'Assigned on dispatch'}</strong></span>
                          </div>
                          <button
                            onClick={() => onNavigate(`/order-success?orderId=${order.id}`)}
                            className="text-amber-900 font-semibold hover:underline flex items-center gap-1"
                          >
                            <span>View Live Order Dossier</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. WISHLIST TAB */}
            {activeTab === 'wishlist' && (
              <div className="bg-white border border-stone-200 rounded-xs p-6 shadow-xs space-y-6">
                <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
                  Saved Luxury Wishlist ({wishlistProducts.length})
                </h2>

                {wishlistProducts.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Heart className="w-10 h-10 text-stone-300 mx-auto" />
                    <p className="text-xs text-stone-500">Your wishlist is currently empty.</p>
                    <button
                      onClick={() => onNavigate('/shop')}
                      className="bg-stone-900 text-white text-xs font-semibold px-4 py-2 rounded-xs"
                    >
                      Browse Masterpieces
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {wishlistProducts.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onNavigate={(slug) => onNavigate(`/product/${slug}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className="bg-white border border-stone-200 rounded-xs p-6 shadow-xs space-y-6">
                <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
                  Saved Primary Address
                </h2>

                <form onSubmit={(e) => { e.preventDefault(); setAddressSaved(true); showToast('Address saved', 'success'); }} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2 rounded-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2 rounded-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">State / Zip</label>
                      <input
                        type="text"
                        value={`${state} ${zip}`}
                        onChange={(e) => { setState('CA'); setZip('90212'); }}
                        className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2 rounded-xs"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold px-4 py-2 rounded-xs"
                  >
                    Save Address
                  </button>
                </form>
              </div>
            )}

            {/* 4. SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="bg-white border border-stone-200 rounded-xs p-6 shadow-xs space-y-6">
                <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
                  Account Security & Multi-Factor Auth
                </h2>

                <div className="space-y-4 max-w-md text-xs">
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-stone-900">Email OTP 2FA</strong>
                      <span className="text-emerald-700 font-bold">ACTIVE</span>
                    </div>
                    <p className="text-stone-500">Secure one-time passcodes are sent to {user?.email} for passwordless sign in.</p>
                  </div>

                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-stone-900">SMS Carrier Verification</strong>
                      <span className="text-emerald-700 font-bold">VERIFIED</span>
                    </div>
                    <p className="text-stone-500">Fast mobile authorization via SMS OTP.</p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
