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
  Truck
} from 'lucide-react';
import { useStore } from '../store/useStore.js';
import { useTranslation } from '../i18n/LanguageContext.js';
import { LanguageSelector } from './LanguageSelector.js';

interface HeroCarouselProps {
  onNavigate: (path: string) => void;
}

const HERO_SLIDES = [
  '/home/home_1.jpg',
  '/home/home_2.jpg',
  '/home/home_3.jpg'
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
          className={`absolute inset-x-0 top-0 z-30 transition-all duration-300 ${
            isScrolled ? 'bg-stone-950/90 shadow-lg backdrop-blur-md' : 'bg-gradient-to-b from-stone-950/80 to-transparent'
          }`}
        >
          {/* Compliance Topbar */}
          <div className="border-b border-white/10 bg-black/25 text-[10px] font-bold uppercase tracking-wider text-stone-200 sm:text-[11px]">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 sm:px-6 lg:px-8">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <ShieldCheck className="hidden h-3.5 w-3.5 shrink-0 text-amber-400 sm:inline" />
                <span className="line-clamp-1">
                  {t('topbar.age_notice', 'YOU MUST BE AT LEAST 21 YEARS OF AGE TO PURCHASE ON THIS WEBSITE. ALL CUSTOMERS WILL BE AGE VERIFIED.')}
                </span>
              </div>
              <div className="hidden shrink-0 items-center gap-3 sm:flex">
                <button
                  onClick={() => handleNavClick('/track-order')}
                  className="flex items-center gap-1 text-stone-200 transition-colors hover:text-amber-300 cursor-pointer"
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
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <button
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="p-2 text-white lg:hidden cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              <button
                onClick={() => handleNavClick('/')}
                className="group flex shrink-0 flex-col items-center text-center cursor-pointer"
              >
                <span className="font-serif text-xl font-bold tracking-[0.15em] text-white transition-colors group-hover:text-amber-300 sm:text-2xl">
                  FUMARE HOOKAH
                </span>
                <span className="-mt-1 text-[9px] font-bold uppercase tracking-[0.35em] text-amber-300">
                  EST. 2018
                </span>
              </button>

              {/* Desktop Search Trigger */}
              <div className="hidden flex-1 max-w-md mx-6 md:flex">
                <button
                  onClick={() => setSearchOpen(true)}
                  className="group flex w-full items-center justify-between rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs text-stone-200 backdrop-blur-md transition-all hover:bg-white/15 cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Search className="h-4 w-4 text-stone-300 group-hover:text-amber-300" />
                    {t('nav.search_placeholder', 'Search hookahs, dark leaf, bowls, coals...')}
                  </span>
                  <kbd className="hidden rounded border border-white/15 bg-black/20 px-1.5 py-0.5 font-mono text-[10px] text-stone-300 lg:inline-block">
                    ⌘K
                  </kbd>
                </button>
              </div>

              {/* User Actions */}
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-white md:hidden cursor-pointer"
                  aria-label="Open search modal"
                >
                  <Search className="h-5 w-5" />
                </button>

                <button
                  onClick={() => handleNavClick('/account?tab=wishlist')}
                  className="relative p-2 text-white cursor-pointer"
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
                  className="relative p-2 text-white cursor-pointer"
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
                <div ref={userDropdownRef} className="relative">
                  <button
                    onClick={() => setUserDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-1 p-2 text-white cursor-pointer"
                    aria-expanded={userDropdownOpen}
                  >
                    <UserIcon className="h-5 w-5" />
                    <span className="hidden text-xs font-semibold sm:inline">
                      {user ? user.firstName : t('nav.sign_in', 'Sign In')}
                    </span>
                    <ChevronDown className="hidden h-3 w-3 sm:inline" />
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
            <nav className="hidden border-t border-white/10 lg:block">
              <div className="mx-auto flex max-w-7xl items-center justify-center gap-5 px-4 py-3 sm:px-6 lg:px-8">
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
            </nav>
          </div>

          {/* Mobile Drawer Menu */}
          {mobileMenuOpen && (
            <div className="border-t border-white/10 bg-stone-950/95 backdrop-blur-md lg:hidden">
              <div className="mx-auto grid max-w-7xl grid-cols-2 gap-1 px-4 py-4 sm:grid-cols-3">
                {navLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => handleNavClick(link.path)}
                    className="rounded-lg px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-stone-200 transition-colors hover:bg-white/10 hover:text-amber-300 cursor-pointer"
                  >
                    {link.label}
                  </button>
                ))}
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
            <h1 className="mb-3 text-3xl font-black leading-tight tracking-tight text-white drop-shadow-md sm:text-5xl md:text-6xl">
              Russian & European Master Hookahs
            </h1>
            <p className="mb-5 flex items-center gap-2 text-xs font-medium text-stone-300 drop-shadow-sm sm:text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>Alpha Hookah • El Bomber • Maklaud • Steamulation • WOOKAH</span>
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleNavClick('/shop?category=hookahs')}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-stone-950 shadow-lg transition-colors hover:bg-stone-200 sm:text-sm"
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
