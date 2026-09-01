import React, { useState, useEffect } from 'react';
import { Category } from '../../types/index.js';
import { api } from '../services/api.js';
import {
  Sparkles,
  ArrowRight,
  Layers,
  Flame,
  Award,
  ShieldCheck,
  Disc,
  Compass
} from 'lucide-react';

interface FeaturedCollectionsProps {
  onNavigate: (path: string) => void;
}

interface EnrichedCollection {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  categorySlug: string;
  description: string;
  imageUrl: string;
  itemCount: number;
  highlightBadge?: string;
  tags: string[];
  accentColor: string; // 'cyan' | 'amber' | 'rose' | 'emerald' | 'purple'
  gridSpan?: string;
}

export const FeaturedCollections: React.FC<FeaturedCollectionsProps> = ({ onNavigate }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await api.getCategories();
        if (isMounted && res.success && res.data) {
          setCategories(res.data.filter(c => c.isActive));
        }
      } catch (err) {
        console.error('Failed to dynamically fetch categories for featured collections:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Map and curate dynamic categories into standout Featured Collections
  // Specifically highlighting 'Artisan Bases' and 'Handcrafted Bowls' along with other flagship collections
  const basesCategory = categories.find(c => c.slug === 'bases');
  const bowlsCategory = categories.find(c => c.slug === 'bowls');
  const hookahsCategory = categories.find(c => c.slug === 'hookahs');
  const tobaccoCategory = categories.find(c => c.slug === 'tobacco');
  const accessoriesCategory = categories.find(c => c.slug === 'accessories');
  const coalCategory = categories.find(c => c.slug === 'coal');

  const collections: EnrichedCollection[] = [
    {
      id: 'collection-artisan-bases',
      title: 'Artisan Bases',
      subtitle: 'Bohemian Crystal & Russian Drop Vases',
      slug: basesCategory?.slug || 'bases',
      categorySlug: basesCategory?.slug || 'bases',
      description: basesCategory?.description || 'Heavyweight blown glass, hand-cut crystal, and drop vases engineered for absolute stability.',
      imageUrl: basesCategory?.imageUrl || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop',
      itemCount: basesCategory?.productCount || 12,
      highlightBadge: 'Master Glasswork',
      tags: ['Bohemian Crystal', 'Russian Drop', 'Craft Glass', 'Universal Fit'],
      accentColor: 'cyan',
      gridSpan: 'md:col-span-6 lg:col-span-7'
    },
    {
      id: 'collection-handcrafted-bowls',
      title: 'Handcrafted Bowls',
      subtitle: 'Clay, Glazed Phunnels & Art Series',
      slug: bowlsCategory?.slug || 'bowls',
      categorySlug: bowlsCategory?.slug || 'bowls',
      description: bowlsCategory?.description || 'Thick-walled clay and semi-porcelain bowls from Oblako, Kong, and Alpaca engineered for peak thermal retention.',
      imageUrl: bowlsCategory?.imageUrl || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop',
      itemCount: bowlsCategory?.productCount || 16,
      highlightBadge: 'Thermal Retention',
      tags: ['Phunnel', 'Killer Glaze', 'High-Fire Clay', 'HMD Lock'],
      accentColor: 'rose',
      gridSpan: 'md:col-span-6 lg:col-span-5'
    },
    {
      id: 'collection-precision-hookahs',
      title: 'Precision Hookahs',
      subtitle: 'Modern Engineering & Aerospace Inox',
      slug: hookahsCategory?.slug || 'hookahs',
      categorySlug: hookahsCategory?.slug || 'hookahs',
      description: 'Alpha Hookah, Maklaud, El Bomber, and Wookah with patented vertical purges and magnetic connectors.',
      imageUrl: hookahsCategory?.imageUrl || 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=1200&auto=format&fit=crop',
      itemCount: hookahsCategory?.productCount || 24,
      highlightBadge: 'Award Winning',
      tags: ['AISI 304 Steel', 'Vertical Purge', 'Magnetic Port', 'Diffuser'],
      accentColor: 'emerald',
      gridSpan: 'md:col-span-4 lg:col-span-4'
    },
    {
      id: 'collection-dark-leaf-tobacco',
      title: 'Dark & Blonde Leaf Shisha',
      subtitle: 'Authentic Russian & American Blends',
      slug: tobaccoCategory?.slug || 'tobacco',
      categorySlug: tobaccoCategory?.slug || 'tobacco',
      description: 'MustHave, DarkSide, BlackBurn, Bonche, and Tangiers with intense flavor saturation.',
      imageUrl: tobaccoCategory?.imageUrl || 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1200&auto=format&fit=crop',
      itemCount: tobaccoCategory?.productCount || 38,
      highlightBadge: '100% Sealed Fresh',
      tags: ['Burley Leaf', 'Toasted Virginia', 'Cigar Line', 'Sour Shock'],
      accentColor: 'amber',
      gridSpan: 'md:col-span-4 lg:col-span-4'
    },
    {
      id: 'collection-hmd-accessories',
      title: 'HMD & Accessories',
      subtitle: 'Kaloud, Na Grani & Medical Silicone',
      slug: accessoriesCategory?.slug || 'accessories',
      categorySlug: accessoriesCategory?.slug || 'accessories',
      description: 'Thermal controllers, precision stainless tongs, molasses catchers, and platinum silicone whips.',
      imageUrl: accessoriesCategory?.imageUrl || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop',
      itemCount: accessoriesCategory?.productCount || 18,
      highlightBadge: 'Session Upgrades',
      tags: ['Kaloud HMD', 'Na Grani Inox', 'Pro Tongs', 'Hoses'],
      accentColor: 'purple',
      gridSpan: 'md:col-span-4 lg:col-span-4'
    }
  ];

  const getAccentStyles = (accent: string) => {
    switch (accent) {
      case 'cyan':
        return {
          borderHover: 'hover:border-cyan-500/70',
          badgeBg: 'bg-cyan-500/90 text-stone-950 font-bold',
          pillBg: 'bg-cyan-950/70 text-cyan-200 border-cyan-800/60',
          btnHover: 'group-hover:bg-cyan-500 group-hover:text-stone-950',
          glow: 'group-hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]',
          dot: 'bg-cyan-400'
        };
      case 'rose':
        return {
          borderHover: 'hover:border-rose-500/70',
          badgeBg: 'bg-rose-500/90 text-white font-bold',
          pillBg: 'bg-rose-950/70 text-rose-200 border-rose-800/60',
          btnHover: 'group-hover:bg-rose-500 group-hover:text-white',
          glow: 'group-hover:shadow-[0_0_25px_rgba(244,63,94,0.25)]',
          dot: 'bg-rose-400'
        };
      case 'emerald':
        return {
          borderHover: 'hover:border-emerald-500/70',
          badgeBg: 'bg-emerald-500/90 text-stone-950 font-bold',
          pillBg: 'bg-emerald-950/70 text-emerald-200 border-emerald-800/60',
          btnHover: 'group-hover:bg-emerald-500 group-hover:text-stone-950',
          glow: 'group-hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]',
          dot: 'bg-emerald-400'
        };
      case 'amber':
        return {
          borderHover: 'hover:border-amber-500/70',
          badgeBg: 'bg-amber-400/95 text-stone-950 font-bold',
          pillBg: 'bg-amber-950/70 text-amber-200 border-amber-800/60',
          btnHover: 'group-hover:bg-amber-400 group-hover:text-stone-950',
          glow: 'group-hover:shadow-[0_0_25px_rgba(251,191,36,0.25)]',
          dot: 'bg-amber-400'
        };
      case 'purple':
      default:
        return {
          borderHover: 'hover:border-purple-500/70',
          badgeBg: 'bg-purple-500/90 text-white font-bold',
          pillBg: 'bg-purple-950/70 text-purple-200 border-purple-800/60',
          btnHover: 'group-hover:bg-purple-500 group-hover:text-white',
          glow: 'group-hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]',
          dot: 'bg-purple-400'
        };
    }
  };

  return (
    <section id="featured-collections-section" className="w-full py-10 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-stone-200 gap-4">
          <div className="space-y-1 text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-cyan-600">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              <span>Curated Department Showcases</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-stone-900">
              Featured Collections
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 max-w-2xl">
              Explore our master-grade selections of artisan glass bases, hand-thrown clay bowls, precision-machined hookahs, and world-class shisha tobacco.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="view-all-collections-btn"
              onClick={() => onNavigate('/shop')}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-800 hover:text-cyan-600 transition-colors border border-stone-300 hover:border-cyan-500 px-4 py-2 rounded-xs bg-stone-50 hover:bg-white shadow-2xs"
            >
              <span>Explore All Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 animate-pulse">
            <div className="md:col-span-7 h-72 bg-stone-200 rounded-sm"></div>
            <div className="md:col-span-5 h-72 bg-stone-200 rounded-sm"></div>
            <div className="md:col-span-4 h-64 bg-stone-200 rounded-sm"></div>
            <div className="md:col-span-4 h-64 bg-stone-200 rounded-sm"></div>
            <div className="md:col-span-4 h-64 bg-stone-200 rounded-sm"></div>
          </div>
        )}

        {/* Collections Bento Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5">
            {collections.map((col) => {
              const styles = getAccentStyles(col.accentColor);
              const isHovered = hoveredCardId === col.id;

              return (
                <div
                  key={col.id}
                  id={col.id}
                  onClick={() => onNavigate(`/shop?category=${col.categorySlug}`)}
                  onMouseEnter={() => setHoveredCardId(col.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  className={`group relative overflow-hidden rounded-sm cursor-pointer border border-stone-200/90 transition-all duration-500 flex flex-col justify-end min-h-[300px] sm:min-h-[340px] bg-stone-950 ${col.gridSpan || 'md:col-span-6'} ${styles.borderHover} ${styles.glow}`}
                >
                  {/* Background Image with Hover Zoom */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden">
                    <img
                      src={col.imageUrl}
                      alt={col.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108 group-hover:brightness-105"
                    />
                  </div>

                  {/* High-Contrast Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20 group-hover:via-black/50 transition-colors duration-500" />
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition-colors duration-300" />

                  {/* Top Badges & Counters */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between">
                    {col.highlightBadge && (
                      <span className={`text-[10px] sm:text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-xs shadow-md backdrop-blur-xs flex items-center gap-1 ${styles.badgeBg}`}>
                        <Sparkles className="w-3 h-3" />
                        <span>{col.highlightBadge}</span>
                      </span>
                    )}

                    <span className="text-[11px] font-semibold text-stone-200 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1.5 ml-auto">
                      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot} animate-pulse`} />
                      <span>{col.itemCount} Items</span>
                    </span>
                  </div>

                  {/* Bottom Content Area */}
                  <div className="relative z-10 p-5 sm:p-6 text-left flex flex-col justify-end space-y-2.5 transform transition-transform duration-300">
                    
                    {/* Subtitle / Category Type */}
                    <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-stone-400" />
                      <span>{col.subtitle}</span>
                    </p>

                    {/* Main Title */}
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight group-hover:text-white transition-colors">
                      {col.title}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                      {col.description}
                    </p>

                    {/* Subcategory Pills (Reveal / Highlight on Hover) */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {col.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-xs border backdrop-blur-md transition-all duration-300 ${styles.pillBg} ${isHovered ? 'scale-102 opacity-100' : 'opacity-85'}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-white/15 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                        <span>Shop Collection</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>

                      <div className={`w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all duration-300 ${styles.btnHover}`}>
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Value Assurance Row */}
        <div className="mt-8 pt-6 border-t border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div className="flex items-start gap-2.5 p-2">
            <ShieldCheck className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-stone-900">Direct Importer</h4>
              <p className="text-[11px] text-stone-500">100% Genuine Factory Sealed</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2">
            <Flame className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-stone-900">Optimal Heat Curves</h4>
              <p className="text-[11px] text-stone-500">Tested by Master Mixologists</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2">
            <Layers className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-stone-900">Artisan Craftsmanship</h4>
              <p className="text-[11px] text-stone-500">Hand-Cut Crystal & Clay</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2">
            <Award className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-stone-900">Lounge & Retail Ready</h4>
              <p className="text-[11px] text-stone-500">Fast Priority Shipping</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
