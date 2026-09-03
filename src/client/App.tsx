import React, { useState, useEffect } from 'react';
import { useStore } from './store/useStore.js';
import { LanguageProvider } from './i18n/LanguageContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { AgeGateModal } from './components/AgeGateModal.js';
import { SearchModal } from './components/SearchModal.js';
import { QuickViewModal } from './components/QuickViewModal.js';
import { CartDrawer } from './components/CartDrawer.js';
import { ToastContainer } from './components/ToastContainer.js';

// Pages
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

export default function App() {
  const { loadCurrentUser, loadCart, loadWishlist, loadSettings } = useStore();
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname + window.location.search);

  // Initialize initial store state on app boot
  useEffect(() => {
    loadCurrentUser();
    loadCart();
    loadWishlist();
    loadSettings();

    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Router navigation helper
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route parser
  const renderRoute = () => {
    const [pathOnly, queryString] = currentPath.split('?');
    const queryParams = new URLSearchParams(queryString || '');

    // 1. Home Page
    if (pathOnly === '/' || pathOnly === '') {
      return <HomePage onNavigate={navigate} />;
    }

    // 2. Shop / Catalog Page
    if (pathOnly === '/shop') {
      return (
        <ShopPage
          key={currentPath}
          initialCategory={queryParams.get('category') || undefined}
          initialBrand={queryParams.get('brand') || undefined}
          initialSearch={queryParams.get('search') || queryParams.get('q') || undefined}
          initialOnSale={queryParams.get('onSale') === 'true'}
          initialNewArrival={queryParams.get('newArrival') === 'true'}
          onNavigate={navigate}
        />
      );
    }

    // 3. Product Details Page (/product/:slug)
    if (pathOnly.startsWith('/product/')) {
      const slug = pathOnly.replace('/product/', '');
      return <ProductDetailPage slug={slug} onNavigate={navigate} />;
    }

    // 4. Checkout Page
    if (pathOnly === '/checkout') {
      return <CheckoutPage onNavigate={navigate} />;
    }

    // 5. Order Success Confirmation
    if (pathOnly === '/order-success') {
      const orderId = queryParams.get('orderId') || undefined;
      return <OrderSuccessPage orderId={orderId} onNavigate={navigate} />;
    }

    // 6. Customer Account Dashboard
    if (pathOnly === '/account') {
      const tab = queryParams.get('tab') || 'orders';
      return <AccountPage initialTab={tab} onNavigate={navigate} />;
    }

    // 7. Wholesale B2B Application
    if (pathOnly === '/wholesale') {
      return <WholesalePage onNavigate={navigate} />;
    }

    // 8. Auth Pages (Login, Register, OTP)
    if (pathOnly === '/auth/login') {
      return <AuthPage initialMode="login" onNavigate={navigate} />;
    }
    if (pathOnly === '/auth/register') {
      return <AuthPage initialMode="register" onNavigate={navigate} />;
    }
    if (pathOnly === '/auth/otp') {
      return <AuthPage initialMode="otp-email" onNavigate={navigate} />;
    }

    // 9. Brand & Concierge Info
    if (pathOnly === '/about') {
      return <AboutPage onNavigate={navigate} />;
    }
    if (pathOnly === '/contact') {
      return <ContactPage onNavigate={navigate} />;
    }

    // 10. Admin Suite
    if (pathOnly === '/admin') {
      return <AdminDashboardPage onNavigate={navigate} />;
    }

    // Fallback default: Home
    return <HomePage onNavigate={navigate} />;
  };

  const isAdminRoute = currentPath.startsWith('/admin');

  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-white text-stone-900 selection:bg-amber-100 selection:text-amber-900">
        {/* Global Modals & Overlays */}
        <AgeGateModal />
        <SearchModal onNavigate={navigate} />
        <QuickViewModal onNavigate={navigate} />
        <CartDrawer onNavigate={navigate} />
        <ToastContainer />

        {/* Main Navbar (Hidden in Admin suite for immersive focus) */}
        {!isAdminRoute && <Navbar currentPath={currentPath} onNavigate={navigate} />}

        {/* Page View */}
        <div className="flex-1">
          {renderRoute()}
        </div>

        {/* Footer (Hidden in Admin suite) */}
        {!isAdminRoute && <Footer onNavigate={navigate} />}
      </div>
    </LanguageProvider>
  );
}
