import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { api } from '../services/api.js';
import { onSync } from '../services/sync.js';
import { ProductCard } from '../components/ProductCard.js';
import { HeroCarousel } from '../components/HeroCarousel.js';
import { Product } from '../../types/index.js';
import { useStore } from '../store/useStore.js';
import { SEOHead } from '../components/SEOHead.js';
import { getWebSiteSchema, getOrganizationSchema, getFAQSchema, MARKET_KEYWORDS } from '../../shared/seoConstants.js';
import {
  ChevronLeft,
  ChevronRight,
  Gift,
  X,
  ShoppingBag,
  MessageSquare,
  Clock,
  Package,
  Tag,
  Mail,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

interface BrandAvatar {
  name: string;
  slug: string;
  bgClass: string;
  textColor: string;
  borderClass?: string;
  badgeText?: string;
  imageUrl?: string;
}

interface BlogPostCard {
  id: string;
  title: string;
  ghostBg: string;
  ghostEmoji: string;
  tag: string;
  readTime: string;
}

type CategoryKey = 'tobacco' | 'hookahs' | 'bowls' | 'bases' | 'coal' | 'accessories' | 'ehookah' | 'vapes';

interface CategoryConfig {
  id: string;
  key: CategoryKey;
  apiCategory: string;
  title: string;
  accentColor: string;
  brands: BrandAvatar[];
  fallbackImage: string;
  heroImages?: string[];
  headline?: string;
  description?: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: 'section-tobacco',
    key: 'tobacco',
    apiCategory: 'tobacco',
    title: 'TOBACCOS',
    accentColor: '#0088cc',
    fallbackImage: '/tobacco/tobacco_1.jpg',
    brands: [
      { name: 'MustHave Tobacco', slug: 'musthave-tobacco', bgClass: 'bg-white', textColor: 'text-stone-900', borderClass: 'border border-stone-300 shadow-xs', badgeText: 'MUSTHAVE', imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop' },
      { name: 'DarkSide Tobacco', slug: 'darkside-tobacco', bgClass: 'bg-stone-900', textColor: 'text-white', badgeText: 'DARKSIDE', imageUrl: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=300&auto=format&fit=crop' },
      { name: 'BlackBurn Tobacco', slug: 'blackburn-tobacco', bgClass: 'bg-stone-900', textColor: 'text-stone-100', borderClass: 'border border-stone-700 shadow-xs', badgeText: 'BLACKBURN', imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=300&auto=format&fit=crop' },
      { name: 'Bonche Tobacco', slug: 'bonche-tobacco', bgClass: 'bg-stone-800', textColor: 'text-amber-200', badgeText: 'BONCHE', imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=300&auto=format&fit=crop' },
      { name: 'Tangiers', slug: 'tangiers', bgClass: 'bg-emerald-950', textColor: 'text-emerald-300', badgeText: 'TANGIERS', imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=300&auto=format&fit=crop' },
      { name: 'Adalya Tobacco', slug: 'adalya-tobacco', bgClass: 'bg-red-900', textColor: 'text-white', badgeText: 'ADALYA', imageUrl: 'https://images.unsplash.com/photo-1599507593548-5d817dcf87bf?q=80&w=300&auto=format&fit=crop' },
      { name: 'Serbetli tobacco', slug: 'serbetli-tobacco', bgClass: 'bg-rose-50', textColor: 'text-rose-800', borderClass: 'border border-rose-200', badgeText: 'Serbetli', imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=300&auto=format&fit=crop' },
      { name: 'Banger Hookah Tobacco', slug: 'banger-tobacco', bgClass: 'bg-amber-900', textColor: 'text-amber-100', badgeText: 'BANGER', imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=300&auto=format&fit=crop' },
      { name: 'Element Tobacco', slug: 'element-tobacco', bgClass: 'bg-cyan-900', textColor: 'text-cyan-100', badgeText: 'ELEMENT', imageUrl: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=300&auto=format&fit=crop' }
    ]
  },
  {
    id: 'section-hookahs',
    key: 'hookahs',
    apiCategory: 'hookahs',
    title: 'HOOKAHS',
    accentColor: '#00b5ad',
    fallbackImage: '/hookahs/hookahs_1.jpg',
    brands: [
      { name: 'Alpha Hookah', slug: 'alpha-hookah', bgClass: 'bg-white', textColor: 'text-stone-900', borderClass: 'border border-stone-300 shadow-xs', badgeText: 'ALPHA', imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop' },
      { name: 'El Bomber Hookah', slug: 'el-bomber', bgClass: 'bg-stone-900', textColor: 'text-red-500', badgeText: 'EL BOMBER', imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop' },
      { name: 'MattPear Hookah', slug: 'mattpear', bgClass: 'bg-emerald-900', textColor: 'text-emerald-100', badgeText: 'MATTPEAR', imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=300&auto=format&fit=crop' },
      { name: 'Maklaud Hookah', slug: 'maklaud-hookah', bgClass: 'bg-stone-950', textColor: 'text-amber-400', badgeText: 'MAKLAUD', imageUrl: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=300&auto=format&fit=crop' },
      { name: 'WOOKAH Hookah', slug: 'wookah', bgClass: 'bg-amber-900', textColor: 'text-amber-100', badgeText: 'WOOKAH', imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=300&auto=format&fit=crop' },
      { name: 'Japona Hookah', slug: 'japona-hookah', bgClass: 'bg-stone-800', textColor: 'text-stone-100', badgeText: 'JAPONA', imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=300&auto=format&fit=crop' },
      { name: 'Steamulation Hookah', slug: 'steamulation-hookah', bgClass: 'bg-slate-100', textColor: 'text-slate-900', borderClass: 'border border-slate-300', badgeText: 'STEAM', imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=300&auto=format&fit=crop' }
    ]
  },
  {
    id: 'section-bowls',
    key: 'bowls',
    apiCategory: 'bowls',
    title: 'HOOKAH BOWLS',
    accentColor: '#f26c60',
    fallbackImage: '/bowls/bowls_1.jpg',
    brands: [
      { name: 'Oblako bowls', slug: 'oblako-bowls', bgClass: 'bg-sky-50', textColor: 'text-sky-800', borderClass: 'border border-sky-300', badgeText: 'OBLAKO', imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=300&auto=format&fit=crop' },
      { name: 'Kong Bowls', slug: 'kong-bowls', bgClass: 'bg-orange-950', textColor: 'text-orange-400', badgeText: 'KONG', imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=300&auto=format&fit=crop' },
      { name: 'Alpaca Bowls', slug: 'alpaca-bowls', bgClass: 'bg-stone-800', textColor: 'text-stone-100', badgeText: 'ALPACA', imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=300&auto=format&fit=crop' },
      { name: 'Solaris Bowls', slug: 'solaris-bowls', bgClass: 'bg-indigo-900', textColor: 'text-indigo-200', badgeText: 'SOLARIS', imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=300&auto=format&fit=crop' },
      { name: 'Target Bowls', slug: 'target-bowls', bgClass: 'bg-rose-950', textColor: 'text-rose-300', badgeText: 'TARGET', imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=300&auto=format&fit=crop' }
    ]
  },
  {
    id: 'section-bases',
    key: 'bases',
    apiCategory: 'bases',
    title: 'BASES',
    accentColor: '#3b82f6',
    fallbackImage: '/bases/bases_1.jpg',
    brands: [
      { name: 'Caesar Crystal', slug: 'caesar-crystal', bgClass: 'bg-blue-950', textColor: 'text-blue-200', badgeText: 'CAESAR', imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=300&auto=format&fit=crop' },
      { name: 'Craft Glass', slug: 'craft-glass', bgClass: 'bg-stone-800', textColor: 'text-amber-300', badgeText: 'CRAFT', imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=300&auto=format&fit=crop' },
      { name: 'WOOKAH Crystal', slug: 'wookah', bgClass: 'bg-amber-900', textColor: 'text-amber-100', badgeText: 'WOOKAH', imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=300&auto=format&fit=crop' }
    ]
  },
  {
    id: 'section-coal',
    key: 'coal',
    apiCategory: 'coal',
    title: 'COALS',
    accentColor: '#f97316',
    fallbackImage: '/tobacco/tobacco_1.jpg',
    brands: [
      { name: 'Coco Loco', slug: 'coco-loco', bgClass: 'bg-stone-900', textColor: 'text-amber-400', badgeText: 'COCO LOCO', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=300&auto=format&fit=crop' },
      { name: 'One Nation', slug: 'one-nation', bgClass: 'bg-red-950', textColor: 'text-red-200', badgeText: '1 NATION', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=300&auto=format&fit=crop' },
      { name: 'Oasis Charcoal', slug: 'oasis-charcoal', bgClass: 'bg-emerald-900', textColor: 'text-emerald-100', badgeText: 'OASIS', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=300&auto=format&fit=crop' }
    ]
  },
  {
    id: 'section-accessories',
    key: 'accessories',
    apiCategory: 'accessories',
    title: 'ACCESSORIES',
    accentColor: '#8b5cf6',
    fallbackImage: '/accessories/accessories_1.jpg',
    heroImages: [
      '/accessories/accessories_1.jpg',
      '/accessories/accessories_2.jpg',
      '/accessories/accessories_3.jpg'
    ],
    headline: 'Heat Management Devices, Silicone Hoses & Session Essentials',
    description: 'Kaloud Lotus • Na Grani • Blade Hookah • Alpha Hookah Tongs • Burners & Wind Covers',
    brands: [
      { name: 'Kaloud', slug: 'kaloud', bgClass: 'bg-white', textColor: 'text-stone-950', borderClass: 'border border-stone-300', badgeText: 'KALOUD', imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=300&auto=format&fit=crop' },
      { name: 'Na Grani HMD', slug: 'na-grani', bgClass: 'bg-stone-900', textColor: 'text-stone-200', badgeText: 'NA GRANI', imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=300&auto=format&fit=crop' },
      { name: 'Blade Hookah', slug: 'blade-hookah', bgClass: 'bg-purple-950', textColor: 'text-purple-200', badgeText: 'BLADE', imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=300&auto=format&fit=crop' },
      { name: 'Alpha Tongs', slug: 'alpha-hookah', bgClass: 'bg-stone-800', textColor: 'text-amber-400', badgeText: 'ALPHA', imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=300&auto=format&fit=crop' }
    ]
  },
  {
    id: 'section-ehookah',
    key: 'ehookah',
    apiCategory: 'e-hookah',
    title: 'E-HOOKAHS',
    accentColor: '#06b6d4',
    fallbackImage: '/e-hookah/e-hookah_1.jpg',
    brands: [
      { name: 'Enso', slug: 'enso', bgClass: 'bg-stone-950', textColor: 'text-cyan-400', badgeText: 'ENSO' },
      { name: 'HeyBar', slug: 'heybar', bgClass: 'bg-orange-950', textColor: 'text-orange-300', badgeText: 'HEYBAR' },
      { name: 'Kori', slug: 'kori', bgClass: 'bg-emerald-900', textColor: 'text-emerald-100', badgeText: 'KORI' },
      { name: 'XKAH', slug: 'xkah', bgClass: 'bg-slate-900', textColor: 'text-slate-100', badgeText: 'XKAH' }
    ]
  },
  {
    id: 'section-vapes',
    key: 'vapes',
    apiCategory: 'vapes',
    title: 'VAPES',
    accentColor: '#ec4899',
    fallbackImage: '/vapes/vapes_1.jpg',
    brands: [
      { name: 'Adalya', slug: 'adalya', bgClass: 'bg-rose-900', textColor: 'text-rose-100', badgeText: 'ADALYA' },
      { name: 'Flamingo', slug: 'flamingo', bgClass: 'bg-pink-700', textColor: 'text-white', badgeText: 'FLAMINGO' },
      { name: 'Kori Hola', slug: 'kori-hola', bgClass: 'bg-blue-900', textColor: 'text-blue-100', badgeText: 'KORI HOLA' },
      { name: 'ZColors', slug: 'zcolors', bgClass: 'bg-purple-900', textColor: 'text-purple-100', badgeText: 'ZCOLORS' }
    ]
  }
];

const BLOG_POSTS: BlogPostCard[] = [
  {
    id: 'post-1',
    title: 'Heat Management 101: How to Pack the Perfect Dark Leaf Bowl',
    ghostBg: 'border-stone-200 hover:border-[#0088cc]',
    ghostEmoji: '💨',
    tag: 'Guides',
    readTime: '4 min read'
  },
  {
    id: 'post-2',
    title: 'Top 5 Russian Hookah Tobacco Flavors You Must Try This Year',
    ghostBg: 'border-stone-200 hover:border-[#0088cc]',
    ghostEmoji: '🍂',
    tag: 'Flavor Spotlight',
    readTime: '5 min read'
  },
  {
    id: 'post-3',
    title: 'Coconut Charcoal vs Quick Light: The Science of Clean Smoke',
    ghostBg: 'border-stone-200 hover:border-[#0088cc]',
    ghostEmoji: '🔥',
    tag: 'Essentials',
    readTime: '3 min read'
  },
  {
    id: 'post-4',
    title: 'Stainless Steel vs Anodized Aluminum: Choosing Your Next Stem',
    ghostBg: 'border-stone-200 hover:border-[#0088cc]',
    ghostEmoji: '🛡️',
    tag: 'Hardware',
    readTime: '6 min read'
  }
];

const BrandAvatarBadge: React.FC<{ brand: BrandAvatar; fallback: string }> = ({ brand, fallback }) => {
  const imageSrc = brand.imageUrl || fallback;
  return (
    <div
      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-108 shadow-xs overflow-hidden ${brand.bgClass} ${brand.textColor} ${brand.borderClass || ''}`}
    >
      <img
        src={imageSrc}
        alt={brand.name}
        className="w-full h-full rounded-full object-cover bg-white"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = fallback;
        }}
      />
    </div>
  );
};

interface CategorySliderProps {
  config: CategoryConfig;
  products: Product[];
  onNavigate: (path: string) => void;
}

const CategorySliderSection: React.FC<CategorySliderProps> = ({ config, products, onNavigate }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    if (!config.heroImages || config.heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % config.heroImages!.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [config.heroImages]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id={config.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between pb-3 border-b border-stone-300 relative mb-6">
        <div className="relative">
          <h2 className="font-heading text-lg sm:text-xl md:text-2xl font-bold uppercase tracking-wider text-stone-900">
            {config.title}
          </h2>
          <div
            className="absolute -bottom-[14px] left-0 h-[4px] w-full z-10"
            style={{ backgroundColor: config.accentColor }}
          />
        </div>

        <div className="flex items-center gap-3 font-outfit">
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => handleScroll('left')}
              className="w-7 h-7 rounded-full border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors shadow-2xs"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-7 h-7 rounded-full border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors shadow-2xs"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => onNavigate(`/shop?category=${config.apiCategory}`)}
            className="text-xs font-bold text-stone-600 hover:opacity-80 transition-opacity uppercase tracking-wider"
            style={{ color: config.accentColor }}
          >
            ― View All
          </button>
        </div>
      </div>

      {/* Featured Category Hero Section (Accessories & High Priority Categories) */}
      {config.heroImages && config.heroImages.length > 0 && (
        <div className="mb-8 relative rounded-xl overflow-hidden border border-stone-800 bg-stone-950 shadow-lg group">
          <div className="relative h-48 sm:h-60 md:h-68 lg:h-76 w-full overflow-hidden">
            {/* Ambient atmospheric backdrop */}
            <img
              src={config.heroImages[heroSlide % config.heroImages.length]}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-center filter blur-3xl opacity-40 scale-125 pointer-events-none"
            />
            {/* Active hero image */}
            <img
              key={config.heroImages[heroSlide % config.heroImages.length]}
              src={config.heroImages[heroSlide % config.heroImages.length]}
              alt={config.title}
              className="absolute inset-0 h-full w-full object-cover object-center transition-all duration-700 group-hover:scale-101"
              loading="lazy"
            />

            {/* Gradient overlays for crisp contrast & text legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/20" />

            {/* Hero content & CTA */}
            <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 lg:px-12 max-w-2xl z-10 text-left">
              <span className="inline-flex items-center gap-1.5 font-outfit text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-400 mb-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Session Essentials
              </span>
              <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-sm">
                {config.headline || `${config.title} Collection`}
              </h3>
              <p className="mt-2 font-outfit text-xs sm:text-sm text-stone-300 line-clamp-2 leading-relaxed">
                {config.description || 'Premium accessories, heat management devices & professional gear.'}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => onNavigate(`/shop?category=${config.apiCategory}`)}
                  className="bg-white hover:bg-stone-200 text-stone-950 text-xs font-outfit font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg shadow-sm transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  Shop {config.title} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Carousel Controls */}
            {config.heroImages.length > 1 && (
              <>
                <button
                  aria-label="Previous banner slide"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHeroSlide((prev) => (prev + config.heroImages!.length - 1) % config.heroImages!.length);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors border border-white/15 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  aria-label="Next banner slide"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHeroSlide((prev) => (prev + 1) % config.heroImages!.length);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors border border-white/15 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5">
                  {config.heroImages.map((_, idx) => (
                    <button
                      key={idx}
                      aria-label={`Slide ${idx + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setHeroSlide(idx);
                      }}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === (heroSlide % config.heroImages!.length)
                          ? 'w-6 bg-amber-400'
                          : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x snap-mandatory min-h-[280px]"
      >
        {products.map((product) => (
          <div key={product.id} className="w-[230px] sm:w-[250px] md:w-[270px] shrink-0 snap-start">
            <ProductCard
              product={product}
              showBulkDiscount={config.key === 'tobacco'}
              onNavigate={(slug) => onNavigate(`/product/${slug}`)}
            />
          </div>
        ))}
      </div>

      {config.brands.length > 0 && (
        <div className="mt-8 pt-6 border-t border-stone-200">
          <h3 className="text-left text-sm font-bold uppercase tracking-wider text-stone-800 mb-5">
            Top {config.title.toLowerCase().replace(/s$/, '')} Brands
          </h3>

          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto pb-2 scrollbar-none">
            {config.brands.map((brand, bIdx) => (
              <div
                key={`${config.key}-${brand.slug}-${bIdx}`}
                onClick={() => onNavigate(`/shop?brand=${brand.slug}`)}
                className="flex flex-col items-center gap-2 cursor-pointer group select-none shrink-0"
              >
                <BrandAvatarBadge brand={brand} fallback={config.fallbackImage} />
                <span className="text-[11px] sm:text-xs font-semibold text-stone-700 group-hover:opacity-80 transition-opacity text-center max-w-[90px] line-clamp-2 leading-tight">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { cart, setCartOpen, showToast } = useStore();

  const [categoryData, setCategoryData] = useState<Record<CategoryKey, Product[]>>({
    tobacco: [],
    hookahs: [],
    bowls: [],
    bases: [],
    coal: [],
    accessories: [],
    ehookah: [],
    vapes: []
  });
  const [newInProducts, setNewInProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [showPointsBanner, setShowPointsBanner] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const postsScrollRef = useRef<HTMLDivElement>(null);

  const loadHomeData = useCallback(async () => {
    try {
      // 1. Fast path: single batch request for all homepage sections
      const res = await api.getHomepageSections().catch(() => null);
      if (res?.success && res.data) {
        setCategoryData({
          tobacco: res.data.categories?.tobacco || [],
          hookahs: res.data.categories?.hookahs || [],
          bowls: res.data.categories?.bowls || [],
          bases: res.data.categories?.bases || [],
          coal: res.data.categories?.coal || [],
          accessories: res.data.categories?.accessories || [],
          ehookah: res.data.categories?.ehookah || [],
          vapes: res.data.categories?.vapes || []
        });
        if (res.data.newArrivals) setNewInProducts(res.data.newArrivals);
        if (res.data.bestSellers) setBestSellers(res.data.bestSellers);
        return;
      }

      // 2. Fallback: individual queries if batch is unavailable
      const [
        tobaccoRes,
        hookahsRes,
        bowlsRes,
        basesRes,
        coalsRes,
        accessoriesRes,
        ehookahRes,
        vapeRes,
        newInRes,
        bestRes
      ] = await Promise.all([
        api.getProducts({ category: 'tobacco', limit: 12 }),
        api.getProducts({ category: 'hookahs', limit: 12 }),
        api.getProducts({ category: 'bowls', limit: 12 }),
        api.getProducts({ category: 'bases', limit: 12 }),
        api.getProducts({ category: 'coal', limit: 12 }),
        api.getProducts({ category: 'accessories', limit: 12 }),
        api.getProducts({ category: 'e-hookah', limit: 12 }),
        api.getProducts({ category: 'vapes', limit: 12 }),
        api.getProducts({ newArrival: true, limit: 8 }),
        api.getProducts({ bestSeller: true, limit: 8 })
      ]);

      setCategoryData({
        tobacco: tobaccoRes?.data?.products || [],
        hookahs: hookahsRes?.data?.products || [],
        bowls: bowlsRes?.data?.products || [],
        bases: basesRes?.data?.products || [],
        coal: coalsRes?.data?.products || [],
        accessories: accessoriesRes?.data?.products || [],
        ehookah: ehookahRes?.data?.products || [],
        vapes: vapeRes?.data?.products || []
      });

      if (newInRes?.data?.products) setNewInProducts(newInRes.data.products);
      if (bestRes?.data?.products) setBestSellers(bestRes.data.products);
    } catch (err) {
      console.error('Failed to load homepage data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHomeData();

    // Listen to real-time sync events instead of hammering the server on window focus
    const unsub = onSync('*', (event) => {
      if (
        ['PRODUCT_UPDATED', 'INVENTORY_UPDATED', 'ORDER_PLACED', 'CATEGORY_UPDATED', 'REFRESH_ALL'].includes(event.type)
      ) {
        loadHomeData();
      }
    });

    return () => {
      unsub();
    };
  }, [loadHomeData]);

  const totalCartCount = useMemo(
    () => cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
    [cart]
  );

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSent(true);
    setTimeout(() => {
      setShowFeedbackModal(false);
      setFeedbackSent(false);
      setFeedbackText('');
    }, 1500);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    showToast('Subscribed to Fumare Hookah newsletter!', 'success');
    setNewsletterEmail('');
  };

  return (
    <div className="w-full bg-[#f8f9fa] pb-20 text-stone-900 font-sans">
      <SEOHead
        title="Fumare Hookah - Premier Hookahs, Shisha Tobacco, Bowls & Accessories"
        ruTitle="Fumare Hookah - Официальный магазин кальянов и табака | Доставка в США и РФ"
        description="The leading online store and master distributor for Alpha Hookah, MustHave, DarkSide, Oblako, Kong, MattPear, Wookah, Kaloud & premium shisha tobacco in USA & Russia."
        ruDescription="Официальный мастер-дистрибьютор Alpha Hookah, MustHave, DarkSide, Oblako, Kong, MattPear и элитного табака для кальяна. Быстрая доставка по США и РФ."
        keywords={MARKET_KEYWORDS.global}
        canonicalPath="/"
        jsonLd={[getWebSiteSchema(), getOrganizationSchema(), getFAQSchema()]}
      />

      <HeroCarousel onNavigate={onNavigate} />

      {CATEGORIES.map((category) => (
        <CategorySliderSection
          key={category.id}
          config={category}
          products={categoryData[category.key]}
          onNavigate={onNavigate}
        />
      ))}

      {/* Service Value Guarantee Boxes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-stone-200/90 rounded-sm p-5 flex items-center gap-4 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-[#0088cc]" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-stone-900 leading-tight">Same Day Shipping</h4>
              <p className="font-outfit text-xs text-stone-500 mt-0.5">USA (1–4 days) · International (3–30 days)</p>
            </div>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-sm p-5 flex items-center gap-4 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <Package className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-stone-900 leading-tight">Free Shipping</h4>
              <p className="font-outfit text-xs text-stone-500 mt-0.5">On orders over $89</p>
            </div>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-sm p-5 flex items-center gap-4 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
              <Tag className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-stone-900 leading-tight">Save up to 50%</h4>
              <p className="font-outfit text-xs text-stone-500 mt-0.5">With Fumare Hookah Direct</p>
            </div>
          </div>
        </div>
      </section>

      {/* New In */}
      <section id="section-new-in" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="text-center mb-8">
          <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-wider text-stone-900">NEW ARRIVALS</h2>
          <div className="w-12 h-[3px] bg-[#0088cc] mx-auto mt-2" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {newInProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showBulkDiscount={true}
              onNavigate={(slug) => onNavigate(`/product/${slug}`)}
            />
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section id="section-best-sellers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="text-center mb-8">
          <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-wider text-stone-900">OUR BEST SELLERS</h2>
          <div className="w-12 h-[3px] bg-[#0088cc] mx-auto mt-2" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showBulkDiscount={true}
              onNavigate={(slug) => onNavigate(`/product/${slug}`)}
            />
          ))}
        </div>
      </section>

      {/* Posts */}
      <section id="section-posts" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="text-center mb-8">
          <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-wider text-stone-900">GUIDES & ARTICLES</h2>
          <div className="w-12 h-[3px] bg-[#0088cc] mx-auto mt-2" />
        </div>
        <div
          ref={postsScrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x snap-mandatory"
        >
          {BLOG_POSTS.map((post) => (
            <div
              key={post.id}
              onClick={() => onNavigate('/blog')}
              className={`w-[260px] sm:w-[280px] p-5 rounded-sm border cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col justify-between shrink-0 snap-start bg-white ${post.ghostBg}`}
            >
              <div>
                <div className="text-3xl mb-3">{post.ghostEmoji}</div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#0088cc]">{post.tag}</span>
                <h3 className="text-sm font-bold text-stone-900 mt-1 leading-snug line-clamp-3">{post.title}</h3>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-500 font-medium">
                <span>{post.readTime}</span>
                <span className="text-[#0088cc] font-bold inline-flex items-center gap-1">Read ➔</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-stone-200 text-stone-700">
        <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-stone-900 mb-3">
          FUMARE HOOKAH IS AN ONLINE HOOKAH AND SHISHA STORE WITH WORLDWIDE SHIPPING.
        </h2>
        <div className="space-y-3 text-xs sm:text-sm text-stone-600 leading-relaxed max-w-5xl">
          <p>
            Fumare Hookah offers an extensive selection of premium hookah products, including stems, bowls, flasks,
            accessories, charcoal, and world-renowned shisha tobacco brands such as MustHave, DarkSide, BlackBurn,
            Tangiers, and Adalya. We work directly with master manufacturers across Russia, Germany, Poland, and the USA
            to guarantee 100% authenticity and fresh factory packaging.
          </p>
          <p>
            Whether you are a seasoned connoisseur seeking heavy dark leaf blends, artisan Bohemian crystal vases, or
            commercial hookah lounges requiring reliable bulk wholesale distribution, our dedicated fulfillment center
            provides same-day dispatch, secure break-free packaging, and insured global delivery.
          </p>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-stone-200 rounded-sm p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-full bg-cyan-50 border border-cyan-200 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 text-[#00b5ad]" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-stone-900">
                SUBSCRIBE TO OUR NEWSLETTER TO RECEIVE THE BEST NEW DEALS!
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Get first notice on exclusive flavor restocks and special discounts.
              </p>
            </div>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="w-full md:w-auto flex items-center gap-2 max-w-md">
            <input
              type="email"
              required
              placeholder="Your email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 min-w-[200px] sm:min-w-[260px] bg-stone-50 border border-stone-300 text-xs px-3.5 py-2.5 rounded-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#00b5ad]"
            />
            <button
              type="submit"
              className="bg-[#00c5b2] hover:bg-[#00b5ad] text-white p-2.5 rounded-xs transition-colors shrink-0 shadow-xs flex items-center justify-center cursor-pointer"
              title="Subscribe"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>

      {/* Floating Points Banner */}
      {showPointsBanner && (
        <div
          id="sticky-points-banner"
          className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-40 bg-stone-950/95 backdrop-blur-md text-white border border-stone-800 rounded-full py-2.5 px-4 sm:px-5 flex items-center justify-between gap-3 shadow-2xl animate-fade-in max-w-md"
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
            <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="line-clamp-1">Register and get 1000 points ($10)</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="points-get-btn"
              onClick={() => onNavigate('/auth/register')}
              className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold px-3 py-1 rounded-full transition-colors shadow-xs cursor-pointer"
            >
              Get $10
            </button>
            <button
              id="points-close-btn"
              onClick={() => setShowPointsBanner(false)}
              className="text-stone-400 hover:text-white p-1 transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Cart Button */}
      <button
        id="floating-cart-btn"
        onClick={() => setCartOpen(true)}
        className="fixed bottom-20 right-4 sm:right-6 z-40 w-13 h-13 rounded-full bg-black text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform border border-stone-800 group cursor-pointer"
        title="View Cart"
      >
        <ShoppingBag className="w-5 h-5 text-white" />
        <span className="absolute -top-1 -right-1 bg-[#00c5b2] text-stone-950 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
          {totalCartCount}
        </span>
      </button>

      {/* Floating Feedback Tab */}
      <button
        id="floating-feedback-tab"
        onClick={() => setShowFeedbackModal(true)}
        className="fixed top-1/2 right-0 -translate-y-1/2 z-40 bg-stone-900 hover:bg-[#0088cc] text-white text-[11px] font-bold uppercase tracking-widest py-2 px-1.5 rounded-l-md shadow-lg transition-colors writing-vertical select-none cursor-pointer"
        style={{ writingMode: 'vertical-rl' }}
      >
        FEEDBACK
      </button>

      {/* Feedback Modal Overlay */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full p-6 shadow-2xl relative animate-fade-in text-left">
            <button
              onClick={() => setShowFeedbackModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3 text-[#0088cc]">
              <MessageSquare className="w-5 h-5" />
              <h3 className="font-bold text-lg text-stone-900">Your Feedback Matters</h3>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              Help us improve Fumare Hookah. Let us know if you are looking for specific tobacco flavors, hookah models, or wholesale options.
            </p>

            {feedbackSent ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xs p-4 text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm">Thank You!</h4>
                <p className="text-xs">Your feedback has been received by our store team.</p>
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} className="space-y-4">
                <textarea
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Type your message, requested brands, or experience..."
                  required
                  className="w-full text-xs p-3 border border-stone-300 rounded-xs focus:ring-1 focus:ring-[#0088cc] focus:border-[#0088cc] outline-none resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[#0088cc] hover:bg-[#0077b3] text-white rounded-xs transition-colors shadow-2xs cursor-pointer"
                  >
                    Send Feedback
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
