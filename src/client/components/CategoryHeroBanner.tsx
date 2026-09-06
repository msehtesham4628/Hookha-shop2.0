import React, { useEffect, useMemo, useState } from 'react';
import { Category, Brand } from '../../types/index.js';
import { useTranslation } from '../i18n/LanguageContext.js';
import { Sparkles, ChevronLeft, ChevronRight, Search, Heart, ShoppingBag, User, Menu, X, ShieldCheck, Truck } from 'lucide-react';
import { useStore } from '../store/useStore.js';
import { LanguageSelector } from './LanguageSelector.js';
import { api } from '../services/api.js';

interface CategoryHeroBannerProps {
  category?: Category;
  categorySlug: string;
  brand?: Brand;
  brandSlug: string;
  subcategories: string[];
  selectedSubcategory: string;
  onSelectSubcategory: (subcategory: string) => void;
  productCount: number;
  onNavigate: (path: string) => void;
  onResetCategory: () => void;
}

type HeroConfig = { title: string; headline: string; description: string; badge: string; images: string[] };

const BASE = 'https://images.unsplash.com/';
const CONFIGS: Record<string, HeroConfig> = {
  hookahs: { title: 'Hookahs', headline: 'Russian & European Master Hookahs', description: 'Alpha Hookah • El Bomber • Maklaud • Steamulation • WOOKAH • MattPear', badge: 'PREMIUM HOOKAH COLLECTION', images: [BASE + 'photo-1527661591475-527312dd65f5?q=80&w=2400&auto=format&fit=crop', BASE + 'photo-1517256064527-09c73fc73e38?q=80&w=2400&auto=format&fit=crop'] },
  tobacco: { title: 'Shisha Tobacco', headline: 'Dark & Blonde Leaf Shisha Tobacco', description: 'MustHave • DarkSide • BlackBurn • Tangiers • Bonche • Chabacco • Spectrum', badge: 'FRESH SEALED BLENDS', images: [BASE + 'photo-1527661591475-527312dd65f5?q=80&w=2400&auto=format&fit=crop', BASE + 'photo-1543083477-4f785aeafaa9?q=80&w=2400&auto=format&fit=crop'] },
  bowls: { title: 'Shisha Bowls', headline: 'Artisan Thermal Retention Bowls', description: 'Oblako • Kong Bowls • Alpaca • Solaris • Target • Cosmo', badge: 'ARTISAN COLLECTION', images: [BASE + 'photo-1618221195710-dd6b41faaea6?q=80&w=2400&auto=format&fit=crop', BASE + 'photo-1578632767115-351597cf2477?q=80&w=2400&auto=format&fit=crop'] },
  bases: { title: 'Vases & Bases', headline: 'Crystal Glass & Russian Drop Vases', description: 'Caesar Crystal • Craft Glass • Big Maks • WOOKAH Crystal', badge: 'HANDCRAFTED CRYSTAL', images: [BASE + 'photo-1513519245088-0e12902e5a38?q=80&w=2400&auto=format&fit=crop', BASE + 'photo-1517256064527-09c73fc73e38?q=80&w=2400&auto=format&fit=crop'] },
  coal: { title: 'Coconut Charcoal', headline: 'High Calorie Natural Coconut Charcoal', description: 'Coco Loco • One Nation • Oasis Charcoal • 26mm & 28mm Cubes', badge: '100% NATURAL COCONUT SHELL', images: [BASE + 'photo-1543083477-4f785aeafaa9?q=80&w=2400&auto=format&fit=crop', BASE + 'photo-1527661591475-527312dd65f5?q=80&w=2400&auto=format&fit=crop'] },
  accessories: { title: 'Accessories & HMD', headline: 'HMD, Hoses, Tongs & Session Gear', description: 'Kaloud Lotus • Na Grani • Blade Hookah • Alpha Tongs • Silicone Hoses', badge: 'SESSION ESSENTIALS', images: [BASE + 'photo-1514432324607-a09d9b4aefdd?q=80&w=2400&auto=format&fit=crop', BASE + 'photo-1527661591475-527312dd65f5?q=80&w=2400&auto=format&fit=crop'] },
  'e-hookah': { title: 'E-Hookah', headline: 'Electronic Hookahs & Smart Heads', description: 'Ooka • Aspire Proteus • Clean Charcoal-Free Vapor', badge: 'SMART ELECTRONIC HEADS', images: [BASE + 'photo-1563245372-f21724e3856d?q=80&w=2400&auto=format&fit=crop', BASE + 'photo-1528701800487-ba012498db85?q=80&w=2400&auto=format&fit=crop'] },
  vapes: { title: 'Vapes', headline: 'Pod Mods, Disposables & Coils', description: 'GeekVape • Vaporesso • Lost Mary • Elf Bar • SMOK', badge: 'POD SYSTEMS & DISPOSABLES', images: [BASE + 'photo-1528701800487-ba012498db85?q=80&w=2400&auto=format&fit=crop', BASE + 'photo-1563245372-f21724e3856d?q=80&w=2400&auto=format&fit=crop'] },
  'wholesale-supplies': { title: 'Wholesale Supplies', headline: 'Wholesale Lounge Supplies & Bulk Packs', description: '1kg Shisha Tins • 20kg Master Coal Cartons • Lounge Hygiene Packs', badge: 'COMMERCIAL B2B', images: [BASE + 'photo-1578632767115-351597cf2477?q=80&w=2400&auto=format&fit=crop', BASE + 'photo-1543083477-4f785aeafaa9?q=80&w=2400&auto=format&fit=crop'] },
  all: { title: 'All Products', headline: 'All Masterpieces & Shisha Tobacco', description: 'Russian & European Hookahs • Dark Leaf Tobacco • Artisan Bowls • Crystal Bases', badge: 'FUMARE HOOKAH CATALOG', images: [BASE + 'photo-1517256064527-09c73fc73e38?q=80&w=2400&auto=format&fit=crop', BASE + 'photo-1527661591475-527312dd65f5?q=80&w=2400&auto=format&fit=crop'] }
};

