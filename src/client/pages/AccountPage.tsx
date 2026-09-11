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
  ShoppingBag,
  Bell,
  LayoutDashboard,
  Check,
  AlertTriangle,
  Award,
  Settings,
  Trash2,
  FileText,
  X
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

  // Sync activeTab when initialTab prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  // Delete Account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteReason, setDeleteReason] = useState('Personal privacy request');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Address edit state (5 distinct address fields)
  const [addressSaved, setAddressSaved] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [houseNo, setHouseNo] = useState(user?.addressDetails?.houseNo || '');
  const [areaRoad, setAreaRoad] = useState(user?.addressDetails?.areaRoad || '');
  const [city, setCity] = useState(user?.addressDetails?.city || '');
  const [state, setState] = useState(user?.addressDetails?.state || '');
  const [pincode, setPincode] = useState(user?.addressDetails?.pincode || '');

  // Profile edit state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Communication preferences state
  const [prefEmailOrders, setPrefEmailOrders] = useState(true);
  const [prefEmailDrops, setPrefEmailDrops] = useState(true);
  const [prefSmsUpdates, setPrefSmsUpdates] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Sync state when user changes
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');

      if (user.addressDetails) {
        setHouseNo(user.addressDetails.houseNo || '');
        setAreaRoad(user.addressDetails.areaRoad || '');
        setCity(user.addressDetails.city || '');
        setState(user.addressDetails.state || '');
        setPincode(user.addressDetails.pincode || '');
      } else if (user.address) {
        const parts = user.address.split(',').map(s => s.trim());
        if (parts.length >= 1) setHouseNo(parts[0] || '');
        if (parts.length >= 2) setAreaRoad(parts[1] || '');
        if (parts.length >= 3) setCity(parts[2] || '');
        if (parts.length >= 4) setState(parts[3] || '');
        if (parts.length >= 5) setPincode(parts[4].replace(/^PIN:\s*/i, '') || '');
      }
    }
  }, [user]);

  // Update activeTab when initialTab prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      showToast('First name is required', 'error');
      return;
    }

    try {
      setSavingProfile(true);
      const res = await api.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim()
      });

      if (user) {
        const updated = {
          ...user,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim()
        };
        setUser(updated);
      }

      if (user?.id) {
        await updateUserProfile(user.id, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim()
        }).catch(() => {});
      }

      showToast('Profile information updated successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Please enter your current password', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    try {
      setChangingPassword(true);
      await api.changePassword({
        currentPassword,
        newPassword
      });
      showToast('Password updated successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message || 'Failed to update password', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseNo.trim() || !areaRoad.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      showToast('Please fill in all address fields.', 'error');
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

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingPrefs(true);
      await api.updateProfile({
        preferences: {
          emailOrders: prefEmailOrders,
          emailDrops: prefEmailDrops,
          smsUpdates: prefSmsUpdates
        }
      });
      showToast('Notification preferences updated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save preferences', 'error');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleDeleteAccount = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type "DELETE" in capital letters into the field to confirm.');
      return;
    }

    try {
      setIsDeletingAccount(true);
      setDeleteError('');
      const res = await api.deleteAccount({
        password: deletePassword.trim() || undefined,
        reason: deleteReason
      });

      if (res.success) {
        showToast('Your account and personal data have been permanently removed.', 'success');
        setShowDeleteModal(false);
        setDeletePassword('');
        setDeleteConfirmationText('');
        await logout();
        onNavigate('/');
      } else {
        setDeleteError(res.message || 'Failed to delete account. Please verify password if set.');
      }
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account. Please verify credentials or contact concierge support.');
    } finally {
      setIsDeletingAccount(false);
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
            const fbOrders = await getUserOrders(user.id);
            if (Array.isArray(fbOrders) && fbOrders.length > 0) {
              const existingIds = new Set(combinedOrders.map(o => o.id));
              const missing = fbOrders.filter(o => !existingIds.has(o.id));
              combinedOrders = [...combinedOrders, ...missing];
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

    if (isAuthenticated) {
      loadAccountData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  if (!isAuthenticated && !user) {
    return (
      <div className="min-h-screen bg-stone-50/60 py-16 flex items-center justify-center">
        <div className="max-w-md w-full mx-4 bg-white border border-stone-200 rounded-xs p-8 shadow-sm text-center space-y-5">
          <div className="w-12 h-12 bg-stone-900 text-amber-400 rounded-full flex items-center justify-center mx-auto">
            <UserIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-stone-900">
              Sign In to Your Account
            </h1>
            <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
              Access your historical orders, active shipments, delivery address book, and private reserve settings.
            </p>
          </div>
          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => onNavigate('/auth/login')}
              className="w-full bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold py-2.5 px-4 rounded-xs transition-colors cursor-pointer shadow-xs"
            >
              Sign In to Account
            </button>
            <button
              onClick={() => onNavigate('/auth/register')}
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold py-2.5 px-4 rounded-xs transition-colors cursor-pointer"
            >
              Create New Account
            </button>
          </div>
          <div className="border-t border-stone-100 pt-4">
            <button
              onClick={() => onNavigate('/track-order')}
              className="text-xs text-amber-900 font-semibold hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Track a guest order without signing in</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-stone-50/50 py-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Header */}
        <div className="bg-white border border-stone-200 rounded-xs p-6 mb-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-900 text-amber-50 rounded-full flex items-center justify-center font-serif text-xl font-bold shrink-0">
              {user?.firstName?.[0] || 'V'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                  {user?.firstName} {user?.lastName}
                </h1>
                <span className="bg-amber-100 text-amber-900 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-xs">
                  {user?.role?.replace('_', ' ') || 'CUSTOMER'}
                </span>
                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-xs">
                  21+ Verified
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">{user?.email} • Member ID: #{user?.id?.slice(0, 8).toUpperCase() || 'FUM-8921'}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold px-4 py-2 rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
              <span>Go to Dashboard</span>
            </button>

            {user?.role !== 'CUSTOMER' && (
              <button
                onClick={() => onNavigate('/admin')}
                className="bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold px-4 py-2 rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Admin Suite</span>
              </button>
            )}

            <button
              onClick={() => { logout(); onNavigate('/'); }}
              className="text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xs transition-colors flex items-center gap-1 cursor-pointer"
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'orders' ? 'bg-amber-50 text-amber-900 border-l-2 border-amber-900' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Package className="w-4 h-4 text-amber-800" />
              <span>Orders & Shipments ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'profile' ? 'bg-amber-50 text-amber-900 border-l-2 border-amber-900' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <UserIcon className="w-4 h-4 text-amber-800" />
              <span>Personal Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'addresses' ? 'bg-amber-50 text-amber-900 border-l-2 border-amber-900' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <MapPin className="w-4 h-4 text-amber-800" />
              <span>Delivery Addresses</span>
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'wishlist' ? 'bg-amber-50 text-amber-900 border-l-2 border-amber-900' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Heart className="w-4 h-4 text-amber-800" />
              <span>Luxury Wishlist ({wishlistIds.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'security' ? 'bg-amber-50 text-amber-900 border-l-2 border-amber-900' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-800" />
              <span>Security & Passcodes</span>
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'preferences' ? 'bg-amber-50 text-amber-900 border-l-2 border-amber-900' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Bell className="w-4 h-4 text-amber-800" />
              <span>Alerts & Notifications</span>
            </button>

            <button
              id="account-settings-tab-btn"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'settings' ? 'bg-amber-50 text-amber-900 border-l-2 border-amber-900' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Settings className="w-4 h-4 text-amber-800" />
              <span>Settings & Privacy</span>
            </button>

            <div className="border-t border-stone-100 my-2 pt-2">
              <button
                onClick={() => onNavigate('/dashboard')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xs text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-stone-400" />
                <span>Return to Dashboard</span>
              </button>
            </div>
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
                      className="bg-stone-900 text-white text-xs font-semibold px-4 py-2 rounded-xs cursor-pointer hover:bg-amber-900 transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-8 space-y-2 bg-stone-50 border border-stone-200 rounded-xs">
                    <p className="text-xs text-stone-600">No orders match your filter criteria.</p>
                    <button
                      onClick={() => { setOrderSearchQuery(''); setOrderStatusFilter('ALL'); }}
                      className="text-xs text-amber-900 font-semibold hover:underline cursor-pointer"
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

                            <div className="flex items-center gap-3">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xs border ${
                                  status === 'DELIVERED'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : status === 'SHIPPED'
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : 'bg-amber-50 text-amber-900 border-amber-200'
                                }`}
                              >
                                {status}
                              </span>
                              <span className="font-serif font-bold text-sm text-stone-900">
                                ${grandTotal.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Items Preview */}
                          <div className="p-4 sm:p-5 space-y-3">
                            <div className="space-y-2">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-stone-50 last:border-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-stone-900">{item.quantity || 1}x</span>
                                    <span className="text-stone-700 font-medium">{item.productName}</span>
                                  </div>
                                  <span className="font-mono text-stone-600 font-semibold">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>

                            {/* Actions bar */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
                              <div className="text-[11px] text-stone-500">
                                Tracking: <span className="font-mono text-stone-800 font-semibold">{trackingNumber}</span> ({carrier})
                              </div>
                              <div className="flex items-center gap-2">
                                <a
                                  href={getCarrierTrackingUrl(trackingNumber, carrier)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-stone-700 hover:text-amber-900 font-semibold flex items-center gap-1 bg-stone-100 px-3 py-1.5 rounded-xs"
                                >
                                  <span>Courier Link</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                                <button
                                  onClick={() => setSelectedOrder(order)}
                                  className="text-xs bg-stone-900 hover:bg-amber-900 text-white font-semibold px-3.5 py-1.5 rounded-xs transition-colors cursor-pointer"
                                >
                                  Full Dossier
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 2. PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="bg-white border border-stone-200 rounded-xs p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
                    Personal Profile & Identity
                  </h2>
                  <p className="text-xs text-stone-500 mt-2">
                    Update your account details and contact information for order communications and age verification.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs px-3 py-2 rounded-xs focus:bg-white focus:outline-hidden focus:border-amber-800 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs px-3 py-2 rounded-xs focus:bg-white focus:outline-hidden focus:border-amber-800 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full bg-stone-100 border border-stone-200 text-stone-500 text-xs px-3 py-2 rounded-xs cursor-not-allowed"
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      Email address is locked for account verification security.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Phone Number (for Courier SMS Dispatch)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs px-3 py-2 rounded-xs focus:bg-white focus:outline-hidden focus:border-amber-800 transition-colors"
                    />
                  </div>

                  <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xs flex items-center gap-2 text-xs text-amber-900">
                    <Shield className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Age verification status: <strong>Adult 21+ Verified</strong> on file.</span>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold px-5 py-2.5 rounded-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {savingProfile ? 'Saving Changes...' : 'Save Profile'}
                    </button>
                  </div>
                </form>
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
                    Manage your delivery address details for rapid order checkout and adult signature confirmation.
                  </p>
                </div>

                <form onSubmit={handleSaveAddress} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      House / Flat / Suite / Office No *
                    </label>
                    <input
                      id="account-address-house-no"
                      type="text"
                      required
                      value={houseNo}
                      onChange={(e) => setHouseNo(e.target.value)}
                      placeholder="e.g. Apt 4B / Suite 300"
                      className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs px-3 py-2 rounded-xs focus:bg-white focus:outline-hidden focus:border-amber-800 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Street / Area / Colony *
                    </label>
                    <input
                      id="account-address-area-road"
                      type="text"
                      required
                      value={areaRoad}
                      onChange={(e) => setAreaRoad(e.target.value)}
                      placeholder="e.g. 346 Anthony Trail / Northbrook"
                      className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs px-3 py-2 rounded-xs focus:bg-white focus:outline-hidden focus:border-amber-800 transition-colors"
                    />
                  </div>

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
                        placeholder="e.g. Chicago, New York, Dallas"
                        className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs px-3 py-2 rounded-xs focus:bg-white focus:outline-hidden focus:border-amber-800 transition-colors"
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
                        placeholder="e.g. IL, NY, TX"
                        className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs px-3 py-2 rounded-xs focus:bg-white focus:outline-hidden focus:border-amber-800 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Postal Code / ZIP *
                    </label>
                    <input
                      id="account-address-pincode"
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="e.g. 60062"
                      className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs px-3 py-2 rounded-xs focus:bg-white focus:outline-hidden focus:border-amber-800 transition-colors font-mono"
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

            {/* 4. WISHLIST TAB */}
            {activeTab === 'wishlist' && (
              <div className="bg-white border border-stone-200 rounded-xs p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-stone-900">
                      Luxury Wishlist
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Custom curated collection of premium hookahs, bowls, and shisha reserves.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-amber-900">
                    {wishlistIds.length} Saved Items
                  </span>
                </div>

                {wishlistProducts.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Heart className="w-10 h-10 text-stone-300 mx-auto" />
                    <p className="text-xs text-stone-500">Your luxury wishlist is currently empty.</p>
                    <button
                      onClick={() => onNavigate('/shop')}
                      className="bg-stone-900 text-white text-xs font-semibold px-4 py-2 rounded-xs hover:bg-amber-900 transition-colors cursor-pointer"
                    >
                      Discover Products
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {wishlistProducts.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        onNavigate={onNavigate}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="bg-white border border-stone-200 rounded-xs p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
                    Account Security & Credentials
                  </h2>
                  <p className="text-xs text-stone-500 mt-2">
                    Update your account password and review active two-factor authentication safeguards.
                  </p>
                </div>

                <div className="space-y-6 max-w-lg">
                  {/* Change Password Form */}
                  <form onSubmit={handleChangePassword} className="space-y-4 p-5 bg-stone-50 border border-stone-200 rounded-xs">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-800" />
                      <h3 className="font-bold text-xs text-stone-900">Change Account Password</h3>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Current Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-white border border-stone-300 text-stone-900 text-xs px-3 py-2 rounded-xs focus:outline-hidden focus:border-amber-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        New Password (min. 6 characters) *
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-white border border-stone-300 text-stone-900 text-xs px-3 py-2 rounded-xs focus:outline-hidden focus:border-amber-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Confirm New Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white border border-stone-300 text-stone-900 text-xs px-3 py-2 rounded-xs focus:outline-hidden focus:border-amber-800"
                      />
                    </div>

                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={changingPassword}
                        className="bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold px-4 py-2 rounded-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {changingPassword ? 'Updating Password...' : 'Update Password'}
                      </button>
                    </div>
                  </form>

                  {/* 2FA Status */}
                  <div className="space-y-3">
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs text-stone-900">Email OTP Multi-Factor Safeguard</strong>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-xs">ACTIVE</span>
                      </div>
                      <p className="text-[11px] text-stone-500">Secure one-time passcodes are sent to {user?.email} for passwordless sign in.</p>
                    </div>

                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs text-stone-900">Adult 21+ Identity Clearance</strong>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-xs">VERIFIED</span>
                      </div>
                      <p className="text-[11px] text-stone-500">Required for federal and state shisha tobacco logistics compliance.</p>
                    </div>

                    {/* Account Deletion Prompt in Security */}
                    <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
                      <div>
                        <strong className="text-xs text-rose-900 flex items-center gap-1.5 font-bold">
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          Account Deletion & Data Privacy
                        </strong>
                        <p className="text-[11px] text-rose-700/90 mt-0.5">
                          Need to permanently remove your login credentials, saved addresses, and personal data?
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteError('');
                          setDeleteConfirmationText('');
                          setDeletePassword('');
                          setShowDeleteModal(true);
                        }}
                        className="text-xs font-bold text-rose-700 hover:text-rose-900 hover:underline shrink-0 text-left sm:text-right cursor-pointer"
                      >
                        Delete Account →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <div className="bg-white border border-stone-200 rounded-xs p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
                    Communication & Notification Preferences
                  </h2>
                  <p className="text-xs text-stone-500 mt-2">
                    Manage how Fumare Hookah contacts you regarding order dispatches and private tobacco drops.
                  </p>
                </div>

                <form onSubmit={handleSavePreferences} className="space-y-4 max-w-lg">
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-3.5 bg-stone-50 border border-stone-200 rounded-xs cursor-pointer hover:bg-stone-100/70 transition-colors">
                      <input
                        type="checkbox"
                        checked={prefEmailOrders}
                        onChange={(e) => setPrefEmailOrders(e.target.checked)}
                        className="mt-0.5 rounded-xs text-amber-900 focus:ring-amber-900"
                      />
                      <div>
                        <span className="text-xs font-bold text-stone-900 block">Order & Shipment Status Emails</span>
                        <span className="text-[11px] text-stone-500">Receive instant updates when orders are packed, dispatched, and out for delivery.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3.5 bg-stone-50 border border-stone-200 rounded-xs cursor-pointer hover:bg-stone-100/70 transition-colors">
                      <input
                        type="checkbox"
                        checked={prefEmailDrops}
                        onChange={(e) => setPrefEmailDrops(e.target.checked)}
                        className="mt-0.5 rounded-xs text-amber-900 focus:ring-amber-900"
                      />
                      <div>
                        <span className="text-xs font-bold text-stone-900 block">Private Reserve Drops & Shisha Restocks</span>
                        <span className="text-[11px] text-stone-500">Early access announcements for limited DarkSide, MustHave, and BlackBurn batches.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3.5 bg-stone-50 border border-stone-200 rounded-xs cursor-pointer hover:bg-stone-100/70 transition-colors">
                      <input
                        type="checkbox"
                        checked={prefSmsUpdates}
                        onChange={(e) => setPrefSmsUpdates(e.target.checked)}
                        className="mt-0.5 rounded-xs text-amber-900 focus:ring-amber-900"
                      />
                      <div>
                        <span className="text-xs font-bold text-stone-900 block">SMS Courier Notifications</span>
                        <span className="text-[11px] text-stone-500">Direct carrier text alerts when the courier arrives for adult signature verification.</span>
                      </div>
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingPrefs}
                      className="bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold px-5 py-2.5 rounded-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {savingPrefs ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 7. SETTINGS & PRIVACY TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-white border border-stone-200 rounded-xs p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                    <div>
                      <h2 className="font-serif text-lg font-bold text-stone-900">
                        Account Settings & Legal Compliance
                      </h2>
                      <p className="text-xs text-stone-500 mt-1">
                        Review your legal agreements, consumer privacy rights, and manage permanent account status.
                      </p>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-stone-100 text-stone-700 px-2.5 py-1 rounded-xs w-fit">
                      Global Privacy Shield
                    </span>
                  </div>

                  {/* Profile Summary & Verification */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 text-xs">
                    <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xs">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Account Holder</span>
                      <strong className="text-stone-900 block truncate">{user?.firstName} {user?.lastName}</strong>
                      <span className="text-[11px] text-stone-500 block truncate mt-0.5">{user?.email}</span>
                    </div>

                    <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xs">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Account Tier</span>
                      <strong className="text-stone-900 block uppercase">{user?.role?.replace('_', ' ') || 'RETAIL CLIENT'}</strong>
                      <span className="text-[11px] text-emerald-600 block mt-0.5 font-medium">✓ 21+ Age Verified</span>
                    </div>

                    <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xs">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Data Rights</span>
                      <strong className="text-stone-900 block">GDPR & CCPA Protected</strong>
                      <span className="text-[11px] text-stone-500 block mt-0.5">Right to be Forgotten</span>
                    </div>
                  </div>
                </div>

                {/* Legal & Policy Agreements */}
                <div className="bg-white border border-stone-200 rounded-xs p-6 shadow-xs space-y-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800">
                      Legal Agreements & Terms
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Binding consumer policies governing adult tobacco purchases, age verification, and data handling.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Terms of Service Card */}
                    <div className="p-4 border border-stone-200 rounded-xs bg-stone-50/50 hover:bg-stone-50 transition-colors flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
                          <FileText className="w-4 h-4 text-amber-800" />
                          <span>Terms of Service</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed">
                          Covers adult purchase eligibility, PACT Act shipping compliance, returns, warranty, and limitations of liability.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate('/terms')}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 hover:text-amber-950 hover:underline cursor-pointer"
                      >
                        <span>Review Terms of Service</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Privacy & Policy Card */}
                    <div className="p-4 border border-stone-200 rounded-xs bg-stone-50/50 hover:bg-stone-50 transition-colors flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
                          <Shield className="w-4 h-4 text-amber-800" />
                          <span>Privacy & Data Policy</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed">
                          Details encryption standards, age verification records, data retention policies, and your right to be forgotten.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate('/privacy')}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 hover:text-amber-950 hover:underline cursor-pointer"
                      >
                        <span>Review Privacy Policy</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Danger Zone: Permanent Account Deletion */}
                <div className="bg-rose-50/60 border border-rose-200 rounded-xs p-6 shadow-xs space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center shrink-0 text-rose-600 mt-0.5">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-rose-900">
                        Danger Zone: Permanently Delete Account
                      </h3>
                      <p className="text-xs text-rose-800/90 leading-relaxed">
                        Once your account is permanently deleted, all private credentials, saved shipping addresses, active wishlist items, and personal preferences will be irreversibly erased from our production databases.
                      </p>
                      <p className="text-[11px] text-rose-700/80">
                        Historical completed order receipts will be anonymized for financial tax accounting records as mandated by federal law.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-[11px] text-rose-800 font-medium">
                      This action is permanent and cannot be undone.
                    </span>
                    <button
                      id="delete-account-btn"
                      type="button"
                      onClick={() => {
                        setDeleteError('');
                        setDeleteConfirmationText('');
                        setDeletePassword('');
                        setShowDeleteModal(true);
                      }}
                      className="bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold px-4 py-2.5 rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete My Account</span>
                    </button>
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

        {/* Delete Account Confirmation Modal */}
        {showDeleteModal && (
          <div
            id="delete-account-modal"
            className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div
              className="bg-white border border-stone-300 rounded-xs shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95"
              role="dialog"
              aria-modal="true"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-stone-900">
                      Confirm Account Deletion
                    </h3>
                    <p className="text-[11px] text-stone-500">Permanent data erasure request</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Warning explanation */}
              <div className="bg-rose-50 border border-rose-200 rounded-xs p-3.5 text-xs text-rose-900 space-y-1">
                <p className="font-bold">Are you absolutely sure?</p>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  You are about to permanently delete the account for <strong className="font-semibold">{user?.email}</strong>. You will be logged out immediately and your stored profile data will be permanently wiped.
                </p>
              </div>

              {/* Confirmation Form */}
              <form onSubmit={handleDeleteAccount} className="space-y-3.5 text-xs">
                {deleteError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{deleteError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    Reason for leaving (Optional)
                  </label>
                  <select
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xs px-3 py-2 text-stone-800 focus:outline-none focus:border-stone-900 cursor-pointer"
                  >
                    <option value="Personal privacy request">Personal privacy request (Right to be Forgotten)</option>
                    <option value="No longer using the service">No longer using the service</option>
                    <option value="Created duplicate account">Created duplicate account</option>
                    <option value="Customer service issue">Customer service issue</option>
                    <option value="Other">Other reason</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    Password verification (if password set)
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your current password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xs px-3 py-2 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-900"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">If your account uses passwordless OTP sign-in, you can leave this blank.</p>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    Type <span className="font-mono text-rose-600 font-bold">DELETE</span> to confirm:
                  </label>
                  <input
                    id="delete-confirm-input"
                    type="text"
                    required
                    placeholder="DELETE"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    className="w-full font-mono uppercase bg-white border border-stone-300 rounded-xs px-3 py-2 text-stone-800 focus:outline-none focus:border-rose-600"
                  />
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeletingAccount}
                    className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold rounded-xs transition-colors cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    id="confirm-delete-account-submit"
                    type="submit"
                    disabled={isDeletingAccount || deleteConfirmationText.trim().toUpperCase() !== 'DELETE'}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isDeletingAccount ? 'Permanently Deleting...' : 'Permanently Delete Account'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
