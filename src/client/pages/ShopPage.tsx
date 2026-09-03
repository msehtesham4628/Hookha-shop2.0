import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { ProductCard } from '../components/ProductCard.js';
import { CategoryBrandBadges } from '../components/CategoryBrandBadges.js';
import { CategoryHeroBanner } from '../components/CategoryHeroBanner.js';
import { Product, Category, Brand } from '../../types/index.js';
import { useTranslation } from '../i18n/LanguageContext.js';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  RotateCcw,
  Search,
  Grid3X3,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Check
} from 'lucide-react';

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

interface ShopPageProps {
  initialCategory?: string;
  initialBrand?: string;
  initialSearch?: string;
  initialOnSale?: boolean;
  initialNewArrival?: boolean;
  onNavigate: (path: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  initialCategory,
  initialBrand,
  initialSearch,
  initialOnSale,
  initialNewArrival,
  onNavigate
}) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState<number>(5590);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [itemsPerPage] = useState<number>(36);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand || '');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch || '');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedFlavor, setSelectedFlavor] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(initialOnSale || false);
  const [newArrivalOnly, setNewArrivalOnly] = useState(initialNewArrival || false);
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [gridColumns, setGridColumns] = useState<3 | 4>(4);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Load Categories and Brands metadata
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.getCategories(),
          api.getBrands()
        ]);
        if (catRes.success) setCategories(catRes.data);
        if (brandRes.success) setBrands(brandRes.data);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    loadMeta();
  }, []);

  // Update on prop changes
  useEffect(() => {
    setSelectedCategory(initialCategory || '');
    setSelectedBrand(initialBrand || '');
    setSearchQuery(initialSearch || '');
    setOnSaleOnly(initialOnSale || false);
    setNewArrivalOnly(initialNewArrival || false);
    setSelectedSubcategory('');
    setCurrentPage(1);
  }, [initialCategory, initialBrand, initialSearch, initialOnSale, initialNewArrival]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
    searchQuery,
    minPrice,
    maxPrice,
    selectedFlavor,
    inStockOnly,
    onSaleOnly,
    newArrivalOnly,
    sortBy
  ]);

  // Fetch filtered products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        category: selectedCategory || undefined,
        subcategory: selectedSubcategory || undefined,
        brand: selectedBrand || undefined,
        q: searchQuery || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        flavor: selectedFlavor || undefined,
        inStock: inStockOnly ? 'true' : undefined,
        onSale: onSaleOnly ? 'true' : undefined,
        newArrival: newArrivalOnly ? 'true' : undefined,
        sort: sortBy,
        page: currentPage,
        limit: itemsPerPage
      };

      const res = await api.getProducts(params);
      if (res.success && res.data) {
        setProducts(res.data.products || []);
        if (res.data.pagination) {
          setTotalCount(res.data.pagination.totalCount);
          setTotalPages(res.data.pagination.totalPages);
        } else {
          setTotalCount(res.data.products?.length || 0);
          setTotalPages(1);
        }
      }
    } catch (err) {
      console.error('Failed to fetch filtered products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
    searchQuery,
    minPrice,
    maxPrice,
    selectedFlavor,
    inStockOnly,
    onSaleOnly,
    newArrivalOnly,
    sortBy,
    currentPage
  ]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedBrand('');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedFlavor('');
    setInStockOnly(false);
    setOnSaleOnly(false);
    setNewArrivalOnly(false);
    setSortBy('popularity');
    setCurrentPage(1);
  };

  const currentCategoryObj = categories.find(c => c.slug === selectedCategory);
  const currentBrandObj = brands.find(b => b.slug === selectedBrand);

  const subcategoryList = currentCategoryObj?.subcategories || [
    'Dark Leaf Tobacco',
    'Blonde Leaf Tobacco',
    'Cigar Tobacco',
    'Fruity & Sweet',
    'Mint & Cooling',
    'Dessert & Spices'
  ];

  const hasActiveFilters = !!(
    selectedCategory ||
    selectedSubcategory ||
    selectedBrand ||
    searchQuery ||
    minPrice ||
    maxPrice ||
    selectedFlavor ||
    inStockOnly ||
    onSaleOnly ||
    newArrivalOnly
  );

  const flavorOptions = [
    'Mint', 'Peach', 'Berries', 'Grapefruit', 'Cane Mint', 'Apple', 'Citrus', 'Spiced Tea', 'Bergamot', 'Mango'
  ];

  const sortButtons = [
    { label: t('category.sort_popularity', 'By Popularity'), value: 'popularity' },
    { label: t('category.sort_newest', 'New'), value: 'newest' },
    { label: t('category.sort_rating', 'Sort by Rating'), value: 'rating' },
    { label: t('category.sort_price_low', 'Cheaper'), value: 'price-low-high' },
    { label: t('category.sort_price_high', 'Expensive'), value: 'price-high-low' }
  ];

  return (
    <div className="w-full bg-stone-50/50 min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Category Hero Banner with Rich Photography & Specs */}
        <CategoryHeroBanner
          category={currentCategoryObj}
          categorySlug={selectedCategory}
          brand={currentBrandObj}
          brandSlug={selectedBrand}
          subcategories={selectedCategory ? subcategoryList : []}
          selectedSubcategory={selectedSubcategory}
          onSelectSubcategory={(sub) => setSelectedSubcategory(sub)}
          productCount={totalCount}
          onNavigate={onNavigate}
          onResetCategory={() => {
            setSelectedCategory('');
            setSelectedBrand('');
            setSelectedSubcategory('');
            setSearchQuery('');
            onNavigate('/shop');
          }}
        />

        {/* 1. Inside Category: Brand Badges Ribbon (Matching Homepage Badges) */}
        <CategoryBrandBadges
          categorySlug={selectedCategory}
          categoryName={currentCategoryObj?.name || 'Category'}
          selectedBrand={selectedBrand}
          onSelectBrand={(brandSlug) => setSelectedBrand(brandSlug)}
        />

        {/* Sorting & Filter Trigger Bar - Matching Authentic World Hookah Market */}
        <div className="mb-6 bg-white border border-stone-200/90 rounded-sm p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs">
          {/* Quick Sort Pills & Live Count */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-1 hidden sm:inline whitespace-nowrap">
                {t('category.sort_by', 'Sort:')}
              </span>
              {sortButtons.map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setSortBy(btn.value)}
                  className={`text-xs px-3 py-1.5 rounded-xs transition-colors whitespace-nowrap uppercase tracking-wider font-semibold cursor-pointer ${
                    sortBy === btn.value
                      ? 'bg-stone-900 text-white shadow-2xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="hidden sm:inline-flex items-center gap-1 text-xs text-stone-500 font-medium px-2.5 py-1 bg-stone-50 rounded-xs border border-stone-200/80">
              <span>Showing</span>
              <span className="font-bold text-stone-900 font-mono">
                {totalCount > 0 ? ((currentPage - 1) * itemsPerPage + 1).toLocaleString() : 0}–{Math.min(currentPage * itemsPerPage, totalCount).toLocaleString()}
              </span>
              <span>of</span>
              <span className="font-bold text-amber-900 font-mono">{totalCount.toLocaleString()}</span>
              <span>products</span>
            </div>
          </div>

          {/* Right Controls: Filter Trigger & Grid Toggles */}
          <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-100">
            {/* Mobile Filter Toggle */}
            <button
              id="mobile-filters-trigger"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 bg-stone-900 text-white text-xs font-semibold px-4 py-2 rounded-xs shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{t('common.apply_filters', 'Filters')} {hasActiveFilters && '(Active)'}</span>
            </button>

            {/* Grid Density Switcher (3* or 4* Columns) */}
            <div className="flex items-center gap-1 border border-stone-200 rounded-xs p-1 bg-stone-50">
              <span className="text-[10px] uppercase font-bold text-stone-400 px-1.5 hidden md:inline">Grid:</span>
              <button
                id="grid-3-col-btn"
                onClick={() => setGridColumns(3)}
                className={`flex items-center gap-1 px-2 py-1 rounded-2xs text-xs font-bold transition-all cursor-pointer ${
                  gridColumns === 3
                    ? 'bg-white shadow-2xs text-amber-900 border border-amber-800/30'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                title="3 Columns Grid (3*)"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>3×</span>
              </button>
              <button
                id="grid-4-col-btn"
                onClick={() => setGridColumns(4)}
                className={`flex items-center gap-1 px-2 py-1 rounded-2xs text-xs font-bold transition-all cursor-pointer ${
                  gridColumns === 4
                    ? 'bg-white shadow-2xs text-amber-900 border border-amber-800/30'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                title="4 Columns Dense Grid (4*)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>4×</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-amber-50/70 border border-amber-200/80 rounded-sm text-xs">
            <span className="font-semibold text-amber-900">{t('category.active_filters', 'Active Filters:')}</span>
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 bg-white border border-amber-300 text-stone-800 px-2.5 py-1 rounded-xs font-medium">
                {t('category.filter_category', 'Category')}: {currentCategoryObj?.name || selectedCategory}
                <button onClick={() => setSelectedCategory('')} className="hover:text-rose-600"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedSubcategory && (
              <span className="inline-flex items-center gap-1 bg-white border border-amber-300 text-stone-800 px-2.5 py-1 rounded-xs font-medium">
                Sub: {selectedSubcategory}
                <button onClick={() => setSelectedSubcategory('')} className="hover:text-rose-600"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedBrand && (
              <span className="inline-flex items-center gap-1 bg-white border border-amber-300 text-stone-800 px-2.5 py-1 rounded-xs font-medium">
                {t('category.filter_brand', 'Brand')}: {currentBrandObj?.name || selectedBrand}
                <button onClick={() => setSelectedBrand('')} className="hover:text-rose-600"><X className="w-3 h-3" /></button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-white border border-amber-300 text-stone-800 px-2.5 py-1 rounded-xs font-medium">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-rose-600"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedFlavor && (
              <span className="inline-flex items-center gap-1 bg-white border border-amber-300 text-stone-800 px-2.5 py-1 rounded-xs font-medium">
                Flavor: {selectedFlavor}
                <button onClick={() => setSelectedFlavor('')} className="hover:text-rose-600"><X className="w-3 h-3" /></button>
              </span>
            )}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1 bg-white border border-amber-300 text-stone-800 px-2.5 py-1 rounded-xs font-medium">
                {t('category.filter_in_stock', 'In Stock Only')}
                <button onClick={() => setInStockOnly(false)} className="hover:text-rose-600"><X className="w-3 h-3" /></button>
              </span>
            )}
            {onSaleOnly && (
              <span className="inline-flex items-center gap-1 bg-white border border-amber-300 text-stone-800 px-2.5 py-1 rounded-xs font-medium">
                {t('category.filter_on_sale', 'On Sale Only')}
                <button onClick={() => setOnSaleOnly(false)} className="hover:text-rose-600"><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-amber-900 font-bold hover:underline flex items-center gap-1 ml-auto cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('common.clear_all', 'Clear All')}</span>
            </button>
          </div>
        )}

        {/* Catalog Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Filters Sidebar (Desktop & Mobile Drawer) */}
          <aside
            id="filters-sidebar"
            className={`lg:col-span-3 bg-white border border-stone-200/90 rounded-sm p-5 shadow-2xs space-y-6 ${
              mobileFilterOpen ? 'fixed inset-0 z-50 overflow-y-auto m-0 rounded-none' : 'hidden lg:block'
            }`}
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-900" />
                <h3 className="font-serif text-sm font-bold text-stone-900 uppercase tracking-wider">
                  {t('common.apply_filters', 'Refine Selection')}
                </h3>
              </div>
              {mobileFilterOpen && (
                <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-stone-500">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2.5">
                {t('category.filter_category', 'Category')}
              </h4>
              <div className="space-y-1 text-xs text-stone-700">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left py-1.5 px-2 rounded-xs transition-colors flex justify-between items-center ${
                    selectedCategory === '' ? 'bg-amber-100 text-amber-900 font-bold' : 'hover:bg-stone-100'
                  }`}
                >
                  <span>{t('category.all_categories', 'All Categories')}</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug === selectedCategory ? '' : cat.slug)}
                    className={`w-full text-left py-1.5 px-2 rounded-xs transition-colors flex justify-between items-center ${
                      selectedCategory === cat.slug ? 'bg-amber-100 text-amber-900 font-bold' : 'hover:bg-stone-100'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-stone-400">{cat.productCount}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="border-t border-stone-200 pt-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2.5">
                {t('category.filter_brand', 'Brand House')}
              </h4>
              <div className="space-y-1.5 text-xs text-stone-700 max-h-52 overflow-y-auto pr-1">
                {brands.map((b) => (
                  <label
                    key={b.id}
                    className="flex items-center gap-2 cursor-pointer py-1 px-1 rounded-xs hover:bg-stone-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrand === b.slug}
                      onChange={() => setSelectedBrand(selectedBrand === b.slug ? '' : b.slug)}
                      className="rounded-xs text-amber-900 focus:ring-amber-800"
                    />
                    <span className="font-medium text-stone-800">{b.name}</span>
                    <span className="text-[10px] text-stone-400 ml-auto">{b.origin?.split(',')[0]}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="border-t border-stone-200 pt-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2.5">
                {t('category.filter_price_range', 'Price Range (USD)')}
              </h4>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2 text-stone-400 text-xs">$</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 text-xs pl-6 pr-2 py-1.5 rounded-xs"
                  />
                </div>
                <span className="text-stone-400">-</span>
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2 text-stone-400 text-xs">$</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 text-xs pl-6 pr-2 py-1.5 rounded-xs"
                  />
                </div>
              </div>
            </div>

            {/* Flavor Profile Filter */}
            <div className="border-t border-stone-200 pt-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2.5">
                {t('category.filter_flavor', 'Flavor Profiles')}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {flavorOptions.map((flavor) => (
                  <button
                    key={flavor}
                    onClick={() => setSelectedFlavor(selectedFlavor === flavor ? '' : flavor)}
                    className={`text-[11px] px-2.5 py-1 rounded-xs border transition-colors cursor-pointer ${
                      selectedFlavor === flavor
                        ? 'bg-amber-900 text-white border-amber-900 font-semibold'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    {flavor}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability & Sale Toggles */}
            <div className="border-t border-stone-200 pt-5 space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded-xs text-amber-900 focus:ring-amber-800"
                />
                <span className="text-stone-800 font-medium">{t('category.filter_in_stock', 'In Stock Only')}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onSaleOnly}
                  onChange={(e) => setOnSaleOnly(e.target.checked)}
                  className="rounded-xs text-amber-900 focus:ring-amber-800"
                />
                <span className="text-stone-800 font-medium">{t('category.filter_on_sale', 'On Sale Only')}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newArrivalOnly}
                  onChange={(e) => setNewArrivalOnly(e.target.checked)}
                  className="rounded-xs text-amber-900 focus:ring-amber-800"
                />
                <span className="text-stone-800 font-medium">{t('category.filter_new_arrivals', 'New Reserve Drops')}</span>
              </label>
            </div>

            {mobileFilterOpen && (
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-stone-900 text-white py-3 font-semibold text-xs rounded-xs uppercase tracking-wider"
              >
                {t('common.apply_filters', 'Apply Filters & View Results')}
              </button>
            )}
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-9">
            {loading ? (
              <div className={`grid grid-cols-2 sm:grid-cols-3 ${gridColumns === 4 ? 'lg:grid-cols-4 xl:grid-cols-4' : 'lg:grid-cols-3 xl:grid-cols-3'} gap-3 sm:gap-4 md:gap-5`}>
                {[...Array(gridColumns === 4 ? 8 : 6)].map((_, i) => (
                  <div key={i} className="bg-white border border-stone-200 rounded-sm p-3.5 animate-pulse aspect-3/4 flex flex-col justify-between shadow-2xs">
                    <div className="bg-stone-200 aspect-square rounded-xs mb-3" />
                    <div className="space-y-2">
                      <div className="h-3.5 bg-stone-200 rounded-xs w-3/4" />
                      <div className="h-3 bg-stone-200 rounded-xs w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-sm p-12 text-center space-y-4 shadow-2xs">
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {t('category.no_products_title', 'No Matching Items Located')}
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {t('category.no_products_desc', 'We could not find any items matching your criteria. Try adjusting or clearing filters.')}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold px-6 py-2.5 rounded-xs transition-colors cursor-pointer"
                >
                  {t('category.reset_filters', 'Reset All Filters')}
                </button>
              </div>
            ) : (
              <div>
                <div className={`grid grid-cols-2 sm:grid-cols-3 ${gridColumns === 4 ? 'lg:grid-cols-4 xl:grid-cols-4' : 'lg:grid-cols-3 xl:grid-cols-3'} gap-3 sm:gap-4 md:gap-5`}>
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onNavigate={(slug) => onNavigate(`/product/${slug}`)}
                    />
                  ))}
                </div>

                {/* Dynamic Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-stone-200">
                    <p className="text-xs text-stone-500 font-medium">
                      Showing <span className="font-bold text-stone-900 font-mono">{((currentPage - 1) * itemsPerPage + 1).toLocaleString()}</span> to <span className="font-bold text-stone-900 font-mono">{Math.min(currentPage * itemsPerPage, totalCount).toLocaleString()}</span> of <span className="font-bold text-stone-900 font-mono">{totalCount.toLocaleString()}</span> products
                    </p>

                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <button
                        onClick={() => {
                          if (currentPage > 1) {
                            setCurrentPage(p => p - 1);
                            window.scrollTo({ top: 350, behavior: 'smooth' });
                          }
                        }}
                        disabled={currentPage === 1}
                        className={`px-3 h-8.5 rounded-xs border flex items-center justify-center gap-1 transition-colors ${
                          currentPage === 1
                            ? 'border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed'
                            : 'border-stone-300 bg-white hover:bg-stone-50 text-stone-700 cursor-pointer shadow-2xs'
                        }`}
                        title="Previous Page"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Prev</span>
                      </button>

                      {/* Dynamic Page Buttons */}
                      {getPageNumbers(currentPage, totalPages).map((pNum, idx) => {
                        if (typeof pNum === 'string') {
                          return (
                            <span key={`dots-${idx}`} className="px-1.5 text-stone-400 font-bold select-none">
                              ...
                            </span>
                          );
                        }
                        const isCurrent = pNum === currentPage;
                        return (
                          <button
                            key={pNum}
                            onClick={() => {
                              setCurrentPage(pNum);
                              window.scrollTo({ top: 350, behavior: 'smooth' });
                            }}
                            className={`min-w-[34px] h-8.5 px-2 rounded-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                              isCurrent
                                ? 'border border-amber-800 bg-amber-900 text-white shadow-xs'
                                : 'border border-stone-200 bg-white hover:bg-stone-100 text-stone-700'
                            }`}
                          >
                            {pNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => {
                          if (currentPage < totalPages) {
                            setCurrentPage(p => p + 1);
                            window.scrollTo({ top: 350, behavior: 'smooth' });
                          }
                        }}
                        disabled={currentPage >= totalPages}
                        className={`px-3 h-8.5 rounded-xs border flex items-center justify-center gap-1 transition-colors ${
                          currentPage >= totalPages
                            ? 'border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed'
                            : 'border-stone-300 bg-white hover:bg-stone-50 text-stone-700 cursor-pointer shadow-2xs'
                        }`}
                        title="Next Page"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}


          </main>

        </div>
      </div>
    </div>
  );
};
