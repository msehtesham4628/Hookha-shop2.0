import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore.js';
import { api } from '../services/api.js';
import { Order, Product } from '../../types/index.js';
import { OrderDetailsModal } from '../components/OrderDetailsModal.js';
import {
  Package,
  Heart,
  User as UserIcon,
  ShieldCheck,
  Truck,
  MapPin,
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle2,
  ExternalLink,
  ShoppingBag,
  ArrowRight,
  RotateCcw,
  Plus,
  Settings,
  Flame,
  Award,
  CreditCard,
  Phone,
  Search
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, logout, wishlistIds, addToCart, showToast, isAdmin } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [popularEssentials, setPopularEssentials] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Guest order lookup state
  const [lookupOrderId, setLookupOrderId] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        setLoading(true);

        const promises: Promise<any>[] = [
          api.getProducts({ limit: 4, featured: true }).catch(() => ({ success: false, data: { products: [] } }))
        ];

        if (isAuthenticated) {
          promises.push(api.getMyOrders().catch(() => ({ success: false, data: [] })));
          promises.push(api.getWishlist().catch(() => ({ success: false, data: { items: [] } })));
        }

        const [prodRes, orderRes, wishRes] = await Promise.all(promises);

        if (isMounted) {
          if (prodRes.success && prodRes.data?.products) {
            setPopularEssentials(prodRes.data.products);
          }

          if (orderRes?.success && orderRes.data) {
            const rawOrders = Array.isArray(orderRes.data) ? orderRes.data : (orderRes.data as any).orders || [];
            setOrders(rawOrders);
          }

          if (wishRes?.success && wishRes.data) {
            setWishlistProducts(wishRes.data.items || []);
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupOrderId.trim()) {
      showToast('Please enter an order or tracking number', 'error');
      return;
    }
    onNavigate(`/track-order?query=${encodeURIComponent(lookupOrderId.trim())}`);
  };

  const latestOrder = orders.length > 0 ? orders[0] : null;

  // Tracking link helper
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

  // If user is not authenticated, show guest dashboard with member preview and order tracker
  if (!isAuthenticated && !user) {
    return (
      <div className="min-h-screen bg-stone-50/60 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          {/* Guest Welcome Banner */}
          <div className="bg-stone-900 text-white rounded-xs p-8 sm:p-10 shadow-lg relative overflow-hidden mb-8">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 bg-radial from-amber-500 to-transparent pointer-events-none" />
            <div className="relative z-10 max-w-xl">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-amber-400 bg-amber-950/80 border border-amber-800/60 px-2.5 py-1 rounded-xs mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Member Dashboard Portal
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                Experience Fumare Private Reserve
              </h1>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-6">
                Sign in to your member dashboard to track live hookah shipments, access dark leaf tobacco reservations, and manage verified adult delivery profiles.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate('/auth/login')}
                  className="bg-amber-600 hover:bg-amber-700 text-stone-950 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xs transition-colors cursor-pointer shadow-sm"
                >
                  Sign In to Dashboard
                </button>
                <button
                  onClick={() => onNavigate('/auth/register')}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs px-5 py-3 rounded-xs transition-colors cursor-pointer"
                >
                  Create Member Account
                </button>
              </div>
            </div>
          </div>

          {/* Quick Order Lookup for Non-Logged-in Shoppers */}
          <div className="bg-white border border-stone-200 rounded-xs p-6 sm:p-8 shadow-xs mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Truck className="w-5 h-5 text-amber-800" />
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Track a Guest Order
              </h2>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              Placed an order without an account? Enter your order number (e.g. WH-1234) or carrier tracking code to check real-time courier dispatch status.
            </p>
            <form onSubmit={handleLookupSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={lookupOrderId}
                  onChange={(e) => setLookupOrderId(e.target.value)}
                  placeholder="Enter Order # or Tracking Number..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xs pl-9 pr-4 py-2.5 text-xs text-stone-900 focus:outline-hidden focus:border-amber-800"
                />
              </div>
              <button
                type="submit"
                className="bg-stone-900 hover:bg-amber-900 text-white font-semibold text-xs px-6 py-2.5 rounded-xs transition-colors cursor-pointer shrink-0"
              >
                Track Shipment
              </button>
            </form>
          </div>

          {/* Member Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-stone-200 rounded-xs p-5 shadow-2xs text-center space-y-2">
              <div className="w-10 h-10 bg-amber-50 text-amber-900 rounded-full flex items-center justify-center mx-auto">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-xs">Live Shipment Tracking</h3>
              <p className="text-[11px] text-stone-500 leading-normal">
                Real-time UPS/FedEx dispatch tracking, adult signature notices, and delivery dossiers.
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-xs p-5 shadow-2xs text-center space-y-2">
              <div className="w-10 h-10 bg-amber-50 text-amber-900 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-xs">Curated Wishlists</h3>
              <p className="text-[11px] text-stone-500 leading-normal">
                Save rare Russian stems, hand-blown bohemian bases, and limited batch shisha blends.
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-xs p-5 shadow-2xs text-center space-y-2">
              <div className="w-10 h-10 bg-amber-50 text-amber-900 rounded-full flex items-center justify-center mx-auto">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-xs">Loyalty & Wholesale Perks</h3>
              <p className="text-[11px] text-stone-500 leading-normal">
                Earn reward points on every bowl or coal box, with verified B2B wholesale pricing.
              </p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/60 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Switch Alert (if user has staff/admin privileges) */}
        {isAdmin && (
          <div className="mb-6 bg-gradient-to-r from-amber-950 via-stone-900 to-stone-900 text-amber-100 border border-amber-800/60 rounded-xs p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  Executive Administrative Rights Active
                  <span className="bg-amber-500 text-stone-950 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-xs">
                    {user?.role?.replace('_', ' ') || 'ADMIN'}
                  </span>
                </p>
                <p className="text-[11px] text-stone-400">
                  You are viewing the Customer Dashboard. You also have full access to catalog, inventory, and order fulfillment.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('/admin')}
              className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Launch Admin Suite</span>
            </button>
          </div>
        )}

        {/* Dashboard Header Profile Banner */}
        <div className="bg-white border border-stone-200 rounded-xs p-6 sm:p-8 shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-stone-900 text-amber-400 rounded-full flex items-center justify-center font-serif text-2xl font-bold border-2 border-amber-500/40 shadow-xs">
              {user?.firstName?.[0] || 'M'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  Welcome, {user?.firstName} {user?.lastName}
                </h1>
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs">
                  <Award className="w-3 h-3 text-amber-700" />
                  VIP Reserve Member
                </span>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-xs">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  21+ Verified
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {user?.email} • Member ID: #{user?.id?.slice(0, 8).toUpperCase() || 'FUM-8921'}
              </p>
            </div>
          </div>

          {/* Quick Hub Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => onNavigate('/account?tab=orders')}
              className="bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold px-3.5 py-2 rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Package className="w-3.5 h-3.5 text-stone-600" />
              <span>All Orders ({orders.length})</span>
            </button>
            <button
              onClick={() => onNavigate('/account?tab=profile')}
              className="bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold px-3.5 py-2 rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 text-stone-600" />
              <span>Edit Account</span>
            </button>
            <button
              onClick={() => onNavigate('/shop')}
              className="bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold px-4 py-2 rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>Browse Catalog</span>
            </button>
          </div>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          
          {/* Card 1: Total Orders */}
          <div
            onClick={() => onNavigate('/account?tab=orders')}
            className="bg-white border border-stone-200 hover:border-amber-600/60 rounded-xs p-5 shadow-2xs transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold tracking-wider uppercase text-stone-500">
                Total Orders
              </span>
              <div className="w-8 h-8 rounded-full bg-amber-50 group-hover:bg-amber-100 text-amber-900 flex items-center justify-center transition-colors">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-stone-900 font-serif">
              {orders.length}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
              <span>{latestOrder ? `Latest: #${latestOrder.orderNumber}` : 'No orders yet'}</span>
              <span className="text-amber-800 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-semibold">
                View <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Card 2: Luxury Wishlist */}
          <div
            onClick={() => onNavigate('/account?tab=wishlist')}
            className="bg-white border border-stone-200 hover:border-amber-600/60 rounded-xs p-5 shadow-2xs transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold tracking-wider uppercase text-stone-500">
                Saved Wishlist
              </span>
              <div className="w-8 h-8 rounded-full bg-rose-50 group-hover:bg-rose-100 text-rose-800 flex items-center justify-center transition-colors">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-stone-900 font-serif">
              {wishlistIds.length}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
              <span>Saved luxury setups</span>
              <span className="text-amber-800 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-semibold">
                Review <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Card 3: Loyalty & Perks */}
          <div className="bg-white border border-stone-200 rounded-xs p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold tracking-wider uppercase text-stone-500">
                Lounge Points
              </span>
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-900 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-stone-900 font-serif">
              {Math.max(120, orders.length * 85)} pts
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
              <span className="text-emerald-700 font-medium">Free Air Shipping @ $150</span>
              <span className="text-stone-400">Tier: Gold</span>
            </div>
          </div>

          {/* Card 4: Primary Address */}
          <div
            onClick={() => onNavigate('/account?tab=addresses')}
            className="bg-white border border-stone-200 hover:border-amber-600/60 rounded-xs p-5 shadow-2xs transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold tracking-wider uppercase text-stone-500">
                Default Address
              </span>
              <div className="w-8 h-8 rounded-full bg-blue-50 group-hover:bg-blue-100 text-blue-800 flex items-center justify-center transition-colors">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xs font-semibold text-stone-900 truncate">
              {user?.addressDetails?.city ? `${user.addressDetails.city}, ${user.addressDetails.state}` : (user?.address || 'Not specified')}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
              <span className="truncate">{user?.addressDetails?.pincode ? `ZIP: ${user.addressDetails.pincode}` : 'Standard Shipping'}</span>
              <span className="text-amber-800 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-semibold shrink-0">
                Edit <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

        </div>

        {/* Active Shipment Progress (if recent order exists) */}
        {latestOrder && (
          <div className="bg-white border border-stone-200 rounded-xs p-6 shadow-xs mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-base font-bold text-stone-900">
                      Live Shipment Tracker
                    </h2>
                    <span className="text-xs font-mono font-bold text-stone-600">
                      #{latestOrder.orderNumber}
                    </span>
                    <span className="bg-amber-100 text-amber-950 font-bold text-[10px] uppercase px-2 py-0.5 rounded-xs">
                      {(latestOrder.orderStatus || latestOrder.status || 'PROCESSING').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Carrier: <strong className="text-stone-700">{latestOrder.carrier || 'UPS Express (Adult Signature Required)'}</strong>
                    {latestOrder.trackingNumber && (
                      <> • Tracking: <span className="font-mono text-stone-900 font-semibold">{latestOrder.trackingNumber}</span></>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {latestOrder.trackingNumber && (
                  <a
                    href={getCarrierTrackingUrl(latestOrder.trackingNumber, latestOrder.carrier)}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold px-3 py-1.5 rounded-xs transition-colors flex items-center gap-1"
                  >
                    <span>Carrier Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <button
                  onClick={() => setSelectedOrder(latestOrder)}
                  className="bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xs transition-colors cursor-pointer"
                >
                  Order Details
                </button>
              </div>
            </div>

            {/* Visual Shipment Timeline */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {[
                { step: '1', title: 'Order Confirmed', completed: true },
                { step: '2', title: '21+ Verification', completed: true },
                { step: '3', title: 'Packed & Dispatched', completed: ['SHIPPED', 'DELIVERED'].includes((latestOrder.orderStatus || latestOrder.status || '').toUpperCase()) },
                { step: '4', title: 'Delivered', completed: (latestOrder.orderStatus || latestOrder.status || '').toUpperCase() === 'DELIVERED' }
              ].map((stage, idx) => (
                <div key={stage.step} className="text-center relative">
                  <div className="flex items-center justify-center mb-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      stage.completed ? 'bg-emerald-600 text-white shadow-xs' : 'bg-stone-100 text-stone-400 border border-stone-200'
                    }`}>
                      {stage.completed ? <CheckCircle2 className="w-4 h-4" /> : stage.step}
                    </div>
                  </div>
                  <p className={`text-[11px] font-semibold ${stage.completed ? 'text-stone-900' : 'text-stone-400'}`}>
                    {stage.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Two-Column Layout: Recent Orders & Quick Reorder */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* Left Column (8 cols): Recent Orders */}
          <div className="lg:col-span-8 bg-white border border-stone-200 rounded-xs p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-amber-800" />
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Recent Orders
                </h3>
              </div>
              <button
                onClick={() => onNavigate('/account?tab=orders')}
                className="text-xs font-semibold text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Order History</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <Package className="w-10 h-10 text-stone-300 mx-auto" />
                <p className="text-xs text-stone-500">You have not placed any orders yet.</p>
                <button
                  onClick={() => onNavigate('/shop')}
                  className="bg-stone-900 text-white text-xs font-semibold px-4 py-2 rounded-xs"
                >
                  Explore Hookah Catalog
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 3).map((order) => {
                  const status = (order.orderStatus || order.status || 'PLACED').toUpperCase();
                  const total = order.grandTotal ?? order.total ?? 0;
                  return (
                    <div
                      key={order.id}
                      className="border border-stone-200 rounded-xs p-4 hover:border-amber-700/50 hover:bg-stone-50/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-stone-900">
                            #{order.orderNumber}
                          </span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs ${
                            status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : status === 'SHIPPED'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-amber-50 text-amber-900 border border-amber-200'
                          }`}>
                            {status}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500">
                          Placed on {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items
                        </p>
                        <p className="text-xs font-bold text-stone-900">
                          ${total.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold px-3 py-1.5 rounded-xs transition-colors cursor-pointer"
                        >
                          Invoice & Details
                        </button>
                        <button
                          onClick={() => onNavigate(`/track-order?orderId=${encodeURIComponent(order.orderNumber)}`)}
                          className="bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xs transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column (4 cols): Quick Reorder Essentials */}
          <div className="lg:col-span-4 bg-white border border-stone-200 rounded-xs p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 border-b border-stone-100 pb-4 mb-4">
                <Flame className="w-5 h-5 text-amber-700" />
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Lounge Essentials
                </h3>
              </div>
              <p className="text-xs text-stone-500 mb-4">
                Replenish premium coconut charcoals, Russian clay bowls, or top-rated shisha dark leaf blends with 1 click.
              </p>

              <div className="space-y-3">
                {popularEssentials.slice(0, 3).map((prod) => (
                  <div key={prod.id} className="flex items-center justify-between gap-3 p-2 rounded-xs border border-stone-100 bg-stone-50/50">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {prod.images?.[0]?.url ? (
                        <img
                          src={prod.images[0].url}
                          alt={prod.name}
                          className="w-10 h-10 object-cover rounded-xs border border-stone-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-stone-200 rounded-xs shrink-0 flex items-center justify-center text-[10px] font-bold text-stone-500">
                          FUM
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-stone-900 truncate">
                          {prod.name}
                        </p>
                        <p className="text-[11px] font-bold text-amber-900">
                          ${prod.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        addToCart(prod.id, 1);
                        showToast(`Added ${prod.name} to cart`, 'success');
                      }}
                      className="bg-stone-900 hover:bg-amber-900 text-white p-2 rounded-xs transition-colors shrink-0 cursor-pointer"
                      title="Add to Bag"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100">
              <button
                onClick={() => onNavigate('/shop')}
                className="w-full bg-stone-100 hover:bg-amber-50 text-stone-800 hover:text-amber-900 text-xs font-semibold py-2.5 rounded-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Browse All Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Account Shortcuts Section */}
        <div className="bg-white border border-stone-200 rounded-xs p-6 shadow-xs">
          <h3 className="font-serif text-base font-bold text-stone-900 mb-4">
            Account Management Shortcuts
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => onNavigate('/account?tab=profile')}
              className="p-4 rounded-xs border border-stone-100 bg-stone-50 hover:bg-stone-100 transition-colors text-left space-y-1.5 cursor-pointer"
            >
              <UserIcon className="w-4 h-4 text-amber-800" />
              <p className="text-xs font-bold text-stone-900">Personal Profile</p>
              <p className="text-[11px] text-stone-500">Update name, phone & 21+ identity</p>
            </button>

            <button
              onClick={() => onNavigate('/account?tab=addresses')}
              className="p-4 rounded-xs border border-stone-100 bg-stone-50 hover:bg-stone-100 transition-colors text-left space-y-1.5 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-amber-800" />
              <p className="text-xs font-bold text-stone-900">Address Book</p>
              <p className="text-[11px] text-stone-500">Saved shipping & billing destinations</p>
            </button>

            <button
              onClick={() => onNavigate('/account?tab=security')}
              className="p-4 rounded-xs border border-stone-100 bg-stone-50 hover:bg-stone-100 transition-colors text-left space-y-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-800" />
              <p className="text-xs font-bold text-stone-900">Security & Access</p>
              <p className="text-[11px] text-stone-500">Passcode, sessions & credentials</p>
            </button>

            <button
              onClick={() => onNavigate('/wholesale')}
              className="p-4 rounded-xs border border-stone-100 bg-stone-50 hover:bg-stone-100 transition-colors text-left space-y-1.5 cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-800" />
              <p className="text-xs font-bold text-stone-900">Wholesale B2B</p>
              <p className="text-[11px] text-stone-500">Commercial lounge discounts</p>
            </button>
          </div>
        </div>

      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};
