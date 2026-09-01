import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { ProductCard } from '../components/ProductCard.js';
import { Product, Category, Brand } from '../../types/index.js';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  RotateCcw,
  Search,
  Check
} from 'lucide-react';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || '');
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand || '');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch || '');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedFlavor, setSelectedFlavor] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(initialOnSale || false);
  const [newArrivalOnly, setNewArrivalOnly] = useState(initialNewArrival || false);
  const [sortBy, setSortBy] = useState<string>('popularity');
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
    if (initialCategory !== undefined) setSelectedCategory(initialCategory);
    if (initialBrand !== undefined) setSelectedBrand(initialBrand);
    if (initialSearch !== undefined) setSearchQuery(initialSearch);
    if (initialOnSale !== undefined) setOnSaleOnly(initialOnSale);
    if (initialNewArrival !== undefined) setNewArrivalOnly(initialNewArrival);
  }, [initialCategory, initialBrand, initialSearch, initialOnSale, initialNewArrival]);

  // Fetch filtered products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        category: selectedCategory || undefined,
        brand: selectedBrand || undefined,
        q: searchQuery || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        flavor: selectedFlavor || undefined,
        inStock: inStockOnly ? 'true' : undefined,
        onSale: onSaleOnly ? 'true' : undefined,
        newArrival: newArrivalOnly ? 'true' : undefined,
        sort: sortBy,
        limit: 48
      };

      const res = await api.getProducts(params);
      if (res.success && res.data) {
        setProducts(res.data.products);
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

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedFlavor('');
    setInStockOnly(false);
    setOnSaleOnly(false);
    setNewArrivalOnly(false);
    setSortBy('popularity');
  };

  const hasActiveFilters = !!(
    selectedCategory ||
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

  return (
    <div className="w-full bg-stone-50/50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header & Breadcrumb */}
        <div className="mb-6 pb-4 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase font-bold tracking-widest text-amber-800 mb-1">
              Haute Shisha Collection
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              {selectedCategory
                ? categories.find(c => c.slug === selectedCategory)?.name || 'Curated Catalog'
                : selectedBrand
                ? `${brands.find(b => b.slug === selectedBrand)?.name} Collection`
                : 'All Masterpieces & Tobacco'}
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Displaying {products.length} verified authentic items
            </p>
          </div>

          {/* Controls: Mobile Filter Toggle & Desktop Sort */}
          <div className="flex items-center gap-3">
            <button
              id="mobile-filters-trigger"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 bg-white border border-stone-300 text-stone-800 text-xs font-semibold px-4 py-2.5 rounded-xs shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-stone-600" />
              <span>Filters {hasActiveFilters && '(Active)'}</span>
            </button>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 bg-white border border-stone-300 px-3 py-2 rounded-xs shadow-xs text-xs">
              <span className="text-stone-500 font-medium whitespace-nowrap">Sort By:</span>
              <select
                id="catalog-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-stone-900 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="popularity">Most Popular</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="newest">Newest Vault Drops</option>
                <option value="rating">Highest Rated (5★)</option>
                <option value="best-selling">Best Sellers</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-amber-50/60 border border-amber-200/80 rounded-xs text-xs">
            <span className="font-semibold text-amber-900">Active Filters:</span>
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 bg-white border border-amber-300 text-stone-800 px-2.5 py-1 rounded-xs font-medium">
                Category: {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                <button onClick={() => setSelectedCategory('')} className="hover:text-rose-600"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedBrand && (
              <span className="inline-flex items-center gap-1 bg-white border border-amber-300 text-stone-800 px-2.5 py-1 rounded-xs font-medium">
                Brand: {brands.find(b => b.slug === selectedBrand)?.name || selectedBrand}
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
                In Stock Only
                <button onClick={() => setInStockOnly(false)} className="hover:text-rose-600"><X className="w-3 h-3" /></button>
              </span>
            )}
            {onSaleOnly && (
              <span className="inline-flex items-center gap-1 bg-white border border-amber-300 text-stone-800 px-2.5 py-1 rounded-xs font-medium">
                Vault Sale Only
                <button onClick={() => setOnSaleOnly(false)} className="hover:text-rose-600"><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-amber-900 font-bold hover:underline flex items-center gap-1 ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          </div>
        )}

        {/* Catalog Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Filters Sidebar (Desktop & Mobile Drawer) */}
          <aside
            id="filters-sidebar"
            className={`lg:col-span-3 bg-white border border-stone-200 rounded-xs p-5 shadow-xs space-y-6 ${
              mobileFilterOpen ? 'fixed inset-0 z-50 overflow-y-auto m-0 rounded-none' : 'hidden lg:block'
            }`}
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-900" />
                <h3 className="font-serif text-sm font-bold text-stone-900 uppercase tracking-wider">Refine Selection</h3>
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
                Category
              </h4>
              <div className="space-y-1.5 text-xs text-stone-700">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left py-1 px-2 rounded-xs transition-colors flex justify-between items-center ${
                    selectedCategory === '' ? 'bg-amber-100 text-amber-900 font-bold' : 'hover:bg-stone-100'
                  }`}
                >
                  <span>All Categories</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug === selectedCategory ? '' : cat.slug)}
                    className={`w-full text-left py-1 px-2 rounded-xs transition-colors flex justify-between items-center ${
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
                Artisan Brand House
              </h4>
              <div className="space-y-1.5 text-xs text-stone-700 max-h-48 overflow-y-auto pr-1">
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
                    <span className="text-[10px] text-stone-400 ml-auto">{b.origin}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="border-t border-stone-200 pt-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2.5">
                Price Range (USD)
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
                Flavor Profiles
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {flavorOptions.map((flavor) => (
                  <button
                    key={flavor}
                    onClick={() => setSelectedFlavor(selectedFlavor === flavor ? '' : flavor)}
                    className={`text-[11px] px-2.5 py-1 rounded-xs border transition-colors ${
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
                <span className="text-stone-800 font-medium">In Stock Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onSaleOnly}
                  onChange={(e) => setOnSaleOnly(e.target.checked)}
                  className="rounded-xs text-amber-900 focus:ring-amber-800"
                />
                <span className="text-stone-800 font-medium">Private Vault Sale Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newArrivalOnly}
                  onChange={(e) => setNewArrivalOnly(e.target.checked)}
                  className="rounded-xs text-amber-900 focus:ring-amber-800"
                />
                <span className="text-stone-800 font-medium">New Reserve Drops</span>
              </label>
            </div>

            {mobileFilterOpen && (
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-stone-900 text-white py-3 font-semibold text-xs rounded-xs uppercase tracking-wider"
              >
                Apply Filters & View Results
              </button>
            )}
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white border border-stone-200 rounded-xs p-4 animate-pulse aspect-3/4 flex flex-col justify-between">
                    <div className="bg-stone-200 aspect-square rounded-xs mb-4" />
                    <div className="space-y-2">
                      <div className="h-4 bg-stone-200 rounded-xs w-3/4" />
                      <div className="h-3 bg-stone-200 rounded-xs w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-xs p-12 text-center space-y-4 shadow-xs">
                <h3 className="font-serif text-lg font-bold text-stone-900">No Matching Artifacts Located</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  We could not find any items matching your selected criteria. Try removing some filters or search terms.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold px-6 py-2.5 rounded-xs transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onNavigate={(slug) => onNavigate(`/product/${slug}`)}
                  />
                ))}
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
};
