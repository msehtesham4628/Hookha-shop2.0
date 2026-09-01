import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore.js';
import { api } from '../services/api.js';
import { Product } from '../../types/index.js';
import { Search, X, ArrowRight, Star, Sparkles } from 'lucide-react';

interface SearchModalProps {
  onNavigate: (path: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ onNavigate }) => {
  const { isSearchOpen, setSearchOpen } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
      setSuggestions([]);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const res = await api.searchProducts(query);
        if (res.success && res.data) {
          setResults(res.data.results || []);
          setSuggestions(res.data.suggestions || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchOpen) return null;

  const handleSelectProduct = (slug: string) => {
    setSearchOpen(false);
    onNavigate(`/product/${slug}`);
  };

  const handleSelectCategory = (slug: string) => {
    setSearchOpen(false);
    onNavigate(`/shop?category=${slug}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchOpen(false);
    onNavigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="search-modal-container"
        className="mx-auto max-w-2xl transform divide-y divide-stone-200 overflow-hidden rounded-sm bg-white shadow-2xl transition-all border border-stone-200"
      >
        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="pointer-events-none absolute left-4 h-5 w-5 text-stone-400" />
          <input
            ref={inputRef}
            id="global-search-input"
            type="text"
            className="h-14 w-full border-0 bg-transparent pl-12 pr-12 text-sm text-stone-900 placeholder-stone-400 focus:outline-none"
            placeholder="Search hookahs, dark leaf tobacco, bowls, coconut coals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            className="absolute right-4 p-1 rounded-full text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </form>

        {/* Dynamic Search Results & Suggestions */}
        <div className="max-h-96 overflow-y-auto p-4">
          {query.trim() === '' ? (
            <div className="py-6 px-2 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-amber-600 mb-2" />
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-800">Popular Sultan Searches</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {['Wookah', 'Steamulation', 'Tangiers Cane Mint', 'Alpaca Bowl', 'Kaloud Lotus', 'CocoUrth Coals', 'Darkside Supernova'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="text-xs bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-700 px-3 py-1 rounded-xs transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 && !isLoading ? (
            <div className="py-10 text-center">
              <p className="text-sm font-semibold text-stone-900">No artifacts matching "{query}"</p>
              <p className="text-xs text-stone-500 mt-1">Try searching by brand (Wookah, Kaloud), flavor (Mint, Peach), or item type.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Category Suggestions */}
              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-2 border-b border-stone-100">
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectCategory(sug.slug)}
                      className="text-xs bg-amber-50 text-amber-900 px-2.5 py-1 rounded-xs hover:bg-amber-100 font-medium flex items-center gap-1"
                    >
                      <span>In {sug.name}</span>
                      <ArrowRight className="w-3 h-3 text-amber-700" />
                    </button>
                  ))}
                </div>
              )}

              {/* Product Matches */}
              <div className="space-y-2">
                {results.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product.slug)}
                    className="flex items-center gap-3 p-2 rounded-xs hover:bg-stone-50 cursor-pointer transition-colors group"
                  >
                    <div className="w-12 h-12 bg-stone-100 rounded-xs overflow-hidden shrink-0 flex items-center justify-center p-1 border border-stone-200">
                      <img
                        src={product.images[0]?.url || 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=100'}
                        alt={product.name}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-stone-900 truncate group-hover:text-amber-900">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                        <span className="font-medium text-amber-900/80">{product.brand}</span>
                        <span>•</span>
                        <span>{product.category}</span>
                        {product.flavor && <span>• <em className="italic">{product.flavor}</em></span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-stone-900 font-sans">
                        ${(product.salePrice || product.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {results.length > 0 && (
                <button
                  onClick={handleSearchSubmit}
                  className="w-full text-center text-xs text-amber-900 font-semibold py-2 hover:bg-amber-50 rounded-xs transition-colors block border-t border-stone-100"
                >
                  View all results for "{query}" →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
