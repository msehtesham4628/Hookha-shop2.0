import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api.js';
import { SEOHead } from '../components/SEOHead.js';
import { Brand } from '../../types/index.js';
import {
  ALL_BRAND_BADGES,
  CATEGORY_BRAND_MAP,
  BrandAvatar,
  getBrandsForCategory
} from '../data/brandsData.js';
import { getBrandUrl, getCategoryUrl } from '../utils/routeHelpers.js';
import {
  ShieldCheck,
  Search,
  ArrowRight,
  Layers,
  Sparkles,
  MapPin,
  ExternalLink,
  Flame,
  CheckCircle2
} from 'lucide-react';

interface BrandsDirectoryPageProps {
  onNavigate: (path: string) => void;
}

const CATEGORY_TABS = [
  { slug: 'all', label: 'All Brands' },
  { slug: 'tobacco', label: 'Tobacco / Shisha' },
  { slug: 'hookahs', label: 'Hookahs' },
  { slug: 'bowls', label: 'Bowls' },
  { slug: 'bases', label: 'Bases & Vases' },
  { slug: 'coal', label: 'Coal & Charcoal' },
  { slug: 'accessories', label: 'Accessories & HMD' },
  { slug: 'e-hookah', label: 'E-Hookah' },
  { slug: 'vapes', label: 'Vapes & Pods' }
];

export const BrandsDirectoryPage: React.FC<BrandsDirectoryPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [serverBrands, setServerBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadServerBrands = async () => {
      try {
        setLoading(true);
        const res = await api.getBrands();
        if (res && res.success && res.data) {
          setServerBrands(res.data);
        }
      } catch (err) {
        console.warn('Could not fetch server brands list:', err);
      } finally {
        setLoading(false);
      }
    };
    loadServerBrands();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Merge server brands product counts with local brands directory
  const masterBrands = useMemo(() => {
    const serverCountsMap = new Map<string, number>();
    for (const sb of serverBrands) {
      serverCountsMap.set(sb.slug.toLowerCase(), sb.productCount || 0);
      if (sb.name) serverCountsMap.set(sb.name.toLowerCase(), sb.productCount || 0);
    }

    return ALL_BRAND_BADGES.map(b => {
      const pCount = serverCountsMap.get(b.slug.toLowerCase()) ?? serverCountsMap.get(b.name.toLowerCase()) ?? 0;
      return {
        ...b,
        productCount: pCount
      };
    });
  }, [serverBrands]);

  // Filter brands based on category tab & search query
  const filteredBrands = useMemo(() => {
    let list = [...masterBrands];

    if (selectedCategory !== 'all') {
      const allowedSlugs = new Set(
        (CATEGORY_BRAND_MAP[selectedCategory] || []).map(b => b.slug.toLowerCase())
      );
      list = list.filter(b => allowedSlugs.has(b.slug.toLowerCase()));
    }

    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase().trim();
      list = list.filter(b =>
        b.name.toLowerCase().includes(term) ||
        b.slug.toLowerCase().includes(term) ||
        (b.origin && b.origin.toLowerCase().includes(term)) ||
        (b.description && b.description.toLowerCase().includes(term))
      );
    }

    return list;
  }, [masterBrands, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 pb-20 font-sans">
      <SEOHead
        title="Official Master Brand Directory | Russian & European Hookahs & Shisha | Fumare Hookah"
        ruTitle="Каталог брендов кальянов и табака | Fumare Hookah"
        description="Explore verified manufacturers and blenders: Alpha Hookah, El Bomber, MustHave, DarkSide, Oblako, Caesar Crystal, Kaloud, and more. 100% genuine master distributor."
        keywords={[
          'hookah brands',
          'shisha brands',
          'alpha hookah',
          'musthave tobacco',
          'darkside tobacco',
          'oblako bowls',
          'russian hookahs',
          'master distributor'
        ]}
        canonicalPath="/brands"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6 uppercase tracking-wider font-medium">
          <button onClick={() => onNavigate('/')} className="hover:text-amber-900 cursor-pointer transition">
            Home
          </button>
          <span>/</span>
          <span className="text-stone-900 font-bold">Brands Directory</span>
        </nav>

        {/* Directory Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-stone-950 text-white shadow-xl border border-stone-800 p-8 sm:p-12 mb-10">
          <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-stone-700/25 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-amber-300 border border-white/10 mb-4 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified Master Distributor Directory
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-white leading-tight">
              Brands & Sub-Categories
            </h1>

            <p className="mt-4 text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl">
              Explore authentic European, Russian, and American hookah manufacturers, artisanal dark-leaf tobacco blenders, hand-cut crystal vase glassblowers, and precision session accessories.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-xs font-semibold text-stone-200">
                <strong className="text-amber-400 font-mono text-sm mr-1">{ALL_BRAND_BADGES.length}+</strong> Verified Brands
              </span>
              <span className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Genuine Guaranteed
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar & Category Navigation Tabs */}
        <div className="space-y-4 mb-10">
          <div className="relative max-w-xl">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search brands by name, country of origin, or specialties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-900 shadow-xs transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.slug}
                onClick={() => setSelectedCategory(tab.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap uppercase tracking-wider transition cursor-pointer ${
                  selectedCategory === tab.slug
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Brands Grid */}
        {filteredBrands.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-4 shadow-xs">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              No brands match "{searchQuery}"
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Try searching with different keywords or switch category filter tabs.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredBrands.map((b) => (
              <div
                key={b.slug}
                onClick={() => onNavigate(getBrandUrl(b.slug, b.category))}
                className="bg-white border border-stone-200 hover:border-amber-800 rounded-2xl p-5 shadow-xs hover:shadow-lg transition flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Top card header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center p-2 shrink-0 group-hover:border-amber-800 transition">
                      {b.imageUrl ? (
                        <img
                          src={b.imageUrl}
                          alt={b.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="font-serif text-base font-black text-amber-900">
                          {b.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
                      {b.category}
                    </span>
                  </div>

                  {/* Brand Titles */}
                  <h3 className="text-lg font-serif font-black text-stone-900 group-hover:text-amber-900 transition line-clamp-1">
                    {b.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1 mb-2.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                    <span className="truncate">{b.origin || 'Master Artisan'}</span>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {b.description || `Certified authentic ${b.name} hookahs, shisha flavors, and accessories.`}
                  </p>
                </div>

                {/* Footer action */}
                <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-500 font-medium">
                    {b.productCount > 0 ? (
                      <span><strong className="text-stone-900 font-mono">{b.productCount}</strong> items</span>
                    ) : (
                      <span>Certified Brand</span>
                    )}
                  </span>

                  <span className="font-bold text-amber-900 group-hover:translate-x-1 transition flex items-center gap-1">
                    Explore Page <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
