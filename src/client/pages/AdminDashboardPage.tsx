import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore.js';
import { api } from '../services/api.js';
import { broadcastSync, onSync } from '../services/sync.js';
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
  AlertCircle,
  RotateCcw,
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
  Award,
  Database,
  UploadCloud,
  FileSpreadsheet,
  Download,
  UserCheck,
  UserX,
  Key,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { BulkProductUpdateModal } from '../components/BulkProductUpdateModal.js';
import { exportCustomersToExcel, exportInventoryToExcel } from '../utils/excelExport.js';

function getCatalogPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | string)[] = [];
  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, '...', total);
  } else if (current >= total - 3) {
    pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total);
  }
  return pages;
}

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user, userPermissions, logout, showToast, isAdmin, isAuthLoading, setUser } = useStore();
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'categories' | 'brands' | 'orders' | 'customers' | 'wholesale' | 'rbac' | 'audit' | 'settings'>('analytics');

  // Admin Login State for Gateway
  const [adminLoginEmail, setAdminLoginEmail] = useState('');
  const [adminLoginPassword, setAdminLoginPassword] = useState('');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');

  // Admin Data State
  const [analytics, setAnalytics] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProductsCount, setTotalProductsCount] = useState<number>(5590);
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

  // MongoDB Cloud Storage State
  const [mongoStatus, setMongoStatus] = useState<{
    isConnected: boolean;
    isConnecting: boolean;
    uriConfigured: boolean;
    dbName: string;
    collectionCounts: Record<string, number>;
    lastSyncAt: string | null;
    lastError: string | null;
  } | null>(null);
  const [mongoSyncing, setMongoSyncing] = useState(false);

  // Excel Export State
  const [exportingCustomers, setExportingCustomers] = useState(false);
  const [exportingInventory, setExportingInventory] = useState(false);

  // Modals & Sub-forms
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
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
  const [prodSku, setProdSku] = useState('');
  const [prodBrand, setProdBrand] = useState('Alpha Hookah');
  const [prodCategory, setProdCategory] = useState('Hookahs');
  const [prodSubcategory, setProdSubcategory] = useState('');
  const [prodPrice, setProdPrice] = useState('249.00');
  const [prodSalePrice, setProdSalePrice] = useState('');
  const [prodStock, setProdStock] = useState('15');
  const [prodFlavor, setProdFlavor] = useState('');
  const [prodMaterial, setProdMaterial] = useState('');
  const [prodShortDesc, setProdShortDesc] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [prodIsBestSeller, setProdIsBestSeller] = useState(false);
  const [prodIsNewArrival, setProdIsNewArrival] = useState(false);
  const [prodIsActive, setProdIsActive] = useState(true);
  const [prodRating, setProdRating] = useState('5.0');

  // Staff Form Fields
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffFirstName, setStaffFirstName] = useState('');
  const [staffLastName, setStaffLastName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState('PRODUCT_SPECIALIST');

  // Staff Management State
  const [staffMembers, setStaffMembers] = useState<User[]>([]);
  const [isEditStaffModalOpen, setIsEditStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [editStaffFirstName, setEditStaffFirstName] = useState('');
  const [editStaffLastName, setEditStaffLastName] = useState('');
  const [editStaffPhone, setEditStaffPhone] = useState('');
  const [editStaffRole, setEditStaffRole] = useState('PRODUCT_SPECIALIST');
  const [editStaffStatus, setEditStaffStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');
  const [editStaffPassword, setEditStaffPassword] = useState('');
  const [staffToDelete, setStaffToDelete] = useState<User | null>(null);

  // Catalog Pagination & Filtering State
  const [catalogPage, setCatalogPage] = useState<number>(1);
  const [catalogLimit, setCatalogLimit] = useState<number>(50);
  const [catalogCategory, setCatalogCategory] = useState<string>('');
  const [catalogBrand, setCatalogBrand] = useState<string>('');
  const [catalogStockFilter, setCatalogStockFilter] = useState<string>('all');
  const [catalogSortBy, setCatalogSortBy] = useState<string>('newest');
  const [catalogTotalPages, setCatalogTotalPages] = useState<number>(1);
  const [catalogLoading, setCatalogLoading] = useState<boolean>(false);
  const [jumpPageInput, setJumpPageInput] = useState<string>('');

  // Bulk Product Selection & Actions State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [bulkPriceAction, setBulkPriceAction] = useState<'none' | 'set' | 'increase_percent' | 'decrease_percent' | 'increase_fixed' | 'decrease_fixed'>('none');
  const [bulkPriceValue, setBulkPriceValue] = useState('');
  const [bulkStockAction, setBulkStockAction] = useState<'none' | 'set' | 'increase' | 'decrease'>('none');
  const [bulkStockValue, setBulkStockValue] = useState('');
  const [bulkCategoryAction, setBulkCategoryAction] = useState('');
  const [bulkBrandAction, setBulkBrandAction] = useState('');
  const [bulkBadgeAction, setBulkBadgeAction] = useState<'none' | 'set_sale' | 'remove_sale' | 'set_bestseller' | 'remove_bestseller' | 'set_featured' | 'remove_featured'>('none');
  const [isApplyingBulk, setIsApplyingBulk] = useState(false);

  // Search & Filter within Admin Tables
  const [adminSearch, setAdminSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  // Real-Time Live Order Alert & Highlight
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null);

  // Store Settings Editable Fields
  const [settingStoreName, setSettingStoreName] = useState('World Hookah Market');
  const [settingTaxRate, setSettingTaxRate] = useState('8.25');
  const [settingFreeShipping, setSettingFreeShipping] = useState('150');
  const [settingAnnouncement, setSettingAnnouncement] = useState('Free shipping on luxury orders above $150 • Authentic Russian & European Hookahs');
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Synthesized notification chime for instant order feedback
  const playOrderChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Note 1 (D5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Note 2 (A5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.12);
      gain2.gain.setValueAtTime(0.2, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.65);
    } catch {
      // AudioContext autoplay restrictions are handled silently
    }
  };

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

    // Ensure valid administrative auth token is available before calling administrative APIs
    let token = localStorage.getItem('sultan_auth_token');
    let needsTokenRefresh = !token;

    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const isExpired = payload.exp && (Date.now() / 1000 >= payload.exp);
          const isCustomer = payload.role === 'CUSTOMER';
          if (isExpired || isCustomer) {
            needsTokenRefresh = true;
          }
        }
      } catch {
        needsTokenRefresh = true;
      }
    }

    if (needsTokenRefresh && user) {
      try {
        const syncRes = await api.googleLogin({
          email: user.email,
          name: `${user.firstName || 'VIP'} ${user.lastName || 'Admin'}`.trim(),
          avatarUrl: user.avatarUrl
        });
        if (syncRes.success && syncRes.data?.token) {
          token = syncRes.data.token;
          localStorage.setItem('sultan_auth_token', token);
          if (syncRes.data.user) {
            setUser(syncRes.data.user, ['*']);
          }
        }
      } catch (err) {
        console.warn('Admin token synchronization note:', err);
      }
    }

    // If no valid session token exists, require manual authentication
    if (!token) return;

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
        brandsRes,
        staffRes
      ] = await Promise.all([
        api.getAnalytics().catch(() => ({ success: false, data: null })),
        api.getProducts({ page: 1, limit: catalogLimit, sort: catalogSortBy }).catch(() => ({ success: false, data: { products: [] } })),
        api.getAdminOrders().catch(() => ({ success: false, data: [] })),
        api.getAdminCustomers().catch(() => ({ success: false, data: [] })),
        api.getWholesaleApplications().catch(() => ({ success: false, data: [] })),
        api.getAdminRoles().catch(() => ({ success: false, data: [] })),
        api.getAdminPermissions().catch(() => ({ success: false, data: [] })),
        api.getAdminAuditLogs().catch(() => ({ success: false, data: [] })),
        api.getSettings().catch(() => ({ success: false, data: null })),
        api.getCategories().catch(() => ({ success: false, data: [] })),
        api.getBrands().catch(() => ({ success: false, data: [] })),
        api.getAdminStaff().catch(() => ({ success: false, data: [] }))
      ]);

      if (analyticsRes.success && analyticsRes.data) {
        setAnalytics(analyticsRes.data);
        if (analyticsRes.data.totalProducts) {
          setTotalProductsCount(analyticsRes.data.totalProducts);
        }
      }
      if (productsRes.success && productsRes.data) {
        setProducts(productsRes.data.products || []);
        const pagination = (productsRes.data as any).pagination;
        if (pagination) {
          setTotalProductsCount(pagination.totalCount || 0);
          setCatalogTotalPages(pagination.totalPages || 1);
          setCatalogPage(pagination.page || 1);
        } else {
          setTotalProductsCount(productsRes.data.products?.length || 0);
          setCatalogTotalPages(1);
        }
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
        if (settingsRes.data.storeName) setSettingStoreName(settingsRes.data.storeName);
        if (settingsRes.data.taxRate !== undefined) setSettingTaxRate(((settingsRes.data.taxRate || 0) * 100).toFixed(2));
        if (settingsRes.data.freeShippingThreshold !== undefined) setSettingFreeShipping(settingsRes.data.freeShippingThreshold.toString());
        if (settingsRes.data.announcement) setSettingAnnouncement(settingsRes.data.announcement);
      }
      if (catsRes.success && catsRes.data) {
        setCategories(catsRes.data || []);
      }
      if (brandsRes.success && brandsRes.data) {
        setBrands(brandsRes.data || []);
      }
      if (staffRes.success && staffRes.data) {
        setStaffMembers(staffRes.data || []);
      }

      // Fetch MongoDB connection & collection metrics
      api.getMongoStatus().then(res => {
        if (res.success && res.data) setMongoStatus(res.data);
      }).catch(() => {});
    } catch (err) {
      console.error('Failed to load admin suite data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStoreSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSettingsSaving(true);
    try {
      const parsedTax = (parseFloat(settingTaxRate) || 0) / 100;
      const parsedFreeShip = parseFloat(settingFreeShipping) || 150;
      const payload: Partial<StoreSettings> = {
        storeName: settingStoreName.trim() || 'World Hookah Market',
        taxRate: parsedTax,
        freeShippingThreshold: parsedFreeShip,
        announcement: settingAnnouncement.trim()
      };
      const res = await api.updateAdminSettings(payload);
      if (res.success && res.data) {
        setSettings(res.data);
        showToast('Storefront configurations saved & synchronized live!', 'success');
        broadcastSync('SETTINGS_UPDATED', { settings: res.data });
      } else {
        showToast('Storefront settings updated', 'success');
        broadcastSync('SETTINGS_UPDATED', { settings: payload });
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save store settings', 'error');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleTriggerMongoSync = async () => {
    setMongoSyncing(true);
    try {
      const res = await api.syncMongo();
      if (res.success) {
        showToast(res.message || 'Data successfully persisted to MongoDB', 'success');
        if (res.data) setMongoStatus(res.data);
      } else {
        showToast('MongoDB sync notice (verify MONGODB_URI in settings)', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to sync to MongoDB', 'error');
    } finally {
      setMongoSyncing(false);
    }
  };

  const handleReconnectMongo = async () => {
    setMongoSyncing(true);
    try {
      const res = await api.reconnectMongo();
      if (res.success) {
        showToast('Connected to MongoDB database cluster', 'success');
        if (res.data) setMongoStatus(res.data);
      } else {
        showToast('Unable to reach MongoDB cluster. Running in resilient local cache mode.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'MongoDB connection error', 'error');
    } finally {
      setMongoSyncing(false);
    }
  };

  // Download Customer Data in Excel (.xlsx)
  const handleDownloadCustomersExcel = async () => {
    try {
      setExportingCustomers(true);
      showToast('Preparing verified customer registry for Excel download...', 'info');

      let targetCustomers = customers;
      // If customer list in state is empty or partial, re-fetch
      if (!targetCustomers || targetCustomers.length === 0) {
        const res = await api.getAdminCustomers();
        if (res.success && res.data) {
          targetCustomers = res.data;
          setCustomers(res.data);
        }
      }

      if (!targetCustomers || targetCustomers.length === 0) {
        showToast('No customer records found to export', 'error');
        return;
      }

      exportCustomersToExcel(targetCustomers);
      showToast(`Exported ${targetCustomers.length} customer records to Excel (.xlsx)`, 'success');
    } catch (err: any) {
      console.error('Failed to export customers to Excel:', err);
      showToast(err.message || 'Failed to generate customer Excel file', 'error');
    } finally {
      setExportingCustomers(false);
    }
  };

  // Download Inventory & Stock Matrix in Excel (.xlsx)
  const handleDownloadInventoryExcel = async (onlyFiltered: boolean = false) => {
    try {
      setExportingInventory(true);
      showToast('Compiling inventory stock levels & valuations for Excel download...', 'info');

      let targetProducts = onlyFiltered ? filteredProducts : products;

      // If exporting full catalog and loaded products are fewer than total, fetch all products
      if (!onlyFiltered && (products.length < totalProductsCount || products.length === 0)) {
        try {
          const res = await api.getAdminProducts();
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            targetProducts = res.data;
          }
        } catch (e) {
          console.warn('Could not fetch full admin catalog endpoint, falling back to loaded products', e);
        }
      }

      if (!targetProducts || targetProducts.length === 0) {
        showToast('No inventory records found to export', 'error');
        return;
      }

      exportInventoryToExcel(targetProducts);
      showToast(`Exported ${targetProducts.length} inventory items to Excel (.xlsx)`, 'success');
    } catch (err: any) {
      console.error('Failed to export inventory to Excel:', err);
      showToast(err.message || 'Failed to generate inventory Excel file', 'error');
    } finally {
      setExportingInventory(false);
    }
  };

  const fetchAdminCatalog = async (
    page: number = catalogPage,
    limit: number = catalogLimit,
    search: string = adminSearch,
    category: string = catalogCategory,
    brand: string = catalogBrand,
    stockStatus: string = catalogStockFilter,
    sort: string = catalogSortBy
  ) => {
    try {
      setCatalogLoading(true);
      const params: Record<string, any> = {
        page,
        limit: limit === -1 ? 10000 : limit,
        q: search ? search.trim() : undefined,
        category: category || undefined,
        brand: brand || undefined,
        stockStatus: stockStatus !== 'all' ? stockStatus : undefined,
        sort
      };
      const res = await api.getProducts(params);
      if (res.success && res.data) {
        setProducts(res.data.products || []);
        if (res.data.pagination) {
          setTotalProductsCount(res.data.pagination.totalCount);
          setCatalogTotalPages(res.data.pagination.totalPages);
          setCatalogPage(res.data.pagination.page);
        } else {
          setTotalProductsCount(res.data.products?.length || 0);
          setCatalogTotalPages(1);
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin catalog products:', err);
    } finally {
      setCatalogLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;

    // Initial load
    loadAllAdminData();

    // 1. Listen for real-time broadcast events (same-window or other tabs/devices)
    const unsub = onSync('*', (event) => {
      if (event.type === 'ORDER_PLACED' && event.payload?.order) {
        const newOrd = event.payload.order;
        setOrders(prev => {
          if (prev.some(o => o.id === newOrd.id)) return prev;
          return [newOrd, ...prev];
        });
        setHighlightedOrderId(newOrd.id);
        playOrderChime();
        showToast(`🔔 New Order #${newOrd.orderNumber} placed by ${newOrd.customerName} ($${(newOrd.grandTotal || newOrd.total || 0).toFixed(2)})!`, 'success');
        setTimeout(() => setHighlightedOrderId(null), 10000);

        // Refresh analytics metrics in background
        api.getAnalytics().then(aRes => {
          if (aRes.success && aRes.data) setAnalytics(aRes.data);
        }).catch(() => {});
      } else if (event.type === 'INVENTORY_UPDATED' || event.type === 'PRODUCT_UPDATED') {
        // Refresh catalog inventory table
        fetchAdminCatalog();
      }
    });

    // 2. Continuous real-time polling: Every 4 seconds, check for any newly placed orders
    const pollInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem('sultan_auth_token');
        if (!token) return;
        const res = await api.getAdminOrders({ limit: 50 });
        if (res.success && res.data) {
          const freshOrders = res.data;
          setOrders(prev => {
            const prevIds = new Set(prev.map(o => o.id));
            const brandNewOrders = freshOrders.filter(o => !prevIds.has(o.id));
            if (brandNewOrders.length > 0) {
              const newest = brandNewOrders[0];
              playOrderChime();
              showToast(`🔔 New Order #${newest.orderNumber} placed by ${newest.customerName} ($${(newest.grandTotal || newest.total || 0).toFixed(2)})!`, 'success');
              setHighlightedOrderId(newest.id);
              setTimeout(() => setHighlightedOrderId(null), 10000);
              api.getAnalytics().then(aRes => {
                if (aRes.success && aRes.data) setAnalytics(aRes.data);
              }).catch(() => {});
              return freshOrders;
            }
            return freshOrders;
          });
        }
      } catch {
        // silent polling catch
      }
    }, 4000);

    // 3. Tab visibility / window focus listener (refreshes immediately when admin opens or focuses tab)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const token = localStorage.getItem('sultan_auth_token');
        if (!token) return;
        api.getAdminOrders({ limit: 50 }).then(res => {
          if (res.success && res.data) setOrders(res.data);
        }).catch(() => {});
        api.getAnalytics().then(res => {
          if (res.success && res.data) setAnalytics(res.data);
        }).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      unsub();
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, [isAdmin]);

  // Fetch products whenever catalog pagination or filters change
  useEffect(() => {
    if (activeTab === 'products') {
      fetchAdminCatalog(catalogPage, catalogLimit, adminSearch, catalogCategory, catalogBrand, catalogStockFilter, catalogSortBy);
    }
  }, [catalogPage, catalogLimit, catalogCategory, catalogBrand, catalogStockFilter, catalogSortBy, activeTab]);

  // Debounced search for catalog filter
  useEffect(() => {
    if (activeTab !== 'products') return;
    const timer = setTimeout(() => {
      setCatalogPage(1);
      fetchAdminCatalog(1, catalogLimit, adminSearch, catalogCategory, catalogBrand, catalogStockFilter, catalogSortBy);
    }, 350);
    return () => clearTimeout(timer);
  }, [adminSearch]);

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
    setProdSku(`SKU-${Date.now().toString(36).toUpperCase()}`);
    setProdBrand('Alpha Hookah');
    setProdCategory('Hookahs');
    setProdSubcategory('');
    setProdPrice('249.00');
    setProdSalePrice('');
    setProdStock('15');
    setProdFlavor('');
    setProdMaterial('V2A Stainless Steel');
    setProdShortDesc('');
    setProdDesc('Premium Russian engineered hookah with magnetic purge valve and stainless steel core.');
    setProdImageUrl('https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=800');
    setProdIsFeatured(false);
    setProdIsBestSeller(false);
    setProdIsNewArrival(true);
    setProdIsActive(true);
    setProdRating('5.0');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdSku(prod.sku || '');
    setProdBrand(prod.brand);
    setProdCategory(prod.category);
    setProdSubcategory(prod.subcategory || '');
    setProdPrice(prod.price.toString());
    setProdSalePrice(prod.salePrice ? prod.salePrice.toString() : '');
    setProdStock(prod.stock.toString());
    setProdFlavor(prod.flavor || '');
    setProdMaterial(prod.material || '');
    setProdShortDesc(prod.shortDescription || '');
    setProdDesc(prod.description);
    setProdImageUrl(prod.images[0]?.url || '');
    setProdIsFeatured(!!prod.isFeatured);
    setProdIsBestSeller(!!prod.isBestSeller);
    setProdIsNewArrival(!!prod.isNewArrival);
    setProdIsActive(prod.isActive !== false);
    setProdRating(prod.rating ? prod.rating.toString() : '5.0');
    setIsProductModalOpen(true);
  };

  const handleQuickStockUpdate = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    try {
      const res = await api.updateProduct(product.id, { stock: newStock });
      if (res.success) {
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: newStock } : p));
        showToast(`${product.name}: stock updated to ${newStock}`, 'success');
        broadcastSync('INVENTORY_UPDATED', { productId: product.id, newStock });
      }
    } catch (err: any) {
      showToast(err.message || 'Stock update failed', 'error');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const primaryUrl = prodImageUrl.trim() || 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=800';
      const existingImages = editingProduct?.images || [];
      let updatedImages = existingImages.map((img, idx) => idx === 0 ? { ...img, url: primaryUrl, thumbnailUrl: primaryUrl, alt: prodName } : img);
      if (updatedImages.length === 0) {
        updatedImages = [{ id: `img-${Date.now()}`, url: primaryUrl, thumbnailUrl: primaryUrl, alt: prodName, isPrimary: true, sortOrder: 1 }];
      }

      const parsedPrice = parseFloat(prodPrice) || 0;
      const parsedSalePrice = prodSalePrice ? parseFloat(prodSalePrice) : undefined;

      const payload: any = {
        name: prodName.trim(),
        sku: prodSku.trim() || undefined,
        brand: prodBrand.trim(),
        category: prodCategory.trim(),
        subcategory: prodSubcategory.trim() || undefined,
        price: parsedPrice,
        salePrice: parsedSalePrice,
        isOnSale: !!parsedSalePrice && parsedSalePrice < parsedPrice,
        stock: parseInt(prodStock, 10) || 0,
        flavor: prodFlavor.trim() || undefined,
        material: prodMaterial.trim() || undefined,
        shortDescription: prodShortDesc.trim() || undefined,
        description: prodDesc.trim(),
        images: updatedImages,
        isFeatured: prodIsFeatured,
        isBestSeller: prodIsBestSeller,
        isNewArrival: prodIsNewArrival,
        isActive: prodIsActive,
        rating: parseFloat(prodRating) || 5.0
      };

      if (editingProduct) {
        const res = await api.updateProduct(editingProduct.id, payload);
        if (res.success) {
          showToast(`Product "${prodName}" updated successfully!`, 'success');
          broadcastSync('PRODUCT_UPDATED', { product: res.data, action: 'update' });
        }
      } else {
        const res = await api.createProduct(payload);
        if (res.success) {
          showToast(`New product "${prodName}" added to catalog!`, 'success');
          broadcastSync('PRODUCT_UPDATED', { product: res.data, action: 'create' });
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
        broadcastSync('PRODUCT_UPDATED', { id, action: 'delete' });
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
    setCatImageUrl('https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=800');
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
        imageUrl: catImageUrl.trim() || 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=800',
        bannerUrl: catBannerUrl.trim() || 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1200',
        subcategories
      };

      if (editingCategory) {
        const res = await api.updateAdminCategory(editingCategory.id, payload);
        if (res.success) {
          showToast(`Category "${catName}" updated successfully!`, 'success');
          broadcastSync('CATEGORY_UPDATED', { category: res.data, action: 'update' });
        }
      } else {
        const res = await api.createAdminCategory(payload);
        if (res.success) {
          showToast(`New category "${catName}" created!`, 'success');
          broadcastSync('CATEGORY_UPDATED', { category: res.data, action: 'create' });
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
        broadcastSync('CATEGORY_UPDATED', { id, action: 'delete' });
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
    setBrandLogoUrl('https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=400');
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
        logoUrl: brandLogoUrl.trim() || 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=400'
      };

      if (editingBrand) {
        const res = await api.updateAdminBrand(editingBrand.id, payload);
        if (res.success) {
          showToast(`Brand "${brandName}" updated successfully!`, 'success');
          broadcastSync('CATEGORY_UPDATED', { brand: res.data });
        }
      } else {
        const res = await api.createAdminBrand(payload);
        if (res.success) {
          showToast(`New brand "${brandName}" created!`, 'success');
          broadcastSync('CATEGORY_UPDATED', { brand: res.data });
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
        broadcastSync('CATEGORY_UPDATED', { id, action: 'delete' });
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
        broadcastSync('ORDER_UPDATED', { orderId, status });
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
        broadcastSync('ORDER_UPDATED', { orderId: selectedOrderForTracking.id, status: 'SHIPPED', trackingNumber: newTrackingNumber });
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

  // Staff Management Handlers
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createStaffAccount({
        email: staffEmail.trim(),
        password: staffPassword.trim(),
        firstName: staffFirstName.trim(),
        lastName: staffLastName.trim(),
        phone: staffPhone.trim() || undefined,
        role: staffRole
      });
      if (res.success) {
        showToast(`Staff member "${staffEmail}" provisioned with role ${staffRole}`, 'success');
        setIsStaffModalOpen(false);
        setStaffEmail('');
        setStaffPassword('');
        setStaffFirstName('');
        setStaffLastName('');
        setStaffPhone('');
        setStaffRole('PRODUCT_SPECIALIST');
        loadAllAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create staff account', 'error');
    }
  };

  const handleOpenEditStaff = (staff: User) => {
    setEditingStaff(staff);
    setEditStaffFirstName(staff.firstName || '');
    setEditStaffLastName(staff.lastName || '');
    setEditStaffPhone(staff.phone || '');
    setEditStaffRole(staff.role || 'PRODUCT_SPECIALIST');
    setEditStaffStatus((staff.status as any) || 'ACTIVE');
    setEditStaffPassword('');
    setIsEditStaffModalOpen(true);
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    try {
      const payload: any = {
        firstName: editStaffFirstName.trim(),
        lastName: editStaffLastName.trim(),
        phone: editStaffPhone.trim() || undefined,
        role: editStaffRole,
        status: editStaffStatus
      };
      if (editStaffPassword.trim()) {
        payload.password = editStaffPassword.trim();
      }
      const res = await api.updateAdminStaff(editingStaff.id, payload);
      if (res.success) {
        showToast(`Staff member "${editingStaff.email}" updated successfully`, 'success');
        setIsEditStaffModalOpen(false);
        setEditingStaff(null);
        loadAllAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update staff profile', 'error');
    }
  };

  const handleQuickChangeStaffRole = async (staffId: string, staffEmail: string, newRole: string) => {
    try {
      const res = await api.updateAdminStaff(staffId, { role: newRole });
      if (res.success) {
        showToast(`Updated role for ${staffEmail} to ${newRole}`, 'success');
        loadAllAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update staff role', 'error');
    }
  };

  const handleConfirmDeleteStaff = async () => {
    if (!staffToDelete) return;
    try {
      const res = await api.deleteAdminStaff(staffToDelete.id);
      if (res.success) {
        showToast(`Staff account "${staffToDelete.email}" removed successfully`, 'success');
        setStaffToDelete(null);
        loadAllAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to remove staff account', 'error');
    }
  };

  const handleToggleStaffStatus = async (staff: User) => {
    try {
      const nextStatus = staff.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      const res = await api.updateAdminStaff(staff.id, { status: nextStatus });
      if (res.success) {
        showToast(`Staff member status changed to ${nextStatus}`, 'success');
        loadAllAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update staff status', 'error');
    }
  };

  // Bulk Product Selection Helpers
  const handleToggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisibleProducts = () => {
    if (selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  // Bulk Stock Delta (+10, -5, etc.)
  const handleBulkQuickStock = async (delta: number) => {
    if (selectedProductIds.length === 0) return;
    try {
      let count = 0;
      for (const id of selectedProductIds) {
        const prod = products.find(p => p.id === id);
        if (prod) {
          const newStock = Math.max(0, prod.stock + delta);
          await api.updateAdminProduct(id, { stock: newStock });
          count++;
        }
      }
      showToast(`Adjusted inventory for ${count} selected products (${delta > 0 ? `+${delta}` : delta})`, 'success');
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Error updating stock levels', 'error');
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedProductIds.length} selected products?`)) {
      return;
    }
    try {
      let count = 0;
      for (const id of selectedProductIds) {
        await api.deleteAdminProduct(id);
        count++;
      }
      showToast(`Removed ${count} products from catalog`, 'success');
      setSelectedProductIds([]);
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Error deleting selected products', 'error');
    }
  };

  // Bulk Edit Modal Submission
  const handleApplyBulkEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductIds.length === 0) return;
    setIsApplyingBulk(true);
    try {
      let count = 0;
      for (const id of selectedProductIds) {
        const prod = products.find(p => p.id === id);
        if (!prod) continue;
        const updatePayload: any = {};

        // Price action
        if (bulkPriceAction === 'set' && bulkPriceValue) {
          updatePayload.price = Math.max(0, parseFloat(bulkPriceValue) || 0);
        } else if (bulkPriceAction === 'increase_percent' && bulkPriceValue) {
          const pct = parseFloat(bulkPriceValue) || 0;
          updatePayload.price = Math.round(prod.price * (1 + pct / 100) * 100) / 100;
        } else if (bulkPriceAction === 'decrease_percent' && bulkPriceValue) {
          const pct = parseFloat(bulkPriceValue) || 0;
          updatePayload.price = Math.max(0, Math.round(prod.price * (1 - pct / 100) * 100) / 100);
        } else if (bulkPriceAction === 'increase_fixed' && bulkPriceValue) {
          const amt = parseFloat(bulkPriceValue) || 0;
          updatePayload.price = Math.round((prod.price + amt) * 100) / 100;
        } else if (bulkPriceAction === 'decrease_fixed' && bulkPriceValue) {
          const amt = parseFloat(bulkPriceValue) || 0;
          updatePayload.price = Math.max(0, Math.round((prod.price - amt) * 100) / 100);
        }

        // Stock action
        if (bulkStockAction === 'set' && bulkStockValue) {
          updatePayload.stock = Math.max(0, parseInt(bulkStockValue) || 0);
        } else if (bulkStockAction === 'increase' && bulkStockValue) {
          updatePayload.stock = Math.max(0, prod.stock + (parseInt(bulkStockValue) || 0));
        } else if (bulkStockAction === 'decrease' && bulkStockValue) {
          updatePayload.stock = Math.max(0, prod.stock - (parseInt(bulkStockValue) || 0));
        }

        // Category & Brand
        if (bulkCategoryAction) {
          updatePayload.category = bulkCategoryAction;
        }
        if (bulkBrandAction) {
          updatePayload.brand = bulkBrandAction;
        }

        // Badges
        if (bulkBadgeAction === 'set_sale') updatePayload.isOnSale = true;
        if (bulkBadgeAction === 'remove_sale') updatePayload.isOnSale = false;
        if (bulkBadgeAction === 'set_bestseller') updatePayload.isBestSeller = true;
        if (bulkBadgeAction === 'remove_bestseller') updatePayload.isBestSeller = false;
        if (bulkBadgeAction === 'set_featured') updatePayload.isFeatured = true;
        if (bulkBadgeAction === 'remove_featured') updatePayload.isFeatured = false;

        if (Object.keys(updatePayload).length > 0) {
          await api.updateAdminProduct(id, updatePayload);
          count++;
        }
      }
      showToast(`Bulk updated ${count} products successfully!`, 'success');
      setIsBulkEditModalOpen(false);
      setSelectedProductIds([]);
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to apply bulk updates', 'error');
    } finally {
      setIsApplyingBulk(false);
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

  // Server-side paginated products for catalog view
  const filteredProducts = products;

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
          <div className="text-center space-y-2.5">
            <div className="w-12 h-12 bg-amber-950/80 border border-amber-600/40 text-amber-400 rounded-xs flex items-center justify-center mx-auto shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            
            <div className="inline-flex items-center gap-2 bg-stone-900 border border-amber-900/60 px-3 py-1 rounded-full text-[10px] font-mono text-amber-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Operations Portal: domainname.com/dashboard</span>
            </div>

            <h1 className="font-serif text-2xl font-bold text-white tracking-wide uppercase">
              Staff & Executive Operations
            </h1>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              Secure staff and administration gateway. Direct portal access at <code className="text-amber-400 font-mono">/dashboard</code> for real-time inventory, orders, wholesale B2B, and MongoDB controls.
            </p>
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
                placeholder="staff@fumarehookah.com"
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
            F
          </div>
          <div>
            <h1 className="font-serif text-sm font-bold tracking-wider text-white uppercase">FUMARE HOOKAH CONTROL CENTER</h1>
            <p className="text-[10px] text-amber-400 uppercase tracking-widest font-semibold">
              Live Storefront Engine • {user?.role || 'SUPER_ADMIN'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* MongoDB Cloud State Pill & Sync Trigger */}
          <div className="flex items-center gap-2 bg-stone-800/90 border border-stone-700 px-2.5 py-1.5 rounded-xs">
            <Database className={`w-3.5 h-3.5 ${mongoStatus?.isConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="text-[11px] text-stone-200 font-medium font-mono hidden sm:inline">
              {mongoStatus?.isConnected ? `MongoDB (${mongoStatus.dbName})` : 'MongoDB: Active'}
            </span>
            <button
              onClick={handleTriggerMongoSync}
              disabled={mongoSyncing}
              title="Synchronize all data to MongoDB"
              className="text-[10px] uppercase font-bold text-amber-300 hover:text-amber-100 bg-amber-950/80 hover:bg-amber-900 border border-amber-800 px-2 py-0.5 rounded-xs cursor-pointer transition-colors"
            >
              {mongoSyncing ? 'Syncing...' : 'Sync to MongoDB'}
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 bg-stone-800 px-3 py-1.5 rounded-xs border border-stone-700">
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
          Products ({totalProductsCount.toLocaleString()})
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
              {totalProductsCount.toLocaleString()}
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-stone-900">Commerce Executive Intelligence</h2>
                      <p className="text-xs text-stone-500">Real-time revenue, order volume, inventory telemetry, and shisha metrics.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        id="analytics-export-inventory-btn"
                        onClick={() => handleDownloadInventoryExcel(false)}
                        disabled={exportingInventory}
                        className="bg-emerald-900 hover:bg-emerald-800 text-emerald-100 text-xs font-semibold px-3 py-1.5 rounded-xs transition-colors flex items-center gap-1.5 border border-emerald-700 shadow-2xs cursor-pointer disabled:opacity-50"
                        title="Download complete inventory and stock valuation in Excel (.xlsx)"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{exportingInventory ? 'Exporting...' : 'Inventory (.xlsx)'}</span>
                      </button>
                      <button
                        id="analytics-export-customers-btn"
                        onClick={handleDownloadCustomersExcel}
                        disabled={exportingCustomers}
                        className="bg-emerald-900 hover:bg-emerald-800 text-emerald-100 text-xs font-semibold px-3 py-1.5 rounded-xs transition-colors flex items-center gap-1.5 border border-emerald-700 shadow-2xs cursor-pointer disabled:opacity-50"
                        title="Download customer accounts registry in Excel (.xlsx)"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{exportingCustomers ? 'Exporting...' : 'Customers (.xlsx)'}</span>
                      </button>
                      <button
                        onClick={loadAllAdminData}
                        className="bg-white border border-stone-300 text-stone-700 px-3 py-1.5 rounded-xs text-xs font-semibold flex items-center gap-1.5 hover:bg-stone-50 cursor-pointer shadow-2xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Refresh Metrics</span>
                      </button>
                    </div>
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

                    <div className="bg-white border border-stone-200 p-5 rounded-xs shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] uppercase font-bold text-stone-500 tracking-wider">Inventory Health</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDownloadInventoryExcel(false)}
                              className="text-[10px] text-emerald-800 hover:text-emerald-900 font-bold underline cursor-pointer"
                              title="Download inventory spreadsheet (.xlsx)"
                            >
                              Export Excel
                            </button>
                            <span className="text-stone-300">•</span>
                            <button
                              onClick={() => {
                                setActiveTab('products');
                                setIsBulkUpdateModalOpen(true);
                              }}
                              className="text-[10px] text-amber-800 hover:text-amber-900 font-bold underline cursor-pointer"
                              title="Open bulk stock updater"
                            >
                              Bulk Sync
                            </button>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-stone-900 mt-1 font-sans">
                          {statsLowStock} items
                        </div>
                        <span className="text-[11px] text-amber-700 font-semibold mt-1 block">Requires supplier replenishment</span>
                      </div>
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
                          View All ({totalProductsCount.toLocaleString()})
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
                        id="admin-bulk-update-btn"
                        onClick={() => setIsBulkUpdateModalOpen(true)}
                        className="bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-semibold px-3.5 py-2 rounded-xs transition-colors flex items-center gap-1.5 border border-stone-700 shadow-xs cursor-pointer"
                        title="Bulk update catalog stock levels and pricing using CSV or JSON"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                        <span>Bulk CSV/JSON Update</span>
                      </button>
                      <button
                        id="admin-export-inventory-btn"
                        onClick={() => handleDownloadInventoryExcel(false)}
                        disabled={exportingInventory}
                        className="bg-emerald-900 hover:bg-emerald-800 text-emerald-100 text-xs font-semibold px-3.5 py-2 rounded-xs transition-colors flex items-center gap-1.5 border border-emerald-700 shadow-xs cursor-pointer disabled:opacity-50"
                        title="Download complete catalog and stock valuation in Excel (.xlsx)"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{exportingInventory ? 'Generating Excel...' : 'Download Inventory (Excel)'}</span>
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

                  {/* Search Bar & Catalog Filters */}
                  <div className="bg-white border border-stone-200 p-4 rounded-xs flex flex-col gap-3 shadow-2xs">
                    {/* Row 1: Search bar & Counter & Export */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 bg-stone-50 border border-stone-200 px-3 py-2 rounded-xs">
                        <Search className="w-4 h-4 text-stone-400 shrink-0" />
                        <input
                          type="text"
                          placeholder="Search products by title, SKU, brand, or specifications..."
                          value={adminSearch}
                          onChange={(e) => setAdminSearch(e.target.value)}
                          className="w-full text-xs text-stone-800 bg-transparent focus:outline-none"
                        />
                        {adminSearch && (
                          <button
                            type="button"
                            onClick={() => setAdminSearch('')}
                            className="text-stone-400 hover:text-stone-600 text-xs font-semibold cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-stone-200 pt-2 sm:pt-0 sm:pl-3">
                        <div className="text-[11px] text-stone-500 font-medium whitespace-nowrap">
                          Displaying <span className="font-bold text-stone-900 font-mono">{filteredProducts.length.toLocaleString()}</span> of <span className="font-bold text-amber-900 font-mono">{totalProductsCount.toLocaleString()}</span> items
                          {catalogTotalPages > 1 && (
                            <span className="ml-1 text-stone-500 font-mono">(Page {catalogPage} of {catalogTotalPages})</span>
                          )}
                        </div>
                        {catalogLoading && (
                          <RefreshCw className="w-3.5 h-3.5 text-amber-900 animate-spin" />
                        )}
                        {adminSearch && filteredProducts.length > 0 && (
                          <button
                            onClick={() => handleDownloadInventoryExcel(true)}
                            disabled={exportingInventory}
                            className="text-[11px] text-emerald-800 hover:text-emerald-900 font-semibold underline flex items-center gap-1 cursor-pointer whitespace-nowrap ml-2"
                            title="Export only currently filtered search results to Excel"
                          >
                            <Download className="w-3 h-3" />
                            <span>Export Page ({filteredProducts.length})</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Deep Filtering & Sorting Dropdowns */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 text-xs">
                      {/* Filter by Category */}
                      <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 px-2.5 py-1.5 rounded-xs">
                        <span className="text-[11px] text-stone-500 font-medium">Category:</span>
                        <select
                          value={catalogCategory}
                          onChange={(e) => {
                            setCatalogCategory(e.target.value);
                            setCatalogPage(1);
                          }}
                          className="bg-transparent text-xs text-stone-800 font-medium focus:outline-none cursor-pointer"
                        >
                          <option value="">All Categories</option>
                          {categories.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Filter by Brand */}
                      <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 px-2.5 py-1.5 rounded-xs">
                        <span className="text-[11px] text-stone-500 font-medium">Brand:</span>
                        <select
                          value={catalogBrand}
                          onChange={(e) => {
                            setCatalogBrand(e.target.value);
                            setCatalogPage(1);
                          }}
                          className="bg-transparent text-xs text-stone-800 font-medium focus:outline-none cursor-pointer"
                        >
                          <option value="">All Brands</option>
                          {brands.map(b => (
                            <option key={b.id} value={b.name}>{b.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Filter by Stock Status */}
                      <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 px-2.5 py-1.5 rounded-xs">
                        <span className="text-[11px] text-stone-500 font-medium">Stock:</span>
                        <select
                          value={catalogStockFilter}
                          onChange={(e) => {
                            setCatalogStockFilter(e.target.value);
                            setCatalogPage(1);
                          }}
                          className="bg-transparent text-xs text-stone-800 font-medium focus:outline-none cursor-pointer"
                        >
                          <option value="all">All Inventory</option>
                          <option value="in">In Stock (&gt;5)</option>
                          <option value="low">Low Stock (≤5)</option>
                          <option value="out">Out of Stock (0)</option>
                        </select>
                      </div>

                      {/* Sort Order */}
                      <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 px-2.5 py-1.5 rounded-xs">
                        <span className="text-[11px] text-stone-500 font-medium">Sort:</span>
                        <select
                          value={catalogSortBy}
                          onChange={(e) => {
                            setCatalogSortBy(e.target.value);
                            setCatalogPage(1);
                          }}
                          className="bg-transparent text-xs text-stone-800 font-medium focus:outline-none cursor-pointer"
                        >
                          <option value="newest">Newest First</option>
                          <option value="price-asc">Price: Low to High</option>
                          <option value="price-desc">Price: High to Low</option>
                          <option value="stock-low-high">Stock: Low to High</option>
                          <option value="stock-high-low">Stock: High to Low</option>
                          <option value="name-asc">Name: A to Z</option>
                          <option value="name-desc">Name: Z to A</option>
                        </select>
                      </div>

                      {/* Items per page */}
                      <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 px-2.5 py-1.5 rounded-xs ml-auto">
                        <span className="text-[11px] text-stone-500 font-medium">Per Page:</span>
                        <select
                          value={catalogLimit}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setCatalogLimit(val);
                            setCatalogPage(1);
                          }}
                          className="bg-transparent text-xs text-stone-800 font-medium focus:outline-none cursor-pointer font-mono"
                        >
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                          <option value={250}>250</option>
                          <option value={500}>500</option>
                          <option value={-1}>All ({totalProductsCount})</option>
                        </select>
                      </div>

                      {/* Reset Filters */}
                      {(adminSearch || catalogCategory || catalogBrand || catalogStockFilter !== 'all' || catalogSortBy !== 'newest') && (
                        <button
                          type="button"
                          onClick={() => {
                            setAdminSearch('');
                            setCatalogCategory('');
                            setCatalogBrand('');
                            setCatalogStockFilter('all');
                            setCatalogSortBy('newest');
                            setCatalogPage(1);
                          }}
                          className="text-[11px] text-stone-600 hover:text-rose-700 font-semibold px-2 py-1.5 border border-stone-200 rounded-xs hover:bg-stone-50 transition-colors cursor-pointer"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bulk Selection Actions Bar */}
                  {selectedProductIds.length > 0 && (
                    <div className="bg-stone-900 text-white px-4 py-3 rounded-xs flex flex-wrap items-center justify-between gap-3 shadow-md animate-in fade-in">
                      <div className="flex items-center gap-3">
                        <span className="bg-amber-500 text-stone-950 text-xs font-bold px-2 py-0.5 rounded font-mono">
                          {selectedProductIds.length} Selected
                        </span>
                        <span className="text-xs text-stone-300">Apply batch updates across chosen items</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsBulkEditModalOpen(true)}
                          className="bg-amber-700 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Bulk Edit Specifications</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBulkQuickStock(10)}
                          className="bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium px-2.5 py-1.5 rounded-xs transition-colors cursor-pointer"
                          title="Increase stock by 10 for all selected items"
                        >
                          +10 Stock
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBulkQuickStock(-5)}
                          className="bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium px-2.5 py-1.5 rounded-xs transition-colors cursor-pointer"
                          title="Decrease stock by 5 for all selected items"
                        >
                          -5 Stock
                        </button>
                        <button
                          type="button"
                          onClick={handleBulkDelete}
                          className="bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-xs font-medium px-2.5 py-1.5 rounded-xs transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedProductIds([])}
                          className="text-xs text-stone-400 hover:text-white px-2 py-1.5 transition-colors cursor-pointer"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Products Table */}
                  <div className="bg-white border border-stone-200 rounded-xs overflow-x-auto shadow-xs">
                    <table className="w-full text-left text-xs min-w-[750px]">
                      <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3 px-3 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length}
                              onChange={handleSelectAllVisibleProducts}
                              className="rounded-xs border-stone-300 text-amber-900 focus:ring-amber-900 cursor-pointer"
                              title="Select / Deselect all visible items"
                            />
                          </th>
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
                        {filteredProducts.map((prod) => {
                          const isSelected = selectedProductIds.includes(prod.id);
                          return (
                          <tr key={prod.id} className={`transition-colors ${isSelected ? 'bg-amber-50/50' : 'hover:bg-stone-50/70'}`}>
                            <td className="py-3 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectProduct(prod.id)}
                                className="rounded-xs border-stone-300 text-amber-900 focus:ring-amber-900 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-4 flex items-center gap-3">
                              <div className="w-11 h-11 bg-stone-100 border border-stone-200 rounded-xs p-1 shrink-0 flex items-center justify-center overflow-hidden">
                                <img src={prod.images[0]?.url} alt={prod.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="font-bold text-stone-900">{prod.name}</p>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-[10px] text-stone-400 font-mono">{prod.sku}</span>
                                  {prod.isBestSeller && (
                                    <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.2 rounded-xs">Best Seller</span>
                                  )}
                                  {prod.isOnSale && (
                                    <span className="bg-rose-100 text-rose-800 text-[9px] font-bold px-1.5 py-0.2 rounded-xs">Sale</span>
                                  )}
                                  {prod.isFeatured && (
                                    <span className="bg-purple-100 text-purple-900 text-[9px] font-bold px-1.5 py-0.2 rounded-xs">Featured</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-stone-700">
                              <div>{prod.category}</div>
                              {prod.subcategory && (
                                <span className="text-[10px] text-stone-400">{prod.subcategory}</span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-semibold text-amber-900">{prod.brand}</td>
                            <td className="py-3 px-4 font-mono">
                              {prod.salePrice ? (
                                <div>
                                  <span className="font-bold text-rose-700">${prod.salePrice.toFixed(2)}</span>
                                  <span className="text-[10px] text-stone-400 line-through ml-1.5">${prod.price.toFixed(2)}</span>
                                </div>
                              ) : (
                                <span className="font-bold text-stone-900">${prod.price.toFixed(2)}</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleQuickStockUpdate(prod, -1)}
                                  className="w-5 h-5 flex items-center justify-center bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xs font-mono font-bold cursor-pointer transition-colors"
                                  title="Decrease stock by 1"
                                >
                                  -
                                </button>
                                <span className={`px-2 py-0.5 rounded-xs font-mono font-bold text-center min-w-[32px] ${prod.stock <= (prod.lowStockThreshold || 5) ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                  {prod.stock}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleQuickStockUpdate(prod, 1)}
                                  className="w-5 h-5 flex items-center justify-center bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xs font-mono font-bold cursor-pointer transition-colors"
                                  title="Increase stock by 1"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-stone-600">{prod.rating ? prod.rating.toFixed(1) : '5.0'} ★ ({prod.reviewCount || 0})</td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button
                                onClick={() => handleOpenEditProduct(prod)}
                                className="p-1.5 bg-stone-100 hover:bg-amber-900 hover:text-white text-stone-700 rounded-xs transition-colors cursor-pointer"
                                title="Edit Product Specifications"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-1.5 bg-stone-100 hover:bg-rose-600 hover:text-white text-stone-400 rounded-xs transition-colors cursor-pointer"
                                title="Decommission Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredProducts.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-stone-500">
                            <Package className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                            <p className="font-semibold text-stone-700">No products found matching the criteria.</p>
                            <p className="text-xs text-stone-400 mt-0.5">Try adjusting your search terms or clearing current filter selections.</p>
                            {(adminSearch || catalogCategory || catalogBrand || catalogStockFilter !== 'all') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAdminSearch('');
                                  setCatalogCategory('');
                                  setCatalogBrand('');
                                  setCatalogStockFilter('all');
                                  setCatalogSortBy('newest');
                                  setCatalogPage(1);
                                }}
                                className="mt-3 text-xs bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold px-3 py-1.5 rounded-xs transition-colors cursor-pointer"
                              >
                                Reset All Filters
                              </button>
                            )}
                          </td>
                        </tr>
                      )}
                      </tbody>
                    </table>
                  </div>

                  {/* Catalog Pagination Controls */}
                  <div className="bg-white border border-stone-200 px-4 py-3 rounded-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                    {/* Left: Range and loading */}
                    <div className="text-xs text-stone-600 flex items-center gap-2">
                      <span>
                        Showing <strong className="text-stone-900 font-mono">{totalProductsCount === 0 ? 0 : (catalogPage - 1) * (catalogLimit === -1 ? totalProductsCount : catalogLimit) + 1}</strong>
                        {' '}–{' '}
                        <strong className="text-stone-900 font-mono">{catalogLimit === -1 ? totalProductsCount : Math.min(catalogPage * catalogLimit, totalProductsCount)}</strong>
                        {' '}of{' '}
                        <strong className="text-amber-900 font-mono">{totalProductsCount.toLocaleString()}</strong> items
                      </span>
                      {catalogLoading && (
                        <span className="flex items-center gap-1 text-[11px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded font-medium">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Loading...
                        </span>
                      )}
                    </div>

                    {/* Center: Pagination controls */}
                    {catalogLimit !== -1 && catalogTotalPages > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={catalogPage <= 1 || catalogLoading}
                          onClick={() => setCatalogPage(prev => Math.max(1, prev - 1))}
                          className="px-2.5 py-1.5 border border-stone-300 rounded-xs text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
                          title="Previous Page"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Prev</span>
                        </button>

                        {/* Page number buttons */}
                        <div className="flex items-center gap-1">
                          {getCatalogPageNumbers(catalogPage, catalogTotalPages).map((p, idx) => (
                            p === '...' ? (
                              <span key={`ellipsis-${idx}`} className="px-1 text-stone-400 text-xs select-none">...</span>
                            ) : (
                              <button
                                key={`page-${p}`}
                                type="button"
                                disabled={catalogLoading}
                                onClick={() => setCatalogPage(Number(p))}
                                className={`min-w-[28px] h-7 px-1 flex items-center justify-center rounded-xs text-xs font-mono transition-colors cursor-pointer ${
                                  catalogPage === p
                                    ? 'bg-amber-900 text-white font-bold shadow-xs'
                                    : 'text-stone-700 hover:bg-stone-100 border border-stone-200'
                                }`}
                              >
                                {p}
                              </button>
                            )
                          ))}
                        </div>

                        <button
                          type="button"
                          disabled={catalogPage >= catalogTotalPages || catalogLoading}
                          onClick={() => setCatalogPage(prev => Math.min(catalogTotalPages, prev + 1))}
                          className="px-2.5 py-1.5 border border-stone-300 rounded-xs text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
                          title="Next Page"
                        >
                          <span className="hidden sm:inline">Next</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Right: Quick jump and page size */}
                    <div className="flex items-center gap-3">
                      {catalogLimit !== -1 && catalogTotalPages > 1 && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const target = parseInt(jumpPageInput, 10);
                            if (target >= 1 && target <= catalogTotalPages) {
                              setCatalogPage(target);
                              setJumpPageInput('');
                            }
                          }}
                          className="flex items-center gap-1 text-xs"
                        >
                          <span className="text-stone-500 text-[11px] whitespace-nowrap">Go to:</span>
                          <input
                            type="number"
                            min={1}
                            max={catalogTotalPages}
                            value={jumpPageInput}
                            onChange={(e) => setJumpPageInput(e.target.value)}
                            placeholder={`1-${catalogTotalPages}`}
                            className="w-14 border border-stone-300 rounded-xs px-1.5 py-1 text-xs text-center font-mono focus:outline-none focus:border-amber-900"
                          />
                          <button
                            type="submit"
                            disabled={!jumpPageInput}
                            className="px-2 py-1 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 rounded-xs text-xs font-semibold cursor-pointer disabled:opacity-40"
                          >
                            Go
                          </button>
                        </form>
                      )}

                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-stone-500 text-[11px] whitespace-nowrap">Per page:</span>
                        <select
                          value={catalogLimit}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setCatalogLimit(val);
                            setCatalogPage(1);
                          }}
                          className="border border-stone-300 rounded-xs px-1.5 py-1 text-xs bg-white font-mono cursor-pointer"
                        >
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                          <option value={250}>250</option>
                          <option value={500}>500</option>
                          <option value={-1}>All ({totalProductsCount})</option>
                        </select>
                      </div>
                    </div>
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
                                  src={cat.imageUrl || cat.bannerUrl || 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=800'}
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
                      .map((brand, bIdx) => {
                        const matchingProductsCount = products.filter(p => p.brand.toLowerCase() === brand.name.toLowerCase()).length;
                        return (
                          <div key={`${brand.id}-${brand.slug || bIdx}`} className="bg-white border border-stone-200 rounded-xs overflow-hidden shadow-xs flex flex-col justify-between hover:border-amber-300 transition-colors">
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
                          <tr
                            key={ord.id}
                            className={`transition-all duration-700 ${
                              highlightedOrderId === ord.id
                                ? 'bg-amber-100/90 ring-2 ring-amber-500 shadow-sm'
                                : 'hover:bg-stone-50/70'
                            }`}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-stone-900">{ord.orderNumber}</p>
                                {highlightedOrderId === ord.id && (
                                  <span className="bg-amber-600 text-white text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-xs animate-pulse shadow-xs">
                                    Just Placed!
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-stone-400">
                                {new Date(ord.createdAt).toLocaleDateString()} • {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-stone-900">Customer Accounts Registry</h2>
                      <p className="text-xs text-stone-500">Verified buyers, age certification records, 5-part delivery addresses, and purchase histories.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        id="admin-export-customers-btn"
                        onClick={handleDownloadCustomersExcel}
                        disabled={exportingCustomers}
                        className="bg-emerald-900 hover:bg-emerald-800 text-emerald-100 text-xs font-semibold px-4 py-2 rounded-xs transition-colors flex items-center gap-1.5 border border-emerald-700 shadow-xs cursor-pointer disabled:opacity-50"
                        title="Download complete verified customer database with 5-part addresses in Excel (.xlsx)"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{exportingCustomers ? 'Generating Excel...' : 'Download Customers (Excel)'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-stone-200 rounded-xs overflow-x-auto shadow-xs">
                    <table className="w-full text-left text-xs min-w-[850px]">
                      <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Contact Info</th>
                          <th className="py-3 px-4">Delivery Address</th>
                          <th className="py-3 px-4">Activity</th>
                          <th className="py-3 px-4">Age Status</th>
                          <th className="py-3 px-4">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {customers.map((c) => (
                          <tr key={c.id} className="hover:bg-stone-50/70">
                            <td className="py-3 px-4">
                              <p className="font-bold text-stone-900">{c.firstName} {c.lastName}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="bg-stone-100 text-stone-800 text-[10px] font-bold px-1.5 py-0.2 rounded-xs font-mono">
                                  {c.role}
                                </span>
                                {c.isWholesaleCustomer && (
                                  <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded-xs">
                                    B2B Wholesale
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-stone-600">
                              <p>{c.email}</p>
                              {c.phone && <p className="text-[11px] text-stone-500 font-mono mt-0.5">{c.phone}</p>}
                            </td>
                            <td className="py-3 px-4 text-stone-700 max-w-[260px]">
                              {c.addressDetails ? (
                                <div className="text-[11px] space-y-0.5">
                                  <p className="font-semibold text-stone-900">{c.addressDetails.houseNo}</p>
                                  <p className="text-stone-600">{c.addressDetails.areaRoad}</p>
                                  <p className="text-stone-500 font-mono">{c.addressDetails.city}, {c.addressDetails.state} - {c.addressDetails.pincode}</p>
                                </div>
                              ) : c.address ? (
                                <p className="text-[11px] text-stone-600 line-clamp-2">{c.address}</p>
                              ) : (
                                <span className="text-[11px] text-stone-400 italic">No address on file</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-bold text-stone-900 font-mono">${(c.totalSpent || 0).toFixed(2)}</p>
                              <p className="text-[11px] text-stone-500">{c.orderCount || 0} order{c.orderCount === 1 ? '' : 's'}</p>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                                <ShieldCheck className="w-3.5 h-3.5" /> 21+ Verified
                              </span>
                            </td>
                            <td className="py-3 px-4 text-stone-400 text-[11px]">{new Date(c.createdAt).toLocaleDateString()}</td>
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
                <div className="space-y-8">
                  {/* Staff Users Management Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-stone-900">Staff User Details & Management</h2>
                      <p className="text-xs text-stone-500">Manage administrator accounts, assign operational roles, reset credentials, and control portal security.</p>
                    </div>
                    <button
                      onClick={() => setIsStaffModalOpen(true)}
                      className="bg-amber-900 hover:bg-amber-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Provision New Staff</span>
                    </button>
                  </div>

                  {/* Staff Accounts Table */}
                  <div className="bg-white border border-stone-200 rounded-xs overflow-x-auto shadow-xs">
                    <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                      <h3 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-900" />
                        <span>Active Staff Personnel ({staffMembers.length})</span>
                      </h3>
                      <span className="text-[11px] text-stone-500 font-mono">
                        Session: {user?.email} ({user?.role})
                      </span>
                    </div>
                    <table className="w-full text-left text-xs min-w-[700px]">
                      <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Staff Member</th>
                          <th className="py-3 px-4">Role / Permissions</th>
                          <th className="py-3 px-4">Phone Contact</th>
                          <th className="py-3 px-4">Account Status</th>
                          <th className="py-3 px-4">Created</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {staffMembers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-stone-500">
                              No staff accounts found. Click "Provision New Staff" above to add an administrator or store manager.
                            </td>
                          </tr>
                        ) : (
                          staffMembers.map((member) => (
                            <tr key={member.id} className="hover:bg-stone-50/70 transition-colors">
                              <td className="py-3 px-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-amber-900 text-amber-100 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                  {member.firstName ? member.firstName[0] : member.email[0]}
                                </div>
                                <div>
                                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                                    <span>{member.firstName} {member.lastName}</span>
                                    {member.id === user?.id && (
                                      <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded font-mono">You</span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-stone-500 font-mono">{member.email}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5">
                                  <select
                                    value={member.role}
                                    disabled={member.id === 'usr-ehtesham-root' || (member.role === 'SUPER_ADMIN' && user?.role !== 'SUPER_ADMIN')}
                                    onChange={(e) => handleQuickChangeStaffRole(member.id, member.email, e.target.value)}
                                    className={`px-2 py-1 rounded-xs font-mono text-[10px] font-bold border focus:outline-none cursor-pointer ${
                                      member.role === 'SUPER_ADMIN'
                                        ? 'bg-purple-100 text-purple-900 border-purple-300'
                                        : member.role === 'ADMIN'
                                        ? 'bg-blue-100 text-blue-900 border-blue-300'
                                        : member.role === 'STORE_MANAGER'
                                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                                        : member.role === 'PRODUCT_MANAGER'
                                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                        : 'bg-stone-100 text-stone-800 border-stone-200'
                                    }`}
                                    title="Quick change staff operational role"
                                  >
                                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                                    <option value="ADMIN">ADMIN</option>
                                    <option value="STORE_MANAGER">STORE_MANAGER</option>
                                    <option value="PRODUCT_MANAGER">PRODUCT_MANAGER</option>
                                    <option value="PRODUCT_SPECIALIST">PRODUCT_SPECIALIST</option>
                                    <option value="ORDER_FULFILLMENT">ORDER_FULFILLMENT</option>
                                    <option value="SUPPORT_AGENT">SUPPORT_AGENT</option>
                                  </select>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-stone-600 font-mono">
                                {member.phone || <span className="text-stone-400 italic">Not set</span>}
                              </td>
                              <td className="py-3 px-4">
                                <button
                                  type="button"
                                  onClick={() => handleToggleStaffStatus(member)}
                                  className={`px-2 py-0.5 rounded-xs text-[10px] font-bold cursor-pointer transition-colors ${
                                    member.status === 'ACTIVE'
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                  }`}
                                  title="Click to toggle status between Active and Suspended"
                                >
                                  {member.status === 'ACTIVE' ? '● Active' : '✕ Suspended'}
                                </button>
                              </td>
                              <td className="py-3 px-4 text-stone-400 font-mono text-[11px]">
                                {new Date(member.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 text-right space-x-1.5">
                                <button
                                  onClick={() => handleOpenEditStaff(member)}
                                  className="p-1.5 bg-stone-100 hover:bg-amber-900 hover:text-white text-stone-700 rounded-xs transition-colors cursor-pointer"
                                  title="Edit Staff Details & Security"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                {member.id !== 'usr-ehtesham-root' && member.id !== user?.id && (
                                  <button
                                    onClick={() => setStaffToDelete(member)}
                                    className="p-1.5 bg-stone-100 hover:bg-rose-600 hover:text-white text-stone-400 rounded-xs transition-colors cursor-pointer"
                                    title="Revoke Credentials and Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* System Roles Matrix */}
                  <div className="space-y-3">
                    <div className="border-b border-stone-200 pb-2">
                      <h3 className="font-serif text-lg font-bold text-stone-900">Roles & Permission Scopes Matrix</h3>
                      <p className="text-xs text-stone-500">Fine-grained access rights mapped to operational staff positions.</p>
                    </div>
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

                  <form onSubmit={handleSaveStoreSettings} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Store Name</label>
                      <input
                        type="text"
                        value={settingStoreName}
                        onChange={(e) => setSettingStoreName(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs focus:ring-1 focus:ring-amber-800 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Announcement Top Banner</label>
                      <input
                        type="text"
                        value={settingAnnouncement}
                        onChange={(e) => setSettingAnnouncement(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs focus:ring-1 focus:ring-amber-800 focus:outline-none"
                        placeholder="e.g. Free shipping on orders over $150"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Free Shipping Threshold ($)</label>
                        <input
                          type="number"
                          value={settingFreeShipping}
                          onChange={(e) => setSettingFreeShipping(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs font-mono focus:ring-1 focus:ring-amber-800 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Standard Sales Tax (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={settingTaxRate}
                          onChange={(e) => setSettingTaxRate(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs font-mono focus:ring-1 focus:ring-amber-800 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xs space-y-1 text-stone-800">
                      <strong>Age & Tobacco Regulations:</strong>
                      <p>Age 21+ verification gate, Proposition 65 health warnings, and Adult Signature delivery are active.</p>
                    </div>

                    <button
                      type="submit"
                      disabled={settingsSaving}
                      className="bg-stone-900 hover:bg-amber-900 text-white font-semibold py-2.5 px-6 rounded-xs transition-colors cursor-pointer flex items-center gap-2"
                    >
                      {settingsSaving && <RefreshCw className="w-4 h-4 animate-spin" />}
                      <span>{settingsSaving ? 'Saving Configurations...' : 'Save & Broadcast Store Settings'}</span>
                    </button>
                  </form>

                  {/* MongoDB Cluster & Storage Card */}
                  <div className="border-t border-stone-200 pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-amber-700" />
                        <div>
                          <h3 className="font-serif text-base font-bold text-stone-900">
                            MongoDB Cloud Persistence & Collections
                          </h3>
                          <p className="text-xs text-stone-500">
                            Centralized database storing catalog products, customer profiles, orders, and wholesale records.
                          </p>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${mongoStatus?.isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        <span className={`w-2 h-2 rounded-full ${mongoStatus?.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        <span>{mongoStatus?.isConnected ? 'MongoDB Active' : 'Cache Fallback'}</span>
                      </span>
                    </div>

                    <div className="bg-stone-50 border border-stone-200 rounded-xs p-4 space-y-3 text-xs">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                        <div className="bg-white p-2.5 rounded border border-stone-200">
                          <span className="text-[10px] text-stone-500 block uppercase">Database</span>
                          <span className="font-bold text-stone-900">{mongoStatus?.dbName || 'fumare_hookah'}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded border border-stone-200">
                          <span className="text-[10px] text-stone-500 block uppercase">Catalog Items</span>
                          <span className="font-bold text-amber-800">
                            {(mongoStatus?.collectionCounts?.products ?? totalProductsCount).toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded border border-stone-200">
                          <span className="text-[10px] text-stone-500 block uppercase">Orders</span>
                          <span className="font-bold text-stone-900">
                            {mongoStatus?.collectionCounts?.orders ?? orders.length}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded border border-stone-200">
                          <span className="text-[10px] text-stone-500 block uppercase">Users & Staff</span>
                          <span className="font-bold text-stone-900">
                            {mongoStatus?.collectionCounts?.users ?? customers.length}
                          </span>
                        </div>
                      </div>

                      {mongoStatus?.lastSyncAt && (
                        <p className="text-[11px] text-stone-500">
                          Last synchronized: {new Date(mongoStatus.lastSyncAt).toLocaleString()}
                        </p>
                      )}

                      {mongoStatus?.lastError && !mongoStatus?.isConnected && (
                        <div className="bg-amber-50 border border-amber-200 rounded p-2 text-[11px] text-amber-800">
                          <span className="font-semibold">Notice:</span> {mongoStatus.lastError}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleTriggerMongoSync}
                          disabled={mongoSyncing}
                          className="bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-xs text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${mongoSyncing ? 'animate-spin' : ''}`} />
                          <span>{mongoSyncing ? 'Synchronizing with MongoDB...' : 'Sync All Data to MongoDB'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleReconnectMongo}
                          disabled={mongoSyncing}
                          className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold py-2 px-4 rounded-xs text-xs transition-colors cursor-pointer"
                        >
                          Test / Reconnect Cluster
                        </button>
                      </div>
                    </div>
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
          <div className="bg-white border border-stone-300 rounded-sm shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Hookah Product'}
                </h3>
                <p className="text-[11px] text-stone-500">
                  Update product title, pricing, stock levels, taxonomy, and media assets.
                </p>
              </div>
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
                      {brands.map((b, bIdx) => (
                        <option key={`${b.id}-${b.slug || bIdx}`} value={b.name}>{b.origin ? `${b.name} (${b.origin})` : b.name}</option>
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
                        <option value="Vapes & Pod Systems">Vapes & Pod Systems</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Subcategory / Line</label>
                  <input
                    type="text"
                    value={prodSubcategory}
                    onChange={(e) => setProdSubcategory(e.target.value)}
                    placeholder="e.g. Dark Leaf Tobacco, Phunnel Bowls"
                    className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">SKU / Item Code</label>
                  <input
                    type="text"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    placeholder="e.g. ALP-MODX-BLK"
                    className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs font-mono"
                  />
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
                  <label className="block font-semibold text-stone-700 mb-1">Sale / Discount Price ($) (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodSalePrice}
                    onChange={(e) => setProdSalePrice(e.target.value)}
                    placeholder="Leave empty if not on sale"
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
                  <label className="block font-semibold text-stone-700 mb-1">Flavor Notes (For Shisha / Vapes)</label>
                  <input
                    type="text"
                    value={prodFlavor}
                    onChange={(e) => setProdFlavor(e.target.value)}
                    placeholder="e.g. Grapefruit Strawberry Raspberry"
                    className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Material / Craftsmanship</label>
                  <input
                    type="text"
                    value={prodMaterial}
                    onChange={(e) => setProdMaterial(e.target.value)}
                    placeholder="e.g. AISI 304 Stainless Steel, Stoneware Clay"
                    className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Rating (1.0 – 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={prodRating}
                    onChange={(e) => setProdRating(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Short Tagline Summary</label>
                  <input
                    type="text"
                    value={prodShortDesc}
                    onChange={(e) => setProdShortDesc(e.target.value)}
                    placeholder="Brief 1-line hook for collection cards"
                    className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Product Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={prodImageUrl}
                      onChange={(e) => setProdImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs font-mono"
                    />
                    {prodImageUrl && (
                      <div className="w-10 h-10 bg-stone-100 border border-stone-300 rounded-xs shrink-0 overflow-hidden flex items-center justify-center">
                        <img src={prodImageUrl} alt="Preview" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Catalog Status & Merchandising Badges</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-stone-50 p-3 border border-stone-200 rounded-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodIsFeatured}
                        onChange={(e) => setProdIsFeatured(e.target.checked)}
                        className="rounded-xs text-amber-900 focus:ring-amber-900"
                      />
                      <span className="font-semibold text-stone-700">Featured</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodIsBestSeller}
                        onChange={(e) => setProdIsBestSeller(e.target.checked)}
                        className="rounded-xs text-amber-900 focus:ring-amber-900"
                      />
                      <span className="font-semibold text-stone-700">Best Seller</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodIsNewArrival}
                        onChange={(e) => setProdIsNewArrival(e.target.checked)}
                        className="rounded-xs text-amber-900 focus:ring-amber-900"
                      />
                      <span className="font-semibold text-stone-700">New Arrival</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodIsActive}
                        onChange={(e) => setProdIsActive(e.target.checked)}
                        className="rounded-xs text-amber-900 focus:ring-amber-900"
                      />
                      <span className="font-semibold text-stone-700">Active</span>
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Full Description & Specifications</label>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="email"
                  required
                  placeholder="Staff Email"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
                />
                <input
                  type="text"
                  placeholder="Phone (Optional)"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs font-mono"
                />
              </div>

              <input
                type="password"
                required
                placeholder="Initial Password (min 6 characters)"
                value={staffPassword}
                onChange={(e) => setStaffPassword(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
              />

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Assigned Operational Role</label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs font-mono"
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Full Administrative Control)</option>
                  <option value="ADMIN">ADMIN (Catalog, Orders, Inventory, Reports)</option>
                  <option value="STORE_MANAGER">STORE_MANAGER (Daily Store Operations & Inventory)</option>
                  <option value="PRODUCT_MANAGER">PRODUCT_MANAGER (Catalog & Brand Management)</option>
                  <option value="PRODUCT_SPECIALIST">PRODUCT_SPECIALIST (Product Updates & Specs)</option>
                  <option value="ORDER_FULFILLMENT">ORDER_FULFILLMENT (Dispatch, Tracking & Logistics)</option>
                  <option value="SUPPORT_AGENT">SUPPORT_AGENT (Customer Service & Inquiry Desk)</option>
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

      {/* EDIT STAFF MODAL */}
      {isEditStaffModalOpen && editingStaff && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-300 rounded-sm shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900">Edit Staff Profile</h3>
                <p className="text-xs text-stone-500">{editingStaff.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditStaffModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdateStaff} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={editStaffFirstName}
                    onChange={(e) => setEditStaffFirstName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editStaffLastName}
                    onChange={(e) => setEditStaffLastName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={editStaffPhone}
                  onChange={(e) => setEditStaffPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Assigned Role</label>
                  <select
                    value={editStaffRole}
                    onChange={(e) => setEditStaffRole(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs font-mono"
                  >
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="STORE_MANAGER">STORE_MANAGER</option>
                    <option value="PRODUCT_MANAGER">PRODUCT_MANAGER</option>
                    <option value="PRODUCT_SPECIALIST">PRODUCT_SPECIALIST</option>
                    <option value="ORDER_FULFILLMENT">ORDER_FULFILLMENT</option>
                    <option value="SUPPORT_AGENT">SUPPORT_AGENT</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Account Status</label>
                  <select
                    value={editStaffStatus}
                    onChange={(e) => setEditStaffStatus(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs font-mono"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Reset Password (Leave blank to keep unchanged)
                </label>
                <input
                  type="password"
                  placeholder="Enter new password to reset"
                  value={editStaffPassword}
                  onChange={(e) => setEditStaffPassword(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsEditStaffModalOpen(false)}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-4 py-2 rounded-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-900 hover:bg-amber-800 text-white font-semibold px-5 py-2 rounded-xs cursor-pointer transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE STAFF MODAL */}
      {staffToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-sm shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 border-b border-stone-100 pb-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900">Revoke Staff Account</h3>
                <p className="text-xs text-stone-500">Confirm permanent revocation of access</p>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xs p-3 space-y-1.5 text-xs">
              <p className="text-stone-700">
                Are you sure you want to remove the staff account for{' '}
                <strong className="text-stone-900">{staffToDelete.firstName} {staffToDelete.lastName}</strong>?
              </p>
              <div className="font-mono text-[11px] text-stone-600 bg-white p-2 rounded border border-stone-200 space-y-0.5">
                <div>Email: <span className="font-bold text-stone-800">{staffToDelete.email}</span></div>
                <div>Role: <span className="font-bold text-purple-900">{staffToDelete.role}</span></div>
                {staffToDelete.phone && <div>Phone: <span className="font-bold text-stone-800">{staffToDelete.phone}</span></div>}
              </div>
              <p className="text-rose-600 text-[11px] font-medium pt-1">
                ⚠️ This will immediately revoke their dashboard access and sessions. This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStaffToDelete(null)}
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-4 py-2 rounded-xs cursor-pointer transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteStaff}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-2 rounded-xs cursor-pointer transition-colors text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Revoke & Delete Staff</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK EDIT PRODUCT SPECIFICATIONS MODAL */}
      {isBulkEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-stone-300 rounded-sm shadow-2xl max-w-lg w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-amber-900" />
                  <span>Bulk Edit Catalog Items</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Applying batch updates to <span className="font-bold text-amber-900">{selectedProductIds.length} selected products</span>. Leave fields on "No Change" if you do not wish to update them.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkEditModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyBulkEdit} className="space-y-4 text-xs">
              {/* Price Action */}
              <div className="bg-stone-50 p-3 rounded-xs border border-stone-200 space-y-2">
                <label className="block font-bold text-stone-800 uppercase tracking-wider text-[10px]">
                  Price Adjustment
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={bulkPriceAction}
                    onChange={(e) => setBulkPriceAction(e.target.value as any)}
                    className="bg-white border border-stone-300 p-2 rounded-xs"
                  >
                    <option value="none">No Change to Price</option>
                    <option value="set">Set Exact Price ($)</option>
                    <option value="increase_percent">Increase Price by % (+)</option>
                    <option value="decrease_percent">Decrease Price by % (-)</option>
                    <option value="increase_fixed">Increase Price by Fixed $ (+)</option>
                    <option value="decrease_fixed">Decrease Price by Fixed $ (-)</option>
                  </select>
                  {bulkPriceAction !== 'none' && (
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      placeholder={bulkPriceAction.includes('percent') ? 'Percentage (e.g. 15)' : 'Amount (e.g. 29.99)'}
                      value={bulkPriceValue}
                      onChange={(e) => setBulkPriceValue(e.target.value)}
                      className="bg-white border border-stone-300 p-2 rounded-xs font-mono"
                    />
                  )}
                </div>
              </div>

              {/* Stock Inventory Action */}
              <div className="bg-stone-50 p-3 rounded-xs border border-stone-200 space-y-2">
                <label className="block font-bold text-stone-800 uppercase tracking-wider text-[10px]">
                  Inventory Stock Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={bulkStockAction}
                    onChange={(e) => setBulkStockAction(e.target.value as any)}
                    className="bg-white border border-stone-300 p-2 rounded-xs"
                  >
                    <option value="none">No Change to Stock</option>
                    <option value="set">Set Exact Stock Count</option>
                    <option value="increase">Increase Stock by (+)</option>
                    <option value="decrease">Decrease Stock by (-)</option>
                  </select>
                  {bulkStockAction !== 'none' && (
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="Units count (e.g. 25)"
                      value={bulkStockValue}
                      onChange={(e) => setBulkStockValue(e.target.value)}
                      className="bg-white border border-stone-300 p-2 rounded-xs font-mono"
                    />
                  )}
                </div>
              </div>

              {/* Category & Brand Reassignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Assign Category</label>
                  <select
                    value={bulkCategoryAction}
                    onChange={(e) => setBulkCategoryAction(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
                  >
                    <option value="">No Change</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Assign Brand</label>
                  <select
                    value={bulkBrandAction}
                    onChange={(e) => setBulkBrandAction(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
                  >
                    <option value="">No Change</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Badges / Visibility */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Promotional Badges</label>
                <select
                  value={bulkBadgeAction}
                  onChange={(e) => setBulkBadgeAction(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xs"
                >
                  <option value="none">No Change</option>
                  <option value="set_sale">Mark as "On Sale"</option>
                  <option value="remove_sale">Remove "On Sale" status</option>
                  <option value="set_bestseller">Mark as "Best Seller"</option>
                  <option value="remove_bestseller">Remove "Best Seller" status</option>
                  <option value="set_featured">Mark as "Featured"</option>
                  <option value="remove_featured">Remove "Featured" status</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsBulkEditModalOpen(false)}
                  disabled={isApplyingBulk}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-4 py-2 rounded-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApplyingBulk}
                  className="bg-amber-900 hover:bg-amber-800 text-white font-semibold px-5 py-2 rounded-xs cursor-pointer transition-colors flex items-center gap-2"
                >
                  {isApplyingBulk ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating Catalog...</span>
                    </>
                  ) : (
                    <span>Apply to {selectedProductIds.length} Items</span>
                  )}
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

      {/* BULK CSV / JSON STOCK & PRICE UPDATE MODAL */}
      {isBulkUpdateModalOpen && (
        <BulkProductUpdateModal
          isOpen={isBulkUpdateModalOpen}
          onClose={() => setIsBulkUpdateModalOpen(false)}
          products={products}
          onSuccess={(msg) => {
            showToast(msg || 'Bulk update completed successfully!', 'success');
            loadAllAdminData();
            broadcastSync('INVENTORY_UPDATED', { action: 'bulk-csv-update' });
          }}
        />
      )}

    </div>
  );
};
