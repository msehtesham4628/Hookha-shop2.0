import React from 'react';
import { Brand } from '../../types/index.js';
import { useTranslation } from '../i18n/LanguageContext.js';
import { Sparkles, ArrowRight, Check } from 'lucide-react';

interface CategoryBrandGridProps {
  categorySlug: string;
  categoryName: string;
  brands: Brand[];
  selectedBrand: string;
  onSelectBrand: (brandSlug: string) => void;
}

// Map brands to realistic category counts & logo icons
const BRAND_METRICS: Record<string, { logoIcon: string; countryCode: string }> = {
  // Tobacco
  'musthave-tobacco': { logoIcon: '🍓', countryCode: 'RU' },
  'darkside-tobacco': { logoIcon: '🌑', countryCode: 'RU' },
  'blackburn-tobacco': { logoIcon: '🔥', countryCode: 'RU' },
  'bonche-tobacco': { logoIcon: '🍂', countryCode: 'RU' },
  'tangiers': { logoIcon: '👑', countryCode: 'US' },
  'adalya-tobacco': { logoIcon: '🍇', countryCode: 'TR' },
  'serbetli-tobacco': { logoIcon: '🍯', countryCode: 'TR' },
  'banger-tobacco': { logoIcon: '💥', countryCode: 'RU' },
  'element-tobacco': { logoIcon: '💧', countryCode: 'RU' },
  'russian-hookah-tobacco': { logoIcon: '🇷🇺', countryCode: 'RU' },

  // Hookahs
  'alpha-hookah': { logoIcon: '⚡', countryCode: 'RU' },
  'el-bomber': { logoIcon: '⚔️', countryCode: 'RU' },
  'mattpear': { logoIcon: '🍐', countryCode: 'RU' },
  'maklaud-hookah': { logoIcon: '🐲', countryCode: 'RU' },
  'wookah': { logoIcon: '🪵', countryCode: 'PL' },
  'japona-hookah': { logoIcon: '⛩️', countryCode: 'RU' },
  'steamulation-hookah': { logoIcon: '⚙️', countryCode: 'DE' },

  // Bowls
  'oblako-bowls': { logoIcon: '☁️', countryCode: 'RU' },
  'kong-bowls': { logoIcon: '🦍', countryCode: 'RU' },
  'alpaca-bowls': { logoIcon: '🦙', countryCode: 'US' },
  'solaris-bowls': { logoIcon: '🪐', countryCode: 'UA' },
  'target-bowls': { logoIcon: '🎯', countryCode: 'RU' },

  // Bases
  'caesar-crystal': { logoIcon: '💎', countryCode: 'CZ' },
  'craft-glass': { logoIcon: '🏺', countryCode: 'RU' },

  // Coal
  'coco-loco': { logoIcon: '🥥', countryCode: 'ID' },
  'one-nation': { logoIcon: '🇩🇪', countryCode: 'DE' },
  'oasis-charcoal': { logoIcon: '🌴', countryCode: 'ID' },

  // Accessories
  'kaloud': { logoIcon: '👑', countryCode: 'US' },
  'na-grani': { logoIcon: '🛡️', countryCode: 'RU' },
  'blade-hookah': { logoIcon: '🗡️', countryCode: 'RU' },

  // E-Hookah
  'ooka': { logoIcon: '🔋', countryCode: 'AE' },
  'aspire-proteus': { logoIcon: '💨', countryCode: 'CN' },

  // Vapes
  'geekvape': { logoIcon: '⚡', countryCode: 'GL' },
  'vaporesso': { logoIcon: '✨', countryCode: 'GL' },
  'lost-mary': { logoIcon: '🍬', countryCode: 'GL' },
  'elf-bar': { logoIcon: '🫐', countryCode: 'GL' },
  'smok': { logoIcon: '🔥', countryCode: 'GL' }
};

