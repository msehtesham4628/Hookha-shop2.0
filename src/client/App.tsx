import React, { useState, useEffect } from 'react';
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
import { HomePage } from './pages/HomePage.js';
import { ShopPage } from './pages/ShopPage.js';
import { ProductDetailPage } from './pages/ProductDetailPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { OrderSuccessPage } from './pages/OrderSuccessPage.js';
import { AccountPage } from './pages/AccountPage.js';
import { WholesalePage } from './pages/WholesalePage.js';
import { AuthPage } from './pages/AuthPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { ContactPage } from './pages/ContactPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { OrderTrackingPage } from './pages/OrderTrackingPage.js';

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
    if (pathOnly === '/dashboard' || pathOnly === '/admin') return <AdminDashboardPage onNavigate={navigate} />;
    return <HomePage onNavigate={navigate} />;
  };
  const isAdminRoute = currentPath.startsWith('/dashboard') || currentPath.startsWith('/admin');
  const isImmersiveStorefrontRoute = !isAdminRoute && currentPath === '/';
  return <LanguageProvider><div className="min-h-screen flex flex-col bg-white text-stone-900 selection:bg-amber-100 selection:text-amber-900"><AgeGateModal /><SearchModal onNavigate={navigate} /><QuickViewModal onNavigate={navigate} /><CartDrawer onNavigate={navigate} /><ToastContainer />{!isAdminRoute && !isImmersiveStorefrontRoute && <Navbar currentPath={currentPath} onNavigate={navigate} overlay={currentPath.startsWith('/shop')} />}<div className="flex-1">{renderRoute()}</div>{!isAdminRoute && <Footer onNavigate={navigate} />}</div></LanguageProvider>;
}
