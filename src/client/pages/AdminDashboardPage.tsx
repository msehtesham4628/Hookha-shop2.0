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
  ChevronDown,
  TrendingUp,
  Box,
  Layers,
  CheckCircle2,
  Clock,
  RefreshCw,
  Sliders,
  ExternalLink,
  Tag,
  Globe,
  FolderPlus,
  Award
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user, userPermissions, logout, showToast, isAdmin, isAuthLoading, setUser } = useStore();
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'categories' | 'brands' | 'orders' | 'customers' | 'wholesale' | 'rbac' | 'audit' | 'settings'>('analytics');

  // Admin Login State for Gateway
  const [adminLoginEmail, setAdminLoginEmail] = useState('admin@worldhookahmarket.com');
  const [adminLoginPassword, setAdminLoginPassword] = useState('Admin123!');
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

  // Category Modal & Form State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImageUrl, setCatImageUrl] = useState('');
  const [catBannerUrl, setCatBannerUrl] = useState('');
  const [catSubcategoriesStr, setCatSubcategoriesStr] = useState('');

  // Brand Modal & Form State
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandName, setBrandName] = useState('');
  const [brandOrigin, setBrandOrigin] = useState('');
  const [brandDesc, setBrandDesc] = useState('');
  const [brandLogoUrl, setBrandLogoUrl] = useState('');

  // Product Form Fields
  const [prodName, setProdName] = useState('');
  const [prodBrand, setProdBrand] = useState('Alpha Hookah');
  const [prodCategory, setProdCategory] = useState('Hookahs');
  const [prodPrice, setProdPrice] = useState('249.00');
  const [prodSalePrice, setProdSalePrice] = useState('');
  const [prodStock, setProdStock] = useState('15');
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

      if (analyticsRes.success && analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      }
      if (productsRes.success && productsRes.data) {
        setProducts(productsRes.data.products || []);
      }
      if (ordersRes.success && ordersRes.data) {
        setOrders(ordersRes.data || []);
      }
      if (customersRes.success && customersRes.data) {
        setCustomers(customersRes.data || []);
      }
      if (wholesaleRes.success && wholesaleRes.data) {
        setWholesaleApps(wholesaleRes.data || []);
      }
      if (rolesRes.success && rolesRes.data) {
        setRoles(rolesRes.data || []);
      }
      if (permsRes.success && permsRes.data) {
        setPermissions(permsRes.data || []);
      }
      if (auditRes.success && auditRes.data) {
        setAuditLogs(auditRes.data || []);
      }
      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data);
      }
      if (catsRes.success && catsRes.data) {
        setCategories(catsRes.data || []);
      }
      if (brandsRes.success && brandsRes.data) {
        setBrands(brandsRes.data || []);
      }
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

  // Derived stats with safe fallbacks
  const statsRevenue = analytics?.totalRevenue ?? analytics?.stats?.totalRevenue ?? orders.reduce((acc, o) => acc + (o.grandTotal || o.total || 0), 0);
  const statsOrders = analytics?.totalOrders ?? analytics?.stats?.totalOrders ?? orders.length;
  const statsAOV = analytics?.averageOrderValue ?? (statsOrders > 0 ? statsRevenue / statsOrders : 0);
  const statsLowStock = analytics?.lowStockCount ?? analytics?.stats?.lowStockCount ?? products.filter(p => p.stock <= (p.lowStockThreshold || 5)).length;
  const statsTopFlavors = analytics?.topFlavors || [
    { flavor: 'MustHave Pinkman (Grapefruit Strawberry Raspberry)', units: 142 },
    { flavor: 'DarkSide Supernova (Sub-Zero Menthol)', units: 118 },
    { flavor: 'BlackBurn Cane Mint (Bold Peppermint)', units: 96 },
    { flavor: 'Bonche Dark Chocolate (Single Origin)', units: 74 },
    { flavor: 'Tangiers Noir Cane Mint', units: 68 }
  ];

  // Handlers for Product Management
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdBrand('Alpha Hookah');
    setProdCategory('Hookahs');
    setProdPrice('249.00');
    setProdSalePrice('');
    setProdStock('15');
    setProdFlavor('');
    setProdDesc('Premium Russian engineered hookah with magnetic purge valve and stainless steel core.');
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
        images: [{ id: `img-${Date.now()}`, url: prodImageUrl || 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=800', isPrimary: true }]
      };

      if (editingProduct) {
        const res = await api.updateProduct(editingProduct.id, payload);
        if (res.success) {
          showToast('Product specifications updated successfully', 'success');
        }
      } else {
        const res = await api.createProduct(payload);
        if (res.success) {
          showToast('New product added to World Hookah Market catalog', 'success');
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

  // Handlers for Category Management
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCatName('');
    setCatDesc('');
    setCatImageUrl('https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=800');
    setCatBannerUrl('https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1200');
    setCatSubcategoriesStr('');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDesc(cat.description || '');
    setCatImageUrl(cat.imageUrl || '');
    setCatBannerUrl(cat.bannerUrl || '');
    setCatSubcategoriesStr(cat.subcategories ? cat.subcategories.join(', ') : '');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      showToast('Category name is required', 'error');
      return;
    }
    try {
      const subcategories = catSubcategoriesStr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const payload: Partial<Category> = {
        name: catName.trim(),
        description: catDesc.trim(),
        imageUrl: catImageUrl.trim() || 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=800',
        bannerUrl: catBannerUrl.trim() || 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1200',
        subcategories
      };

      if (editingCategory) {
        const res = await api.updateAdminCategory(editingCategory.id, payload);
        if (res.success) {
          showToast(`Category "${catName}" updated successfully!`, 'success');
        }
      } else {
        const res = await api.createAdminCategory(payload);
        if (res.success) {
          showToast(`New category "${catName}" created!`, 'success');
        }
      }
      setIsCategoryModalOpen(false);
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save category', 'error');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you wish to delete category "${name}"?`)) return;
    try {
      const res = await api.deleteAdminCategory(id);
      if (res.success) {
        showToast(`Category "${name}" removed`, 'info');
        loadAllAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete category', 'error');
    }
  };

  // Handlers for Brand Management
  const handleOpenCreateBrand = () => {
    setEditingBrand(null);
    setBrandName('');
    setBrandOrigin('Russia');
    setBrandDesc('Premium hookah and shisha craftsmanship.');
    setBrandLogoUrl('https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=400');
    setIsBrandModalOpen(true);
  };

  const handleOpenEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setBrandName(brand.name);
    setBrandOrigin(brand.origin || '');
    setBrandDesc(brand.description || '');
    setBrandLogoUrl(brand.logoUrl || '');
    setIsBrandModalOpen(true);
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      showToast('Brand name is required', 'error');
      return;
    }
    try {
      const payload: Partial<Brand> = {
        name: brandName.trim(),
        origin: brandOrigin.trim() || 'Global',
        description: brandDesc.trim(),
        logoUrl: brandLogoUrl.trim() || 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=400'
      };

      if (editingBrand) {
        const res = await api.updateAdminBrand(editingBrand.id, payload);
        if (res.success) {
          showToast(`Brand "${brandName}" updated successfully!`, 'success');
        }
      } else {
        const res = await api.createAdminBrand(payload);
        if (res.success) {
          showToast(`New brand "${brandName}" created!`, 'success');
        }
      }
      setIsBrandModalOpen(false);
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save brand', 'error');
    }
  };

  const handleDeleteBrand = async (id: string, name: string) => {
    if (!confirm(`Are you sure you wish to delete brand "${name}"?`)) return;
    try {
      const res = await api.deleteAdminBrand(id);
      if (res.success) {
        showToast(`Brand "${name}" removed`, 'info');
        loadAllAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete brand', 'error');
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
        showToast(`Tracking number ${newTrackingNumber} assigned!`, 'success');
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
        (o.orderNumber || '').toLowerCase().includes(q) ||
        (o.customerEmail || '').toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredProducts = products.filter(p => {
    if (!adminSearch) return true;
    const q = adminSearch.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q)
    );
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

  // Gateway Login Screen
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
              Restricted Gateway
            </span>
            <h1 className="font-serif text-2xl font-bold text-white tracking-wide uppercase">
              World Hookah Admin
            </h1>
            <p className="text-xs text-stone-400">
              Authorized personnel only. Sign in with executive or staff credentials.
            </p>
          </div>

          {/* 1-Click Quick Demo Switchers */}
          <div className="bg-stone-900 border border-stone-800 rounded-xs p-4 space-y-3">
            <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant 1-Click Access</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleAdminLogin(undefined, 'admin@worldhookahmarket.com', 'Admin123!')}
                disabled={adminLoginLoading}
                className="bg-amber-900 hover:bg-amber-800 text-amber-50 p-2.5 rounded-xs text-xs font-semibold text-center border border-amber-700/50 transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="font-bold">👑 Super Admin</span>
                <span className="text-[9px] text-amber-200">Full Suite</span>
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
                onClick={() => handleAdminLogin(undefined, 'admin@sultan.com', 'Admin123!')}
                disabled={adminLoginLoading}
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 p-2.5 rounded-xs text-xs font-semibold text-center border border-stone-700 transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="font-bold">👑 Sultan Admin</span>
                <span className="text-[9px] text-stone-400">Executive</span>
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
                placeholder="admin@worldhookahmarket.com"
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
                  <span>Enter Admin Suite</span>
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
              ← Return to World Hookah Market Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-stone-100 min-h-screen text-stone-900 flex flex-col">
      {/* Top Admin Bar */}
      <header className="bg-stone-900 text-stone-100 border-b border-stone-800 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xs bg-amber-800 flex items-center justify-center font-bold text-amber-100 font-serif text-sm">
            W
          </div>
          <div>
            <h1 className="font-serif text-sm font-bold tracking-wider text-white uppercase">WORLD HOOKAH CONTROL CENTER</h1>
            <p className="text-[10px] text-amber-400 uppercase tracking-widest font-semibold">
              Live Storefront Engine • {user?.role || 'SUPER_ADMIN'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="hidden sm:flex items-center gap-2 bg-stone-800 px-3 py-1.5 rounded-xs border border-stone-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-stone-300">API: Operational</span>
          </div>

          <button
            onClick={() => onNavigate('/')}
            className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1.5 rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Storefront</span>
          </button>

          <button
            onClick={() => { logout(); onNavigate('/'); }}
            className="text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Scroller */}
      <div className="md:hidden bg-white border-b border-stone-200 px-2 py-2 flex gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3 py-1.5 rounded-xs text-xs font-semibold whitespace-nowrap ${activeTab === 'analytics' ? 'bg-amber-900 text-white' : 'bg-stone-100 text-stone-700'}`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-3 py-1.5 rounded-xs text-xs font-semibold whitespace-nowrap ${activeTab === 'products' ? 'bg-amber-900 text-white' : 'bg-stone-100 text-stone-700'}`}
        >
          Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-3 py-1.5 rounded-xs text-xs font-semibold whitespace-nowrap ${activeTab === 'categories' ? 'bg-amber-900 text-white' : 'bg-stone-100 text-stone-700'}`}
        >
          Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('brands')}
          className={`px-3 py-1.5 rounded-xs text-xs font-semibold whitespace-nowrap ${activeTab === 'brands' ? 'bg-amber-900 text-white' : 'bg-stone-100 text-stone-700'}`}
        >
          Brands ({brands.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3 py-1.5 rounded-xs text-xs font-semibold whitespace-nowrap ${activeTab === 'orders' ? 'bg-amber-900 text-white' : 'bg-stone-100 text-stone-700'}`}
        >
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-3 py-1.5 rounded-xs text-xs font-semibold whitespace-nowrap ${activeTab === 'customers' ? 'bg-amber-900 text-white' : 'bg-stone-100 text-stone-700'}`}
        >
          Customers ({customers.length})
        </button>
        <button
          onClick={() => setActiveTab('wholesale')}
          className={`px-3 py-1.5 rounded-xs text-xs font-semibold whitespace-nowrap ${activeTab === 'wholesale' ? 'bg-amber-900 text-white' : 'bg-stone-100 text-stone-700'}`}
        >
          B2B ({wholesaleApps.length})
        </button>
        <button
          onClick={() => setActiveTab('rbac')}
          className={`px-3 py-1.5 rounded-xs text-xs font-semibold whitespace-nowrap ${activeTab === 'rbac' ? 'bg-amber-900 text-white' : 'bg-stone-100 text-stone-700'}`}
        >
          RBAC
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 rounded-xs text-xs font-semibold whitespace-nowrap ${activeTab === 'audit' ? 'bg-amber-900 text-white' : 'bg-stone-100 text-stone-700'}`}
        >
          Audit
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3 py-1.5 rounded-xs text-xs font-semibold whitespace-nowrap ${activeTab === 'settings' ? 'bg-amber-900 text-white' : 'bg-stone-100 text-stone-700'}`}
        >
          Settings
        </button>
      </div>

      {/* Main Admin Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Admin Navigation Sidebar */}
        <aside className="w-64 bg-white border-r border-stone-200 p-4 space-y-1 shrink-0 hidden md:block">
          <div className="text-[10px] uppercase font-bold tracking-widest text-stone-400 px-3 mb-2">
            Operations & Metrics
          </div>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'analytics' ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics & KPIs</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'products' ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4" />
              <span>Catalog Management</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-xs font-mono font-bold ${activeTab === 'products' ? 'bg-amber-800 text-amber-100' : 'bg-stone-100 text-stone-600'}`}>
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'categories' ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4" />
              <span>Categories & Hierarchy</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-xs font-mono font-bold ${activeTab === 'categories' ? 'bg-amber-800 text-amber-100' : 'bg-stone-100 text-stone-600'}`}>
              {categories.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('brands')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'brands' ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Tag className="w-4 h-4" />
              <span>Brands & Manufacturers</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-xs font-mono font-bold ${activeTab === 'brands' ? 'bg-amber-800 text-amber-100' : 'bg-stone-100 text-stone-600'}`}>
              {brands.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'orders' ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4" />
              <span>Orders & Dispatch</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-xs font-mono font-bold ${activeTab === 'orders' ? 'bg-amber-800 text-amber-100' : 'bg-stone-100 text-stone-600'}`}>
              {orders.length}
            </span>
          </button>

          <div className="text-[10px] uppercase font-bold tracking-widest text-stone-400 px-3 pt-4 mb-2">
            Accounts & Access
          </div>

          <button
            onClick={() => setActiveTab('customers')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'customers' ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4" />
              <span>Customer Registry</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-xs font-mono font-bold ${activeTab === 'customers' ? 'bg-amber-800 text-amber-100' : 'bg-stone-100 text-stone-600'}`}>
              {customers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('wholesale')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'wholesale' ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4" />
              <span>B2B Lounge Apps</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-xs font-mono font-bold ${activeTab === 'wholesale' ? 'bg-amber-800 text-amber-100' : 'bg-stone-100 text-stone-600'}`}>
              {wholesaleApps.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rbac')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'rbac' ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>RBAC & Staff Roster</span>
          </button>

          <div className="text-[10px] uppercase font-bold tracking-widest text-stone-400 px-3 pt-4 mb-2">
            Governance & Settings
          </div>

          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'audit' ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4" />
              <span>Audit Trail</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-xs font-mono font-bold ${activeTab === 'audit' ? 'bg-amber-800 text-amber-100' : 'bg-stone-100 text-stone-600'}`}>
              {auditLogs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xs text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'settings' ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Store Configuration</span>
          </button>
        </aside>

        {/* Content Workspace Area */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-7xl">
          
          {loading ? (
            <div className="w-full h-96 flex flex-col items-center justify-center text-stone-500">
              <div className="w-8 h-8 border-2 border-amber-900/30 border-t-amber-900 rounded-full animate-spin mb-3" />
              <p className="text-xs uppercase tracking-widest font-semibold">Loading administrative matrix...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: ANALYTICS */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-stone-900">Commerce Executive Intelligence</h2>
                      <p className="text-xs text-stone-500">Real-time revenue, order volume, inventory telemetry, and shisha metrics.</p>
                    </div>
                    <button
                      onClick={loadAllAdminData}
                      className="bg-white border border-stone-300 text-stone-700 px-3 py-1.5 rounded-xs text-xs font-semibold flex items-center gap-1.5 hover:bg-stone-50 cursor-pointer shadow-2xs"
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
                        ${Number(statsRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">↑ 19.2% vs prior cycle</span>
                    </div>

                    <div className="bg-white border border-stone-200 p-5 rounded-xs shadow-xs">
                      <span className="text-[11px] uppercase font-bold text-stone-500 tracking-wider">Total Orders</span>
                      <div className="text-2xl font-bold text-stone-900 mt-1 font-sans">
                        {statsOrders}
                      </div>
                      <span className="text-[11px] text-stone-500 mt-1 block">100% verified fulfillment</span>
                    </div>

                    <div className="bg-white border border-stone-200 p-5 rounded-xs shadow-xs">
                      <span className="text-[11px] uppercase font-bold text-stone-500 tracking-wider">Average Order Value</span>
                      <div className="text-2xl font-bold text-stone-900 mt-1 font-sans">
                        ${Number(statsAOV).toFixed(2)}
                      </div>
                      <span className="text-[11px] text-amber-800 font-semibold mt-1 block">Master distributor tier</span>
                    </div>

                    <div className="bg-white border border-stone-200 p-5 rounded-xs shadow-xs">
                      <span className="text-[11px] uppercase font-bold text-stone-500 tracking-wider">Inventory Health</span>
                      <div className="text-2xl font-bold text-stone-900 mt-1 font-sans">
                        {statsLowStock} items
                      </div>
                      <span className="text-[11px] text-amber-700 font-semibold mt-1 block">Requires supplier replenishment</span>
                    </div>
                  </div>

                  {/* Top Selling Flavors & Hookahs */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-stone-200 p-6 rounded-xs shadow-xs">
                      <h3 className="font-serif text-base font-bold text-stone-900 mb-4">Top Shisha Flavors & Blends</h3>
                      <div className="space-y-3">
                        {statsTopFlavors.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-stone-100">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-[10px]">{idx + 1}</span>
                              <span className="font-semibold text-stone-900">{item.flavor}</span>
                            </div>
                            <span className="font-bold text-amber-900 font-mono">{item.units} units</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border border-stone-200 p-6 rounded-xs shadow-xs">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-serif text-base font-bold text-stone-900">Low Stock Warning Matrix</h3>
                        <button onClick={() => setActiveTab('products')} className="text-xs text-amber-900 font-semibold hover:underline">
                          View All ({products.length})
                        </button>
                      </div>
                      <div className="space-y-3">
                        {products.filter(p => p.stock <= (p.lowStockThreshold || 5)).slice(0, 5).map((p) => (
                          <div key={p.id} className="flex items-center justify-between text-xs py-2 border-b border-stone-100">
                            <div>
                              <p className="font-bold text-stone-900">{p.name}</p>
                              <p className="text-[11px] text-stone-500 font-mono">SKU: {p.sku} • {p.brand}</p>
                            </div>
                            <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-xs font-bold font-mono">
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
                      <h2 className="font-serif text-2xl font-bold text-stone-900">Catalog & Media Matrix</h2>
                      <p className="text-xs text-stone-500">Manage Russian hookahs, dark leaf tobacco, clay bowls, bases, and prices.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleOpenCreateCategory}
                        className="bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold px-3 py-2 rounded-xs transition-colors flex items-center gap-1.5 border border-stone-300 cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5 text-amber-800" />
                        <span>Add Category</span>
                      </button>
                      <button
                        onClick={handleOpenCreateBrand}
                        className="bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold px-3 py-2 rounded-xs transition-colors flex items-center gap-1.5 border border-stone-300 cursor-pointer"
                      >
                        <Tag className="w-3.5 h-3.5 text-amber-800" />
                        <span>Add Brand</span>
                      </button>
                      <button
                        id="admin-create-product-btn"
                        onClick={handleOpenCreateProduct}
                        className="bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xs transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add New Product</span>
                      </button>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="bg-white border border-stone-200 p-4 rounded-xs flex items-center gap-3 shadow-2xs">
                    <Search className="w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Filter catalog by product title, brand (e.g. Alpha, MustHave), or SKU..."
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      className="w-full text-xs text-stone-800 bg-transparent focus:outline-none"
                    />
                  </div>

                  {/* Products Table */}
                  <div className="bg-white border border-stone-200 rounded-xs overflow-x-auto shadow-xs">
                    <table className="w-full text-left text-xs min-w-[700px]">
                      <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Product Details</th>
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
                              <span className={`px-2 py-0.5 rounded-xs font-mono font-bold ${prod.stock <= (prod.lowStockThreshold || 5) ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                {prod.stock}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-stone-600">{prod.rating.toFixed(1)} ★ ({prod.reviewCount})</td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button
                                onClick={() => handleOpenEditProduct(prod)}
                                className="p-1 text-stone-600 hover:text-amber-900 transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-1 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
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

              {/* TAB: CATEGORIES MANAGEMENT */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif text-2xl font-bold text-stone-900">Categories & Taxonomy Hierarchy</h2>
                        <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-xs font-mono">
                          {categories.length} Total
                        </span>
                      </div>
                      <p className="text-xs text-stone-500">Configure storefront categories, hero media banners, and subcategory taxonomy filters.</p>
                    </div>
                    <button
                      onClick={handleOpenCreateCategory}
                      className="bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xs transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Category</span>
                    </button>
                  </div>

                  {/* Search categories */}
                  <div className="bg-white border border-stone-200 p-4 rounded-xs flex items-center gap-3 shadow-2xs">
                    <Search className="w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Filter categories by name, slug, or subcategory..."
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      className="w-full text-xs text-stone-800 bg-transparent focus:outline-none"
                    />
                  </div>

                  {/* Categories Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories
                      .filter(c => !adminSearch || c.name.toLowerCase().includes(adminSearch.toLowerCase()) || (c.subcategories && c.subcategories.some(s => s.toLowerCase().includes(adminSearch.toLowerCase()))))
                      .map((cat) => {
                        const matchingProductsCount = products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase() || p.categoryId === cat.id).length;
                        return (
                          <div key={cat.id} className="bg-white border border-stone-200 rounded-xs overflow-hidden shadow-xs flex flex-col justify-between hover:border-amber-800/60 transition-colors">
                            <div>
                              <div className="h-32 bg-stone-100 relative overflow-hidden border-b border-stone-100">
                                <img
                                  src={cat.imageUrl || cat.bannerUrl || 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=800'}
                                  alt={cat.name}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                                  <div>
                                    <span className="text-[10px] font-mono uppercase tracking-wider text-white bg-stone-900/90 px-2 py-0.5 rounded-xs border border-white/10">
                                      /{cat.slug}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="p-4 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-serif text-lg font-bold text-stone-900">{cat.name}</h3>
                                  <span className="text-[11px] font-mono font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-xs shrink-0">
                                    {matchingProductsCount} {matchingProductsCount === 1 ? 'Product' : 'Products'}
                                  </span>
                                </div>
                                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                                  {cat.description || 'No description provided.'}
                                </p>
                                
                                {cat.subcategories && cat.subcategories.length > 0 && (
                                  <div className="pt-2">
                                    <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider block mb-1.5">Subcategories</span>
                                    <div className="flex flex-wrap gap-1">
                                      {cat.subcategories.map((sub, i) => (
                                        <span key={i} className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-xs border border-stone-200">
                                          {sub}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs">
                              <button
                                onClick={() => onNavigate(`/shop?category=${encodeURIComponent(cat.name)}`)}
                                className="text-amber-900 hover:text-amber-700 font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Shop View</span>
                              </button>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOpenEditCategory(cat)}
                                  className="p-1.5 bg-white border border-stone-200 hover:bg-amber-50 hover:text-amber-900 text-stone-700 rounded-xs transition-colors cursor-pointer"
                                  title="Edit Category"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                  className="p-1.5 bg-white border border-stone-200 hover:bg-rose-50 hover:text-rose-700 text-stone-400 rounded-xs transition-colors cursor-pointer"
                                  title="Delete Category"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* TAB: BRANDS MANAGEMENT */}
              {activeTab === 'brands' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif text-2xl font-bold text-stone-900">Brands & Authorized Makers</h2>
                        <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-xs font-mono">
                          {brands.length} Brands
                        </span>
                      </div>
                      <p className="text-xs text-stone-500">Curate hookah manufacturers, Russian dark leaf masters, and artisan craft studios.</p>
                    </div>
                    <button
                      onClick={handleOpenCreateBrand}
                      className="bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xs transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Brand</span>
                    </button>
                  </div>

                  {/* Search brands */}
                  <div className="bg-white border border-stone-200 p-4 rounded-xs flex items-center gap-3 shadow-2xs">
                    <Search className="w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Filter brands by name, country of origin (e.g. Russia, Germany, USA), or description..."
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      className="w-full text-xs text-stone-800 bg-transparent focus:outline-none"
                    />
                  </div>

                  {/* Brands Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {brands
                      .filter(b => !adminSearch || b.name.toLowerCase().includes(adminSearch.toLowerCase()) || (b.origin && b.origin.toLowerCase().includes(adminSearch.toLowerCase())))
                      .map((brand) => {
                        const matchingProductsCount = products.filter(p => p.brand.toLowerCase() === brand.name.toLowerCase()).length;
                        return (
                          <div key={brand.id} className="bg-white border border-stone-200 rounded-xs overflow-hidden shadow-xs flex flex-col justify-between hover:border-amber-300 transition-colors">
                            <div className="p-4 space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xs border border-stone-200 bg-stone-50 p-1 flex items-center justify-center overflow-hidden shrink-0">
                                  {brand.logoUrl ? (
                                    <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                  ) : (
                                    <Award className="w-6 h-6 text-amber-900" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <h3 className="font-serif text-base font-bold text-stone-900 truncate">{brand.name}</h3>
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] uppercase font-bold text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-xs">
                                      {brand.origin || 'Global'}
                                    </span>
                                    <span className="text-[10px] text-stone-400 font-mono">
                                      {matchingProductsCount} {matchingProductsCount === 1 ? 'item' : 'items'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                                {brand.description || 'Authentic manufacturer with certified distribution.'}
                              </p>
                            </div>

                            <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs">
                              <button
                                onClick={() => onNavigate(`/shop?brand=${encodeURIComponent(brand.name)}`)}
                                className="text-amber-900 hover:text-amber-700 font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Browse Catalog</span>
                              </button>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOpenEditBrand(brand)}
                                  className="p-1.5 bg-white border border-stone-200 hover:bg-amber-50 hover:text-amber-900 text-stone-700 rounded-xs transition-colors cursor-pointer"
                                  title="Edit Brand"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBrand(brand.id, brand.name)}
                                  className="p-1.5 bg-white border border-stone-200 hover:bg-rose-50 hover:text-rose-700 text-stone-400 rounded-xs transition-colors cursor-pointer"
                                  title="Delete Brand"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* TAB 3: ORDERS MANAGEMENT */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-stone-900">Orders & Fulfillment Dispatch</h2>
                      <p className="text-xs text-stone-500">Manage orders, adult signature confirmation, and assign carrier tracking.</p>
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
                  <div className="bg-white border border-stone-200 rounded-xs overflow-x-auto shadow-xs">
                    <table className="w-full text-left text-xs min-w-[750px]">
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
                            <td className="py-3 px-4 font-mono font-bold text-stone-900">${(ord.grandTotal || ord.total || 0).toFixed(2)}</td>
                            <td className="py-3 px-4">
                              <select
                                value={ord.status || ord.orderStatus}
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
                                  className="text-amber-900 hover:underline font-semibold cursor-pointer"
                                >
                                  + Assign Tracking
                                </button>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => onNavigate(`/order-success?orderId=${ord.id}`)}
                                className="text-xs font-semibold text-amber-900 hover:underline cursor-pointer"
                              >
                                View Details
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
                    <p className="text-xs text-stone-500">Verified buyers, age certification records, and purchase histories.</p>
                  </div>

                  <div className="bg-white border border-stone-200 rounded-xs overflow-x-auto shadow-xs">
                    <table className="w-full text-left text-xs min-w-[650px]">
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
                                <ShieldCheck className="w-3.5 h-3.5" /> 21+ Verified
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
                    <h2 className="font-serif text-2xl font-bold text-stone-900">B2B Lounge & Wholesale Applications</h2>
                    <p className="text-xs text-stone-500">Review business licenses, EIN tax numbers, and approve tiered wholesale accounts.</p>
                  </div>

                  <div className="space-y-4">
                    {wholesaleApps.length === 0 ? (
                      <div className="bg-white border border-stone-200 p-8 rounded-xs text-center text-stone-500 text-xs">
                        No pending wholesale applications at this time.
                      </div>
                    ) : (
                      wholesaleApps.map((app) => (
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
                                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-xs transition-colors cursor-pointer"
                              >
                                Approve Wholesale Partner
                              </button>
                              <button
                                onClick={() => handleReviewWholesale(app.id, 'REJECTED')}
                                className="bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold px-4 py-2 rounded-xs transition-colors cursor-pointer"
                              >
                                Decline Application
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: RBAC & STAFF */}
              {activeTab === 'rbac' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-stone-900">Roles & Staff Security (RBAC)</h2>
                      <p className="text-xs text-stone-500">Inspect system roles, authorization scopes, and provision staff access.</p>
                    </div>
                    <button
                      onClick={() => setIsStaffModalOpen(true)}
                      className="bg-amber-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Provision Staff</span>
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
                    <p className="text-xs text-stone-500">Immutable ledger of price updates, stock changes, and dispatch executions.</p>
                  </div>

                  <div className="bg-white border border-stone-200 rounded-xs overflow-x-auto shadow-xs">
                    <table className="w-full text-left text-xs min-w-[700px]">
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
              {activeTab === 'settings' && (
                <div className="bg-white border border-stone-200 rounded-xs p-6 shadow-xs max-w-2xl space-y-6">
                  <h2 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">
                    Storefront Global Configuration
                  </h2>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Store Name</label>
                      <input
                        type="text"
                        defaultValue={settings?.storeName || 'World Hookah Market'}
                        className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Free Shipping Threshold ($)</label>
                        <input
                          type="number"
                          defaultValue={settings?.freeShippingThreshold || 99}
                          className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Standard Sales Tax (%)</label>
                        <input
                          type="number"
                          defaultValue={((settings?.taxRate || 0.0825) * 100).toFixed(1)}
                          className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xs space-y-1 text-stone-800">
                      <strong>Age & Tobacco Regulations:</strong>
                      <p>Age 21+ verification gate, Proposition 65 health warnings, and Adult Signature delivery are active.</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => showToast('Storefront configurations saved successfully', 'success')}
                      className="bg-stone-900 hover:bg-amber-900 text-white font-semibold py-2.5 px-6 rounded-xs transition-colors cursor-pointer"
                    >
                      Save Store Settings
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </main>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-300 rounded-sm shadow-2xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {editingProduct ? 'Edit Catalog Product' : 'Add New Hookah Product'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
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
                    placeholder="e.g. Alpha Hookah Model X Black Matte"
                    className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-stone-700">Brand *</label>
                    <button
                      type="button"
                      onClick={() => handleOpenCreateBrand()}
                      className="text-[11px] text-amber-900 hover:text-amber-700 font-semibold cursor-pointer"
                    >
                      + Add New Brand
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      list="admin-brand-options"
                      value={prodBrand}
                      onChange={(e) => setProdBrand(e.target.value)}
                      placeholder="Select or enter brand name..."
                      className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
                    />
                    <datalist id="admin-brand-options">
                      {brands.map(b => (
                        <option key={b.id} value={b.name}>{b.origin ? `${b.name} (${b.origin})` : b.name}</option>
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-stone-700">Category *</label>
                    <button
                      type="button"
                      onClick={() => handleOpenCreateCategory()}
                      className="text-[11px] text-amber-900 hover:text-amber-700 font-semibold cursor-pointer"
                    >
                      + Add New Category
                    </button>
                  </div>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
                  >
                    {categories.length > 0 ? (
                      categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="Hookahs">Hookahs</option>
                        <option value="Shisha Tobacco">Shisha Tobacco</option>
                        <option value="Hookah Bowls">Hookah Bowls</option>
                        <option value="Bases & Glass">Bases & Glass</option>
                        <option value="Charcoal & Heat">Charcoal & Heat</option>
                        <option value="Accessories & HMD">Accessories & HMD</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Price ($) *</label>
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
                  <label className="block font-semibold text-stone-700 mb-1">Sale Price ($) (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodSalePrice}
                    onChange={(e) => setProdSalePrice(e.target.value)}
                    placeholder="Leave empty for regular price"
                    className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Stock Quantity *</label>
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
                    placeholder="e.g. Grapefruit Strawberry Raspberry"
                    className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Product Image URL</label>
                  <input
                    type="text"
                    required
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                    placeholder="https://..."
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
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-4 py-2 rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-stone-900 hover:bg-amber-900 text-white font-semibold px-5 py-2 rounded-xs cursor-pointer transition-colors"
                >
                  Save Product
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
            <h3 className="font-serif text-base font-bold text-stone-900">Assign Express Tracking</h3>
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
                  className="bg-stone-100 text-stone-700 font-semibold px-4 py-2 rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-900 text-white font-semibold px-5 py-2 rounded-xs cursor-pointer"
                >
                  Save & Confirm Dispatch
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
                  className="bg-stone-100 text-stone-700 font-semibold px-4 py-2 rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-900 text-white font-semibold px-5 py-2 rounded-xs cursor-pointer"
                >
                  Generate Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-300 rounded-sm shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-900" />
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {editingCategory ? 'Edit Store Category' : 'Create New Category'}
                </h3>
              </div>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Russian Stainless Hookahs"
                  className="w-full bg-stone-50 border border-stone-300 p-2.5 rounded-xs font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Brief description for customer taxonomy exploration..."
                  className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={catImageUrl}
                  onChange={(e) => setCatImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Hero Banner URL (Optional)</label>
                <input
                  type="text"
                  value={catBannerUrl}
                  onChange={(e) => setCatBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Subcategories (Comma-separated)</label>
                <input
                  type="text"
                  value={catSubcategoriesStr}
                  onChange={(e) => setCatSubcategoriesStr(e.target.value)}
                  placeholder="e.g. Classic, Travel Mini, Heavy Stainless, Artistic Glass"
                  className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">Separate subcategory tags with commas.</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-4 py-2 rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-stone-900 hover:bg-amber-900 text-white font-semibold px-5 py-2 rounded-xs cursor-pointer transition-colors"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT BRAND MODAL */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-300 rounded-sm shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-900" />
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {editingBrand ? 'Edit Manufacturer Brand' : 'Register New Brand'}
                </h3>
              </div>
              <button onClick={() => setIsBrandModalOpen(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Alpha Hookah"
                    className="w-full bg-stone-50 border border-stone-300 p-2.5 rounded-xs font-semibold text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Origin Country</label>
                  <input
                    type="text"
                    value={brandOrigin}
                    onChange={(e) => setBrandOrigin(e.target.value)}
                    placeholder="e.g. Russia, Germany, USA, UAE"
                    className="w-full bg-stone-50 border border-stone-300 p-2.5 rounded-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Brand Logo / Visual URL</label>
                <input
                  type="text"
                  value={brandLogoUrl}
                  onChange={(e) => setBrandLogoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Brand Description & Heritage</label>
                <textarea
                  rows={3}
                  value={brandDesc}
                  onChange={(e) => setBrandDesc(e.target.value)}
                  placeholder="History, engineering pedigree, and product specialization..."
                  className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-4 py-2 rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-stone-900 hover:bg-amber-900 text-white font-semibold px-5 py-2 rounded-xs cursor-pointer transition-colors"
                >
                  {editingBrand ? 'Update Brand' : 'Register Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
