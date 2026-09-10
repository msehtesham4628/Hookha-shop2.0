import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';
import { api } from './services/api.js';
import './index.css';

// Keep admin catalog refreshes on the same page/search/filter view.
// Also deduplicate/collapse repeated product GETs. Several storefront/admin
// effects can request the same catalog query during mount/navigation; without
// this guard each one invokes a separate Vercel function.
const originalGetProducts = api.getProducts.bind(api);
const catalogQueryStorageKey = 'fumare_admin_catalog_query';
const catalogQueryKeys = new Set(['page', 'limit', 'search', 'category', 'brand', 'stock', 'stockFilter', 'sort', 'sortBy']);
const productRequestCache = new Map<string, { expiresAt: number; value: Promise<any> }>();
const PRODUCT_CACHE_TTL_MS = 5000;

api.getProducts = async (params: Record<string, any> = {}) => {
  let requestParams = { ...params };

  const hasCatalogViewState = Object.keys(requestParams).some((key) =>
    ['search', 'category', 'brand', 'stock', 'stockFilter'].includes(key) && requestParams[key] !== undefined && requestParams[key] !== null && requestParams[key] !== ''
  ) || (requestParams.page !== undefined && Number(requestParams.page) > 1);

  if (hasCatalogViewState) {
    try {
      localStorage.setItem(catalogQueryStorageKey, JSON.stringify(
        Object.fromEntries(Object.entries(requestParams).filter(([key]) => catalogQueryKeys.has(key)))
      ));
    } catch {}
  } else if (requestParams.page === 1 && !requestParams.search && !requestParams.category && !requestParams.brand && !requestParams.stock && !requestParams.stockFilter) {
    try {
      const saved = localStorage.getItem(catalogQueryStorageKey);
      if (saved) {
        const remembered = JSON.parse(saved);
        if (remembered && typeof remembered === 'object') {
          requestParams = { ...remembered, ...requestParams };
        }
      }
    } catch {}
  }

  const cacheKey = Object.keys(requestParams)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(String(requestParams[key]))}`)
    .join('&');
  const now = Date.now();
  const cached = productRequestCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const value = originalGetProducts(requestParams);
  productRequestCache.set(cacheKey, { expiresAt: now + PRODUCT_CACHE_TTL_MS, value });
  void value.catch(() => {
    const current = productRequestCache.get(cacheKey);
    if (current?.value === value) productRequestCache.delete(cacheKey);
  });
  return value;
};

// Admin order polling guard. AdminDashboardPage historically polled every 4s,
// which created a request storm against MongoDB. Keep the dashboard behaviour
// intact but collapse repeated reads to one request per 30s and never poll while
// the tab is hidden.
const originalGetAdminOrders = api.getAdminOrders.bind(api);
let lastAdminOrdersAt = 0;
let lastAdminOrdersResult: Promise<any> | null = null;
const ADMIN_ORDERS_MIN_INTERVAL_MS = 30000;

api.getAdminOrders = async (params?: any) => {
  if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
    return { success: false, data: [] } as any;
  }

  const now = Date.now();
  if (lastAdminOrdersResult && now - lastAdminOrdersAt < ADMIN_ORDERS_MIN_INTERVAL_MS) {
    return lastAdminOrdersResult;
  }

  lastAdminOrdersAt = now;
  lastAdminOrdersResult = originalGetAdminOrders(params);
  try {
    return await lastAdminOrdersResult;
  } catch (error) {
    lastAdminOrdersResult = null;
    throw error;
  }
};

// Defensive fallback for the homepage vape-brand section. The build scripts
// normally inject this data into HomePage.tsx, but the app must never white-screen
// if a stale/generated bundle is missing that local binding.
const vapeBrandFallback = [
  { name: 'Adalya', slug: 'adalya', bgClass: 'bg-rose-900', textColor: 'text-rose-100', badgeText: 'ADALYA' },
  { name: 'Flamingo', slug: 'flamingo', bgClass: 'bg-pink-700', textColor: 'text-white', badgeText: 'FLAMINGO' },
  { name: 'Kori Hola', slug: 'kori-hola', bgClass: 'bg-blue-900', textColor: 'text-blue-100', badgeText: 'KORI HOLA' },
  { name: 'ZColors', slug: 'zcolors', bgClass: 'bg-purple-900', textColor: 'text-purple-100', badgeText: 'ZCOLORS' },
];
(globalThis as typeof globalThis & { vapeBrands?: typeof vapeBrandFallback }).vapeBrands = vapeBrandFallback;

class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Fumare Hookah runtime error:', error, info);
  }

  render() {
    if (this.state.error) {
      const message = this.state.error.message || String(this.state.error);
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#fafaf9', color: '#1c1917', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ width: '100%', maxWidth: 720, padding: 28, background: '#fff', border: '1px solid #d6d3d1', borderRadius: 8, boxShadow: '0 10px 30px rgba(0,0,0,.08)' }}>
            <h1 style={{ margin: '0 0 10px', fontSize: 24 }}>Store failed to load</h1>
            <p style={{ margin: '0 0 16px', color: '#57534e' }}>A browser-side error stopped the application from rendering.</p>
            <pre style={{ margin: 0, padding: 16, overflowX: 'auto', background: '#f5f5f4', borderRadius: 6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message}</pre>
            <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: '10px 16px', border: 0, borderRadius: 6, background: '#1c1917', color: '#fff', cursor: 'pointer' }}>Reload store</button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root was not found');

createRoot(root).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
