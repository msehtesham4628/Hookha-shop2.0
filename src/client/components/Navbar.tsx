import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore.js';
import { useTranslation } from '../i18n/LanguageContext.js';
import { LanguageSelector } from './LanguageSelector.js';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Package,
  Settings,
  Sparkles,
  Globe,
  Truck
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  overlay?: boolean;
}

interface CategoryNavItem {
  label: string;
  path: string;
  categorySlug?: string;
  brands?: { name: string; slug: string }[];
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, overlay = false }) => {
  const { user, isAdmin, cart, wishlistIds, setCartOpen, setSearchOpen, logout } = useStore();
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: CategoryNavItem[] = [
    {
      label: t('nav.hookahs', 'Hookahs'),
      path: '/shop?category=hookahs',
      categorySlug: 'hookahs',
      brands: [
        { name: 'Alpha Hookah', slug: 'alpha-hookah' },
        { name: 'El Bomber', slug: 'el-bomber' },
        { name: 'MattPear', slug: 'mattpear' },
        { name: 'Maklaud Hookah', slug: 'maklaud-hookah' },
        { name: 'WOOKAH', slug: 'wookah' },
        { name: 'Japona Hookah', slug: 'japona-hookah' },
        { name: 'Steamulation', slug: 'steamulation-hookah' }
      ]
    },
    {
      label: t('nav.tobacco', 'Tobacco'),
      path: '/shop?category=tobacco',
      categorySlug: 'tobacco',
      brands: [
        { name: 'MustHave Tobacco', slug: 'musthave-tobacco' },
        { name: 'DarkSide Tobacco', slug: 'darkside-tobacco' },
        { name: 'BlackBurn Tobacco', slug: 'blackburn-tobacco' },
        { name: 'Bonche Tobacco', slug: 'bonche-tobacco' },
        { name: 'Tangiers', slug: 'tangiers' },
        { name: 'Adalya Tobacco', slug: 'adalya-tobacco' },
        { name: 'Serbetli tobacco', slug: 'serbetli-tobacco' },
        { name: 'Banger Hookah Tobacco', slug: 'banger-tobacco' },
        { name: 'Element Tobacco', slug: 'element-tobacco' }
      ]
    },
    {
      label: t('nav.bowls', 'Bowls'),
      path: '/shop?category=bowls',
      categorySlug: 'bowls',
      brands: [
        { name: 'Oblako Bowls', slug: 'oblako-bowls' },
        { name: 'Kong Bowls', slug: 'kong-bowls' },
        { name: 'Alpaca Bowls', slug: 'alpaca-bowls' },
        { name: 'Solaris Bowls', slug: 'solaris-bowls' },
        { name: 'Target Bowls', slug: 'target-bowls' }
      ]
    },
    {
      label: t('nav.bases', 'Bases'),
      path: '/shop?category=bases',
      categorySlug: 'bases',
      brands: [
        { name: 'Caesar Crystal', slug: 'caesar-crystal' },
        { name: 'Craft Glass', slug: 'craft-glass' },
        { name: 'WOOKAH Crystal', slug: 'wookah' }
      ]
    },
    {
      label: t('nav.charcoal', 'Coal'),
      path: '/shop?category=coal',
      categorySlug: 'coal',
      brands: [
        { name: 'Coco Loco', slug: 'coco-loco' },
        { name: 'One Nation', slug: 'one-nation' },
        { name: 'Oasis Charcoal', slug: 'oasis-charcoal' }
      ]
    },
    {
      label: t('nav.accessories', 'Accessories'),
      path: '/shop?category=accessories',
      categorySlug: 'accessories',
      brands: [
        { name: 'Kaloud', slug: 'kaloud' },
        { name: 'Na Grani', slug: 'na-grani' },
        { name: 'Blade Hookah', slug: 'blade-hookah' },
        { name: 'Alpha Accessories', slug: 'alpha-hookah' }
      ]
    },
    {
      label: t('nav.ehookah', 'E-Hookah'),
      path: '/shop?category=e-hookah',
      categorySlug: 'e-hookah',
      brands: [
        { name: 'Ooka', slug: 'ooka' },
        { name: 'Aspire Proteus', slug: 'aspire-proteus' },
        { name: 'Kangerm', slug: 'kangerm' },
        { name: 'Starbuzz', slug: 'starbuzz' },
        { name: 'Enso', slug: 'enso' },
        { name: 'Kori', slug: 'kori' }
      ]
    },
    {
      label: t('nav.vapes', 'Vapes'),
      path: '/shop?category=vapes',
      categorySlug: 'vapes',
      brands: [
        { name: 'Al Fakher Vapes', slug: 'al-fakher-vapes' },
        { name: 'Geek Bar', slug: 'geek-bar' },
        { name: 'Lost Mary', slug: 'lost-mary' },
        { name: 'Vaporesso', slug: 'vaporesso' },
        { name: 'GeekVape', slug: 'geekvape' },
        { name: 'Elf Bar', slug: 'elf-bar' },
        { name: 'Nasty Juice', slug: 'nasty-juice' },
        { name: 'SMOK', slug: 'smok' }
      ]
    },
    {
      label: t('nav.wholesale', 'Wholesale B2B'),
      path: '/wholesale'
    }
  ];

  return (
    <header className={`${overlay ? 'navbar-overlay absolute' : 'sticky'} top-0 z-40 w-full max-w-full overflow-x-clip bg-white`}>
      {/* Top Announcement & Language Selector Bar */}
      <div className="bg-[#15181e] text-stone-200 text-[10px] sm:text-[11px] font-bold py-1.5 px-3 sm:px-4 border-b border-stone-800 tracking-wider uppercase overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 min-w-0">
          <div className="flex-1 min-w-0 text-center sm:text-left flex items-center gap-2 overflow-hidden">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 hidden sm:inline shrink-0" />
            <span className="truncate block">
              {t('topbar.age_notice', 'YOU MUST BE AT LEAST 21 YEARS OF AGE TO PURCHASE ON THIS WEBSITE. ALL CUSTOMERS WILL BE AGE VERIFIED.')}
            </span>
          </div>

          {/* Topbar Language Selector & Quick Track Order */}
          <div className="shrink-0 flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onNavigate('/track-order')}
              className="text-stone-300 hover:text-amber-300 text-[10px] hidden sm:flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
              title="Track your shipment in real time"
            >
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('nav.track_order', 'Track Order')}</span>
            </button>
            <div className="h-3 w-px bg-stone-700 hidden sm:block"></div>
            <LanguageSelector variant="topbar" />
          </div>
        </div>
      </div>

      {/* Main Brand & Header Bar */}
      <div className={`transition-all duration-300 border-b border-stone-200 ${isScrolled ? 'py-2 sm:py-3 shadow-xs bg-white/95 backdrop-blur-md' : 'py-2.5 sm:py-4 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-1.5 sm:gap-4 min-w-0">
          
          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-stone-800 hover:text-amber-900 transition-colors cursor-pointer shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          {/* Brand Logo */}
          <div
            id="brand-logo"
            onClick={() => onNavigate('/')}
            className="cursor-pointer flex flex-col items-center select-none group shrink-0"
          >
            <div className="flex items-center gap-1">
              <span className="font-serif text-base sm:text-xl lg:text-2xl font-bold tracking-[0.08em] sm:tracking-[0.12em] text-stone-900 group-hover:text-amber-900 transition-colors uppercase whitespace-nowrap">
                FUMARE HOOKAH
              </span>
            </div>
            <span className="text-[7.5px] sm:text-[9px] uppercase tracking-[0.35em] text-amber-800/90 font-sans font-bold -mt-1">
              EST. 2018
            </span>
          </div>

          {/* Desktop Search Bar Trigger */}
          <div className="hidden md:flex flex-1 min-w-0 max-w-xs lg:max-w-sm xl:max-w-md mx-2 lg:mx-4 xl:mx-6">
            <button
              id="desktop-search-trigger"
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between bg-stone-100/80 hover:bg-stone-100 border border-stone-200 text-stone-500 text-xs px-3 sm:px-4 py-2 sm:py-2.5 rounded-xs transition-all shadow-2xs group cursor-pointer min-w-0"
            >
              <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                <Search className="w-4 h-4 text-stone-400 group-hover:text-amber-800 transition-colors shrink-0" />
                <span className="tracking-wide truncate block">
                  {t('nav.search_placeholder', 'Search hookahs, dark leaf, bowls, coals...')}
                </span>
              </div>
              <kbd className="hidden lg:inline-block text-[10px] bg-stone-200/80 text-stone-600 px-1.5 py-0.5 rounded-xs border border-stone-300/80 font-mono shrink-0 ml-2">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 shrink-0">
            {/* Mobile Search Icon */}
            <button
              id="mobile-search-btn"
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-1.5 text-stone-700 hover:text-amber-900 transition-colors cursor-pointer"
              title="Search Catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Link - visible on tablet/desktop or screens with enough room */}
            <button
              id="navbar-wishlist-btn"
              onClick={() => onNavigate('/account?tab=wishlist')}
              className="hidden sm:block relative p-1.5 sm:p-2 text-stone-700 hover:text-amber-900 transition-colors cursor-pointer"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-amber-800 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* User Account / Profile - hidden on mobile since it's directly inside the mobile drawer */}
            <div className="relative hidden sm:block">
              <button
                id="navbar-user-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 text-stone-700 hover:text-amber-900 transition-colors rounded-sm cursor-pointer"
              >
                <UserIcon className="w-5 h-5 shrink-0" />
                <span className="hidden xl:inline text-xs font-semibold text-stone-800 truncate max-w-[90px]">
                  {user ? user.firstName : t('nav.sign_in', 'Sign In')}
                </span>
                <ChevronDown className="hidden xl:inline w-3 h-3 text-stone-400 shrink-0" />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div
                  id="user-dropdown-menu"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-56 bg-white border border-stone-200 rounded-xs shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="text-xs font-semibold text-stone-900">{user.firstName} {user.lastName}</p>
                        <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                        {user.role !== 'CUSTOMER' && (
                          <span className="inline-block mt-1 text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-xs tracking-wider">
                            {user.role.replace('_', ' ')}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => { setUserDropdownOpen(false); onNavigate('/account'); }}
                        className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 hover:text-amber-900 flex items-center gap-2 cursor-pointer"
                      >
                        <Package className="w-3.5 h-3.5 text-stone-400" />
                        <span>{t('nav.my_account', 'My Account & Orders')}</span>
                      </button>

                      <button
                        onClick={() => { setUserDropdownOpen(false); onNavigate('/track-order'); }}
                        className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 hover:text-amber-900 flex items-center gap-2 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5 text-amber-800" />
                        <span>{t('nav.track_order', 'Track Order')}</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => { setUserDropdownOpen(false); onNavigate('/admin'); }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-amber-900 bg-amber-50/60 hover:bg-amber-100 flex items-center gap-2 cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5 text-amber-700" />
                          <span>{t('nav.admin_suite', 'Admin Suite')}</span>
                        </button>
                      )}

                      <div className="border-t border-stone-100 my-1"></div>

                      <button
                        onClick={() => { setUserDropdownOpen(false); logout(); }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>{t('nav.sign_out', 'Sign Out')}</span>
                      </button>
                    </>
                  ) : (
                    <div className="p-3">
                      <p className="text-xs text-stone-600 mb-3">
                        Sign in to access orders, private reserve releases, and luxury perks.
                      </p>
                      <button
                        onClick={() => { setUserDropdownOpen(false); onNavigate('/auth/login'); }}
                        className="w-full bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold py-2 px-3 rounded-xs mb-2 transition-colors text-center block cursor-pointer"
                      >
                        {t('nav.sign_in', 'Sign In')}
                      </button>
                      <button
                        onClick={() => { setUserDropdownOpen(false); onNavigate('/auth/register'); }}
                        className="w-full bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 text-xs font-semibold py-2 px-3 rounded-xs transition-colors text-center block cursor-pointer"
                      >
                        {t('nav.create_account', 'Create Account')}
                      </button>

                      <div className="border-t border-stone-100 my-2"></div>
                      <button
                        onClick={() => { setUserDropdownOpen(false); onNavigate('/track-order'); }}
                        className="w-full text-stone-700 hover:text-amber-900 text-xs font-semibold py-1.5 px-3 rounded-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer bg-stone-50 hover:bg-stone-100 border border-stone-200"
                      >
                        <Truck className="w-3.5 h-3.5 text-amber-800" />
                        <span>{t('nav.track_order', 'Track an Order')}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Bag Button */}
            <button
              id="navbar-cart-btn"
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 bg-stone-900 hover:bg-amber-900 text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xs shadow-xs transition-all duration-200 group cursor-pointer shrink-0"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cart.itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-stone-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {cart.itemCount}
                  </span>
                )}
              </div>
              <span className="hidden xl:inline text-xs font-bold font-sans tracking-wide whitespace-nowrap">
                ${cart.subtotal.toFixed(2)}
              </span>
            </button>

            {/* Admin Switch Badge */}
            {isAdmin && (
              <button
                id="admin-quick-badge"
                onClick={() => onNavigate('/admin')}
                className="hidden xl:flex items-center gap-1 bg-amber-700 hover:bg-amber-800 text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1.5 rounded-xs shadow-2xs cursor-pointer whitespace-nowrap shrink-0"
                title="Open Admin Portal"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{t('nav.admin_suite', 'Admin Suite')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden lg:block bg-white border-b border-stone-200/90 shadow-2xs relative w-full max-w-full z-20 overflow-visible">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 overflow-visible">
          <ul className="flex items-center justify-center gap-2.5 lg:gap-3.5 xl:gap-5 2xl:gap-7 py-2.5 text-[11px] xl:text-xs uppercase font-medium tracking-wider xl:tracking-widest text-stone-700 whitespace-nowrap">
            {navLinks.map((link, idx) => {
              const isActive = currentPath === link.path || (link.categorySlug && currentPath.includes(`category=${link.categorySlug}`));
              const hasBrands = link.brands && link.brands.length > 0;
              const isEarly = idx < 2;
              const isLate = idx > navLinks.length - 3;

              return (
                <li
                  key={link.path}
                  className="relative group shrink-0"
                  onMouseEnter={() => setHoveredCategory(link.categorySlug || null)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <button
                    onClick={() => onNavigate(link.path)}
                    className={`flex items-center gap-1 hover:text-amber-900 transition-colors py-1 relative cursor-pointer ${
                      isActive ? 'text-amber-900 font-bold' : ''
                    }`}
                  >
                    <span>{link.label}</span>
                    {hasBrands && (
                      <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-amber-800 transition-transform group-hover:rotate-180" />
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-800 rounded-full" />
                    )}
                  </button>

                  {/* Desktop Dropdown for Category Brands / Subcategories */}
                  {hasBrands && hoveredCategory === link.categorySlug && (
                    <div className={`absolute top-full ${isEarly ? 'left-0' : isLate ? 'right-0' : 'left-1/2 -translate-x-1/2'} mt-1.5 w-60 bg-white border border-stone-200 shadow-2xl rounded-sm p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150`}>
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                        <span className="text-[10px] font-bold tracking-wider text-amber-900 uppercase">
                          {link.label} Brands
                        </span>
                        <button
                          onClick={() => { setHoveredCategory(null); onNavigate(link.path); }}
                          className="text-[10px] text-stone-500 hover:text-amber-800 lowercase hover:underline cursor-pointer"
                        >
                          view all →
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {link.brands?.map((brand, bIdx) => (
                          <button
                            key={`${link.categorySlug}-${brand.slug}-${bIdx}`}
                            onClick={() => {
                              setHoveredCategory(null);
                              onNavigate(`/shop?category=${link.categorySlug}&brand=${brand.slug}`);
                            }}
                            className="w-full text-left px-2.5 py-1.5 text-xs normal-case font-normal text-stone-700 hover:text-amber-950 hover:bg-amber-50/80 rounded-xs transition-colors flex items-center justify-between group/item cursor-pointer"
                          >
                            <span>{brand.name}</span>
                            <span className="text-[10px] text-stone-400 group-hover/item:text-amber-700 opacity-0 group-hover/item:opacity-100 transition-opacity">
                              →
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile/Tablet Horizontal Category Strip */}
      <nav className="lg:hidden bg-stone-50 border-b border-stone-200/90 w-full max-w-full overflow-hidden">
        <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            onClick={() => onNavigate('/shop')}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              currentPath === '/shop' && !currentPath.includes('category=')
                ? 'bg-amber-800 text-white shadow-2xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {t('nav.all', 'All')}
          </button>
          {navLinks.map((link) => {
            const isActive = link.categorySlug && currentPath.includes(`category=${link.categorySlug}`);
            return (
              <button
                key={`mob-strip-${link.path}`}
                onClick={() => onNavigate(link.path)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-amber-800 text-white shadow-2xs'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative w-[85%] max-w-xs sm:max-w-sm bg-stone-900 text-stone-100 h-full p-5 overflow-y-auto flex flex-col justify-between shadow-2xl z-10 border-r border-stone-800">
            <div>
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-stone-800">
                <div className="flex flex-col">
                  <span className="font-serif text-base font-bold tracking-wider text-stone-100 uppercase">
                    FUMARE HOOKAH
                  </span>
                  <span className="text-[8px] font-mono tracking-[0.25em] text-amber-400 font-bold uppercase -mt-0.5">
                    EST. 2018
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-white rounded-sm hover:bg-stone-800 transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Search */}
              <div className="my-3.5">
                <button
                  onClick={() => { setSearchOpen(true); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 bg-stone-800/90 hover:bg-stone-800 text-stone-300 hover:text-white text-xs px-3 py-2.5 rounded-sm border border-stone-700/80 transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">{t('nav.search_placeholder', 'Search entire collection...')}</span>
                </button>
              </div>

              {/* Categories Navigation */}
              <ul className="space-y-1 text-sm font-medium text-stone-200">
                {navLinks.map((link) => {
                  const hasBrands = link.brands && link.brands.length > 0;
                  const isExpanded = expandedMobileCategory === link.categorySlug;

                  return (
                    <li key={link.path} className="border-b border-stone-800/60 pb-2 pt-1">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => { onNavigate(link.path); setMobileMenuOpen(false); }}
                          className="text-left uppercase tracking-wider text-xs font-semibold text-stone-200 hover:text-amber-400 cursor-pointer flex-1 py-1"
                        >
                          {link.label}
                        </button>
                        {hasBrands && (
                          <button
                            onClick={() => setExpandedMobileCategory(isExpanded ? null : (link.categorySlug || null))}
                            className="p-1 text-stone-400 hover:text-white cursor-pointer"
                            aria-label={`Toggle ${link.label} subcategories`}
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-amber-400' : ''}`} />
                          </button>
                        )}
                      </div>

                      {/* Expanded Mobile Subcategory Brands */}
                      {hasBrands && isExpanded && (
                        <div className="mt-1.5 pl-3 border-l-2 border-amber-600 bg-stone-800/40 rounded-r-sm space-y-1 py-2 pr-2">
                          <button
                            onClick={() => { onNavigate(link.path); setMobileMenuOpen(false); }}
                            className="w-full text-left text-[11px] font-bold text-amber-400 py-1 hover:underline flex items-center justify-between"
                          >
                            <span>View All {link.label}</span>
                            <span>→</span>
                          </button>
                          {link.brands?.map((brand, bIdx) => (
                            <button
                              key={`mob-${link.categorySlug}-${brand.slug}-${bIdx}`}
                              onClick={() => {
                                onNavigate(`/shop?category=${link.categorySlug}&brand=${brand.slug}`);
                                setMobileMenuOpen(false);
                              }}
                              className="w-full text-left text-[11px] text-stone-300 hover:text-white py-1 flex items-center justify-between"
                            >
                              <span>{brand.name}</span>
                              <span className="text-[10px] text-stone-500">→</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}

                {/* Quick Service Links */}
                <li className="border-b border-stone-800/60 py-2">
                  <button
                    onClick={() => { onNavigate('/account?tab=wishlist'); setMobileMenuOpen(false); }}
                    className="w-full text-left uppercase tracking-wider text-xs font-semibold text-stone-200 hover:text-amber-400 cursor-pointer flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-400" />
                      <span>{t('nav.wishlist', 'Saved Wishlist')}</span>
                    </span>
                    {wishlistIds.length > 0 && (
                      <span className="bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {wishlistIds.length}
                      </span>
                    )}
                  </button>
                </li>

                <li className="border-b border-stone-800/60 py-2">
                  <button
                    onClick={() => { onNavigate('/track-order'); setMobileMenuOpen(false); }}
                    className="w-full text-left uppercase tracking-wider text-xs font-semibold text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-2"
                  >
                    <Truck className="w-4 h-4 text-amber-400" />
                    <span>{t('nav.track_order', 'Track Order')}</span>
                  </button>
                </li>
              </ul>

              {/* Language Selector in Mobile Drawer */}
              <div className="mt-2">
                <LanguageSelector variant="drawer" theme="dark" />
              </div>
            </div>

            {/* Account & Session Footer */}
            <div className="pt-5 mt-4 border-t border-stone-800">
              {user ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="text-xs font-bold text-white truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => { onNavigate('/admin'); setMobileMenuOpen(false); }}
                        className="text-[9px] uppercase font-bold bg-amber-700 text-white px-2 py-0.5 rounded-xs shrink-0"
                      >
                        Admin
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => { onNavigate('/account'); setMobileMenuOpen(false); }}
                    className="w-full text-xs text-stone-200 hover:text-white bg-stone-800 hover:bg-stone-700 py-2 px-3 rounded-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('nav.my_account', 'My Account & Orders')}</span>
                  </button>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full text-xs text-rose-400 hover:text-rose-300 border border-rose-900/60 bg-rose-950/30 hover:bg-rose-950/60 py-2 rounded-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('nav.sign_out', 'Sign Out')}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => { onNavigate('/auth/login'); setMobileMenuOpen(false); }}
                      className="flex-1 bg-amber-700 hover:bg-amber-600 text-white text-xs font-semibold py-2.5 rounded-xs transition-colors cursor-pointer text-center"
                    >
                      {t('nav.sign_in', 'Sign In')}
                    </button>
                    <button
                      onClick={() => { onNavigate('/auth/register'); setMobileMenuOpen(false); }}
                      className="flex-1 border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold py-2.5 rounded-xs transition-colors cursor-pointer text-center"
                    >
                      {t('nav.create_account', 'Register')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
