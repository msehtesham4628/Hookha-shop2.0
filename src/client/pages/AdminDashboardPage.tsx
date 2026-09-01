import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore.js';
import { api } from '../services/api.js';
import {
  Product,
  Order,
  User,
  AuditLog,
  Category,
  Brand,
  Role,
  Permission,
  StoreSettings
} from '../../types/index.js';
import {
  BarChart3,
  Package,
  ShoppingBag,
  Users,
  ShieldCheck,
  FileText,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Search,
  Truck,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Eye,
  LogOut,
  Building2,
  ChevronDown
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user, userPermissions, logout, showToast, isAdmin, isAuthLoading, setUser } = useStore();
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'customers' | 'wholesale' | 'rbac' | 'audit' | 'settings'>('analytics');

  // Admin Login State for Gateway
  const [adminLoginEmail, setAdminLoginEmail] = useState('');
  const [adminLoginPassword, setAdminLoginPassword] = useState('');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');

  // Admin Data State
  const [analytics, setAnalytics] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [wholesaleApps, setWholesaleApps] = useState<any[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Sub-forms
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [newTrackingNumber, setNewTrackingNumber] = useState('');

  // Product Form Fields
  const [prodName, setProdName] = useState('');
  const [prodBrand, setProdBrand] = useState('Wookah');
  const [prodCategory, setProdCategory] = useState('Hookahs');
  const [prodPrice, setProdPrice] = useState('');
  const [prodSalePrice, setProdSalePrice] = useState('');
  const [prodStock, setProdStock] = useState('10');
  const [prodFlavor, setProdFlavor] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');

  // Staff Form Fields
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffFirstName, setStaffFirstName] = useState('');
  const [staffLastName, setStaffLastName] = useState('');
  const [staffRole, setStaffRole] = useState('PRODUCT_SPECIALIST');

  // Search & Filter within Admin Tables
  const [adminSearch, setAdminSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  const handleAdminLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || adminLoginEmail;
    const loginPass = customPass || adminLoginPassword;
    if (!loginEmail || !loginPass) {
      setAdminLoginError('Please enter administrative email and password');
      return;
    }

    try {
      setAdminLoginLoading(true);
      setAdminLoginError('');
      const res = await api.loginWithPassword(loginEmail, loginPass);
      if (res.success && res.data) {
        if (res.data.user.role === 'CUSTOMER') {
          setAdminLoginError('Access denied: Account lacks administrative privileges.');
          return;
        }
        localStorage.setItem('sultan_auth_token', res.data.token);
        setUser(res.data.user, (res.data as any).permissions || []);
        showToast(`Authenticated as ${res.data.user.firstName} (${res.data.user.role})`, 'success');
      }
    } catch (err: any) {
      setAdminLoginError(err.message || 'Invalid administrative credentials.');
    } finally {
      setAdminLoginLoading(false);
    }
  };

  const loadAllAdminData = async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      const [
        analyticsRes,
        productsRes,
        ordersRes,
        customersRes,
        wholesaleRes,
        rolesRes,
        permsRes,
        auditRes,
        settingsRes,
        catsRes,
        brandsRes
      ] = await Promise.all([
        api.getAnalytics().catch(() => ({ success: false, data: null })),
        api.getProducts({ limit: 100 }).catch(() => ({ success: false, data: { products: [] } })),
        api.getAdminOrders().catch(() => ({ success: false, data: [] })),
        api.getAdminCustomers().catch(() => ({ success: false, data: [] })),
        api.getWholesaleApplications().catch(() => ({ success: false, data: [] })),
        api.getAdminRoles().catch(() => ({ success: false, data: [] })),
        api.getAdminPermissions().catch(() => ({ success: false, data: [] })),
        api.getAdminAuditLogs().catch(() => ({ success: false, data: [] })),
        api.getSettings().catch(() => ({ success: false, data: null })),
        api.getCategories().catch(() => ({ success: false, data: [] })),
        api.getBrands().catch(() => ({ success: false, data: [] }))
      ]);

      if (analyticsRes.success && analyticsRes.data) setAnalytics(analyticsRes.data);
      if (productsRes.success && productsRes.data) setProducts(productsRes.data.products || []);
      if (ordersRes.success && ordersRes.data) setOrders(ordersRes.data || []);
      if (customersRes.success && customersRes.data) setCustomers(customersRes.data || []);
      if (wholesaleRes.success && wholesaleRes.data) setWholesaleApps(wholesaleRes.data || []);
      if (rolesRes.success && rolesRes.data) setRoles(rolesRes.data || []);
      if (permsRes.success && permsRes.data) setPermissions(permsRes.data || []);
      if (auditRes.success && auditRes.data) setAuditLogs(auditRes.data || []);
      if (settingsRes.success && settingsRes.data) setSettings(settingsRes.data);
      if (catsRes.success && catsRes.data) setCategories(catsRes.data || []);
      if (brandsRes.success && brandsRes.data) setBrands(brandsRes.data || []);
    } catch (err) {
      console.error('Failed to load admin suite data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllAdminData();
    }
  }, [isAdmin]);

  // Handlers for Product Management
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdBrand('Wookah');
    setProdCategory('Hookahs');
    setProdPrice('299.00');
    setProdSalePrice('');
    setProdStock('15');
    setProdFlavor('');
    setProdDesc('Precision-crafted shisha artifact engineered for connoisseurs.');
    setProdImageUrl('https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=800');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdBrand(prod.brand);
    setProdCategory(prod.category);
    setProdPrice(prod.price.toString());
    setProdSalePrice(prod.salePrice ? prod.salePrice.toString() : '');
    setProdStock(prod.stock.toString());
    setProdFlavor(prod.flavor || '');
    setProdDesc(prod.description);
    setProdImageUrl(prod.images[0]?.url || '');
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: prodName,
        brand: prodBrand,
        category: prodCategory,
        price: parseFloat(prodPrice),
        salePrice: prodSalePrice ? parseFloat(prodSalePrice) : undefined,
        stock: parseInt(prodStock, 10),
        flavor: prodFlavor || undefined,
        description: prodDesc,
        images: [{ id: `img-${Date.now()}`, url: prodImageUrl, isPrimary: true }]
      };

      if (editingProduct) {
        const res = await api.updateProduct(editingProduct.id, payload);
        if (res.success) {
          showToast('Product specifications updated successfully', 'success');
        }
      } else {
        const res = await api.createProduct(payload);
        if (res.success) {
          showToast('New hookah artifact added to vault catalog', 'success');
        }
      }
      setIsProductModalOpen(false);
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save product', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you wish to decommission this product?')) return;
    try {
      const res = await api.deleteProduct(id);
      if (res.success) {
        showToast('Product decommissioned', 'info');
        loadAllAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  // Order status update
  const handleUpdateOrderStatus = async (orderId: string, status: any) => {
    try {
      const res = await api.updateOrderStatus(orderId, status);
      if (res.success) {
        showToast(`Order status updated to ${status}`, 'success');
        loadAllAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForTracking) return;
    try {
      const res = await api.updateOrderStatus(selectedOrderForTracking.id, 'SHIPPED', newTrackingNumber);
      if (res.success) {
        showToast(`UPS Tracking ${newTrackingNumber} assigned!`, 'success');
        setIsTrackingModalOpen(false);
        loadAllAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to assign tracking', 'error');
    }
  };

  // Wholesale application review
  const handleReviewWholesale = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await api.reviewWholesaleApplication(id, status);
      if (res.success) {
        showToast(`Wholesale account ${status.toLowerCase()}!`, 'success');
        loadAllAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating wholesale application', 'error');
    }
  };

  // Create Staff
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createStaffAccount({
        email: staffEmail,
        password: staffPassword,
        firstName: staffFirstName,
        lastName: staffLastName,
        role: staffRole
      });
      if (res.success) {
        showToast('Staff credentials generated & active!', 'success');
        setIsStaffModalOpen(false);
        setStaffEmail('');
        setStaffPassword('');
        setStaffFirstName('');
        setStaffLastName('');
        loadAllAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create staff account', 'error');
    }
  };

  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter !== 'ALL' && o.status !== orderStatusFilter) return false;
    if (adminSearch) {
      const q = adminSearch.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredProducts = products.filter(p => {
    if (!adminSearch) return true;
    const q = adminSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  });

  if (isAuthLoading) {
    return (
      <div className="w-full min-h-screen bg-stone-950 flex flex-col items-center justify-center text-stone-200">
        <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-stone-400 font-semibold">
          Verifying administrative authorization...
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="w-full min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between p-4 sm:p-8">
        <div className="max-w-md w-full mx-auto my-auto py-12 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-amber-950/80 border border-amber-600/40 text-amber-400 rounded-xs flex items-center justify-center mx-auto shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-amber-500">
              Restricted Administrative Gateway
            </span>
            <h1 className="font-serif text-2xl font-bold text-white tracking-wide">
              Sultan Control Center
            </h1>
            <p className="text-xs text-stone-400">
              Authorized personnel only. Please sign in with staff or executive credentials.
            </p>
          </div>

          {/* 1-Click Quick Demo Switchers */}
          <div className="bg-stone-900 border border-stone-800 rounded-xs p-4 space-y-3">
            <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Administrative Access</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleAdminLogin(undefined, 'admin@sultan.com', 'Admin123!')}
                disabled={adminLoginLoading}
                className="bg-amber-900 hover:bg-amber-800 text-amber-50 p-2.5 rounded-xs text-xs font-semibold text-center border border-amber-700/50 transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="font-bold">👑 Super Admin</span>
                <span className="text-[9px] text-amber-200">Full Access</span>
              </button>
              <button
                type="button"
                onClick={() => handleAdminLogin(undefined, 'pm@sultan.com', 'Staff123!')}
                disabled={adminLoginLoading}
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 p-2.5 rounded-xs text-xs font-semibold text-center border border-stone-700 transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="font-bold">📦 Catalog Lead</span>
                <span className="text-[9px] text-stone-400">Products</span>
              </button>
              <button
                type="button"
                onClick={() => handleAdminLogin(undefined, 'support@sultan.com', 'Staff123!')}
                disabled={adminLoginLoading}
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 p-2.5 rounded-xs text-xs font-semibold text-center border border-stone-700 transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="font-bold">🎧 Support Mgr</span>
                <span className="text-[9px] text-stone-400">Orders</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={(e) => handleAdminLogin(e)} className="bg-stone-900 border border-stone-800 rounded-xs p-6 space-y-4 shadow-xl">
            {adminLoginError && (
              <div className="bg-rose-950/80 border border-rose-800 text-rose-200 p-3 rounded-xs text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{adminLoginError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-300">Staff Email</label>
              <input
                type="email"
                value={adminLoginEmail}
                onChange={(e) => setAdminLoginEmail(e.target.value)}
                placeholder="admin@sultan.com"
                required
                className="w-full bg-stone-950 border border-stone-700 rounded-xs px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-300">Password</label>
              <input
                type="password"
                value={adminLoginPassword}
                onChange={(e) => setAdminLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-stone-950 border border-stone-700 rounded-xs px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={adminLoginLoading}
              className="w-full bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xs text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {adminLoginLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Access Control Center</span>
                </>
              )}
            </button>
          </form>

          {/* Back to storefront */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="text-xs text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
            >
              ← Return to Sultan Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-stone-100 min-h-screen text-stone-900 flex flex-col">
      {/* Top Admin Bar */}
      <header className="bg-stone-900 text-stone-100 border-b border-stone-800 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xs bg-amber-700 flex items-center justify-center font-bold text-amber-100 font-serif">
            S
          </div>
          <div>
            <h1 className="font-serif text-sm font-bold tracking-wider text-white">SULTAN ADMIN CONTROL CENTER</h1>
            <p className="text-[10px] text-amber-400 uppercase tracking-widest font-semibold">
              Live Production Storefront Engine • {user?.role || 'SUPER_ADMIN'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-2 bg-stone-800 px-3 py-1.5 rounded-xs border border-stone-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-stone-300">API Status: Fully Operational</span>
          </div>

          <button
            onClick={() => onNavigate('/')}
            className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1.5 rounded-xs transition-colors"
          >
            ← View Live Storefront
          </button>

          <button
            onClick={() => { logout(); onNavigate('/'); }}
            className="text-rose-400 hover:text-rose-300 flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Admin Navigation Sidebar */}
        <aside className="w-64 bg-white border-r border-stone-200 p-4 space-y-1 shrink-0 hidden md:block">
          <div className="text-[10px] uppercase font-bold tracking-widest text-stone-400 px-3 mb-2">
            Operations & Metrics
          </div>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors ${
              activeTab === 'analytics' ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics & KPIs</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors ${
              activeTab === 'products' ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product & Media Catalog ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors ${
              activeTab === 'orders' ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders & Dispatch ({orders.length})</span>
          </button>

          <div className="text-[10px] uppercase font-bold tracking-widest text-stone-400 px-3 pt-4 mb-2">
            Accounts & Access
          </div>

          <button
            onClick={() => setActiveTab('customers')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors ${
              activeTab === 'customers' ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customer Registry ({customers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wholesale')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors ${
              activeTab === 'wholesale' ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>B2B Wholesale Apps ({wholesaleApps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rbac')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors ${
              activeTab === 'rbac' ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>RBAC & Staff Accounts</span>
          </button>

          <div className="text-[10px] uppercase font-bold tracking-widest text-stone-400 px-3 pt-4 mb-2">
            Governance & Settings
          </div>

          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors ${
              activeTab === 'audit' ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors ${
              activeTab === 'settings' ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Storefront Settings</span>
          </button>
        </aside>

        {/* Content Workspace Area */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl">
          
          {/* TAB 1: ANALYTICS */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900">Executive Commerce Analytics</h2>
                  <p className="text-xs text-stone-500">Real-time revenue, gross margin, and shisha sales volume.</p>
                </div>
                <button
                  onClick={loadAllAdminData}
                  className="bg-white border border-stone-300 text-stone-700 px-3 py-1.5 rounded-xs text-xs font-semibold flex items-center gap-1.5 hover:bg-stone-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Refresh Metrics</span>
                </button>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-stone-200 p-5 rounded-xs shadow-xs">
                  <span className="text-[11px] uppercase font-bold text-stone-500 tracking-wider">Gross Revenue</span>
                  <div className="text-2xl font-bold text-stone-900 mt-1 font-sans">
                    ${analytics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">↑ 18.4% vs last period</span>
                </div>

                <div className="bg-white border border-stone-200 p-5 rounded-xs shadow-xs">
                  <span className="text-[11px] uppercase font-bold text-stone-500 tracking-wider">Completed Orders</span>
                  <div className="text-2xl font-bold text-stone-900 mt-1 font-sans">
                    {analytics.totalOrders}
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 block">100% verified fulfillment</span>
                </div>

                <div className="bg-white border border-stone-200 p-5 rounded-xs shadow-xs">
                  <span className="text-[11px] uppercase font-bold text-stone-500 tracking-wider">Average Order Value (AOV)</span>
                  <div className="text-2xl font-bold text-stone-900 mt-1 font-sans">
                    ${analytics.averageOrderValue.toFixed(2)}
                  </div>
                  <span className="text-[11px] text-amber-800 font-semibold mt-1 block">Luxury category benchmark</span>
                </div>

                <div className="bg-white border border-stone-200 p-5 rounded-xs shadow-xs">
                  <span className="text-[11px] uppercase font-bold text-stone-500 tracking-wider">Inventory Health</span>
                  <div className="text-2xl font-bold text-stone-900 mt-1 font-sans">
                    {analytics.lowStockCount} items
                  </div>
                  <span className="text-[11px] text-amber-700 font-semibold mt-1 block">Requires supplier re-order</span>
                </div>
              </div>

              {/* Top Selling Flavors & Hookahs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-stone-200 p-6 rounded-xs shadow-xs">
                  <h3 className="font-serif text-base font-bold text-stone-900 mb-4">Top Shisha Flavors & Blends</h3>
                  <div className="space-y-3">
                    {analytics.topFlavors.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-stone-100">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-[10px]">{idx + 1}</span>
                          <span className="font-semibold text-stone-900">{item.flavor}</span>
                        </div>
                        <span className="font-bold text-amber-900 font-mono">{item.units} units sold</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-stone-200 p-6 rounded-xs shadow-xs">
                  <h3 className="font-serif text-base font-bold text-stone-900 mb-4">Low Stock Warning Matrix</h3>
                  <div className="space-y-3">
                    {products.filter(p => p.stock <= p.lowStockThreshold).slice(0, 4).map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-xs py-2 border-b border-stone-100">
                        <div>
                          <p className="font-bold text-stone-900">{p.name}</p>
                          <p className="text-[11px] text-stone-500 font-mono">SKU: {p.sku}</p>
                        </div>
                        <span className="bg-rose-100 text-rose-800 px-2 py-1 rounded-xs font-bold font-mono">
                          {p.stock} units left
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900">Product & Media Catalog</h2>
                  <p className="text-xs text-stone-500">Manage stainless steel stems, dark leaf tobacco, stoneware bowls, and imagery.</p>
                </div>
                <button
                  id="admin-create-product-btn"
                  onClick={handleOpenCreateProduct}
                  className="bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xs transition-colors flex items-center gap-2 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="bg-white border border-stone-200 p-4 rounded-xs flex items-center gap-3">
                <Search className="w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Filter by product name, SKU, or brand..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="w-full text-xs text-stone-800 bg-transparent focus:outline-none"
                />
              </div>

              {/* Products Table */}
              <div className="bg-white border border-stone-200 rounded-xs overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Artifact</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Brand</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-stone-100 border border-stone-200 rounded-xs p-1 shrink-0 flex items-center justify-center">
                            <img src={prod.images[0]?.url} alt={prod.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <p className="font-bold text-stone-900">{prod.name}</p>
                            <p className="text-[10px] text-stone-400 font-mono">{prod.sku}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-stone-700">{prod.category}</td>
                        <td className="py-3 px-4 font-semibold text-amber-900">{prod.brand}</td>
                        <td className="py-3 px-4 font-mono font-bold text-stone-900">${prod.price.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-xs font-mono font-bold ${prod.stock <= prod.lowStockThreshold ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {prod.stock}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-stone-600">{prod.rating.toFixed(1)} ★</td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1 text-stone-600 hover:text-amber-900 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900">Orders & Fulfillment Dispatch</h2>
                  <p className="text-xs text-stone-500">Live order processing, age verification certification, and UPS tracking assignment.</p>
                </div>

                <div className="flex items-center gap-2 bg-white border border-stone-300 px-3 py-1.5 rounded-xs text-xs">
                  <span className="text-stone-500">Status:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-transparent font-semibold text-stone-800 focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white border border-stone-200 rounded-xs overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Order Dossier</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Tracking</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-stone-900">{ord.orderNumber}</p>
                          <p className="text-[10px] text-stone-400">{new Date(ord.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-stone-800">{ord.customerName}</p>
                          <p className="text-[11px] text-stone-500">{ord.customerEmail}</p>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-stone-900">${ord.grandTotal.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            className="bg-stone-50 border border-stone-300 text-xs font-semibold text-amber-900 px-2 py-1 rounded-xs"
                          >
                            <option value="PAID">PAID</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-stone-600">
                          {ord.trackingNumber ? (
                            <span className="font-semibold text-stone-900">{ord.trackingNumber}</span>
                          ) : (
                            <button
                              onClick={() => { setSelectedOrderForTracking(ord); setNewTrackingNumber(`1Z${Math.random().toString(36).substring(2, 10).toUpperCase()}`); setIsTrackingModalOpen(true); }}
                              className="text-amber-900 hover:underline font-semibold"
                            >
                              + Assign UPS Track
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onNavigate(`/order-success?orderId=${ord.id}`)}
                            className="text-xs font-semibold text-amber-900 hover:underline"
                          >
                            View Dossier
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">Customer Accounts Registry</h2>
                <p className="text-xs text-stone-500">Registered connoisseurs, VIP tiers, and contact preferences.</p>
              </div>

              <div className="bg-white border border-stone-200 rounded-xs overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Age Verified</th>
                      <th className="py-3 px-4">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-stone-50/70">
                        <td className="py-3 px-4 font-bold text-stone-900">{c.firstName} {c.lastName}</td>
                        <td className="py-3 px-4 text-stone-600">{c.email}</td>
                        <td className="py-3 px-4">
                          <span className="bg-stone-100 text-stone-800 text-[10px] font-bold px-2 py-0.5 rounded-xs">
                            {c.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> 21+ Certified
                          </span>
                        </td>
                        <td className="py-3 px-4 text-stone-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: WHOLESALE APPLICATIONS */}
          {activeTab === 'wholesale' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">B2B Lounge & Retail Applications</h2>
                <p className="text-xs text-stone-500">Review EIN verification, monthly spend tiers, and approve lounge discounts.</p>
              </div>

              <div className="space-y-4">
                {wholesaleApps.map((app) => (
                  <div key={app.id} className="bg-white border border-stone-200 rounded-xs p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                      <div>
                        <h3 className="font-serif text-base font-bold text-stone-900">{app.businessName}</h3>
                        <p className="text-xs text-stone-500">Type: {app.businessType} • Tax ID: <strong className="font-mono text-stone-800">{app.taxId}</strong></p>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-xs ${
                        app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-700">
                      <div>
                        <span className="font-semibold text-stone-900 block">Contact:</span>
                        <span>{app.contactName} ({app.email})</span>
                      </div>
                      <div>
                        <span className="font-semibold text-stone-900 block">Estimated Volume:</span>
                        <span className="font-semibold text-amber-900">{app.estimatedMonthlySpend}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-stone-900 block">Website:</span>
                        <span>{app.website || 'N/A'}</span>
                      </div>
                    </div>

                    {app.notes && (
                      <p className="text-xs text-stone-600 bg-stone-50 p-3 rounded-xs border border-stone-200">
                        <strong>Lounge Notes:</strong> {app.notes}
                      </p>
                    )}

                    {app.status === 'PENDING' && (
                      <div className="flex gap-2 pt-2 border-t border-stone-100">
                        <button
                          onClick={() => handleReviewWholesale(app.id, 'APPROVED')}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-xs transition-colors"
                        >
                          Approve Wholesale Partner
                        </button>
                        <button
                          onClick={() => handleReviewWholesale(app.id, 'REJECTED')}
                          className="bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold px-4 py-2 rounded-xs transition-colors"
                        >
                          Decline Application
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: RBAC & STAFF */}
          {activeTab === 'rbac' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900">Roles & Staff Permissions (RBAC)</h2>
                  <p className="text-xs text-stone-500">Manage granular system access controls and provision staff accounts.</p>
                </div>
                <button
                  onClick={() => setIsStaffModalOpen(true)}
                  className="bg-amber-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Provision Staff Account</span>
                </button>
              </div>

              {/* Roles Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map((r) => (
                  <div key={r.id} className="bg-white border border-stone-200 p-5 rounded-xs shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <h3 className="font-serif text-sm font-bold text-stone-900">{r.name}</h3>
                      <span className="text-[10px] font-mono text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded-xs">{r.id}</span>
                    </div>
                    <p className="text-xs text-stone-600">{r.description}</p>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block mb-1.5">Authorized Permissions:</span>
                      <div className="flex flex-wrap gap-1">
                        {r.permissions.map((p) => (
                          <span key={p} className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-xs font-mono">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">Administrative Audit Trail</h2>
                <p className="text-xs text-stone-500">Immutable ledger recording all administrative updates, price revisions, and staff logins.</p>
              </div>

              <div className="bg-white border border-stone-200 rounded-xs overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Staff Actor</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Entity</th>
                      <th className="py-3 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-stone-50/70">
                        <td className="py-3 px-4 text-stone-400 font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-semibold text-stone-900">{log.userEmail}</td>
                        <td className="py-3 px-4">
                          <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded-xs font-mono text-[10px] font-bold">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-amber-900 font-medium">{log.entityType}</td>
                        <td className="py-3 px-4 text-stone-600 text-[11px] font-mono truncate max-w-xs">
                          {JSON.stringify(log.details)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: STORE SETTINGS */}
          {activeTab === 'settings' && settings && (
            <div className="bg-white border border-stone-200 rounded-xs p-6 shadow-xs max-w-2xl space-y-6">
              <h2 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">
                Storefront Global Configuration
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Store Name</label>
                  <input
                    type="text"
                    defaultValue={settings.storeName}
                    className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Free Shipping Threshold ($)</label>
                    <input
                      type="number"
                      defaultValue={settings.freeShippingThreshold}
                      className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Standard Sales Tax (%)</label>
                    <input
                      type="number"
                      defaultValue={(settings.taxRate * 100).toFixed(1)}
                      className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs font-mono"
                    />
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xs space-y-1 text-stone-800">
                  <strong>Tobacco Compliance Active:</strong>
                  <p>California Proposition 65 warnings, 21+ Age confirmation gate, and Adult signature requirement are strictly enforced.</p>
                </div>

                <button
                  type="button"
                  onClick={() => showToast('Settings updated across entire platform', 'success')}
                  className="bg-stone-900 hover:bg-amber-900 text-white font-semibold py-2.5 px-6 rounded-xs transition-colors"
                >
                  Save Store Settings
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-300 rounded-sm shadow-2xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {editingProduct ? 'Edit Shisha Product' : 'Add New Hookah Artifact'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Brand House</label>
                  <input
                    type="text"
                    required
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
                  >
                    <option value="Hookahs">Hookahs</option>
                    <option value="Shisha Tobacco">Shisha Tobacco</option>
                    <option value="Bowls & Phunnels">Bowls & Phunnels</option>
                    <option value="Coconut Charcoal">Coconut Charcoal</option>
                    <option value="Heat Management (HMD)">Heat Management (HMD)</option>
                    <option value="Bohemian Glass Vases">Bohemian Glass Vases</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Regular Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Vault Sale Price ($) (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodSalePrice}
                    onChange={(e) => setProdSalePrice(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Current Stock Level *</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Flavor Notes (If Shisha)</label>
                  <input
                    type="text"
                    value={prodFlavor}
                    onChange={(e) => setProdFlavor(e.target.value)}
                    placeholder="e.g. Crisp Cane Mint & Citrus"
                    className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">High-Res Product Image URL</label>
                  <input
                    type="text"
                    required
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Description & Specifications</label>
                  <textarea
                    rows={3}
                    required
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-4 py-2 rounded-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-stone-900 hover:bg-amber-900 text-white font-semibold px-5 py-2 rounded-xs"
                >
                  Save Artifact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRACKING ASSIGN MODAL */}
      {isTrackingModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-300 rounded-sm shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-stone-900">Assign UPS Air Tracking Number</h3>
            <p className="text-xs text-stone-600">Assign carrier tracking for Order #{selectedOrderForTracking?.orderNumber}. Status will transition to SHIPPED.</p>

            <form onSubmit={handleSaveTracking} className="space-y-4 text-xs">
              <input
                type="text"
                required
                value={newTrackingNumber}
                onChange={(e) => setNewTrackingNumber(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 p-2.5 rounded-xs font-mono font-bold"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTrackingModalOpen(false)}
                  className="bg-stone-100 text-stone-700 font-semibold px-4 py-2 rounded-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-900 text-white font-semibold px-5 py-2 rounded-xs"
                >
                  Save & Notify Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE STAFF MODAL */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-300 rounded-sm shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-stone-900">Provision Staff Account</h3>
            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="First Name"
                  value={staffFirstName}
                  onChange={(e) => setStaffFirstName(e.target.value)}
                  className="bg-stone-50 border border-stone-300 p-2 rounded-xs"
                />
                <input
                  type="text"
                  required
                  placeholder="Last Name"
                  value={staffLastName}
                  onChange={(e) => setStaffLastName(e.target.value)}
                  className="bg-stone-50 border border-stone-300 p-2 rounded-xs"
                />
              </div>

              <input
                type="email"
                required
                placeholder="Staff Email"
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
              />

              <input
                type="password"
                required
                placeholder="Initial Password"
                value={staffPassword}
                onChange={(e) => setStaffPassword(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
              />

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Assigned Role</label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
                >
                  <option value="PRODUCT_SPECIALIST">PRODUCT_SPECIALIST</option>
                  <option value="ORDER_FULFILLMENT">ORDER_FULFILLMENT</option>
                  <option value="SUPPORT_AGENT">SUPPORT_AGENT</option>
                  <option value="STORE_MANAGER">STORE_MANAGER</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="bg-stone-100 text-stone-700 font-semibold px-4 py-2 rounded-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-900 text-white font-semibold px-5 py-2 rounded-xs"
                >
                  Generate Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
