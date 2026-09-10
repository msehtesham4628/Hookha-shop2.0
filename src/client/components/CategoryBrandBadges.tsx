import React, { useRef } from 'react';
import { CATEGORY_BRAND_MAP, ALL_BRAND_BADGES, BrandAvatar } from '../data/brandsData.js';
import { getBrandUrl } from '../utils/routeHelpers.js';
import { ChevronLeft, ChevronRight, Check, ExternalLink } from 'lucide-react';

interface CategoryBrandBadgesProps {
  categorySlug?: string;
  categoryName?: string;
  selectedBrand?: string;
  onSelectBrand: (brandSlug: string) => void;
  onNavigate?: (path: string) => void;
}

export const CategoryBrandBadges: React.FC<CategoryBrandBadgesProps> = ({
  categorySlug = '',
  categoryName = 'Category',
  selectedBrand = '',
  onSelectBrand,
  onNavigate
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const brands: BrandAvatar[] = categorySlug && CATEGORY_BRAND_MAP[categorySlug]
    ? CATEGORY_BRAND_MAP[categorySlug]
    : ALL_BRAND_BADGES;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (!brands || brands.length === 0) return null;

  return (
    <div className="mb-6 bg-white border border-stone-200/90 rounded-xl p-4 sm:p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-900">
            Top {categoryName} Brands
          </h3>
          <span className="text-[11px] font-semibold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
            {brands.length} Verified
          </span>
          {onNavigate && (
            <button
              onClick={() => onNavigate('/brands')}
              className="text-[11px] font-semibold text-stone-500 hover:text-amber-900 hover:underline cursor-pointer ml-2"
            >
              Directory →
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedBrand && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onSelectBrand('')}
                className="text-[11px] font-bold text-cyan-700 hover:text-cyan-900 bg-cyan-50 hover:bg-cyan-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
              {onNavigate && (
                <button
                  onClick={() => onNavigate(getBrandUrl(selectedBrand, categorySlug))}
                  className="text-[11px] font-bold text-amber-900 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Brand Page</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="w-7 h-7 rounded-full border border-stone-200 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors cursor-pointer shadow-2xs"
              title="Scroll left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-7 h-7 rounded-full border border-stone-200 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors cursor-pointer shadow-2xs"
              title="Scroll right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Brand Badges Track (Same circular design as HomePage) */}
      <div
        ref={scrollRef}
        className="flex items-center gap-5 sm:gap-7 overflow-x-auto pb-2 pt-1 scroll-smooth scrollbar-none"
      >
        {/* All Brands Pill / Badge Option */}
        <div
          onClick={() => onSelectBrand('')}
          className="flex flex-col items-center gap-2 cursor-pointer group select-none shrink-0"
        >
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center transition-transform duration-300 group-hover:scale-108 shadow-xs border ${
              !selectedBrand
                ? 'bg-stone-900 text-white border-stone-900 ring-2 ring-cyan-600/50'
                : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-white'
            }`}
          >
            <span className="font-black text-[10px] sm:text-[11px] tracking-tight text-center px-1 leading-none uppercase">
              ALL
            </span>
            <span className="text-[8px] opacity-80 mt-0.5">BRANDS</span>
          </div>
          <span className={`text-[11px] sm:text-xs font-semibold transition-colors text-center max-w-[85px] truncate ${
            !selectedBrand ? 'text-cyan-800 font-bold' : 'text-stone-600 group-hover:text-stone-900'
          }`}>
            All
          </span>
        </div>

        {brands.map((brand, bIdx) => {
          const isSelected = selectedBrand === brand.slug;
          return (
            <div
              key={`${brand.slug || brand.name}-${bIdx}`}
              onClick={() => onSelectBrand(isSelected ? '' : brand.slug)}
              className="flex flex-col items-center gap-2 cursor-pointer group select-none shrink-0 relative"
            >
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-108 shadow-xs relative ${
                  brand.bgClass
                } ${brand.textColor} ${brand.borderClass || ''} ${
                  isSelected ? 'ring-3 ring-cyan-500 scale-105 shadow-md' : ''
                }`}
              >
                <span className="font-black text-[11px] sm:text-xs tracking-tight text-center px-1 leading-none">
                  {brand.badgeText}
                </span>

                {isSelected && (
                  <div className="absolute -top-1 -right-1 bg-cyan-600 text-white rounded-full p-0.5 shadow-sm">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>

              <span className={`text-[11px] sm:text-xs font-semibold transition-colors text-center max-w-[90px] line-clamp-2 leading-tight ${
                isSelected ? 'text-cyan-800 font-bold' : 'text-stone-700 group-hover:text-cyan-700'
              }`}>
                {brand.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
