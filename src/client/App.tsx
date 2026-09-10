import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useStore } from './store/useStore.js';
import { onSync } from './services/sync.js';
import { LanguageProvider } from './i18n/LanguageContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { AgeGateModal } from './components/AgeGateModal.js';
import { SearchModal } from './components/SearchModal.js';
import { QuickViewModal } from './components/QuickViewModal.js';
import { CartDrawer } from './components/CartDrawer.js';
import { ToastContainer } from './components/ToastContainer.js';
import { FontThemeSelector } from './components/FontThemeSelector.js';
import { HomePage } from './pages/HomePage.js';
import { getCanonicalCategory } from './utils/routeHelpers.js';

// Lazy-loaded routes for instant initial storefront loading and smaller JS bundle
const ShopPage = lazy(() => import('./pages/ShopPage.js').then(m => ({ default: m.ShopPage })));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage.js').then(m => ({ default: m.ProductDetailPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage.js').then(m => ({ default: m.CheckoutPage })));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage.js').then(m => ({ default: m.OrderSuccessPage })));
const AccountPage = lazy(() => import('./pages/AccountPage.js').then(m => ({ default: m.AccountPage })));
const WholesalePage = lazy(() => import('./pages/WholesalePage.js').then(m => ({ default: m.WholesalePage })));
const AuthPage = lazy(() => import('./pages/AuthPage.js').then(m => ({ default: m.AuthPage })));
const AboutPage = lazy(() => import('./pages/AboutPage.js').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage.js').then(m => ({ default: m.ContactPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage.js').then(m => ({ default: m.AdminDashboardPage })));
const ExcelProductSyncPage = lazy(() => import('./pages/ExcelProductSyncPage.js').then(m => ({ default: m.ExcelProductSyncPage })));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage.js').then(m => ({ default: m.OrderTrackingPage })));