export const CategoryBrandGrid: React.FC<CategoryBrandGridProps> = ({
  categorySlug,
  categoryName,
  brands,
  selectedBrand,
  onSelectBrand
}) => {
  const { t } = useTranslation();

  // Filter relevant brands based on category
  const relevantBrands = brands.filter(b => {
    if (categorySlug === 'tobacco') {
      return (
        b.slug.includes('tobacco') ||
        ['musthave-tobacco', 'darkside-tobacco', 'blackburn-tobacco', 'bonche-tobacco', 'tangiers', 'adalya-tobacco', 'serbetli-tobacco', 'banger-tobacco', 'element-tobacco', 'russian-hookah-tobacco'].includes(b.slug)
      );
    }
    if (categorySlug === 'hookahs') {
      return ['alpha-hookah', 'el-bomber', 'mattpear', 'maklaud-hookah', 'wookah', 'japona-hookah', 'steamulation-hookah'].includes(b.slug);
    }
    if (categorySlug === 'bowls') {
      return ['oblako-bowls', 'kong-bowls', 'alpaca-bowls', 'solaris-bowls', 'target-bowls', 'japona-hookah'].includes(b.slug);
    }
    if (categorySlug === 'bases') {
      return ['caesar-crystal', 'craft-glass', 'wookah'].includes(b.slug);
    }
    if (categorySlug === 'coal') {
      return ['coco-loco', 'one-nation', 'oasis-charcoal'].includes(b.slug);
    }
    if (categorySlug === 'accessories') {
      return ['kaloud', 'na-grani', 'blade-hookah', 'alpha-hookah'].includes(b.slug);
    }
    if (categorySlug === 'e-hookah') {
      return ['ooka', 'aspire-proteus'].includes(b.slug);
    }
    if (categorySlug === 'vapes') {
      return ['geekvape', 'vaporesso', 'lost-mary', 'elf-bar', 'smok'].includes(b.slug);
    }
    return true;
  });

  const displayBrands = relevantBrands.length > 0 ? relevantBrands : brands.slice(0, 12);

  return (
    <div className="mb-8 bg-white border border-stone-200/90 rounded-sm p-4 sm:p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-800" />
          <h3 className="font-serif text-sm sm:text-base font-bold text-stone-900 tracking-wide uppercase">
            {t('category.explore_brands', `Featured ${categoryName || 'Category'} Brands`)}
          </h3>
        </div>
        {selectedBrand && (
          <button
            onClick={() => onSelectBrand('')}
            className="text-xs text-amber-900 font-semibold hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Show All {categoryName} Brands</span>
          </button>
        )}
      </div>

      {/* Brand Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {displayBrands.map((brand) => {
          const isSelected = selectedBrand === brand.slug;
          const meta = BRAND_METRICS[brand.slug] || { logoIcon: '🏷️', countryCode: brand.origin?.includes('Russia') ? 'RU' : 'US' };

          return (
            <button
              key={brand.id}
              onClick={() => onSelectBrand(isSelected ? '' : brand.slug)}
              className={`group relative flex flex-col items-center text-center p-3 rounded-sm border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-amber-50/90 border-amber-800 ring-1 ring-amber-800 shadow-xs'
                  : 'bg-stone-50/70 hover:bg-white hover:border-amber-700/60 border-stone-200 shadow-2xs'
              }`}
            >
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 bg-amber-800 text-white rounded-full p-0.5">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}

              {/* Brand Avatar/Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-2 transition-transform duration-200 group-hover:scale-105 ${
                isSelected ? 'bg-amber-900 text-white shadow-xs' : 'bg-white border border-stone-200 shadow-2xs'
              }`}>
                {meta.logoIcon}
              </div>

              {/* Brand Name */}
              <span className={`text-xs font-semibold leading-tight line-clamp-1 ${
                isSelected ? 'text-amber-950 font-bold' : 'text-stone-800 group-hover:text-amber-900'
              }`}>
                {brand.name}
              </span>

              {/* Origin & Count */}
              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-stone-500">
                <span className="font-mono uppercase font-bold text-stone-400 bg-stone-200/80 px-1 py-0.2 rounded-2xs">
                  {meta.countryCode}
                </span>
                <span>•</span>
                <span className="font-medium text-stone-600">
                  {brand.productCount || 8} items
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
