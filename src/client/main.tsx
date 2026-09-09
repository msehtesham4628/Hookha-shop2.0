import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';
import { api } from './services/api.js';
import './index.css';

// Keep the admin catalog refresh on the same page/search/filter view.
// AdminDashboardPage performs a broad load after mutations with only
// { page: 1, limit, sort }. Remember the most recent fully-qualified catalog
// query so that mutation refreshes don't unexpectedly jump back to page 1.
const originalGetProducts = api.getProducts.bind(api);
const catalogQueryStorageKey = 'fumare_admin_catalog_query';
const catalogQueryKeys = new Set(['page', 'limit', 'search', 'category', 'brand', 'stock', 'stockFilter', 'sort', 'sortBy']);

api.getProducts = async (params: Record<string, any> = {}) => {
  const hasCatalogViewState = Object.keys(params).some((key) =>
    ['search', 'category', 'brand', 'stock', 'stockFilter'].includes(key) && params[key] !== undefined && params[key] !== null && params[key] !== ''
  ) || (params.page !== undefined && Number(params.page) > 1);

  if (hasCatalogViewState) {
    try {
      localStorage.setItem(catalogQueryStorageKey, JSON.stringify(
        Object.fromEntries(Object.entries(params).filter(([key]) => catalogQueryKeys.has(key)))
      ));
    } catch {}
  } else if (params.page === 1 && !params.search && !params.category && !params.brand && !params.stock && !params.stockFilter) {
    try {
      const saved = localStorage.getItem(catalogQueryStorageKey);
      if (saved) {
        const remembered = JSON.parse(saved);
        if (remembered && typeof remembered === 'object') {
          params = { ...remembered, ...params };
        }
      }
    } catch {}
  }

  return originalGetProducts(params);
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