export default function App() {
  const { loadCurrentUser, loadCart, loadWishlist, loadSettings } = useStore();
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname + window.location.search);
  useEffect(() => {
    loadCurrentUser(); loadCart(); loadWishlist(); loadSettings();
    const unsubSync = onSync('*', (event) => {
      if (event.type === 'SETTINGS_UPDATED') loadSettings();
      else if (event.type === 'ORDER_PLACED' || event.type === 'INVENTORY_UPDATED') loadCart();
    });
    const handlePopState = () => setCurrentPath(window.location.pathname + window.location.search);
    window.addEventListener('popstate', handlePopState);
    return () => { unsubSync(); window.removeEventListener('popstate', handlePopState); };
  }, []);
  const navigate = (path: string) => { window.history.pushState({}, '', path); setCurrentPath(path); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const renderRoute = () => {
    const [pathOnly, queryString] = currentPath.split('?');
    const queryParams = new URLSearchParams(queryString || '');
    if (pathOnly === '/' || pathOnly === '') return <HomePage onNavigate={navigate} />;
    if (pathOnly === '/shop') return <ShopPage key={currentPath} initialCategory={queryParams.get('category') || undefined} initialBrand={queryParams.get('brand') || undefined} initialSearch={queryParams.get('search') || queryParams.get('q') || undefined} initialOnSale={queryParams.get('onSale') === 'true'} initialNewArrival={queryParams.get('newArrival') === 'true'} onNavigate={navigate} />;
    if (pathOnly.startsWith('/product/')) return <ProductDetailPage slug={pathOnly.replace('/product/', '')} onNavigate={navigate} />;
    if (pathOnly === '/checkout') return <CheckoutPage onNavigate={navigate} />;
    if (pathOnly === '/order-success') return <OrderSuccessPage orderId={queryParams.get('orderId') || undefined} onNavigate={navigate} />;
    if (pathOnly === '/track-order' || pathOnly === '/order-tracking' || pathOnly === '/track' || pathOnly.startsWith('/track/')) { const orderId = queryParams.get('orderId') || queryParams.get('id') || queryParams.get('query') || (pathOnly.startsWith('/track/') ? pathOnly.replace('/track/', '') : undefined); return <OrderTrackingPage initialOrderId={orderId} onNavigate={navigate} />; }
    if (pathOnly === '/account') return <AccountPage initialTab={queryParams.get('tab') || 'orders'} onNavigate={navigate} />;
    if (pathOnly === '/wholesale') return <WholesalePage onNavigate={navigate} />;
    if (pathOnly === '/auth/login') return <AuthPage initialMode="login" onNavigate={navigate} />;
    if (pathOnly === '/auth/register') return <AuthPage initialMode="register" onNavigate={navigate} />;
    if (pathOnly === '/auth/forgot') return <AuthPage initialMode="forgot" onNavigate={navigate} />;
    if (pathOnly === '/auth/otp') return <AuthPage initialMode="login" onNavigate={navigate} />;
    if (pathOnly === '/about') return <AboutPage onNavigate={navigate} />;
    if (pathOnly === '/contact') return <ContactPage onNavigate={navigate} />;
    if (pathOnly === '/admin/excel-sync') return <ExcelProductSyncPage onNavigate={navigate} />;
    if (pathOnly === '/dashboard' || pathOnly === '/admin') return <AdminDashboardPage onNavigate={navigate} />;

    // Clean Path-Based Dynamic Routing:
    // 1. /<category> (e.g. /hookahs, /tobacco)
    // 2. /<category>/page/<pageNum> (e.g. /hookahs/page/2)
    // 3. /<category>/<pageNum>/<product-slug> (e.g. /hookahs/1/alpha-hookah-model-x)
    // 4. /<category>/<product-slug-or-id> (e.g. /hookahs/alpha-hookah-model-x or /hookahs/1)
    const segments = pathOnly.split('/').filter(Boolean);
    if (segments.length > 0) {
      const canonicalCategory = getCanonicalCategory(segments[0]);
      if (canonicalCategory) {
        // Category root: /<category>
        if (segments.length === 1) {
          const page = Math.max(1, parseInt(queryParams.get('page') || '1', 10) || 1);
          return (
            <ShopPage
              key={`cat-${canonicalCategory}-p-${page}-${queryString}`}
              initialCategory={canonicalCategory}
              initialBrand={queryParams.get('brand') || undefined}
              initialSearch={queryParams.get('search') || queryParams.get('q') || undefined}
              initialOnSale={queryParams.get('onSale') === 'true'}
              initialNewArrival={queryParams.get('newArrival') === 'true'}
              initialPage={page}
              isCategoryRoute={true}
              onNavigate={navigate}
            />
          );
        }

        // Category pagination: /<category>/page/:page or /<category>/page-:page
        if (
          (segments.length === 3 && (segments[1].toLowerCase() === 'page' || segments[1].toLowerCase() === 'p')) ||
          (segments.length === 2 && segments[1].toLowerCase().startsWith('page-'))
        ) {
          const pageStr = segments.length === 3 ? segments[2] : segments[1].replace(/^page-?/i, '');
          const page = Math.max(1, parseInt(pageStr, 10) || 1);
          return (
            <ShopPage
              key={`cat-${canonicalCategory}-p-${page}-${queryString}`}
              initialCategory={canonicalCategory}
              initialBrand={queryParams.get('brand') || undefined}
              initialSearch={queryParams.get('search') || queryParams.get('q') || undefined}
              initialOnSale={queryParams.get('onSale') === 'true'}
              initialNewArrival={queryParams.get('newArrival') === 'true'}
              initialPage={page}
              isCategoryRoute={true}
              onNavigate={navigate}
            />
          );
        }

        // Product with page prefix: /<category>/<pageNum>/<product-slug> (e.g. /hookahs/1/alpha-hookah-model-x)
        if (segments.length === 3 && !isNaN(Number(segments[1]))) {
          const productSlug = segments[2];
          return (
            <ProductDetailPage
              key={`prod-${productSlug}`}
              slug={productSlug}
              categorySlug={canonicalCategory}
              onNavigate={navigate}
            />
          );
        }

        // Product in category: /<category>/<product-slug-or-id> (e.g. /hookahs/alpha-hookah-model-x or /hookahs/1)
        if (segments.length === 2) {
          const productSlug = segments[1];
          return (
            <ProductDetailPage
              key={`prod-${productSlug}`}
              slug={productSlug}
              categorySlug={canonicalCategory}
              onNavigate={navigate}
            />
          );
        }
      }
    }
    return <HomePage onNavigate={navigate} />;
  };
  const isAdminRoute = currentPath.startsWith('/dashboard') || currentPath.startsWith('/admin');
  const isImmersiveStorefrontRoute = !isAdminRoute && currentPath === '/';
  return (
    <LanguageProvider>
      <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-white text-stone-900 selection:bg-amber-100 selection:text-amber-900">
        <AgeGateModal />
        <SearchModal onNavigate={navigate} />
        <QuickViewModal onNavigate={navigate} />
        <CartDrawer onNavigate={navigate} />
        <ToastContainer />
        <FontThemeSelector />
        {!isAdminRoute && !isImmersiveStorefrontRoute && <Navbar currentPath={currentPath} onNavigate={navigate} />}
        <div className="flex-1 w-full max-w-full overflow-x-hidden">
          <Suspense fallback={
            <div className="min-h-[50vh] flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-stone-200 border-t-amber-500 rounded-full animate-spin" />
            </div>
          }>
            {renderRoute()}
          </Suspense>
        </div>
        {!isAdminRoute && <Footer onNavigate={navigate} />}
      </div>
    </LanguageProvider>
  );
}
