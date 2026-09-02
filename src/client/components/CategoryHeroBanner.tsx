import React, { useState, useEffect, useRef } from 'react';
import { Category, Brand } from '../../types/index.js';
import { useTranslation } from '../i18n/LanguageContext.js';
import { Sparkles, ChevronRight, ChevronLeft, Layers, CheckCircle2 } from 'lucide-react';

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

interface CategorySlide {
  image: string;
  tagline: string;
  subtitle: string;
}

interface CategoryVisualConfig {
  title: string;
  badge: string;
  headline: string;
  description: string;
  slides: CategorySlide[];
  accentColor: string;
  accentGradient: string;
  stats: { label: string; value: string }[];
}

const CATEGORY_CONFIGS: Record<string, CategoryVisualConfig> = {
  hookahs: {
    title: 'Hookahs',
    badge: 'AEROSPACE GRADE AISI 304 • RUSSIAN & EUROPEAN MASTERS',
    headline: 'Engineered Precision Hookahs',
    description: 'Precision engineered modern and Russian hookahs crafted from aerospace-grade AISI 304 stainless steel, magnetic purge valves, and artisan crystal glass.',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=1800&auto=format&fit=crop',
        tagline: 'Precision Aerospace Stems',
        subtitle: 'AISI 304 Stainless Steel & 360° Vertical Purge'
      },
      {
        image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=1800&auto=format&fit=crop',
        tagline: 'Russian & German Hardware',
        subtitle: 'Alpha Hookah, El Bomber, MattPear & Maklaud'
      },
      {
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1800&auto=format&fit=crop',
        tagline: 'Artisan Wood & Crystal Masterpieces',
        subtitle: 'Heavy Weighted Bases with Magnetic Connectors'
      }
    ],
    accentColor: '#00b5ad',
    accentGradient: 'from-cyan-950/90 via-stone-950/80 to-stone-950/95',
    stats: [
      { label: 'Stem Metallurgy', value: 'AISI 304 Inox' },
      { label: 'Origin Masters', value: 'Russia & Germany' },
      { label: 'Purge Tech', value: '360° Vertical' }
    ]
  },
  tobacco: {
    title: 'Tobacco',
    badge: 'DARK LEAF & BLONDE LEAF • 100+ CERTIFIED BLENDS',
    headline: 'Dark & Blonde Leaf Shisha Tobacco',
    description: 'Dark leaf, blonde leaf, and whole-leaf cigar shisha tobacco blends featuring world-renowned brands like MustHave, DarkSide, BlackBurn, Tangiers, and Bonche.',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1800&auto=format&fit=crop',
        tagline: 'Toasted Burley & Virginia Leaf',
        subtitle: 'MustHave, DarkSide, BlackBurn & Tangiers Blends'
      },
      {
        image: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=1800&auto=format&fit=crop',
        tagline: 'Dense Smoke & Long Session Yield',
        subtitle: 'Over 100+ Authentic Cured Aromas & Cigar Blends'
      },
      {
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1800&auto=format&fit=crop',
        tagline: 'Certified Freshness & Origin Sealed',
        subtitle: 'Mild to Extreme Nicotine Strengths in 25g, 125g & 200g'
      }
    ],
    accentColor: '#0088cc',
    accentGradient: 'from-blue-950/90 via-stone-950/85 to-stone-950/95',
    stats: [
      { label: 'Leaf Varieties', value: 'Burley & Virginia' },
      { label: 'Nicotine Tiers', value: 'Mild to Extreme' },
      { label: 'Aroma Freshness', value: 'Sealed & Certified' }
    ]
  },
  bowls: {
    title: 'Bowls',
    badge: 'HANDCRAFTED CLAY & GLAZED CERAMICS • THERMAL RETENTION',
    headline: 'Handcrafted Artisan Shisha Bowls',
    description: 'Handcrafted clay, semi-porcelain, and character art bowls designed for high thermal retention, pure flavor, and dense smoke output.',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1800&auto=format&fit=crop',
        tagline: 'Phunnel & Killer Geometries',
        subtitle: 'Uniform Thermal Distribution & Zero Flavor Bleed'
      },
      {
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1800&auto=format&fit=crop',
        tagline: 'Oblako, Kong & Alpaca Originals',
        subtitle: 'Artisan Ceramic Glazes & Thermal Terracotta'
      },
      {
        image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1800&auto=format&fit=crop',
        tagline: 'Engineered for HMD & Foil Packs',
        subtitle: 'Optimal 15g – 22g Tobacco Capacities'
      }
    ],
    accentColor: '#f26c60',
    accentGradient: 'from-rose-950/90 via-stone-950/85 to-stone-950/95',
    stats: [
      { label: 'Bowl Geometries', value: 'Phunnel & Killer' },
      { label: 'Thermal Profile', value: 'Uniform Retention' },
      { label: 'Capacity Range', value: '12g – 25g' }
    ]
  },
  bases: {
    title: 'Bases',
    badge: 'BOHEMIAN CRYSTAL & CRAFT DROP VASES',
    headline: 'Bohemian Crystal & Drop Bases',
    description: 'Russian drop vases, craft glass, and hand-cut Bohemian crystal bases engineered for maximum stability, optimal air chamber volume, and visual elegance.',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1800&auto=format&fit=crop',
        tagline: 'Hand-Cut Bohemian Crystal',
        subtitle: 'Caesar Crystal & Craft Glass Russian Drops'
      },
      {
        image: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=1800&auto=format&fit=crop',
        tagline: 'Weighted Low Center of Gravity',
        subtitle: 'Universal 45mm Gasket Compatibility'
      },
      {
        image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=1800&auto=format&fit=crop',
        tagline: 'Clear, Tinted & Frosted Finishes',
        subtitle: 'Precision Hand-Blown Heavy Bottom Glass'
      }
    ],
    accentColor: '#3b82f6',
    accentGradient: 'from-sky-950/90 via-stone-950/85 to-stone-950/95',
    stats: [
      { label: 'Crystal Quality', value: 'Hand-Cut Bohemian' },
      { label: 'Stability Index', value: 'Heavy Base Weighted' },
      { label: 'Grommet Fit', value: 'Universal 45mm' }
    ]
  },
  coal: {
    title: 'Coal',
    badge: '100% NATURAL COCONUT SHELL • ZERO CHEMICAL ODOR',
    headline: 'Natural Coconut Charcoal & Heat',
    description: '100% natural coconut charcoal cubes, flats, and circle cuts with low ash, zero sulfur chemicals, and up to 90 minutes burn time.',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=1800&auto=format&fit=crop',
        tagline: '100% Indonesian Coconut Shell',
        subtitle: 'Coco Loco, One Nation & Oasis Charcoal'
      },
      {
        image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1800&auto=format&fit=crop',
        tagline: 'Up to 90 Minutes High Calorie Heat',
        subtitle: 'Low Ash Output < 2% & Zero Unwanted Odors'
      },
      {
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1800&auto=format&fit=crop',
        tagline: '26mm & 28mm Cubes Available',
        subtitle: '1kg Retail Boxes and 20kg Master Lounge Cartons'
      }
    ],
    accentColor: '#f97316',
    accentGradient: 'from-amber-950/90 via-stone-950/85 to-stone-950/95',
    stats: [
      { label: 'Burn Duration', value: '80 – 90+ Minutes' },
      { label: 'Ash Content', value: '< 2.0% Low Ash' },
      { label: 'Sizes Available', value: '26mm & 28mm Cubes' }
    ]
  },
  accessories: {
    title: 'Accessories',
    badge: 'HEAT MANAGEMENT & PRECISION ACCESSORIES',
    headline: 'HMD, Hoses & Session Essentials',
    description: 'Heat Management Devices (Kaloud, Na Grani), medical-grade silicone hoses, precision tongs, molasses catchers, and professional cleaning supplies.',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1800&auto=format&fit=crop',
        tagline: 'Kaloud & Na Grani Heat Management',
        subtitle: 'Cast Aluminum & Stainless Steel Regulators'
      },
      {
        image: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=1800&auto=format&fit=crop',
        tagline: 'Soft-Touch Medical Grade Silicone Hoses',
        subtitle: 'Blade Hookah, Alpha Tongs & Stainless Mouthpieces'
      },
      {
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1800&auto=format&fit=crop',
        tagline: 'Precision Molasses Catchers & Grommets',
        subtitle: 'Everything You Need for Pure Flavor Sessions'
      }
    ],
    accentColor: '#8b5cf6',
    accentGradient: 'from-purple-950/90 via-stone-950/85 to-stone-950/95',
    stats: [
      { label: 'HMD Alloy', value: 'Aircraft Grade Cast' },
      { label: 'Hose Material', value: 'Medical Soft Silicone' },
      { label: 'Tongs Precision', value: 'Laser-Cut Steel' }
    ]
  },
  'e-hookah': {
    title: 'E-Hookah',
    badge: 'SMART ELECTRONIC HEADS & SHISHA VAPORIZERS',
    headline: 'Electronic Hookahs & Smart Heads',
    description: 'Electronic hookah heads and portable shisha vaporizers for convenient, clean, charcoal-free, and instant modern sessions.',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1800&auto=format&fit=crop',
        tagline: 'Charcoal-Free Clean Vapor Sessions',
        subtitle: 'Ooka Pods & Aspire Proteus Electronic Heads'
      },
      {
        image: 'https://images.unsplash.com/photo-1528701800487-ba01 settings-800?q=80&w=1800&auto=format&fit=crop',
        tagline: 'Instant Heat-Up & Long Battery Life',
        subtitle: 'Smart Temperature Regulation & Pure Pod Flavors'
      }
    ],
    accentColor: '#06b6d4',
    accentGradient: 'from-teal-950/90 via-stone-950/85 to-stone-950/95',
    stats: [
      { label: 'Vapor Tech', value: 'Dual Ceramic Mesh' },
      { label: 'Battery Life', value: 'All-Day Fast USB-C' },
      { label: 'Heat Mechanism', value: '100% Charcoal-Free' }
    ]
  },
  vapes: {
    title: 'Vapes',
    badge: 'POD SYSTEMS & RECHARGEABLE VAPES',
    headline: 'Pod Mods, Disposables & Coils',
    description: 'High performance pod mods, premium disposable vapes, replacement coils, and nic salt devices from world leading vape manufacturers.',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1528701800487-ba01 settings-800?q=80&w=1800&auto=format&fit=crop',
        tagline: 'GeekVape, Vaporesso & Lost Mary',
        subtitle: 'Leak-Proof Mesh Coils & Smart Auto-Wattage'
      },
      {
        image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1800&auto=format&fit=crop',
        tagline: 'High Capacity Rechargeable Disposables',
        subtitle: 'Pure Taste Technology & Smooth Draw Resistance'
      }
    ],
    accentColor: '#ec4899',
    accentGradient: 'from-fuchsia-950/90 via-stone-950/85 to-stone-950/95',
    stats: [
      { label: 'Coil Technology', value: 'Leak-Proof Mesh' },
      { label: 'Power Output', value: 'Smart Auto-Wattage' },
      { label: 'Flavor Profile', value: 'Pure Sub-Ohm & MTL' }
    ]
  },
  'wholesale-supplies': {
    title: 'Wholesale Supplies',
    badge: 'COMMERCIAL B2B & LOUNGE DIRECT PRICING',
    headline: 'Wholesale Lounge Supplies & Bulk Packs',
    description: 'Commercial 1kg shisha tins, 20kg master charcoal cartons, and bulk lounge accessory packs at authorized distributor wholesale pricing.',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1800&auto=format&fit=crop',
        tagline: 'Commercial 1kg Tins & 20kg Master Cases',
        subtitle: 'Tiered 15% – 35% Wholesale Discounts with Fast Dispatch'
      },
      {
        image: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=1800&auto=format&fit=crop',
        tagline: 'Direct Lounge Supply & Hygiene Packs',
        subtitle: 'Disposable Mouthpieces, Master Charcoal & Hoses'
      }
    ],
    accentColor: '#d97706',
    accentGradient: 'from-amber-950/90 via-stone-950/85 to-stone-950/95',
    stats: [
      { label: 'Bulk Units', value: '1kg Tins & 20kg Cases' },
      { label: 'Wholesale Discount', value: 'Tiered 15% – 35% Off' },
      { label: 'Account Approval', value: 'Instant Tax ID Auth' }
    ]
  },
  all: {
    title: 'All Products',
    badge: 'HAUTE SHISHA CATALOG • VERIFIED MASTER DROPS',
    headline: 'All Masterpieces & Shisha Tobacco',
    description: 'Browse premier Russian and European aerospace-grade hookahs, toasted dark leaf shisha tobacco, artisanal clay bowls, Bohemian crystal bases, and coconut coals.',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=1800&auto=format&fit=crop',
        tagline: 'Authentic Russian & European Catalog',
        subtitle: 'Direct from Authorized Brand Manufacturers'
      },
      {
        image: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=1800&auto=format&fit=crop',
        tagline: 'Dark Leaf, Stems, Bowls & Accessories',
        subtitle: 'Premium Curated Shisha Gear with Same-Day Dispatch'
      },
      {
        image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1800&auto=format&fit=crop',
        tagline: 'Worldwide Shipping & Verified Quality',
        subtitle: 'Guaranteed Authentic Origin & Secure Delivery'
      }
    ],
    accentColor: '#b45309',
    accentGradient: 'from-stone-950/95 via-stone-900/90 to-stone-950/95',
    stats: [
      { label: 'Catalog Selection', value: '100% Authentic' },
      { label: 'Shipping Speed', value: 'Same Day Dispatch' },
      { label: 'Global Network', value: 'Worldwide Delivery' }
    ]
  }
};

