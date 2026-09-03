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
  Globe
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

interface CategoryNavItem {
  label: string;
  path: string;
  categorySlug?: string;
  brands?: { name: string; slug: string }[];
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
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
        { name: 'Aspire Proteus', slug: 'aspire-proteus' }
      ]
    },
    {
      label: t('nav.vapes', 'Vapes'),
      path: '/shop?category=vapes',
      categorySlug: 'vapes',
      brands: [
        { name: 'GeekVape', slug: 'geekvape' },
        { name: 'Vaporesso', slug: 'vaporesso' },
        { name: 'Lost Mary', slug: 'lost-mary' },
        { name: 'Elf Bar', slug: 'elf-bar' },
        { name: 'SMOK', slug: 'smok' }
      ]
    },
    {
      label: t('nav.wholesale', 'Wholesale B2B'),
      path: '/wholesale'
    }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white">
      {/* Top Announcement & Language Selector Bar */}
      <div className="bg-[#15181e] text-stone-200 text-[10px] sm:text-[11px] font-bold py-1.5 px-4 border-b border-stone-800 tracking-wider uppercase">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1 text-center sm:text-left flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 hidden sm:inline" />
            <span className="line-clamp-1">
              {t('topbar.age_notice', 'YOU MUST BE AT LEAST 21 YEARS OF AGE TO PURCHASE ON THIS WEBSITE. ALL CUSTOMERS WILL BE AGE VERIFIED.')}
            </span>
          </div>

          {/* Topbar Language Selector */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <LanguageSelector variant="topbar" />
          </div>
        </div>
      </div>

      {/* Main Brand & Header Bar */}
      <div className={`transition-all duration-300 border-b border-stone-200 ${isScrolled ? 'py-3 shadow-xs bg-white/95 backdrop-blur-md' : 'py-4 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-stone-800 hover:text-amber-900 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand Logo */}
          <div
            id="brand-logo"
            onClick={() => onNavigate('/')}
            className="cursor-pointer flex flex-col items-center select-none group"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-[0.15em] text-stone-900 group-hover:text-amber-900 transition-colors uppercase">
                FUMARE HOOKAH
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-[0.35em] text-amber-800/90 font-sans font-bold -mt-1">
              EST. 2018
            </span>
          </div>

          {/* Desktop Search Bar Trigger */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <button
              id="desktop-search-trigger"
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between bg-stone-100/80 hover:bg-stone-100 border border-stone-200 text-stone-500 text-xs px-4 py-2.5 rounded-xs transition-all shadow-2xs group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-stone-400 group-hover:text-amber-800 transition-colors" />
                <span className="tracking-wide">
                  {t('nav.search_placeholder', 'Search hookahs, dark leaf, bowls, coals...')}
                </span>
              </div>
              <kbd className="hidden lg:inline-block text-[10px] bg-stone-200/80 text-stone-600 px-1.5 py-0.5 rounded-xs border border-stone-300/80 font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Search Icon */}
            <button
              id="mobile-search-btn"
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-2 text-stone-700 hover:text-amber-900 transition-colors cursor-pointer"
              title="Search Catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Link */}
            <button
              id="navbar-wishlist-btn"
              onClick={() => onNavigate('/account?tab=wishlist')}
              className="relative p-2 text-stone-700 hover:text-amber-900 transition-colors cursor-pointer"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-1 right-1 bg-amber-800 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* User Account / Profile */}
            <div className="relative">
              <button
                id="navbar-user-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 p-2 text-stone-700 hover:text-amber-900 transition-colors rounded-sm cursor-pointer"
              >
                <UserIcon className="w-5 h-5" />
                <span className="hidden sm:inline text-xs font-semibold text-stone-800">
                  {user ? user.firstName : t('nav.sign_in', 'Sign In')}
                </span>
                <ChevronDown className="hidden sm:inline w-3 h-3 text-stone-400" />
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
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Bag Button */}
            <button
              id="navbar-cart-btn"
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 bg-stone-900 hover:bg-amber-900 text-white px-3.5 py-2 rounded-xs shadow-xs transition-all duration-200 group cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cart.itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-stone-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {cart.itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold font-sans tracking-wide">
                ${cart.subtotal.toFixed(2)}
              </span>
            </button>

            {/* Admin Switch Badge */}
            {isAdmin && (
              <button
                id="admin-quick-badge"
                onClick={() => onNavigate('/admin')}
                className="hidden lg:flex items-center gap-1 bg-amber-700 hover:bg-amber-800 text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1.5 rounded-xs shadow-2xs cursor-pointer"
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
      <nav className="hidden lg:block bg-white border-b border-stone-200/90 shadow-2xs relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-center gap-6 xl:gap-8 py-2.5 text-xs uppercase font-medium tracking-widest text-stone-700">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path || (link.categorySlug && currentPath.includes(`category=${link.categorySlug}`));
              const hasBrands = link.brands && link.brands.length > 0;

              return (
                <li
                  key={link.path}
                  className="relative group"
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
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-64 bg-white border border-stone-200 shadow-xl rounded-xs p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                        <span className="text-[10px] font-bold tracking-wider text-amber-900 uppercase">
                          {link.label} Brands
                        </span>
                        <button
                          onClick={() => { setHoveredCategory(null); onNavigate(link.path); }}
                          className="text-[10px] text-stone-500 hover:text-amber-800 lowercase hover:underline"
                        >
                          view all →
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {link.brands?.map((brand) => (
                          <button
                            key={brand.slug}
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

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[90px] z-50 bg-stone-950/40 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-sm bg-white h-full p-6 overflow-y-auto flex flex-col justify-between shadow-xl">
            <div>
              <div className="mb-6">
                <button
                  onClick={() => { setSearchOpen(true); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 bg-stone-100 text-stone-600 text-xs p-3 rounded-xs border border-stone-200"
                >
                  <Search className="w-4 h-4 text-stone-500" />
                  <span>{t('nav.search_placeholder', 'Search entire collection...')}</span>
                </button>
              </div>

              <ul className="space-y-3 text-sm font-medium text-stone-800">
                {navLinks.map((link) => {
                  const hasBrands = link.brands && link.brands.length > 0;
                  const isExpanded = expandedMobileCategory === link.categorySlug;

                  return (
                    <li key={link.path} className="border-b border-stone-100 pb-2.5">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => { onNavigate(link.path); setMobileMenuOpen(false); }}
                          className="text-left uppercase tracking-wider text-xs font-semibold hover:text-amber-800 cursor-pointer flex-1"
                        >
                          {link.label}
                        </button>
                        {hasBrands && (
                          <button
                            onClick={() => setExpandedMobileCategory(isExpanded ? null : (link.categorySlug || null))}
                            className="p-1 text-stone-400 hover:text-stone-800 cursor-pointer"
                            aria-label={`Toggle ${link.label} subcategories`}
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180 text-amber-800' : ''}`} />
                          </button>
                        )}
                      </div>

                      {/* Expanded Mobile Subcategory Brands */}
                      {hasBrands && isExpanded && (
                        <div className="mt-2 pl-3 border-l-2 border-amber-200 space-y-1.5 py-1">
                          <button
                            onClick={() => { onNavigate(link.path); setMobileMenuOpen(false); }}
                            className="w-full text-left text-xs font-bold text-amber-900 py-1 hover:underline"
                          >
                            View All {link.label} →
                          </button>
                          {link.brands?.map((brand) => (
                            <button
                              key={brand.slug}
                              onClick={() => {
                                onNavigate(`/shop?category=${link.categorySlug}&brand=${brand.slug}`);
                                setMobileMenuOpen(false);
                              }}
                              className="w-full text-left text-xs text-stone-600 hover:text-stone-950 py-1 flex items-center justify-between"
                            >
                              <span>{brand.name}</span>
                              <span className="text-[10px] text-stone-400">→</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* Language Selector in Mobile Drawer */}
              <div className="mt-4">
                <LanguageSelector variant="drawer" />
              </div>
            </div>

            <div className="pt-6 border-t border-stone-200">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-stone-900">{user.firstName} {user.lastName}</p>
                      <p className="text-[11px] text-stone-500">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => { onNavigate('/admin'); setMobileMenuOpen(false); }}
                        className="text-[10px] uppercase font-bold bg-amber-800 text-white px-2 py-1 rounded-xs"
                      >
                        Admin
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full text-xs text-rose-700 border border-rose-200 p-2 rounded-xs hover:bg-rose-50 cursor-pointer"
                  >
                    {t('nav.sign_out', 'Sign Out')}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => { onNavigate('/auth/login'); setMobileMenuOpen(false); }}
                    className="flex-1 bg-stone-900 text-white text-xs font-semibold py-2.5 rounded-xs cursor-pointer"
                  >
                    {t('nav.sign_in', 'Sign In')}
                  </button>
                  <button
                    onClick={() => { onNavigate('/auth/register'); setMobileMenuOpen(false); }}
                    className="flex-1 border border-stone-300 text-stone-800 text-xs font-semibold py-2.5 rounded-xs cursor-pointer"
                  >
                    {t('nav.create_account', 'Register')}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};
