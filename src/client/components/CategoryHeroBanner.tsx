import React from 'react';
import { Category, Brand } from '../../types/index.js';
import { useTranslation } from '../i18n/LanguageContext.js';
import { Sparkles, ShieldCheck, Truck, Award, CheckCircle2, ChevronRight, Layers, Flame } from 'lucide-react';

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

interface CategoryVisualConfig {
  title: string;
  badge: string;
  headline: string;
  description: string;
  heroImage: string;
  accentColor: string;
  accentGradient: string;
  stats: { label: string; value: string }[];
  keyHighlights: string[];
}

const CATEGORY_CONFIGS: Record<string, CategoryVisualConfig> = {
  hookahs: {
    title: 'Hookahs',
    badge: 'AEROSPACE GRADE AISI 304 • RUSSIAN & EUROPEAN MASTERS',
    headline: 'Engineered Precision Hookahs',
    description: 'Precision engineered modern and Russian hookahs crafted from aerospace-grade AISI 304 stainless steel, magnetic purge valves, and artisan crystal glass.',
    heroImage: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=1800&auto=format&fit=crop',
    accentColor: '#00b5ad',
    accentGradient: 'from-cyan-950/90 via-stone-950/80 to-stone-950/95',
    stats: [
      { label: 'Stem Metallurgy', value: 'AISI 304 Inox' },
      { label: 'Origin Masters', value: 'Russia & Germany' },
      { label: 'Purge Tech', value: '360° Vertical' }
    ],
    keyHighlights: ['Alpha Hookah', 'El Bomber', 'MattPear', 'Maklaud', 'Steamulation', 'WOOKAH']
  },
  tobacco: {
    title: 'Tobacco',
    badge: 'DARK LEAF & BLONDE LEAF • 100+ CERTIFIED BLENDS',
    headline: 'Dark & Blonde Leaf Shisha Tobacco',
    description: 'Dark leaf, blonde leaf, and whole-leaf cigar shisha tobacco blends featuring world-renowned brands like MustHave, DarkSide, BlackBurn, Tangiers, and Bonche.',
    heroImage: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1800&auto=format&fit=crop',
    accentColor: '#0088cc',
    accentGradient: 'from-blue-950/90 via-stone-950/85 to-stone-950/95',
    stats: [
      { label: 'Leaf Varieties', value: 'Burley & Virginia' },
      { label: 'Nicotine Tiers', value: 'Mild to Extreme' },
      { label: 'Aroma Freshness', value: 'Sealed & Certified' }
    ],
    keyHighlights: ['MustHave', 'DarkSide', 'BlackBurn', 'Bonche', 'Tangiers', 'Adalya']
  },
  bowls: {
    title: 'Bowls',
    badge: 'HANDCRAFTED CLAY & GLAZED CERAMICS • THERMAL RETENTION',
    headline: 'Handcrafted Artisan Shisha Bowls',
    description: 'Handcrafted clay, semi-porcelain, and character art bowls designed for high thermal retention, pure flavor, and dense smoke output.',
    heroImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1800&auto=format&fit=crop',
    accentColor: '#f26c60',
    accentGradient: 'from-rose-950/90 via-stone-950/85 to-stone-950/95',
    stats: [
      { label: 'Bowl Geometries', value: 'Phunnel & Killer' },
      { label: 'Thermal Profile', value: 'Uniform Retention' },
      { label: 'Capacity Range', value: '12g – 25g' }
    ],
    keyHighlights: ['Oblako', 'Kong Bowls', 'Alpaca', 'Cosmo Bowl', 'Solaris', 'Big Maks']
  },
  bases: {
    title: 'Bases',
    badge: 'BOHEMIAN CRYSTAL & CRAFT DROP VASES',
    headline: 'Bohemian Crystal & Drop Bases',
    description: 'Russian drop vases, craft glass, and hand-cut Bohemian crystal bases engineered for maximum stability, optimal air chamber volume, and visual elegance.',
    heroImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1800&auto=format&fit=crop',
    accentColor: '#3b82f6',
    accentGradient: 'from-sky-950/90 via-stone-950/85 to-stone-950/95',
    stats: [
      { label: 'Crystal Quality', value: 'Hand-Cut Bohemian' },
      { label: 'Stability Index', value: 'Heavy Base Weighted' },
      { label: 'Grommet Fit', value: 'Universal 45mm' }
    ],
    keyHighlights: ['Russian Drop', 'Caesar Crystal', 'Craft Glass', 'WOOKAH Crystal', 'Alpha Base']
  },
  coal: {
    title: 'Coal',
    badge: '100% NATURAL COCONUT SHELL • ZERO CHEMICAL ODOR',
    headline: 'Natural Coconut Charcoal & Heat',
    description: '100% natural coconut charcoal cubes, flats, and circle cuts with low ash, zero sulfur chemicals, and up to 90 minutes burn time.',
    heroImage: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=1800&auto=format&fit=crop',
    accentColor: '#f97316',
    accentGradient: 'from-amber-950/90 via-stone-950/85 to-stone-950/95',
    stats: [
      { label: 'Burn Duration', value: '80 – 90+ Minutes' },
      { label: 'Ash Content', value: '< 2.0% Low Ash' },
      { label: 'Sizes Available', value: '26mm & 28mm Cubes' }
    ],
    keyHighlights: ['Coco Loco', 'One Nation', 'Oasis Charcoal', 'Shaman', 'Charcoal Burners']
  },
  accessories: {
    title: 'Accessories',
    badge: 'HEAT MANAGEMENT & PRECISION ACCESSORIES',
    headline: 'HMD, Hoses & Session Essentials',
    description: 'Heat Management Devices (Kaloud, Na Grani), medical-grade silicone hoses, precision tongs, molasses catchers, and professional cleaning supplies.',
    heroImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1800&auto=format&fit=crop',
    accentColor: '#8b5cf6',
    accentGradient: 'from-purple-950/90 via-stone-950/85 to-stone-950/95',
    stats: [
      { label: 'HMD Alloy', value: 'Aircraft Grade Cast' },
      { label: 'Hose Material', value: 'Medical Soft Silicone' },
      { label: 'Tongs Precision', value: 'Laser-Cut Steel' }
    ],
    keyHighlights: ['Kaloud Lotus', 'Na Grani HMD', 'Blade Hookah', 'Alpha Tongs', 'Molasses Catchers']
  },
  'e-hookah': {
    title: 'E-Hookah',
    badge: 'SMART ELECTRONIC HEADS & SHISHA VAPORIZERS',
    headline: 'Electronic Hookahs & Smart Heads',
    description: 'Electronic hookah heads and portable shisha vaporizers for convenient, clean, charcoal-free, and instant modern sessions.',
    heroImage: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1800&auto=format&fit=crop',
    accentColor: '#06b6d4',
    accentGradient: 'from-teal-950/90 via-stone-950/85 to-stone-950/95',
    stats: [
      { label: 'Vapor Tech', value: 'Dual Ceramic Mesh' },
      { label: 'Battery Life', value: 'All-Day Fast USB-C' },
      { label: 'Heat Mechanism', value: '100% Charcoal-Free' }
    ],
    keyHighlights: ['Ooka Pods', 'Kangerm', 'Aspire Proteus', 'Starbuzz E-Head', 'Vapor Pods']
  },
  vapes: {
    title: 'Vapes',
    badge: 'POD SYSTEMS & RECHARGEABLE VAPES',
    headline: 'Pod Mods, Disposables & Coils',
    description: 'High performance pod mods, premium disposable vapes, replacement coils, and nic salt devices from world leading vape manufacturers.',
    heroImage: 'https://images.unsplash.com/photo-1528701800487-ba01 settings-800?q=80&w=1800&auto=format&fit=crop',
    accentColor: '#ec4899',
    accentGradient: 'from-fuchsia-950/90 via-stone-950/85 to-stone-950/95',
    stats: [
      { label: 'Coil Technology', value: 'Leak-Proof Mesh' },
      { label: 'Power Output', value: 'Smart Auto-Wattage' },
      { label: 'Flavor Profile', value: 'Pure Sub-Ohm & MTL' }
    ],
    keyHighlights: ['GeekVape', 'Vaporesso', 'Lost Mary', 'SMOK', 'VOOPOO', 'OXVA']
  },
  'wholesale-supplies': {
    title: 'Wholesale Supplies',
    badge: 'COMMERCIAL B2B & LOUNGE DIRECT PRICING',
    headline: 'Wholesale Lounge Supplies & Bulk Packs',
    description: 'Commercial 1kg shisha tins, 20kg master charcoal cartons, and bulk lounge accessory packs at authorized distributor wholesale pricing.',
    heroImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1800&auto=format&fit=crop',
    accentColor: '#d97706',
    accentGradient: 'from-amber-950/90 via-stone-950/85 to-stone-950/95',
    stats: [
      { label: 'Bulk Units', value: '1kg Tins & 20kg Cases' },
      { label: 'Wholesale Discount', value: 'Tiered 15% – 35% Off' },
      { label: 'Account Approval', value: 'Instant Tax ID Auth' }
    ],
    keyHighlights: ['1kg Shisha Tins', '20kg Master Cases', 'Disposable Tips', 'Lounge Starter Kits']
  },
  all: {
    title: 'All Products',
    badge: 'HAUTE SHISHA CATALOG • VERIFIED MASTER DROPS',
    headline: 'All Masterpieces & Shisha Tobacco',
    description: 'Browse premier Russian and European aerospace-grade hookahs, toasted dark leaf shisha tobacco, artisanal clay bowls, Bohemian crystal bases, and coconut coals.',
    heroImage: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=1800&auto=format&fit=crop',
    accentColor: '#b45309',
    accentGradient: 'from-stone-950/95 via-stone-900/90 to-stone-950/95',
    stats: [
      { label: 'Catalog Selection', value: '100% Authentic' },
      { label: 'Shipping Speed', value: 'Same Day Dispatch' },
      { label: 'Global Network', value: 'Worldwide Delivery' }
    ],
    keyHighlights: ['Hookahs', 'Tobacco', 'Bowls', 'Bases', 'Coal', 'Accessories', 'E-Hookah', 'Vapes']
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

  // Use category's own database image if available
  const heroImageUrl = category?.bannerUrl || category?.imageUrl || config.heroImage;

  const displayTitle = brand
    ? `${brand.name} Reserve`
    : category?.name || config.title;

  const displayHeadline = brand
    ? `Official ${brand.name} Collection`
    : config.headline;

  const displayDescription = brand?.description || category?.description || config.description;

  return (
    <div className="relative mb-8 rounded-2xl overflow-hidden shadow-xl border border-stone-800/80 bg-stone-950 text-white">
      {/* Background Image Container with Gradient Overlays */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={heroImageUrl}
          alt={displayTitle}
          className="w-full h-full object-cover object-center scale-105 filter brightness-75 contrast-110"
          referrerPolicy="no-referrer"
          loading="eager"
        />
        {/* Dark Vignette & Color Gradients */}
        <div className={`absolute inset-0 bg-gradient-to-r ${config.accentGradient} opacity-90`} />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: config.accentColor }} />
      </div>

      {/* Hero Content Area */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col justify-between min-h-[300px] sm:min-h-[340px]">
        {/* Top Header: Breadcrumb & Item Counter Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
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

          {/* Real-time Product Counter */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md border border-white/15 text-stone-100 shadow-sm">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: config.accentColor }} />
              <span>{t('category.showing_items', `${productCount} Products`, { count: productCount })}</span>
            </span>
          </div>
        </div>

        {/* Middle Body: Badge, Main Title, Description & Stat Badges */}
        <div className="my-6 max-w-3xl">
          {/* Section Eyebrow Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-white/10 border border-white/20 text-stone-200 mb-3 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{config.badge}</span>
          </div>

          {/* Big Category Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-2 leading-tight drop-shadow-md">
            {displayTitle}
          </h1>

          {/* Subheading / Tagline */}
          <h2 className="text-base sm:text-lg font-semibold text-stone-300 mb-2">
            {displayHeadline}
          </h2>

          {/* Description */}
          <p className="text-xs sm:text-sm text-stone-300/90 leading-relaxed max-w-2xl drop-shadow-sm font-normal">
            {displayDescription}
          </p>

          {/* Category Specs / Highlight Badges */}
          <div className="mt-5 flex flex-wrap items-center gap-2 sm:gap-3">
            {config.stats.map((stat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 shadow-xs text-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="text-stone-400 font-medium">{stat.label}:</span>
                <span className="text-white font-bold">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Subcategories Quick Filter Strip */}
        {subcategories && subcategories.length > 0 && (
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] uppercase font-bold text-stone-400 whitespace-nowrap flex items-center gap-1 mr-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Filters:</span>
              </span>

              {/* All Items Button */}
              <button
                onClick={() => onSelectSubcategory('')}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all duration-200 whitespace-nowrap cursor-pointer shadow-sm ${
                  selectedSubcategory === ''
                    ? 'bg-white text-stone-950 ring-2 ring-white/30 scale-102'
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
                    className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-white text-stone-950 font-bold ring-2 ring-white/30 shadow-md scale-102'
                        : 'bg-white/10 hover:bg-white/20 text-stone-200 border border-white/15'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