export const CategoryHeroBanner: React.FC<CategoryHeroBannerProps> = ({
  category,
  categorySlug,
  brand,
  brandSlug,
  subcategories,
  selectedSubcategory,
  onSelectSubcategory,
  productCount,
  onNavigate,
  onResetCategory
}) => {
  const { t } = useTranslation();

  // Find active configuration or fallback to 'all'
  const effectiveKey = categorySlug || (brandSlug ? 'hookahs' : 'all');
  const config = CATEGORY_CONFIGS[effectiveKey] || CATEGORY_CONFIGS.all;

  // Slides state (2-3 slides per category)
  const slides = config.slides || [];
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset slide index when category changes
  useEffect(() => {
    setCurrentSlideIndex(0);
  }, [categorySlug, brandSlug]);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, isPaused, currentSlideIndex]);

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const displayTitle = brand
    ? `${brand.name}`
    : category?.name || config.title;

  const activeSlide = slides[currentSlideIndex] || slides[0];

  return (
    <div
      className="relative mb-6 rounded-2xl overflow-hidden shadow-xl border border-stone-800/80 bg-stone-950 text-white select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image Slides with Smooth Fade Transitions */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
              idx === currentSlideIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={`${displayTitle} - Slide ${idx + 1}`}
              className="w-full h-full object-cover object-center filter brightness-60 contrast-110"
              referrerPolicy="no-referrer"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}

        {/* Dark Vignette & Gradient Overlays */}
        <div className={`absolute inset-0 bg-gradient-to-r ${config.accentGradient} opacity-85`} />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: config.accentColor }}
        />
      </div>

      {/* Hero Content Area */}
      <div className="relative z-10 p-5 sm:p-7 lg:p-9 flex flex-col justify-between min-h-[280px] sm:min-h-[320px]">
        {/* Top Header: Breadcrumb & Realtime Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          {/* Breadcrumb Path */}
          <div className="flex items-center gap-1.5 text-xs text-stone-300 font-medium">
            <button
              onClick={() => onNavigate('/')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3 h-3 text-stone-500 flex-shrink-0" />
            <button
              onClick={onResetCategory}
              className={`hover:text-white transition-colors cursor-pointer ${!categorySlug && !brandSlug ? 'text-white font-bold' : ''}`}
            >
              {t('nav.all_products', 'Catalog')}
            </button>
            {category && (
              <>
                <ChevronRight className="w-3 h-3 text-stone-500 flex-shrink-0" />
                <span className="text-white font-bold">{category.name}</span>
              </>
            )}
            {brand && (
              <>
                <ChevronRight className="w-3 h-3 text-stone-500 flex-shrink-0" />
                <span className="text-cyan-400 font-bold">{brand.name}</span>
              </>
            )}
          </div>

          {/* Real-time Product Counter & Slide Counter */}
          <div className="flex items-center gap-2">
            {slides.length > 1 && (
              <span className="text-[11px] font-mono text-stone-300 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                {currentSlideIndex + 1} / {slides.length}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md border border-white/15 text-stone-100 shadow-sm">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: config.accentColor }} />
              <span>{t('category.showing_items', `${productCount} Products`, { count: productCount })}</span>
            </span>
          </div>
        </div>

        {/* Middle Body: Badge, Main Title, Slide Highlights */}
        <div className="my-4 max-w-3xl">
          {/* Section Eyebrow Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider bg-white/10 border border-white/20 text-stone-200 mb-2.5 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{config.badge}</span>
          </div>

          {/* Big Category Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white mb-1.5 leading-tight drop-shadow-md">
            {displayTitle}
          </h1>

          {/* Slide Tagline */}
          <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-cyan-300 mb-1 drop-shadow-xs">
            <span>{activeSlide?.tagline || config.headline}</span>
          </div>

          {/* Slide Subtitle / Description */}
          <p className="text-xs sm:text-sm text-stone-300/90 leading-relaxed max-w-2xl drop-shadow-sm font-normal">
            {activeSlide?.subtitle || config.description}
          </p>

          {/* Category Specs / Highlight Badges */}
          <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-2.5">
            {config.stats.map((stat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/40 backdrop-blur-md border border-white/10 shadow-xs text-[11px]"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span className="text-stone-400 font-medium">{stat.label}:</span>
                <span className="text-white font-bold">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar: Subcategory Filter Pills + Slide Dot Indicators & Arrows */}
        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Subcategories Filter Strip */}
          {subcategories && subcategories.length > 0 ? (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 whitespace-nowrap flex items-center gap-1 mr-1">
                <Layers className="w-3 h-3" />
                <span>Filters:</span>
              </span>

              {/* All Items Button */}
              <button
                onClick={() => onSelectSubcategory('')}
                className={`text-xs px-3 py-1 rounded-md font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  selectedSubcategory === ''
                    ? 'bg-white text-stone-950 shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-stone-200 border border-white/15'
                }`}
              >
                All {displayTitle}
              </button>

              {/* Subcategory Pills */}
              {subcategories.map((sub) => {
                const isSelected = selectedSubcategory === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => onSelectSubcategory(isSelected ? '' : sub)}
                    className={`text-xs px-3 py-1 rounded-md font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-white text-stone-950 font-bold shadow-sm'
                        : 'bg-white/10 hover:bg-white/20 text-stone-200 border border-white/15'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          ) : (
            <div />
          )}

          {/* Slide Navigation Controls (2-3 Slides) */}
          {slides.length > 1 && (
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {/* Prev Slide Button */}
              <button
                onClick={prevSlide}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md flex items-center justify-center text-white transition-colors cursor-pointer border border-white/20 shadow-xs"
                title="Previous Slide"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Slide Indicator Dots */}
              <div className="flex items-center gap-1.5 px-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      idx === currentSlideIndex
                        ? 'w-5 h-1.5 bg-cyan-400'
                        : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Next Slide Button */}
              <button
                onClick={nextSlide}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md flex items-center justify-center text-white transition-colors cursor-pointer border border-white/20 shadow-xs"
                title="Next Slide"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
