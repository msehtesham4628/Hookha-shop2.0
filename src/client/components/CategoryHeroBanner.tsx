import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Category, Brand } from '../../types/index.js';

interface CategoryHeroBannerProps {
  category?: Category;
  categorySlug: string;
  brand?: Brand;
  brandSlug?: string;
  subcategories: string[];
  selectedSubcategory: string;
  onSelectSubcategory: (subcategory: string) => void;
  productCount: number;
  onNavigate: (path: string) => void;
  onResetCategory?: () => void;
}

type HeroConfig = {
  title: string;
  headline: string;
  description: string;
  badge: string;
  images: string[];
};

const LOCAL_IMAGES: Record<string, string[]> = {
  hookahs: ['/hookahs/hookahs_1.jpg', '/hookahs/hookahs_2.jpg', '/hookahs/hookahs_3.jpg'],
  tobacco: ['/tobacco/tobacco_1.jpg', '/tobacco/tobacco_2.jpg', '/tobacco/tobacco_3.jpg'],
  bowls: ['/bowls/bowls_1.jpg', '/bowls/bowls_2.jpg', '/bowls/bowls_3.jpg'],
  bases: ['/bases/bases_1.jpg', '/bases/bases_2.jpg', '/bases/bases_3.jpg'],
  coal: ['/coal/coal_1.jpg', '/coal/coal_2.jpg', '/coal/coal_3.jpg'],
  accessories: ['/accessories/accessories_1.jpg', '/accessories/accessories_2.jpg', '/accessories/accessories_3.jpg'],
  'e-hookah': ['/e-hookah/e-hookah_1.jpg', '/e-hookah/e-hookah_2.jpg', '/e-hookah/e-hookah_3.jpg'],
  vapes: ['/vapes/vapes_1.jpg', '/vapes/vapes_2.jpg', '/vapes/vapes_3.jpg'],
  'wholesale-supplies': ['/home/home_1.jpg', '/home/home_2.jpg', '/home/home_3.jpg'],
  all: ['/home/home_1.jpg', '/home/home_2.jpg', '/home/home_3.jpg']
};

