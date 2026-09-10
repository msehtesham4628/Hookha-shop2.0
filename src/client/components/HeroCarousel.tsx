import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  Truck,
  Package,
  LogOut
} from 'lucide-react';
import { useStore } from '../store/useStore.js';
import { useTranslation } from '../i18n/LanguageContext.js';
import { LanguageSelector } from './LanguageSelector.js';

interface HeroCarouselProps {
  onNavigate: (path: string) => void;
}

const HERO_SLIDES = [
  '/accessories/accessories_1.jpg',
  '/accessories/accessories_2.jpg',
  '/accessories/accessories_3.jpg',
  '/tobacco/tobacco_1.jpg',
  '/tobacco/tobacco_2.jpg',
  '/tobacco/tobacco_3.jpg'
];

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onNavigate }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const { user, cart, wishlistIds, setCartOpen, setSearchOpen, logout } = useStore();
  const { t } = useTranslation();

  // Slide transition timer
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % HERO_SLIDES.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  // Passive scroll listener
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut listener (Cmd/Ctrl + K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchOpen]);

  // Click-outside listener for user dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

  const navLinks = useMemo(
    () => [
      { label: t('nav.hookahs', 'Hookahs'), path: '/shop?category=hookahs' },
      { label: t('nav.tobacco', 'Tobacco'), path: '/shop?category=tobacco' },
      { label: t('nav.bowls', 'Bowls'), path: '/shop?category=bowls' },
      { label: t('nav.bases', 'Bases'), path: '/shop?category=bases' },
      { label: t('nav.charcoal', 'Coal'), path: '/shop?category=coal' },
      { label: t('nav.accessories', 'Accessories'), path: '/shop?category=accessories' },
      { label: t('nav.ehookah', 'E-Hookah'), path: '/shop?category=e-hookah' },
      { label: t('nav.vapes', 'Vapes'), path: '/shop?category=vapes' },
      { label: t('nav.wholesale', 'Wholesale B2B'), path: '/wholesale' }
    ],
    [t]
  );

  const totalCartCount = useMemo(
    () => cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
    [cart]
  );

  const handleNavClick = useCallback(
    (path: string) => {
      setMobileMenuOpen(false);
      setUserDropdownOpen(false);
      onNavigate(path);
    },
    [onNavigate]
  );

  return (
    <section id="hero-carousel" className="relative w-full overflow-hidden bg-[#0d0f12] text-white select-none">
      <div className="relative min-h-[620px] w-full overflow-hidden sm:min-h-[680px] lg:min-h-[740px]">
        {/* Slides */}
        {HERO_SLIDES.map((image, index) => (
          <img
            key={image}
            src={image}
            alt={index === activeSlide ? 'Premium hookah collection' : 'Hookah lifestyle background'}
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ${
              index === activeSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            loading={index === 0 ? 'eager' : 'lazy'}
            referrerPolicy="no-referrer"
          />
        ))}

        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/55 to-stone-950/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/55 to-transparent" />

        {/* Navigation Header */}
        <header
          className={`absolute inset-x-0 top-0 z-30 w-full max-w-full overflow-x-clip transition-all duration-300 ${
            isScrolled ? 'bg-stone-950/90 shadow-lg backdrop-blur-md' : 'bg-transparent'
          }`}
        >
          {/* Compliance Topbar */}
          <div className="border-b border-white/10 bg-black/25 text-[10px] font-bold uppercase tracking-wider text-stone-200 sm:text-[11px] overflow-hidden">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4 px-3 py-1.5 sm:px-6 lg:px-8 min-w-0">
              <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                <ShieldCheck className="hidden h-3.5 w-3.5 shrink-0 text-amber-400 sm:inline" />
                <span className="truncate block">
                  {t('topbar.age_notice', 'YOU MUST BE AT LEAST 21 YEARS OF AGE TO PURCHASE ON THIS WEBSITE. ALL CUSTOMERS WILL BE AGE VERIFIED.')}
                </span>
              </div>
              <div className="hidden shrink-0 items-center gap-3 sm:flex">
                <button
                  onClick={() => handleNavClick('/track-order')}
                  className="flex items-center gap-1 text-stone-200 transition-colors hover:text-amber-300 cursor-pointer whitespace-nowrap"
                >
                  <Truck className="h-3.5 w-3.5 text-amber-400" />
                  <span>{t('nav.track_order', 'Track Order')}</span>
                </button>
                <div className="h-3 w-px bg-white/20" />
                <LanguageSelector variant="topbar" />
              </div>
            </div>
          </div>

          {/* Main Brand & Actions Header */}
          <div className="border-b border-white/10 bg-black/10">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-1.5 sm:gap-4 px-3 py-2.5 sm:py-4 sm:px-6 lg:px-8 min-w-0">
              <button
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="p-1.5 text-white lg:hidden cursor-pointer shrink-0"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
              </button>

              <button
                onClick={() => handleNavClick('/')}
                className="group flex shrink-0 flex-col items-center text-center cursor-pointer"
              >
                <span className="font-serif text-base sm:text-xl lg:text-2xl font-bold tracking-[0.08em] sm:tracking-[0.12em] text-white transition-colors group-hover:text-amber-300 whitespace-nowrap">
                  FUMARE HOOKAH
                </span>
                <span className="-mt-1 text-[7.5px] sm:text-[9px] font-bold uppercase tracking-[0.35em] text-amber-300">
                  EST. 2018
                </span>
              </button>

              {/* Desktop Search Trigger */}
              <div className="hidden flex-1 min-w-0 max-w-xs lg:max-w-sm xl:max-w-md mx-2 lg:mx-4 xl:mx-6 md:flex">
                <button
                  onClick={() => setSearchOpen(true)}
                  className="group flex w-full items-center justify-between rounded-xl border border-white/15 bg-white/10 px-3 sm:px-4 py-2 sm:py-2.5 text-xs text-stone-200 backdrop-blur-md transition-all hover:bg-white/15 cursor-pointer min-w-0"
                >
                  <span className="flex items-center gap-2 min-w-0 overflow-hidden">
                    <Search className="h-4 w-4 text-stone-300 group-hover:text-amber-300 shrink-0" />
                    <span className="truncate block">
                      {t('nav.search_placeholder', 'Search hookahs, dark leaf, bowls, coals...')}
                    </span>
                  </span>
                  <kbd className="hidden rounded border border-white/15 bg-black/20 px-1.5 py-0.5 font-mono text-[10px] text-stone-300 lg:inline-block shrink-0 ml-2">
                    ⌘K
                  </kbd>
                </button>
              </div>

              {/* User Actions */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-1.5 text-white md:hidden cursor-pointer"
                  aria-label="Open search modal"
                >
                  <Search className="h-5 w-5" />
                </button>

                <button
                  onClick={() => handleNavClick('/account?tab=wishlist')}
                  className="hidden sm:block relative p-1.5 sm:p-2 text-white cursor-pointer"
                  title="Wishlist"
                >
                  <Heart className="h-5 w-5" />
                  {wishlistIds.length > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-700 text-[10px] font-bold text-white shadow-xs">
                      {wishlistIds.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setCartOpen(true)}
                  className="relative p-1.5 sm:p-2 text-white cursor-pointer"
                  title="Cart"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {totalCartCount > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-700 text-[10px] font-bold text-white shadow-xs">
                      {totalCartCount}
                    </span>
                  )}
                </button>

                {/* Account Dropdown */}
                <div ref={userDropdownRef} className="relative hidden sm:block">
                  <button
                    onClick={() => setUserDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-1 p-1.5 sm:p-2 text-white cursor-pointer"
                    aria-expanded={userDropdownOpen}
                  >
                    <UserIcon className="h-5 w-5 shrink-0" />
                    <span className="hidden text-xs font-semibold xl:inline truncate max-w-[90px]">
                      {user ? user.firstName : t('nav.sign_in', 'Sign In')}
                    </span>
                    <ChevronDown className="hidden h-3 w-3 xl:inline shrink-0" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-xl border border-stone-200 bg-white py-2 text-stone-900 shadow-2xl animate-fade-in z-50">
                      {user ? (
                        <>
                          <div className="border-b border-stone-100 px-4 py-2">
                            <p className="text-xs font-semibold truncate">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="truncate text-[11px] text-stone-500">{user.email}</p>
                          </div>
                          <button
                            onClick={() => handleNavClick('/account')}
                            className="w-full px-4 py-2 text-left text-xs hover:bg-stone-50 cursor-pointer"
                          >
                            My Account & Orders
                          </button>
                          <button
                            onClick={() => handleNavClick('/track-order')}
                            className="w-full px-4 py-2 text-left text-xs hover:bg-stone-50 cursor-pointer"
                          >
                            Track Order
                          </button>
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              logout();
                            }}
                            className="w-full px-4 py-2 text-left text-xs text-rose-700 hover:bg-rose-50 cursor-pointer"
                          >
                            Sign Out
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleNavClick('/auth/login')}
                          className="w-full px-4 py-2 text-left text-xs hover:bg-stone-50 cursor-pointer"
                        >
                          Sign In
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden border-t border-white/10 lg:block w-full max-w-full">
              <div className="mx-auto flex max-w-7xl items-center justify-center gap-2.5 lg:gap-3.5 xl:gap-5 2xl:gap-7 px-4 py-2.5 sm:px-6 lg:px-8 overflow-visible">
                <div className="flex items-center justify-center gap-2.5 lg:gap-3.5 xl:gap-5 2xl:gap-7 mx-auto whitespace-nowrap">
                  {navLinks.map((link) => (
                    <button
                      key={link.path}
                      onClick={() => handleNavClick(link.path)}
                      className="whitespace-nowrap text-[11px] font-bold uppercase tracking-wider text-stone-200 transition-colors hover:text-amber-300 cursor-pointer"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>
            </nav>

            {/* Mobile/Tablet Horizontal Category Strip */}
            <nav className="lg:hidden border-t border-white/10 w-full max-w-full overflow-hidden bg-black/20 backdrop-blur-xs">
              <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar scroll-smooth">
                {navLinks.map((link) => (
                  <button
                    key={`hero-strip-${link.path}`}
                    onClick={() => handleNavClick(link.path)}
                    className="whitespace-nowrap rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-200 transition-colors hover:bg-white/20 hover:text-amber-300 cursor-pointer shrink-0"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </nav>
          </div>

          {/* Mobile Drawer Menu */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden">
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
                    {navLinks.map((link) => (
                      <li key={link.path} className="border-b border-stone-800/60 pb-2 pt-1">
                        <button
                          onClick={() => handleNavClick(link.path)}
                          className="w-full text-left uppercase tracking-wider text-xs font-semibold text-stone-200 hover:text-amber-400 cursor-pointer py-1 flex items-center justify-between"
                        >
                          <span>{link.label}</span>
                          <span className="text-stone-500 text-[10px]">→</span>
                        </button>
                      </li>
                    ))}

                    {/* Quick Service Links */}
                    <li className="border-b border-stone-800/60 py-2">
                      <button
                        onClick={() => handleNavClick('/account?tab=wishlist')}
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
                        onClick={() => handleNavClick('/track-order')}
                        className="w-full text-left uppercase tracking-wider text-xs font-semibold text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-2"
                      >
                        <Truck className="w-4 h-4 text-amber-400" />
                        <span>{t('nav.track_order', 'Track Order')}</span>
                      </button>
                    </li>
                  </ul>

                  {/* Language Selector */}
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
                        {user.role === 'admin' && (
                          <button
                            onClick={() => handleNavClick('/admin')}
                            className="text-[9px] uppercase font-bold bg-amber-700 text-white px-2 py-0.5 rounded-xs shrink-0"
                          >
                            Admin
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => handleNavClick('/account')}
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
                          onClick={() => handleNavClick('/auth/login')}
                          className="flex-1 bg-amber-700 hover:bg-amber-600 text-white text-xs font-semibold py-2.5 rounded-xs transition-colors cursor-pointer text-center"
                        >
                          {t('nav.sign_in', 'Sign In')}
                        </button>
                        <button
                          onClick={() => handleNavClick('/auth/register')}
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

        {/* Hero Body */}
        <div className="absolute inset-x-0 bottom-0 z-10 mx-auto flex max-w-7xl flex-col justify-end px-4 pb-10 pt-48 sm:px-8 sm:pb-14 lg:px-12">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-200 shadow-sm backdrop-blur-md sm:text-xs">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>Imported Hookah Collection</span>
            </div>
            <h1 className="mb-3 font-display text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.08] tracking-tight text-white drop-shadow-md">
              Russian & European Master Hookahs
            </h1>
            <p className="mb-5 flex items-center gap-2 font-outfit text-xs font-medium text-stone-200 drop-shadow-sm sm:text-sm tracking-wide">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>Alpha Hookah • El Bomber • Maklaud • Steamulation • WOOKAH</span>
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleNavClick('/shop?category=hookahs')}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-outfit text-xs font-bold uppercase tracking-wider text-stone-950 shadow-lg transition-colors hover:bg-stone-200 sm:text-sm"
              >
                <span>Shop the Catalog</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <span className="hidden items-center gap-1.5 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs font-medium text-stone-300 backdrop-blur-md sm:inline-flex">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Imported Product Catalog</span>
              </span>
            </div>
          </div>
        </div>

        {/* Slide Pagination Bullets */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 sm:bottom-6 sm:right-8">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === activeSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
