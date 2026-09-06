import React, { useState, useEffect, useRef } from 'react';
import { Category, Brand } from '../../types/index.js';
import { useTranslation } from '../i18n/LanguageContext.js';
import { Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
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
}

const CATEGORY_CONFIGS: Record<string, CategoryVisualConfig> = {
  hookahs: {
    title: 'Hookahs',
    badge: 'AEROSPACE GRADE AISI 304',
    headline: 'Russian & European Master Hookahs',
    description: 'Alpha Hookah • El Bomber • Maklaud • Steamulation • WOOKAH • MattPear',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=2000&auto=format&fit=crop',
        tagline: 'Precision Aerospace Stems',
        subtitle: 'AISI 304 Stainless Steel & 360° Vertical Purge Technology'
      },
      {
        image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=2000&auto=format&fit=crop',
        tagline: 'Russian & German Hardware',
        subtitle: 'Alpha Hookah, El Bomber, MattPear & Maklaud Masterpieces'
      },
      {
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2000&auto=format&fit=crop',
        tagline: 'Artisan Wood & Crystal Stems',
        subtitle: 'Heavy Weighted Bases with Magnetic Gasket-Free Ports'
      }
    ],
    accentColor: '#00b5ad'
  },
  tobacco: {
    title: 'Shisha Tobacco',
    badge: '100+ FRESH SEALED BLENDS',
    headline: 'Dark & Blonde Leaf Shisha Tobacco',
    description: 'MustHave • DarkSide • BlackBurn • Tangiers • Bonche • Chabacco • Spectrum',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=2000&auto=format&fit=crop',
        tagline: 'Toasted Burley & Virginia Leaf',
        subtitle: 'MustHave, DarkSide, BlackBurn, Tangiers & Bonche Blends'
      },
      {
        image: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=2000&auto=format&fit=crop',
        tagline: 'Dense Smoke & Long Session Yield',
        subtitle: 'Over 100+ Authentic Cured Aromas, Single Notes & Mixed Blends'
      },
      {
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=2000&auto=format&fit=crop',
        tagline: 'Certified Freshness & Sealed Tins',
        subtitle: 'Mild, Medium to Extreme Nicotine Strengths in 25g, 125g & 200g'
      }
    ],
    accentColor: '#0088cc'
  },
  bowls: {
    title: 'Shisha Bowls',
    badge: 'HANDCRAFTED CLAY & GLAZED PHUNNELS',
    headline: 'Artisan Thermal Retention Bowls',
    description: 'Oblako • Kong Bowls • Alpaca • Solaris • Target • Cosmo',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop',
        tagline: 'Phunnel & Killer Geometries',
        subtitle: 'Uniform Thermal Distribution & Zero Flavor Bleeding'
      },
      {
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=2000&auto=format&fit=crop',
        tagline: 'Oblako, Kong & Alpaca Originals',
        subtitle: 'Artisan Ceramic Glazes & Thermal Terracotta Construction'
      },
      {
        image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=2000&auto=format&fit=crop',
        tagline: 'Engineered for HMD & Foil Packs',
        subtitle: 'Optimal 15g – 22g Capacities for Clean Long Sessions'
      }
    ],
    accentColor: '#f26c60'
  },
  bases: {
    title: 'Vases & Bases',
    badge: 'HAND-CUT BOHEMIAN CRYSTAL',
    headline: 'Crystal Glass & Russian Drop Vases',
    description: 'Caesar Crystal • Craft Glass • Big Maks • WOOKAH Crystal',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2000&auto=format&fit=crop',
        tagline: 'Hand-Cut Bohemian Crystal',
        subtitle: 'Caesar Crystal & Craft Glass Russian Drop Vases'
      },
      {
        image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=2000&auto=format&fit=crop',
        tagline: 'Weighted Low Center of Gravity',
        subtitle: 'Universal 45mm Gasket Compatibility & Heavy Wall Glass'
      },
      {
        image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=2000&auto=format&fit=crop',
        tagline: 'Clear, Tinted & Frosted Finishes',
        subtitle: 'Precision Hand-Blown Heavy Bottom Glassware'
      }
    ],
    accentColor: '#3b82f6'
  },
  coal: {
    title: 'Coconut Charcoal',
    badge: '100% NATURAL COCONUT SHELL',
    headline: 'High Calorie Natural Coconut Charcoal',
    description: 'Coco Loco • One Nation • Oasis Charcoal • 26mm & 28mm Cubes',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=2000&auto=format&fit=crop',
        tagline: '100% Indonesian Coconut Shell',
        subtitle: 'Coco Loco, One Nation & Oasis Charcoal'
      },
      {
        image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=2000&auto=format&fit=crop',
        tagline: 'Up to 90 Minutes High Heat Output',
        subtitle: 'Low Ash Output < 2% & Zero Unwanted Chemical Odors'
      },
      {
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=2000&auto=format&fit=crop',
        tagline: '26mm & 28mm Cubes Available',
        subtitle: '1kg Retail Packs and 20kg Master Lounge Cartons'
      }
    ],
    accentColor: '#f97316'
  },
  accessories: {
    title: 'Accessories & HMD',
    badge: 'HEAT MANAGEMENT & HARDWARE',
    headline: 'HMD, Hoses, Tongs & Session Gear',
    description: 'Kaloud Lotus • Na Grani • Blade Hookah • Alpha Tongs • Silicone Hoses',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=2000&auto=format&fit=crop',
        tagline: 'Kaloud & Na Grani Heat Management',
        subtitle: 'Cast Aluminum & Stainless Steel Thermal Regulators'
      },
      {
        image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=2000&auto=format&fit=crop',
        tagline: 'Soft-Touch Silicone Hoses & Tongs',
        subtitle: 'Blade Hookah, Alpha Tongs & Stainless Steel Mouthpieces'
      },
      {
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop',
        tagline: 'Precision Molasses Catchers & Grommets',
        subtitle: 'Everything You Need for Pure Flavor and Clean Sessions'
      }
    ],
    accentColor: '#8b5cf6'
  },
  'e-hookah': {
    title: 'E-Hookah',
    badge: 'SMART ELECTRONIC HEADS',
    headline: 'Electronic Hookahs & Smart Heads',
    description: 'Ooka • Aspire Proteus • Clean Charcoal-Free Vapor',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=2000&auto=format&fit=crop',
        tagline: 'Charcoal-Free Clean Vapor Sessions',
        subtitle: 'Ooka Pods & Aspire Proteus Electronic Heads'
      },
      {
        image: 'https://images.unsplash.com/photo-1528701800487-ba012498db85?q=80&w=2000&auto=format&fit=crop',
        tagline: 'Instant Heat-Up & Smart Temperature Regulation',
        subtitle: 'Long Battery Life & Pure Pod Flavors'
      }
    ],
    accentColor: '#06b6d4'
  },
  vapes: {
    title: 'Vapes & Pods',
    badge: 'POD SYSTEMS & DISPOSABLES',
    headline: 'Pod Mods, Disposables & Coils',
    description: 'GeekVape • Vaporesso • Lost Mary • Elf Bar • SMOK',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1528701800487-ba012498db85?q=80&w=2000&auto=format&fit=crop',
        tagline: 'GeekVape, Vaporesso & Lost Mary',
        subtitle: 'Leak-Proof Mesh Coils & Smart Auto-Wattage'
      },
      {
        image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=2000&auto=format&fit=crop',
        tagline: 'High Capacity Rechargeable Disposables',
        subtitle: 'Pure Taste Technology & Smooth Draw Resistance'
      }
    ],
    accentColor: '#ec4899'
  },
  'wholesale-supplies': {
    title: 'Wholesale Supplies',
    badge: 'COMMERCIAL B2B DIRECT PRICING',
    headline: 'Wholesale Lounge Supplies & Bulk Packs',
    description: '1kg Shisha Tins • 20kg Master Coal Cartons • Lounge Hygiene Packs',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=2000&auto=format&fit=crop',
        tagline: 'Commercial 1kg Tins & 20kg Master Cases',
        subtitle: 'Tiered 15% – 35% Wholesale Discounts with Fast Dispatch'
      },
      {
        image: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=2000&auto=format&fit=crop',
        tagline: 'Direct Lounge Supply & Hygiene Essentials',
        subtitle: 'Disposable Mouthpieces, Master Charcoal & Hoses'
      }
    ],
    accentColor: '#d97706'
  },
  all: {
    title: 'All Products',
    badge: 'HAUTE SHISHA CATALOG • VERIFIED MASTER DROPS',
    headline: 'All Masterpieces & Shisha Tobacco',
    description: 'Russian & European Aerospace Hookahs • Dark Leaf Tobacco • Artisan Bowls • Crystal Bases',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=2000&auto=format&fit=crop',
        tagline: 'Authentic Russian & European Catalog',
        subtitle: 'Direct from Authorized Brand Manufacturers'
      },
      {
        image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=2000&auto=format&fit=crop',
        tagline: 'Dark Leaf, Stems, Bowls & Accessories',
        subtitle: 'Premium Curated Shisha Gear with Same-Day Dispatch'
      },
      {
        image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=2000&auto=format&fit=crop',
        tagline: 'Worldwide Shipping & Verified Quality',
        subtitle: 'Guaranteed Authentic Origin & Secure Delivery'
      }
    ],
    accentColor: '#00b5ad'
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
  const [catalogImages, setCatalogImages] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset slide index when category changes
  useEffect(() => {
    setCurrentSlideIndex(0);
  }, [categorySlug, brandSlug]);

  useEffect(() => {
    let cancelled = false;
    setCatalogImages([]);
    api.getProducts({
      category: categorySlug || undefined,
      brand: brandSlug || undefined,
      limit: 3,
      sort: 'newest'
    }).then((response) => {
      const images = (response.data?.products || [])
        .map(product => product.images?.[0]?.url)
        .filter((imageUrl): imageUrl is string => Boolean(imageUrl))
        .map(imageUrl => `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`);
      if (!cancelled && response.success && images.length > 0) {
        setCatalogImages(images);
      }
    }).catch(() => {});

    return () => {
      cancelled = true;
    };
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
    <div className="relative mb-6">
      {/* Sleek Hero Slide Carousel (Matching Homepage Banner Style, No Card Look) */}
      <div
        className="relative w-full h-[250px] sm:h-[300px] md:h-[360px] rounded-xl overflow-hidden bg-stone-950 text-white select-none shadow-md group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Full-Bleed Slides with Smooth Fade and Subtle Motion */}
        {slides.map((slide, idx) => {
          const isActive = idx === currentSlideIndex;
          return (
            <div
              key={idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={catalogImages[idx] || catalogImages[0] || slide.image}
                alt={`${displayTitle} - Slide ${idx + 1}`}
                className={`w-full h-full object-cover object-center transition-transform duration-7000 ease-out filter brightness-70 contrast-105 ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
                referrerPolicy="no-referrer"
                loading={idx === 0 ? 'eager' : 'lazy'}
                onError={(event) => {
                  const fallback = catalogImages[0] || slide.image;
                  if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
                }}
              />

              {/* Natural Dark Gradient Scrims */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/40 to-transparent" />
            </div>
          );
        })}

        {/* Minimal Hero Content Overlay */}
        <div className="absolute inset-0 p-5 sm:p-7 md:p-9 flex flex-col justify-between z-20">
          {/* Breadcrumb Path & Counter */}
          <div className="flex items-center justify-between gap-3 text-xs text-stone-300 font-medium">
            <div className="flex items-center gap-1.5 flex-wrap">
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

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-black/50 backdrop-blur-md border border-white/15 text-stone-200">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>{(productCount || 0).toLocaleString()} Products</span>
              </span>
            </div>
          </div>

          {/* Hero Titles & Slide Subtitle */}
          <div className="max-w-2xl">
            {/* Subtle Eyebrow Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/20 text-stone-200 mb-2 shadow-xs">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{config.badge}</span>
            </div>

            {/* Clean, High-Contrast Category Headline */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-md leading-tight mb-1.5">
              {displayTitle}
            </h1>

            {/* Active Slide Tagline */}
            <p className="text-xs sm:text-sm font-semibold text-cyan-300 mb-1 drop-shadow-xs">
              {activeSlide?.tagline || config.headline}
            </p>

            {/* Active Slide Subtitle */}
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal line-clamp-2 drop-shadow-xs max-w-xl">
              {activeSlide?.subtitle || config.description}
            </p>
          </div>

          {/* Bottom Controls: Navigation Arrows & Slide Dots */}
          <div className="flex items-center justify-between">
            {/* Subcategory Quick Links if available */}
            {subcategories && subcategories.length > 0 ? (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none max-w-[80%]">
                <button
                  onClick={() => onSelectSubcategory('')}
                  className={`text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    selectedSubcategory === ''
                      ? 'bg-white text-stone-950 shadow-xs'
                      : 'bg-black/40 hover:bg-black/60 text-stone-300 border border-white/10'
                  }`}
                >
                  All
                </button>
                {subcategories.slice(0, 4).map((sub) => {
                  const isSelected = selectedSubcategory === sub;
                  return (
                    <button
                      key={sub}
                      onClick={() => onSelectSubcategory(isSelected ? '' : sub)}
                      className={`text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                        isSelected
                          ? 'bg-white text-stone-950 font-bold shadow-xs'
                          : 'bg-black/40 hover:bg-black/60 text-stone-300 border border-white/10'
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

            {/* Slide Dots Indicator */}
            {slides.length > 1 && (
              <div className="flex items-center gap-1.5">
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
            )}
          </div>
        </div>

        {/* Floating Left/Right Navigation Arrow Buttons (Appears on Hover) */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-80 hover:opacity-100 cursor-pointer shadow-md"
              title="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-80 hover:opacity-100 cursor-pointer shadow-md"
              title="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
