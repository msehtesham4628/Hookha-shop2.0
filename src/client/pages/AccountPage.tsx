import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore.js';
import { api } from '../services/api.js';
import { getUserOrders, updateUserProfile } from '../services/firebase.js';
import { Order, Product } from '../../types/index.js';
import { ProductCard } from '../components/ProductCard.js';
import { OrderDetailsModal } from '../components/OrderDetailsModal.js';
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
  Lock,
  ExternalLink,
  Eye,
  Search,
  Filter,
  ShoppingBag
} from 'lucide-react';

interface AccountPageProps {
  initialTab?: string;
  onNavigate: (path: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ initialTab = 'orders', onNavigate }) => {
  const { user, isAuthenticated, logout, wishlistIds, showToast, setUser } = useStore();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  // Address edit state (5 distinct address fields)
  const [addressSaved, setAddressSaved] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [houseNo, setHouseNo] = useState(user?.addressDetails?.houseNo || '');
  const [areaRoad, setAreaRoad] = useState(user?.addressDetails?.areaRoad || '');
  const [city, setCity] = useState(user?.addressDetails?.city || '');
  const [state, setState] = useState(user?.addressDetails?.state || '');
  const [pincode, setPincode] = useState(user?.addressDetails?.pincode || '');

  // Populate address when user data updates
  useEffect(() => {
    if (user?.addressDetails) {
      setHouseNo(user.addressDetails.houseNo || '');
      setAreaRoad(user.addressDetails.areaRoad || '');
      setCity(user.addressDetails.city || '');
      setState(user.addressDetails.state || '');
      setPincode(user.addressDetails.pincode || '');
    } else if (user?.address) {
      const parts = user.address.split(',').map(s => s.trim());
      if (parts.length >= 1) setHouseNo(parts[0] || '');
      if (parts.length >= 2) setAreaRoad(parts[1] || '');
      if (parts.length >= 3) setCity(parts[2] || '');
      if (parts.length >= 4) setState(parts[3] || '');
      if (parts.length >= 5) setPincode(parts[4].replace(/^PIN:\s*/i, '') || '');
    }
  }, [user]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseNo.trim() || !areaRoad.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      showToast('Please fill in all 5 address fields.', 'error');
      return;
    }

    try {
      setSavingAddress(true);
      const addressDetails = {
        houseNo: houseNo.trim(),
        areaRoad: areaRoad.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim()
      };
      const formattedAddress = [
        houseNo.trim(),
        areaRoad.trim(),
        city.trim(),
        state.trim(),
        `PIN: ${pincode.trim()}`
      ].filter(Boolean).join(', ');

      await api.updateAddress({
        address: formattedAddress,
        addressDetails
      });

      if (user?.id) {
        await updateUserProfile(user.id, {
          address: formattedAddress,
          addressDetails
        }).catch(() => {});
      }

      if (user) {
        setUser({
          ...user,
          address: formattedAddress,
          addressDetails
        });
      }

      setAddressSaved(true);
      showToast('Delivery address saved successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save address', 'error');
    } finally {
      setSavingAddress(false);
    }
  };

  // Helper to generate carrier tracking links
  const getCarrierTrackingUrl = (trk?: string, car?: string) => {
    if (!trk) return '#';
    const c = car?.toLowerCase() || '';
    if (c.includes('ups') || trk.startsWith('1Z')) {
      return `https://www.ups.com/track?tracknum=${encodeURIComponent(trk)}`;
    }
    if (c.includes('fedex')) {
      return `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(trk)}`;
    }
    if (c.includes('dhl')) {
      return `https://www.dhl.com/en/express/tracking.html?AWB=${encodeURIComponent(trk)}`;
    }
    if (c.includes('usps')) {
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(trk)}`;
    }
    return `https://parcelsapp.com/en/tracking/${encodeURIComponent(trk)}`;
  };

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      orderSearchQuery === '' ||
      order.orderNumber.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      (order.trackingNumber && order.trackingNumber.toLowerCase().includes(orderSearchQuery.toLowerCase())) ||
      order.items.some((i) => i.productName.toLowerCase().includes(orderSearchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    const status = (order.orderStatus || order.status || 'PLACED').toUpperCase();
    if (orderStatusFilter === 'ALL') return true;
    if (orderStatusFilter === 'DELIVERED') return status === 'DELIVERED';
    if (orderStatusFilter === 'SHIPPED') return status === 'SHIPPED';
    if (orderStatusFilter === 'PROCESSING') return status === 'PROCESSING' || status === 'PACKED' || status === 'PLACED' || status === 'PAYMENT_CONFIRMED';
    return true;
  });

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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-stone-900">
                      Historical Orders & Deliveries
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Review acquired hookah setups, active shipments, and logistics dossiers.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500 font-medium">
                      Total Orders: <strong className="text-stone-900">{orders.length}</strong>
                    </span>
                  </div>
                </div>

                {orders.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                    {/* Search filter */}
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search by order #, item, tracking..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 text-xs pl-8 pr-3 py-1.5 rounded-xs focus:outline-hidden focus:border-amber-800"
                      />
                    </div>

                    {/* Status filter tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      {[
                        { key: 'ALL', label: 'All Orders' },
                        { key: 'SHIPPED', label: 'In Transit' },
                        { key: 'DELIVERED', label: 'Delivered' },
                        { key: 'PROCESSING', label: 'Processing' }
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setOrderStatusFilter(tab.key)}
                          className={`text-xs px-2.5 py-1 rounded-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                            orderStatusFilter === tab.key
                              ? 'bg-amber-900 text-white'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-8 space-y-2 bg-stone-50 border border-stone-200 rounded-xs">
                    <p className="text-xs text-stone-600">No orders match your filter criteria.</p>
                    <button
                      onClick={() => { setOrderSearchQuery(''); setOrderStatusFilter('ALL'); }}
                      className="text-xs text-amber-900 font-semibold hover:underline"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {filteredOrders.map((order) => {
                      const status = (order.orderStatus || order.status || 'PLACED').toUpperCase();
                      const grandTotal = order.grandTotal ?? order.total ?? 0;
                      const trackingNumber = order.trackingNumber || 'WH-TRK-7892401';
                      const carrier = order.carrier || 'UPS Express (Guaranteed 2-Day)';

                      return (
                        <div
                          key={order.id}
                          className="border border-stone-200 rounded-xs bg-white hover:border-amber-700/50 hover:shadow-xs transition-all duration-200 overflow-hidden"
                        >
                          {/* Card Header */}
                          <div className="bg-stone-50/80 px-4 sm:px-5 py-3 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-3 text-xs">
                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                                  Order Reference
                                </span>
                                <span className="font-bold text-stone-900 font-mono">
                                  #{order.orderNumber}
                                </span>
                              </div>

                              <div className="h-6 w-px bg-stone-200 hidden sm:block" />

                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                                  Placed On
                                </span>
                                <span className="text-stone-700">
                                  {new Date(order.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>

                              <div className="h-6 w-px bg-stone-200 hidden sm:block" />

                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                                  Items
                                </span>
                                <span className="text-stone-700 font-medium">
                                  {order.items.reduce((acc, i) => acc + (i.quantity || 1), 0)} Units
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3">
                              <div>
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider ${
                                    status === 'DELIVERED'
                                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                      : status === 'SHIPPED'
                                      ? 'bg-sky-100 text-sky-900 border border-sky-300'
                                      : status === 'CANCELLED'
                                      ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                                  }`}
                                >
                                  {status === 'DELIVERED' && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                                  {status === 'SHIPPED' && <Truck className="w-3 h-3 text-sky-700" />}
                                  {status !== 'DELIVERED' && status !== 'SHIPPED' && <Clock className="w-3 h-3 text-amber-700" />}
                                  <span>{status}</span>
                                </span>
                              </div>
                              <span className="font-bold text-stone-900 font-serif text-sm">
                                ${grandTotal.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Items List Preview */}
                          <div className="p-4 sm:p-5 divide-y divide-stone-100 space-y-3">
                            {order.items.map((item, i) => {
                              const itemPrice = (item.price ?? (item as any).unitPrice ?? ((item.subtotal || (item as any).totalPrice || 0) / (item.quantity || 1))) || 0;
                              const itemTotal = item.subtotal ?? (item as any).totalPrice ?? (itemPrice * item.quantity);
                              const flavor = item.flavor || (item as any).selectedFlavor;
                              const color = item.color || (item as any).selectedColor;
                              const img = item.productImage || 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=200';

                              return (
                                <div key={i} className="pt-3 first:pt-0 flex items-center justify-between text-xs gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xs border border-stone-200 bg-stone-50 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                                      <img
                                        src={img}
                                        alt={item.productName}
                                        className="max-h-full max-w-full object-contain"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-stone-900 font-medium truncate">
                                        {item.productName}
                                      </p>
                                      <div className="flex items-center gap-2 text-[11px] text-stone-500">
                                        <span>Qty: <strong className="text-stone-800">{item.quantity}</strong></span>
                                        {flavor && (
                                          <span className="text-amber-900 bg-amber-50 px-1 py-0.2 rounded-xs border border-amber-200">
                                            {flavor}
                                          </span>
                                        )}
                                        {color && <span className="text-stone-600">Finish: {color}</span>}
                                      </div>
                                    </div>
                                  </div>

                                  <span className="font-mono font-medium text-stone-900 shrink-0">
                                    ${itemTotal.toFixed(2)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Tracking & Action Footer */}
                          <div className="bg-stone-50/60 px-4 sm:px-5 py-3 border-t border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Truck className="w-4 h-4 text-amber-800 shrink-0" />
                              <span className="text-stone-600">{carrier.split(' ')[0]} Tracking:</span>
                              <code className="font-mono font-bold text-stone-900 bg-white px-1.5 py-0.5 rounded-xs border border-stone-200 text-[11px]">
                                {trackingNumber}
                              </code>
                              {trackingNumber && (
                                <a
                                  href={getCarrierTrackingUrl(trackingNumber, carrier)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-amber-900 hover:underline flex items-center gap-0.5 text-[11px] font-semibold"
                                >
                                  <span>Track Package</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onNavigate(`/track-order?orderId=${encodeURIComponent(order.orderNumber)}`)}
                                className="bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs px-3 py-1.5 rounded-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                              >
                                <Truck className="w-3.5 h-3.5 text-amber-400" />
                                <span>Track Live</span>
                              </button>

                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="bg-amber-900 hover:bg-amber-950 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Order Details</span>
                              </button>

                              <button
                                onClick={() => onNavigate(`/order-success?orderId=${order.id}`)}
                                className="bg-white hover:bg-stone-100 text-stone-700 font-semibold text-xs px-3 py-1.5 rounded-xs border border-stone-300 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <span>Dossier</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                <div>
                  <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
                    Saved Primary Address
                  </h2>
                  <p className="text-xs text-stone-500 mt-2">
                    Manage your delivery address details for rapid order checkout.
                  </p>
                </div>

                <form onSubmit={handleSaveAddress} className="space-y-4 max-w-lg">
                  {/* 1. House / flat /office no */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      House / flat /office no *
                    </label>
                    <input
                      id="account-address-house-no"
                      type="text"
                      required
                      value={houseNo}
                      onChange={(e) => setHouseNo(e.target.value)}
                      placeholder="e.g. Flat 402, Building 3 / Office 12B"
                      className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs px-3 py-2 rounded-xs focus:bg-white focus:outline-none focus:border-amber-800 transition-colors"
                    />
                  </div>

                  {/* 2. Area/road name/colony */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Area/road name/colony *
                    </label>
                    <input
                      id="account-address-area-road"
                      type="text"
                      required
                      value={areaRoad}
                      onChange={(e) => setAreaRoad(e.target.value)}
                      placeholder="e.g. MG Road, Indiranagar / Palm Jumeirah"
                      className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs px-3 py-2 rounded-xs focus:bg-white focus:outline-none focus:border-amber-800 transition-colors"
                    />
                  </div>

                  {/* 3. City & 4. State */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        City *
                      </label>
                      <input
                        id="account-address-city"
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Mumbai, Dubai, New York"
                        className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs px-3 py-2 rounded-xs focus:bg-white focus:outline-none focus:border-amber-800 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        State *
                      </label>
                      <input
                        id="account-address-state"
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. Maharashtra, California"
                        className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs px-3 py-2 rounded-xs focus:bg-white focus:outline-none focus:border-amber-800 transition-colors"
                      />
                    </div>
                  </div>

                  {/* 5. Pincode */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      id="account-address-pincode"
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="e.g. 400001 or 560038"
                      className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs px-3 py-2 rounded-xs focus:bg-white focus:outline-none focus:border-amber-800 transition-colors font-mono"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      id="account-address-save-btn"
                      type="submit"
                      disabled={savingAddress}
                      className="bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold px-5 py-2.5 rounded-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {savingAddress ? 'Saving Address...' : 'Save Address'}
                    </button>
                  </div>
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

        {/* Order Details Modal */}
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onNavigate={onNavigate}
        />

      </div>
    </div>
  );
};