const CONFIGS: Record<string, HeroConfig> = {
  hookahs: {
    title: 'Hookahs',
    headline: 'Russian & European Master Hookahs',
    description: 'Alpha Hookah • El Bomber • Maklaud • Steamulation • WOOKAH • MattPear',
    badge: 'PREMIUM HOOKAH COLLECTION',
    images: LOCAL_IMAGES.hookahs
  },
  tobacco: {
    title: 'Tobaccos',
    headline: 'Dark & Blonde Leaf Tobaccos',
    description: 'MustHave • DarkSide • BlackBurn • Tangiers • Bonche • Chabacco • Spectrum',
    badge: 'FRESH SEALED BLENDS',
    images: LOCAL_IMAGES.tobacco
  },
  bowls: {
    title: 'Hookah Bowls',
    headline: 'Artisan Thermal Retention Bowls',
    description: 'Oblako • Kong Bowls • Alpaca • Solaris • Target • Cosmo',
    badge: 'ARTISAN COLLECTION',
    images: LOCAL_IMAGES.bowls
  },
  bases: {
    title: 'Bases',
    headline: 'Crystal Glass & Russian Drop Vases',
    description: 'Caesar Crystal • Craft Glass • Big Maks • WOOKAH Crystal',
    badge: 'HANDCRAFTED CRYSTAL',
    images: LOCAL_IMAGES.bases
  },
  coal: {
    title: 'Coals',
    headline: 'High Calorie Natural Coconut Coals',
    description: 'Coco Loco • One Nation • Oasis Charcoal • 26mm & 28mm Cubes',
    badge: '100% NATURAL COCONUT SHELL',
    images: LOCAL_IMAGES.coal
  },
  accessories: {
    title: 'Accessories',
    headline: 'HMD, Hoses, Tongs & Session Gear',
    description: 'Kaloud Lotus • Na Grani • Blade Hookah • Alpha Tongs • Silicone Hoses',
    badge: 'SESSION ESSENTIALS',
    images: LOCAL_IMAGES.accessories
  },
  'e-hookah': {
    title: 'E-Hookahs',
    headline: 'Electronic Hookahs & Smart Heads',
    description: 'Ooka • Aspire Proteus • Clean Charcoal-Free Vapor',
    badge: 'SMART ELECTRONIC HEADS',
    images: LOCAL_IMAGES['e-hookah']
  },
  vapes: {
    title: 'Vapes',
    headline: 'Pod Mods, Disposables & Coils',
    description: 'GeekVape • Vaporesso • Lost Mary • Elf Bar • SMOK',
    badge: 'POD SYSTEMS & DISPOSABLES',
    images: LOCAL_IMAGES.vapes
  },
  'wholesale-supplies': {
    title: 'Wholesale Supplies',
    headline: 'Wholesale Lounge Supplies & Bulk Packs',
    description: '1kg Shisha Tins • 20kg Master Coal Cartons • Lounge Hygiene Packs',
    badge: 'COMMERCIAL B2B',
    images: LOCAL_IMAGES['wholesale-supplies']
  },
  all: {
    title: 'All Products',
    headline: 'All Hookahs & Tobaccos',
    description: 'Russian & European Hookahs • Dark Leaf Tobacco • Artisan Bowls • Crystal Bases',
    badge: 'FUMARE HOOKAH CATALOG',
    images: LOCAL_IMAGES.all
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
  const key = categorySlug || 'all';
  const config = CONFIGS[key] || CONFIGS.all;
  const [slide, setSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const images = useMemo(() => config.images, [config.images]);

  useEffect(() => {
    setSlide(0);
  }, [key, brandSlug]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % images.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [images.length]);

  const title = brand?.name ? `${brand.name} Collection` : category?.name || config.title;
  const headline = brand?.name ? `${brand.name} — Premium Collection` : config.headline;
  const activeImage = images[slide % images.length];

  return (
    <section className="relative left-1/2 -mt-6 mb-10 w-screen -translate-x-1/2 overflow-hidden bg-stone-950 text-white sm:-mt-8">
      <div className="relative min-h-[620px] sm:min-h-[680px] lg:min-h-[760px]">
        <img
          key={activeImage}
          src={activeImage}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700"
          loading="eager"
          onError={(e) => {
            e.currentTarget.src = LOCAL_IMAGES.all[0];
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-950/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/45 to-transparent" />

        {/* Hero Content */}
        <div className="absolute inset-x-0 bottom-0 z-10 mx-auto flex max-w-7xl items-end px-4 pb-12 pt-48 sm:px-8 sm:pb-16 lg:px-12">
          <div className="max-w-4xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-200 backdrop-blur-md">
              <Sparkles className="h-3 w-3 text-amber-400" />
              {brand ? `${brand.name} Collection` : config.badge}
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-white drop-shadow-2xl sm:text-6xl lg:text-7xl">
              {headline}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-300 sm:text-base">
              {brand?.description || config.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('/shop')}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black uppercase tracking-wide text-stone-950 transition hover:bg-stone-200"
              >
                Browse Catalog <ArrowRight className="h-4 w-4" />
              </button>
              <span className="rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-xs font-semibold text-stone-200 backdrop-blur-md">
                {productCount.toLocaleString()} products
              </span>
            </div>

            {subcategories.length > 0 && (
              <div className="mt-6 flex max-w-3xl flex-wrap gap-2">
                {subcategories.slice(0, 8).map((sub) => (
                  <button
                    key={sub}
                    onClick={() => onSelectSubcategory(sub)}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide backdrop-blur-md transition ${
                      selectedSubcategory === sub
                        ? 'border-white bg-white text-stone-950'
                        : 'border-white/20 bg-black/30 text-white hover:bg-white/15'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Carousel Nav & Indicators */}
        {images.length > 1 && (
          <>
            <button
              aria-label="Previous hero"
              onClick={() => setSlide((prev) => (prev + images.length - 1) % images.length)}
              className="absolute left-3 top-1/2 z-20 -translate-y-1/2 cursor-pointer rounded-full border border-white/20 bg-black/30 p-2 backdrop-blur-md transition hover:bg-black/50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              aria-label="Next hero"
              onClick={() => setSlide((prev) => (prev + 1) % images.length)}
              className="absolute right-3 top-1/2 z-20 -translate-y-1/2 cursor-pointer rounded-full border border-white/20 bg-black/30 p-2 backdrop-blur-md transition hover:bg-black/50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-5 right-5 z-20 flex gap-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  aria-label={`Hero slide ${index + 1}`}
                  onClick={() => setSlide(index)}
                  className={`h-1.5 cursor-pointer rounded-full transition-all ${
                    index === slide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
