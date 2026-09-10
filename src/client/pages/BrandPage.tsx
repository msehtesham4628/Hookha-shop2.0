import React, { useState, useEffect, useMemo, useRef } from 'react';
import { api } from '../services/api.js';
import { onSync } from '../services/sync.js';
import { ProductCard } from '../components/ProductCard.js';
import { Product, Brand, Category } from '../../types/index.js';
import { useBrandHeadMetadata } from '../hooks/useDocumentMetadata.js';
import { getBrandBySlug, getBrandsForCategory, BrandAvatar } from '../data/brandsData.js';
import { getCategoryUrl, getBrandUrl, getCanonicalCategory } from '../utils/routeHelpers.js';
import {
  ShieldCheck,
  Sparkles,
  Search,
  Grid3X3,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
  Flame,
  Check,
  ArrowRight,
  Layers,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface BrandPageProps {
  brandSlug: string;
  categorySlug?: string;
  initialPage?: number;
  onNavigate: (path: string) => void;
}

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | string)[] = [];
  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, '...', total);
  } else if (current >= total - 3) {
    pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total);
  }
  return pages;
}

export const BrandPage: React.FC<BrandPageProps> = ({
  brandSlug,
  categorySlug,
  initialPage = 1,
  onNavigate
}) => {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>(categorySlug || 'all');
  const [selectedSort, setSelectedSort] = useState('popularity');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [gridColumns, setGridColumns] = useState<3 | 4>(4);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const itemsPerPage = 16;

  // Metadata from local brands catalog
  const localBrandMeta: BrandAvatar | undefined = useMemo(() => {
    return getBrandBySlug(brandSlug);
  }, [brandSlug]);

  const canonicalCategory = useMemo(() => {
    return categorySlug ? getCanonicalCategory(categorySlug) : (localBrandMeta?.category || null);
  }, [categorySlug, localBrandMeta]);

  // Fetch brand information and products
  const fetchBrandData = async (silent = false) => {
    if (!silent) setLoading(true);
    setLoadError(null);
    try {
      const res = await api.getBrand(brandSlug);
      if (res && res.success && res.data) {
        setBrand(res.data.brand);
        setProducts(res.data.products || []);
      } else {
        // Fallback: Query products with brand filter
        const fallbackRes = await api.getProducts({ brand: brandSlug, limit: 200 });
        if (fallbackRes && fallbackRes.success && fallbackRes.data) {
          const prods = fallbackRes.data.products || [];
          setProducts(prods);
          const brandName = localBrandMeta?.name || brandSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          setBrand({
            id: `brand-${brandSlug}`,
            name: brandName,
            slug: brandSlug,
            origin: localBrandMeta?.origin || 'Global Artisan',
            description: localBrandMeta?.description || `Certified authentic ${brandName} catalog merchandise and accessories.`,
            logoUrl: localBrandMeta?.imageUrl || prods[0]?.images[0]?.url,
            productCount: prods.length,
            isActive: true
          });
        }
      }
    } catch (err: any) {
      console.warn('Brand API fetch failed, falling back to products query:', err);
      try {
        const fallbackRes = await api.getProducts({ brand: brandSlug, limit: 200 });
        if (fallbackRes && fallbackRes.success && fallbackRes.data) {
          const prods = fallbackRes.data.products || [];
          setProducts(prods);
          const brandName = localBrandMeta?.name || brandSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          setBrand({
            id: `brand-${brandSlug}`,
            name: brandName,
            slug: brandSlug,
            origin: localBrandMeta?.origin || 'Global Artisan',
            description: localBrandMeta?.description || `Certified authentic ${brandName} catalog merchandise and accessories.`,
            logoUrl: localBrandMeta?.imageUrl || prods[0]?.images[0]?.url,
            productCount: prods.length,
            isActive: true
          });
        } else {
          setLoadError(err.message || 'Failed to load brand products');
        }
      } catch (fallbackErr: any) {
        setLoadError(fallbackErr.message || 'Failed to load brand products');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(initialPage);
    fetchBrandData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [brandSlug, initialPage]);

  // Keep live-synchronized with dashboard changes
  useEffect(() => {
    const unsub = onSync('*', (event) => {
      if (event.type === 'PRODUCT_UPDATED' || event.type === 'INVENTORY_UPDATED') {
        fetchBrandData(true);
      }
    });
    return () => unsub();
  }, [brandSlug]);

  // Calculate available categories for this brand
  const availableCategories = useMemo(() => {
    const catsMap = new Map<string, { name: string; slug: string; count: number }>();
    for (const p of products) {
      const cSlug = p.categorySlug || getCanonicalCategory(p.category) || 'other';
      const cName = p.category || cSlug;
      if (!catsMap.has(cSlug)) {
        catsMap.set(cSlug, { name: cName, slug: cSlug, count: 0 });
      }
      catsMap.get(cSlug)!.count++;
    }
    return Array.from(catsMap.values()).sort((a, b) => b.count - a.count);
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category filter tab
    if (activeCategoryTab && activeCategoryTab !== 'all') {
      list = list.filter(p => {
        const cSlug = p.categorySlug || getCanonicalCategory(p.category) || '';
        return cSlug.toLowerCase() === activeCategoryTab.toLowerCase();
      });
    }

    // In Stock filter
    if (inStockOnly) {
      list = list.filter(p => p.stock > 0);
    }

    // On Sale filter
    if (onSaleOnly) {
      list = list.filter(p => p.isOnSale || (p.salePrice && p.salePrice < p.price));
    }

    // Search query within brand
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        (p.flavor && p.flavor.toLowerCase().includes(term)) ||
        p.tags.some(t => t.toLowerCase().includes(term))
      );
    }

    // Sort order
    switch (selectedSort) {
      case 'price-low-high':
        list.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-high-low':
        list.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'popularity':
      default:
        list.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return list;
  }, [products, activeCategoryTab, inStockOnly, onSaleOnly, searchQuery, selectedSort]);

  // Pagination calculation
  const totalCount = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const newUrl = getBrandUrl(brandSlug, categorySlug, page);
    window.history.pushState(null, '', newUrl);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const displayName = brand?.name || localBrandMeta?.name || brandSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const displayOrigin = brand?.origin || localBrandMeta?.origin || 'Global Artisan';
  const displayDescription = brand?.description || localBrandMeta?.description || `Discover authentic ${displayName} hookahs, flavors, and accessories certified by Fumare Hookah.`;

  // Related sibling brands in the same category
  const siblingBrands = useMemo(() => {
    if (!canonicalCategory) return [];
    return getBrandsForCategory(canonicalCategory)
      .filter(b => b.slug !== brandSlug)
      .slice(0, 8);
  }, [canonicalCategory, brandSlug]);

  // Automatically generate, localize, and update document head metadata (canonical, og:image, title, schema.org)
  useBrandHeadMetadata({
    brandSlug,
    brandName: displayName,
    brandAvatar: localBrandMeta,
    categorySlug: canonicalCategory || categorySlug,
    page: currentPage,
    products
  });

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6 uppercase tracking-wider font-medium overflow-x-auto whitespace-nowrap pb-1">
          <button onClick={() => onNavigate('/')} className="hover:text-amber-900 cursor-pointer transition">
            Home
          </button>
          <span>/</span>
          <button onClick={() => onNavigate('/brands')} className="hover:text-amber-900 cursor-pointer transition">
            Brands
          </button>
          {categorySlug && (
            <>
              <span>/</span>
              <button
                onClick={() => onNavigate(getCategoryUrl(categorySlug))}
                className="hover:text-amber-900 cursor-pointer transition capitalize"
              >
                {categorySlug.replace(/-/g, ' ')}
              </button>
            </>
          )}
          <span>/</span>
          <span className="text-stone-900 font-bold">{displayName}</span>
        </nav>

        {/* Brand Master Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-stone-950 text-white shadow-xl border border-stone-800 p-6 sm:p-10 mb-10">
          {/* Ambient decorative glow */}
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-stone-700/25 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Brand Avatar / Visual Monogram */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-stone-900 border-2 border-stone-700/80 flex items-center justify-center p-3 shadow-inner shrink-0 overflow-hidden">
                {brand?.logoUrl || localBrandMeta?.imageUrl ? (
                  <img
                    src={brand?.logoUrl || localBrandMeta?.imageUrl}
                    alt={displayName}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="font-serif text-2xl sm:text-3xl font-black text-amber-400 tracking-wider">
                    {displayName.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Brand Titles & Badges */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Official Master Distributor
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/10 text-stone-300 border border-white/10">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    {displayOrigin}
                  </span>
                  {categorySlug && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-600/30 uppercase">
                      Sub-Category: {categorySlug.replace(/-/g, ' ')}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-white leading-tight">
                  {displayName}
                </h1>

                <p className="mt-2 text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
                  {displayDescription}
                </p>
              </div>
            </div>

            {/* Total Products Stats & Actions */}
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/10 gap-3">
              <div className="text-left md:text-right">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-400">
                  {products.length}
                </span>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                  Catalog Artifacts
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('/brands')}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 border border-white/15 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  All Brands
                </button>
              </div>
            </div>
          </div>

          {/* Category Sub-Tabs (if brand has products in multiple categories) */}
          {availableCategories.length > 1 && (
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-2">
              <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider mr-2">
                Brand Collections:
              </span>
              <button
                onClick={() => {
                  setActiveCategoryTab('all');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                  activeCategoryTab === 'all'
                    ? 'bg-amber-400 text-stone-950 shadow-xs'
                    : 'bg-white/10 text-stone-300 hover:bg-white/20 border border-white/10'
                }`}
              >
                All Categories ({products.length})
              </button>
              {availableCategories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => {
                    setActiveCategoryTab(cat.slug);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                    activeCategoryTab === cat.slug
                      ? 'bg-amber-400 text-stone-950 shadow-xs'
                      : 'bg-white/10 text-stone-300 hover:bg-white/20 border border-white/10'
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Catalog Controls: Search, Sort, Filters, View Layout */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 mb-8 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search within this brand */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder={`Search ${displayName} catalog by name, model, flavor...`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9.5 pr-4 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-amber-900 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Toggle Toggles & Sort Options */}
          <div className="flex flex-wrap items-center gap-3">
            {/* In Stock toggle */}
            <button
              onClick={() => {
                setInStockOnly(!inStockOnly);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                inStockOnly
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                  : 'bg-stone-50 border-stone-300 text-stone-700 hover:border-stone-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${inStockOnly ? 'bg-emerald-600' : 'bg-stone-400'}`} />
              In Stock Only
            </button>

            {/* On Sale toggle */}
            <button
              onClick={() => {
                setOnSaleOnly(!onSaleOnly);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                onSaleOnly
                  ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                  : 'bg-stone-50 border-stone-300 text-stone-700 hover:border-stone-400'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              On Sale
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium hidden sm:inline">Sort:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="bg-stone-50 border border-stone-300 text-xs px-3 py-2 rounded-lg text-stone-800 font-semibold focus:outline-none focus:border-amber-900 cursor-pointer"
              >
                <option value="popularity">Most Popular</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Grid density toggle */}
            <div className="hidden lg:flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-300">
              <button
                onClick={() => setGridColumns(3)}
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  gridColumns === 3 ? 'bg-white shadow-2xs text-stone-900' : 'text-stone-400 hover:text-stone-700'
                }`}
                title="3 Columns"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setGridColumns(4)}
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  gridColumns === 4 ? 'bg-white shadow-2xs text-stone-900' : 'text-stone-400 hover:text-stone-700'
                }`}
                title="4 Columns"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Products Grid */}
        {loading ? (
          <div className={`grid grid-cols-2 sm:grid-cols-3 ${gridColumns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-3 sm:gap-5`}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-xl p-4 animate-pulse aspect-3/4 flex flex-col justify-between">
                <div className="bg-stone-200 aspect-square rounded-lg mb-3" />
                <div className="space-y-2">
                  <div className="h-3.5 bg-stone-200 rounded w-3/4" />
                  <div className="h-3 bg-stone-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="bg-white border border-stone-200 rounded-xl p-12 text-center space-y-4 shadow-xs">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Unable to Retrieve {displayName} Catalog
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {loadError}
            </p>
            <button
              onClick={() => fetchBrandData()}
              className="bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl p-12 text-center space-y-4 shadow-xs">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              No matching {displayName} items found
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              We could not find any products matching your specific filters or search keywords.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setInStockOnly(false);
                setOnSaleOnly(false);
                setActiveCategoryTab('all');
              }}
              className="bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div>
            <div className={`grid grid-cols-2 sm:grid-cols-3 ${gridColumns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-3 sm:gap-5`}>
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onNavigate={(slug) => onNavigate(`/${product.categorySlug || canonicalCategory || 'product'}/${slug}`)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-stone-300">
                <p className="text-xs text-stone-600 font-medium">
                  Showing <span className="font-bold text-stone-900 font-mono">{((currentPage - 1) * itemsPerPage + 1).toLocaleString()}</span> to <span className="font-bold text-stone-900 font-mono">{Math.min(currentPage * itemsPerPage, totalCount).toLocaleString()}</span> of <span className="font-bold text-stone-900 font-mono">{totalCount.toLocaleString()}</span> items
                </p>

                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 h-9 rounded-lg border flex items-center justify-center gap-1 transition-colors ${
                      currentPage === 1
                        ? 'border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed'
                        : 'border-stone-300 bg-white hover:bg-stone-50 text-stone-700 cursor-pointer shadow-2xs'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {getPageNumbers(currentPage, totalPages).map((p, idx) => {
                      if (typeof p === 'string') {
                        return <span key={`ellipsis-${idx}`} className="px-2 text-stone-400">...</span>;
                      }
                      return (
                        <button
                          key={p}
                          onClick={() => handlePageChange(p)}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono text-xs transition cursor-pointer ${
                            currentPage === p
                              ? 'bg-amber-900 text-white font-bold shadow-xs'
                              : 'border border-stone-300 bg-white hover:bg-stone-50 text-stone-700'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 h-9 rounded-lg border flex items-center justify-center gap-1 transition-colors ${
                      currentPage === totalPages
                        ? 'border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed'
                        : 'border-stone-300 bg-white hover:bg-stone-50 text-stone-700 cursor-pointer shadow-2xs'
                    }`}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sibling Brands / Sub-categories in same Category */}
        {siblingBrands.length > 0 && (
          <div className="mt-16 pt-10 border-t border-stone-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-serif font-bold text-stone-900">
                  Explore More {canonicalCategory ? canonicalCategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : ''} Brands
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Discover master shisha brands and verified artisan manufacturers
                </p>
              </div>
              <button
                onClick={() => onNavigate(getCategoryUrl(canonicalCategory || 'shop'))}
                className="text-xs font-bold uppercase tracking-wider text-amber-900 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
              >
                Browse Category <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {siblingBrands.map((sib) => (
                <button
                  key={sib.slug}
                  onClick={() => onNavigate(getBrandUrl(sib.slug, canonicalCategory || undefined))}
                  className="bg-white border border-stone-200 rounded-xl p-3.5 flex flex-col items-center justify-center text-center hover:border-amber-800 hover:shadow-md transition cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center mb-2 font-serif text-xs font-bold text-stone-800 group-hover:text-amber-900 transition">
                    {sib.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[11px] font-bold text-stone-800 group-hover:text-amber-900 line-clamp-1">
                    {sib.name}
                  </span>
                  <span className="text-[9px] text-stone-400 uppercase tracking-widest mt-0.5">
                    {sib.origin || 'Artisan'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
