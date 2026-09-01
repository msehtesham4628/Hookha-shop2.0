import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext.js';
import { useStore } from '../store/useStore.js';
import { Sparkles, ShoppingBag, Plus, RefreshCw, Check, Flame, ChevronRight } from 'lucide-react';

interface SignatureMix {
  name: string;
  tagline: string;
  strength: 'Light' | 'Medium' | 'Heavy Dark Leaf';
  ingredients: {
    brand: string;
    flavor: string;
    ratio: number;
    productId: string;
    price: number;
  }[];
}

const SIGNATURE_MIXES: SignatureMix[] = [
  {
    name: 'Russian Berry Frost',
    tagline: 'Hyper-sweet strawberry raspberry punch with Siberian cold exhale',
    strength: 'Heavy Dark Leaf',
    ingredients: [
      { brand: 'MustHave', flavor: 'Pinkman (Raspberry Grapefruit)', ratio: 40, productId: 'prod-mh-pinkman', price: 23.99 },
      { brand: 'DarkSide', flavor: 'Ice Granny (Cold Apple)', ratio: 30, productId: 'prod-ds-icegranny', price: 24.99 },
      { brand: 'BlackBurn', flavor: 'Lemon Sweets', ratio: 30, productId: 'prod-bb-lemon', price: 22.99 }
    ]
  },
  {
    name: 'Cigar Lounge & Spiced Chai',
    tagline: 'Woody Dominican cigar filler accented with cardamom and black tea',
    strength: 'Heavy Dark Leaf',
    ingredients: [
      { brand: 'Bonche', flavor: 'Cuban Cigar Leaf', ratio: 50, productId: 'prod-bonche-cigar', price: 34.99 },
      { brand: 'DarkSide', flavor: 'Spiced Tea', ratio: 30, productId: 'prod-ds-spicedtea', price: 24.99 },
      { brand: 'Tangiers', flavor: 'Cane Mint Noir', ratio: 20, productId: 'prod-tang-cane', price: 25.99 }
    ]
  },
  {
    name: 'Citrus Sunburst & Mango',
    tagline: 'Juicy tropical mango blended with candied orange and cooling menthol',
    strength: 'Medium',
    ingredients: [
      { brand: 'MustHave', flavor: 'Mango Sling', ratio: 50, productId: 'prod-mh-mango', price: 23.99 },
      { brand: 'DarkSide', flavor: 'Supernova', ratio: 20, productId: 'prod-ds-supernova', price: 24.99 },
      { brand: 'BlackBurn', flavor: 'Green Tea Melon', ratio: 30, productId: 'prod-bb-melon', price: 22.99 }
    ]
  }
];

export const CategoryMixologyWidget: React.FC = () => {
  const { t } = useTranslation();
  const { addToCart, showToast } = useStore();
  const [selectedMixIndex, setSelectedMixIndex] = useState(0);
  const [isAddingAll, setIsAddingAll] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const activeMix = SIGNATURE_MIXES[selectedMixIndex];
  const totalPrice = activeMix.ingredients.reduce((sum, item) => sum + item.price, 0);

  const handleAddAllToCart = async () => {
    setIsAddingAll(true);
    try {
      for (const item of activeMix.ingredients) {
        await addToCart(item.productId, 1, item.flavor);
      }
      setAddedSuccess(true);
      showToast(`Added entire "${activeMix.name}" mix pack to your bag!`, 'success');
      setTimeout(() => setAddedSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      showToast('Could not add all items. Please try individually.', 'error');
    } finally {
      setIsAddingAll(false);
    }
  };

  return (
    <div className="mb-8 bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950 text-white rounded-sm p-5 sm:p-6 border border-stone-800 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-xs mb-1.5">
            <Sparkles className="w-3 h-3" />
            <span>{t('category.mixology_title', 'Shisha Mixology Lab')}</span>
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold tracking-wide text-white">
            {t('mixology.recommended_mixes', 'Lounge Master Signature Mixes')}
          </h3>
          <p className="text-xs text-stone-300 mt-1 max-w-xl">
            {t('category.mixology_subtitle', 'Curated flavor blends with exact bowl ratios. Add all ingredients to your bag in one click.')}
          </p>
        </div>

        {/* Mix Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {SIGNATURE_MIXES.map((mix, idx) => (
            <button
              key={mix.name}
              onClick={() => setSelectedMixIndex(idx)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xs transition-colors whitespace-nowrap cursor-pointer ${
                selectedMixIndex === idx
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
              }`}
            >
              {mix.name}
            </button>
          ))}
        </div>
      </div>

      {/* Active Mix Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5 items-center">
        {/* Ingredients & Ratios */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">
              {activeMix.tagline}
            </span>
            <span className="inline-flex items-center gap-1 bg-stone-800 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-xs border border-amber-500/30">
              <Flame className="w-3 h-3 text-amber-400" />
              {activeMix.strength}
            </span>
          </div>

          <div className="space-y-2">
            {activeMix.ingredients.map((item, i) => (
              <div
                key={i}
                className="bg-stone-800/80 border border-stone-700/80 rounded-xs p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-900/60 border border-amber-600/40 flex items-center justify-center text-xs font-bold text-amber-300">
                    {item.ratio}%
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold font-mono">
                        {item.brand}
                      </span>
                      <span className="text-[10px] text-stone-400 font-medium">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-white">
                      {item.flavor}
                    </p>
                  </div>
                </div>

                {/* Ratio Bar */}
                <div className="w-full sm:w-36 bg-stone-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${item.ratio}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-4 bg-stone-800/90 border border-amber-500/30 rounded-xs p-4 flex flex-col justify-between h-full space-y-4">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-amber-400 mb-1">
              Bundle Summary
            </div>
            <h4 className="font-serif text-base font-bold text-white">
              {activeMix.name} Bundle
            </h4>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-serif text-amber-300">
                ${totalPrice.toFixed(2)}
              </span>
              <span className="text-xs text-stone-400">for 3 x 200g jars</span>
            </div>
            <p className="text-[11px] text-stone-300 mt-2 leading-relaxed">
              Provides approximately 30-35 premium lounge-grade bowl packings.
            </p>
          </div>

          <button
            onClick={handleAddAllToCart}
            disabled={isAddingAll}
            className={`w-full py-2.5 px-4 rounded-xs font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              addedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md hover:shadow-amber-500/20'
            }`}
          >
            {addedSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Added Complete Mix!</span>
              </>
            ) : isAddingAll ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Adding 3 Flavors...</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>{t('mixology.add_mix_to_cart', 'Add Complete Mix to Cart')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
