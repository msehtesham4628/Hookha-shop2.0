import React, { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Search, ShoppingBag, Heart, User as UserIcon, Menu, X, ChevronDown, Truck } from 'lucide-react';
import { useStore } from '../store/useStore.js';
import { useTranslation } from '../i18n/LanguageContext.js';
import { LanguageSelector } from './LanguageSelector.js';

interface HeroCarouselProps {
  onNavigate: (path: string) => void;
}

const heroSlides = [
  '/home/home_1.jpg',
  '/home/home_2.jpg',
  '/home/home_3.jpg'
];

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onNavigate }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, cart, wishlistIds, setCartOpen, setSearchOpen, logout } = useStore();
  const { t } = useTranslation();

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { label: t('nav.hookahs', 'Hookahs'), path: '/shop?category=hookahs' },
    { label: t('nav.tobacco', 'Tobacco'), path: '/shop?category=tobacco' },
    { label: t('nav.bowls', 'Bowls'), path: '/shop?category=bowls' },
    { label: t('nav.bases', 'Bases'), path: '/shop?category=bases' },
    { label: t('nav.charcoal', 'Coal'), path: '/shop?category=coal' },
    { label: t('nav.accessories', 'Accessories'), path: '/shop?category=accessories' },
    { label: t('nav.ehookah', 'E-Hookah'), path: '/shop?category=e-hookah' },
    { label: t('nav.vapes', 'Vapes'), path: '/shop?category=vapes' },
    { label: t('nav.wholesale', 'Wholesale B2B'), path: '/wholesale' }
  ];

  const totalCartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <section id="hero-carousel" className="relative w-full overflow-hidden bg-[#0d0f12] text-white select-none">
      <div className="relative min-h-[620px] w-full overflow-hidden sm:min-h-[680px] lg:min-h-[740px]">
        {heroSlides.map((image, index) => (
          <img
            key={image}
            src={image}
            alt={index === activeSlide ? 'Premium hookah collection' : 'Hookah lifestyle background'}
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ${index === activeSlide ? 'opacity-100' : 'opacity-0'}`}
            referrerPolicy="no-referrer"
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/55 to-stone-950/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/55 to-transparent" />

        <header className={`absolute inset-x-0 top-0 z-30 transition-all duration-300 ${isScrolled ? 'bg-stone-950/90 shadow-lg backdrop-blur-md' : 'bg-gradient-to-b from-stone-950/80 to-transparent'}`}>
          <div className="border-b border-white/10 bg-black/25 text-[10px] font-bold uppercase tracking-wider text-stone-200 sm:text-[11px]">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 sm:px-6 lg:px-8">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <ShieldCheck className="hidden h-3.5 w-3.5 shrink-0 text-amber-400 sm:inline" />
                <span className="line-clamp-1">{t('topbar.age_notice', 'YOU MUST BE AT LEAST 21 YEARS OF AGE TO PURCHASE ON THIS WEBSITE. ALL CUSTOMERS WILL BE AGE VERIFIED.')}</span>
              </div>
              <div className="hidden shrink-0 items-center gap-3 sm:flex">
                <button onClick={() => onNavigate('/track-order')} className="flex items-center gap-1 text-stone-200 transition-colors hover:text-amber-300">
                  <Truck className="h-3.5 w-3.5 text-amber-400" />
                  <span>{t('nav.track_order', 'Track Order')}</span>
                </button>
                <div className="h-3 w-px bg-white/20" />
                <LanguageSelector variant="topbar" />
              </div>
            </div>
          </div>

          <div className="border-b border-white/10 bg-black/10">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-white lg:hidden" aria-label="Toggle Navigation Menu">
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              <button onClick={() => onNavigate('/')} className="group flex shrink-0 flex-col items-center text-center">
                <span className="font-serif text-xl font-bold tracking-[0.15em] text-white transition-colors group-hover:text-amber-300 sm:text-2xl">FUMARE HOOKAH</span>
                <span className="-mt-1 text-[9px] font-bold uppercase tracking-[0.35em] text-amber-300">EST. 2018</span>
              </button>

              <div className="hidden flex-1 max-w-md mx-6 md:flex">
                <button onClick={() => setSearchOpen(true)} className="group flex w-full items-center justify-between rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs text-stone-200 backdrop-blur-md transition-all hover:bg-white/15">
                  <span className="flex items-center gap-2.5"><Search className="h-4 w-4 text-stone-300 group-hover:text-amber-300" />{t('nav.search_placeholder', 'Search hookahs, dark leaf, bowls, coals...')}</span>
                  <kbd className="hidden rounded border border-white/15 bg-black/20 px-1.5 py-0.5 font-mono text-[10px] text-stone-300 lg:inline-block">⌘K</kbd>
                </button>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <button onClick={() => setSearchOpen(true)} className="p-2 text-white md:hidden"><Search className="h-5 w-5" /></button>
                <button onClick={() => onNavigate('/account?tab=wishlist')} className="relative p-2 text-white" title="Wishlist">
                  <Heart className="h-5 w-5" />
                  {wishlistIds.length > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-700 text-[10px] font-bold text-white">{wishlistIds.length}</span>}
                </button>
                <button onClick={() => setCartOpen(true)} className="relative p-2 text-white" title="Cart">
                  <ShoppingBag className="h-5 w-5" />
                  {totalCartCount > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-700 text-[10px] font-bold text-white">{totalCartCount}</span>}
                </button>
                <div className="relative">
                  <button onClick={() => setUserDropdownOpen(!userDropdownOpen)} className="flex items-center gap-1 p-2 text-white">
                    <UserIcon className="h-5 w-5" />
                    <span className="hidden text-xs font-semibold sm:inline">{user ? user.firstName : t('nav.sign_in', 'Sign In')}</span>
                    <ChevronDown className="hidden h-3 w-3 sm:inline" />
                  </button>
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-xl border border-stone-200 bg-white py-2 text-stone-900 shadow-2xl">
                      {user ? (
                        <>
                          <div className="border-b border-stone-100 px-4 py-2"><p className="text-xs font-semibold">{user.firstName} {user.lastName}</p><p className="truncate text-[11px] text-stone-500">{user.email}</p></div>
                          <button onClick={() => { setUserDropdownOpen(false); onNavigate('/account'); }} className="w-full px-4 py-2 text-left text-xs hover:bg-stone-50">My Account & Orders</button>
                          <button onClick={() => { setUserDropdownOpen(false); onNavigate('/track-order'); }} className="w-full px-4 py-2 text-left text-xs hover:bg-stone-50">Track Order</button>
                          <button onClick={() => { setUserDropdownOpen(false); logout(); }} className="w-full px-4 py-2 text-left text-xs text-rose-700 hover:bg-rose-50">Sign Out</button>
                        </>
                      ) : <button onClick={() => { setUserDropdownOpen(false); onNavigate('/auth/login'); }} className="w-full px-4 py-2 text-left text-xs hover:bg-stone-50">Sign In</button>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <nav className="hidden border-t border-white/10 lg:block">
              <div className="mx-auto flex max-w-7xl items-center justify-center gap-5 px-4 py-3 sm:px-6 lg:px-8">
                {navLinks.map((link) => (
                  <button key={link.path} onClick={() => onNavigate(link.path)} className="whitespace-nowrap text-[11px] font-bold uppercase tracking-wider text-stone-200 transition-colors hover:text-amber-300">
                    {link.label}
                  </button>
                ))}
              </div>
            </nav>
          </div>

          {mobileMenuOpen && (
            <div className="border-t border-white/10 bg-stone-950/95 backdrop-blur-md lg:hidden">
              <div className="mx-auto grid max-w-7xl grid-cols-2 gap-1 px-4 py-4 sm:grid-cols-3">
                {navLinks.map((link) => (
                  <button key={link.path} onClick={() => { setMobileMenuOpen(false); onNavigate(link.path); }} className="rounded-lg px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-stone-200 transition-colors hover:bg-white/10 hover:text-amber-300">
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        <div className="absolute inset-x-0 bottom-0 z-10 mx-auto flex max-w-7xl flex-col justify-end px-4 pb-10 pt-48 sm:px-8 sm:pb-14 lg:px-12">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-200 shadow-sm backdrop-blur-md sm:text-xs">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>Imported Hookah Collection</span>
            </div>
            <h1 className="mb-3 text-3xl font-black leading-tight tracking-tight text-white drop-shadow-md sm:text-5xl md:text-6xl">Russian & European Master Hookahs</h1>
            <p className="mb-5 flex items-center gap-2 text-xs font-medium text-stone-300 drop-shadow-sm sm:text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>Alpha Hookah • El Bomber • Maklaud • Steamulation • WOOKAH</span>
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => onNavigate('/shop?category=hookahs')} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-stone-950 shadow-lg transition-colors hover:bg-stone-200 sm:text-sm">
                <span>Shop the Catalog</span><ArrowRight className="h-4 w-4" />
              </button>
              <span className="hidden items-center gap-1.5 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs font-medium text-stone-300 backdrop-blur-md sm:inline-flex">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /><span>Imported Product Catalog</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};