export const CategoryHeroBanner: React.FC<CategoryHeroBannerProps> = (props) => {
  const { category, categorySlug, brand, brandSlug, subcategories, selectedSubcategory, onSelectSubcategory, productCount, onNavigate, onResetCategory } = props;
  const { t } = useTranslation();
  const { user, cart, wishlistIds, setCartOpen, setSearchOpen, logout } = useStore();
  const config = CONFIGS[categorySlug] || CONFIGS.all;
  const [slide, setSlide] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [catalogImages, setCatalogImages] = useState<string[]>([]);

  useEffect(() => { setSlide(0); }, [categorySlug, brandSlug]);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 20); window.addEventListener('scroll', onScroll); return () => window.removeEventListener('scroll', onScroll); }, []);
  useEffect(() => {
    let cancelled = false;
    api.getProducts({ category: categorySlug || undefined, brand: brandSlug || undefined, limit: 3, sort: 'newest' }).then((r) => {
      const images = (r.data?.products || []).map(p => p.images?.[0]?.url).filter(Boolean).map(u => `/api/image-proxy?url=${encodeURIComponent(u as string)}`);
      if (!cancelled && r.success) setCatalogImages(images as string[]);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [categorySlug, brandSlug]);
  useEffect(() => { if (config.images.length < 2) return; const id = window.setInterval(() => setSlide(s => (s + 1) % config.images.length), 5500); return () => window.clearInterval(id); }, [config.images.length, categorySlug, brandSlug]);

  const title = brand?.name || category?.name || config.title;
  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const images = useMemo(() => config.images.map((fallback, i) => catalogImages[i] || catalogImages[0] || fallback), [config.images, catalogImages]);
  const nav = [
    ['HOOKAHS', '/shop?category=hookahs'], ['TOBACCO', '/shop?category=tobacco'], ['BOWLS', '/shop?category=bowls'], ['BASES', '/shop?category=bases'], ['COAL', '/shop?category=coal'], ['ACCESSORIES', '/shop?category=accessories'], ['E-HOOKAH', '/shop?category=e-hookah'], ['VAPES', '/shop?category=vapes']
  ];

  return (
    <section className="relative left-1/2 -translate-x-1/2 w-screen max-w-none overflow-hidden bg-[#070b10] text-white mb-10">
      <div className="relative h-[650px] sm:h-[700px] lg:h-[760px] overflow-hidden">
        {images.map((image, i) => <img key={i} src={image} alt={title} className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ${i === slide ? 'opacity-100' : 'opacity-0'}`} referrerPolicy="no-referrer" />)}
        <div className="absolute inset-0 bg-[#03070b]/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/20" />

        <header className={`absolute inset-x-0 top-0 z-40 transition-all duration-300 ${scrolled ? 'bg-black/85 backdrop-blur-xl shadow-2xl' : 'bg-gradient-to-b from-black/75 to-transparent'}`}>
          <div className="border-b border-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/80"><div className="mx-auto flex max-w-[1500px] items-center justify-between"><span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-amber-400" />21+ age verified shopping</span><div className="hidden items-center gap-4 sm:flex"><button onClick={() => onNavigate('/track-order')} className="flex items-center gap-1 hover:text-amber-300"><Truck className="h-3.5 w-3.5" />Track Order</button><LanguageSelector variant="topbar" /></div></div></div>
          <div className="mx-auto flex max-w-[1500px] items-center gap-5 px-4 py-4 sm:px-6 lg:px-8">
            <button className="lg:hidden" onClick={() => setMobileOpen(v => !v)}>{mobileOpen ? <X /> : <Menu />}</button>
            <button onClick={() => onNavigate('/')} className="shrink-0 text-left"><div className="font-serif text-xl font-black tracking-[.14em] sm:text-2xl">FUMARE HOOKAH</div><div className="text-[9px] font-bold tracking-[.35em] text-amber-400">EST. 2023</div></button>
            <nav className="hidden flex-1 items-center justify-center gap-4 xl:flex">{nav.map(([label, path]) => <button key={path} onClick={() => onNavigate(path)} className={`text-[11px] font-black tracking-wide transition ${path.includes(categorySlug) ? 'text-amber-400' : 'text-white/90 hover:text-amber-300'}`}>{label}</button>)}</nav>
            <div className="ml-auto flex items-center gap-1"><button onClick={() => setSearchOpen(true)} className="p-2 hover:text-amber-300"><Search className="h-5 w-5" /></button><button onClick={() => onNavigate('/account?tab=wishlist')} className="relative p-2"><Heart className="h-5 w-5" />{wishlistIds.length > 0 && <b className="absolute right-0 top-0 rounded-full bg-amber-500 px-1 text-[9px] text-black">{wishlistIds.length}</b>}</button><button onClick={() => setCartOpen(true)} className="relative p-2"><ShoppingBag className="h-5 w-5" />{cartCount > 0 && <b className="absolute right-0 top-0 rounded-full bg-amber-500 px-1 text-[9px] text-black">{cartCount}</b>}</button><div className="relative"><button onClick={() => setAccountOpen(v => !v)} className="p-2"><User className="h-5 w-5" /></button>{accountOpen && <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white p-2 text-stone-900 shadow-2xl">{user ? <><div className="px-3 py-2 text-xs font-bold">{user.firstName} {user.lastName}</div><button onClick={() => onNavigate('/account')} className="w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-stone-100">My Account & Orders</button><button onClick={() => { logout(); setAccountOpen(false); }} className="w-full rounded-lg px-3 py-2 text-left text-xs text-red-700 hover:bg-red-50">Sign Out</button></> : <button onClick={() => onNavigate('/auth/login')} className="w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-stone-100">Sign In</button>}</div>}</div></div>
          </div>
          <nav className="border-t border-white/10 xl:hidden"><div className="mx-auto flex max-w-[1500px] gap-4 overflow-x-auto px-4 py-3">{nav.map(([label, path]) => <button key={path} onClick={() => onNavigate(path)} className="whitespace-nowrap text-[10px] font-black text-white/85">{label}</button>)}</div></nav>
          {mobileOpen && <div className="border-t border-white/10 bg-black/95 p-4 lg:hidden"><div className="grid grid-cols-2 gap-2">{nav.map(([label, path]) => <button key={path} onClick={() => { setMobileOpen(false); onNavigate(path); }} className="rounded-lg bg-white/5 p-3 text-left text-xs font-bold">{label}</button>)}</div></div>}
        </header>

        <div className="absolute inset-x-0 bottom-0 z-20 mx-auto max-w-[1500px] px-5 pb-12 pt-52 sm:px-8 lg:px-12">
          <div className="max-w-4xl"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-md"><Sparkles className="h-3.5 w-3.5 text-amber-400" />{brand ? `${brand.name} Collection` : config.badge}</div><h1 className="text-5xl font-black leading-[.95] tracking-tight sm:text-6xl lg:text-8xl">{title}</h1><p className="mt-5 max-w-3xl text-sm font-medium text-white/85 sm:text-lg">{brand?.description || config.description}</p><div className="mt-6 flex flex-wrap gap-3"><button onClick={() => onNavigate('/shop')} className="rounded-xl bg-amber-400 px-6 py-3 text-xs font-black uppercase tracking-wide text-black shadow-xl transition hover:bg-amber-300">Browse Catalog <ChevronRight className="ml-1 inline h-4 w-4" /></button><span className="rounded-xl border border-white/25 bg-black/35 px-5 py-3 text-xs font-bold backdrop-blur-md">{productCount.toLocaleString()} products</span></div>{subcategories.length > 0 && <div className="mt-6 flex max-w-5xl flex-wrap gap-2">{subcategories.slice(0, 6).map(sub => <button key={sub} onClick={() => onSelectSubcategory(selectedSubcategory === sub ? '' : sub)} className={`rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-wide ${selectedSubcategory === sub ? 'border-amber-400 bg-amber-400 text-black' : 'border-white/30 bg-black/35 text-white hover:bg-white/10'}`}>{sub}</button>)}</div>}</div>
          <div className="mt-10 flex items-center gap-2">{images.map((_, i) => <button key={i} onClick={() => setSlide(i)} className={`h-1.5 rounded-full transition-all ${i === slide ? 'w-10 bg-amber-400' : 'w-2 bg-white/40'}`} />)}</div>
        </div>
        {images.length > 1 && <><button onClick={() => setSlide(s => (s - 1 + images.length) % images.length)} className="absolute left-5 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 rounded-full border border-white/20 bg-black/35 backdrop-blur-md sm:flex items-center justify-center hover:bg-black/60"><ChevronLeft /></button><button onClick={() => setSlide(s => (s + 1) % images.length)} className="absolute right-5 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 rounded-full border border-white/20 bg-black/35 backdrop-blur-md sm:flex items-center justify-center hover:bg-black/60"><ChevronRight /></button></>}
      </div>
      <div className="grid grid-cols-1 border-t border-white/10 bg-[#080d14] sm:grid-cols-3"><div className="flex items-center justify-center gap-3 border-b border-white/10 px-4 py-5 sm:border-b-0 sm:border-r"><Truck className="h-6 w-6" /><div><b className="block text-xs">FAST & DISCREET SHIPPING</b><span className="text-[11px] text-white/55">Across India</span></div></div><div className="flex items-center justify-center gap-3 border-b border-white/10 px-4 py-5 sm:border-b-0 sm:border-r"><ShieldCheck className="h-6 w-6" /><div><b className="block text-xs">100% ORIGINAL PRODUCTS</b><span className="text-[11px] text-white/55">Trusted Brands</span></div></div><div className="flex items-center justify-center gap-3 px-4 py-5"><Search className="h-6 w-6" /><div><b className="block text-xs">EXPERT SUPPORT</b><span className="text-[11px] text-white/55">Chat With Our Team</span></div></div></div>
    </section>
  );
};
