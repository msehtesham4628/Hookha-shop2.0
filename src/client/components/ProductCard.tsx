import React, { useState } from 'react';
import { Product } from '../../types/index.js';
import { useStore } from '../store/useStore.js';
import { useTranslation } from '../i18n/LanguageContext.js';
import { Heart, Eye, ShoppingBag, Minus, Plus, Check, Flame, Star, Sparkles, ShieldCheck } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onNavigate?: (slug: string) => void;
  showBulkDiscount?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate, showBulkDiscount }) => {
  const { addToCart, wishlistIds, toggleWishlist, setQuickViewProduct } = useStore();
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isSaved = wishlistIds.includes(product.id);
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0] || { url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=600' };
  const secondaryImage = product.images.length > 1 ? (product.images.find(img => !img.isPrimary) || product.images[1]) : null;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const hasBulkDiscount = showBulkDiscount || product.tags?.includes('bulk-discount') || product.categorySlug === 'tobacco';

  // Calculate discount percentage if on sale
  const discountPercent = product.salePrice && product.price > product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : null;

  const savingsAmount = product.salePrice && product.price > product.salePrice
    ? (product.price - product.salePrice).toFixed(2)
    : null;

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity < (product.stock || 99)) {
      setQuantity(q => q + 1);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock || isAdding) return;
    setIsAdding(true);
    await addToCart(product.id, quantity);
    setIsAdding(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  const handleClick = () => {
    if (onNavigate) {
      onNavigate(product.slug);
    }
  };

  // Extract key spec or flavor chip
  const getProductPill = () => {
    if (product.flavor) {
      return {
        label: product.flavor,
        color: 'bg-amber-50/90 text-amber-900 border-amber-200/80',
        dot: 'bg-amber-500'
      };
    }
    if (product.categorySlug === 'hookahs' && product.material) {
      return {
        label: product.material,
        color: 'bg-cyan-50/90 text-cyan-900 border-cyan-200/80',
        dot: 'bg-cyan-500'
      };
    }
    if (product.categorySlug === 'bowls') {
      return {
        label: product.subcategory || 'Artisan Phunnel',
        color: 'bg-stone-100 text-stone-800 border-stone-200',
        dot: 'bg-stone-500'
      };
    }
    if (product.categorySlug === 'coal') {
      return {
        label: '100% Coconut • 26mm',
        color: 'bg-orange-50/90 text-orange-900 border-orange-200/80',
        dot: 'bg-orange-500'
      };
    }
    if (product.categorySlug === 'bases') {
      return {
        label: 'Bohemian Craft Crystal',
        color: 'bg-blue-50/90 text-blue-900 border-blue-200/80',
        dot: 'bg-blue-500'
      };
    }
    return null;
  };

  const productPill = getProductPill();
  const ratingValue = product.rating || 4.9;
  const reviewCount = product.reviewCount || 18;

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white border border-stone-200/90 hover:border-cyan-500/70 rounded-xl transition-all duration-300 flex flex-col cursor-pointer overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] hover:-translate-y-1 w-full"
    >
      {/* 1. Top Badges & Image Showcase */}
      <div className="relative aspect-square w-full bg-linear-to-b from-stone-50/80 via-white to-stone-50/40 overflow-hidden flex items-center justify-center p-4 sm:p-5">
        
        {/* Badges Stack (Top Left) */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start max-w-[70%] pointer-events-none">
          {discountPercent && discountPercent > 0 && (
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10.5px] font-black tracking-tight px-2 py-0.5 rounded-md shadow-xs">
              <span>-{discountPercent}%</span>
            </span>
          )}
          {product.isBestSeller && !discountPercent && (
            <span className="inline-flex items-center gap-1 bg-stone-900 text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs border border-amber-400/30">
              <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
              <span>Bestseller</span>
            </span>
          )}
          {product.isNewArrival && !product.isBestSeller && !discountPercent && (
            <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
              <Sparkles className="w-2.5 h-2.5" />
              <span>New</span>
            </span>
          )}
          {hasBulkDiscount && (
            <span className="inline-flex items-center gap-1 bg-white/95 text-cyan-800 border border-cyan-300/80 text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-2xs">
              <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
              <span>Bulk Tier</span>
            </span>
          )}
        </div>

        {/* Wishlist Button (Top Right) */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={handleToggleWishlist}
          title={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-200 shadow-xs cursor-pointer ${
            isSaved
              ? 'bg-rose-50 border border-rose-200 text-rose-600 scale-105'
              : 'bg-white/90 hover:bg-white border border-stone-200 text-stone-600 hover:text-cyan-600 hover:border-cyan-300'
          }`}
        >
          <Heart className={`w-4 h-4 transition-transform ${isSaved ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
        </button>

        {/* Dual-Image Showcase with Crossfade Hover */}
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={primaryImage.url}
            alt={product.name}
            className={`w-full h-full object-contain object-center transition-all duration-500 ${
              secondaryImage && isHovered ? 'opacity-0 scale-105' : 'opacity-100 group-hover:scale-108'
            }`}
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          {secondaryImage && (
            <img
              src={secondaryImage.url}
              alt={`${product.name} lifestyle`}
              className={`absolute inset-0 w-full h-full object-contain object-center transition-all duration-500 ${
                isHovered ? 'opacity-100 scale-108' : 'opacity-0 scale-95'
              }`}
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          )}
        </div>

        {/* Floating Quick View Bar (Appears on Hover) */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 translate-y-1 group-hover:translate-y-0">
          <button
            id={`quick-view-btn-${product.id}`}
            onClick={handleQuickView}
            className="w-full bg-stone-900/90 backdrop-blur-sm hover:bg-cyan-600 text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t('common.quick_view', 'Quick View')}</span>
          </button>
        </div>
      </div>

      {/* 2. Product Details Body */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-white border-t border-stone-100/80">
        <div>
          {/* Brand & Star Rating Header */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-cyan-700/90 group-hover:text-cyan-600 transition-colors line-clamp-1">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-stone-700 shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{ratingValue.toFixed(1)}</span>
              <span className="text-stone-400 font-normal text-[10px]">({reviewCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-sans text-xs sm:text-sm font-bold text-stone-900 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-cyan-700 transition-colors">
            {product.name}
          </h3>

          {/* Key Characteristic / Flavor Pill */}
          {productPill && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold border px-2 py-0.5 rounded-md line-clamp-1 max-w-full ${productPill.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${productPill.dot}`} />
                <span className="truncate">{productPill.label}</span>
              </span>
            </div>
          )}

          {/* Stock Status Indicator */}
          <div className="mt-2 flex items-center gap-1.5 text-[10px]">
            {isOutOfStock ? (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                {t('common.out_of_stock', 'Out of Stock')}
              </span>
            ) : isLowStock ? (
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Only {product.stock} left in stock
              </span>
            ) : (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                In Stock • Ready to ship
              </span>
            )}
          </div>

          {/* Pricing Row */}
          <div className="mt-2.5 flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              {product.salePrice ? (
                <>
                  <span className="text-base sm:text-lg font-black text-stone-900">
                    ${product.salePrice.toFixed(2)}
                  </span>
                  <span className="text-xs text-stone-400 line-through font-medium">
                    ${product.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-base sm:text-lg font-black text-stone-900">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            {savingsAmount && (
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200/60 px-1.5 py-0.5 rounded">
                Save ${savingsAmount}
              </span>
            )}
          </div>
        </div>

        {/* 3. Action Footer: Ergonomic Stepper + Add to Cart Button */}
        <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          {/* Quantity Stepper */}
          <div className="inline-flex items-center border border-stone-200 rounded-lg p-0.5 bg-stone-50/80 shadow-2xs">
            <button
              id={`qty-minus-${product.id}`}
              onClick={handleDecrease}
              disabled={quantity <= 1 || isOutOfStock}
              className="w-6 h-6 flex items-center justify-center rounded text-stone-600 hover:text-stone-900 hover:bg-white disabled:opacity-30 transition-all cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-6 text-center text-xs font-bold text-stone-900 select-none">
              {quantity}
            </span>
            <button
              id={`qty-plus-${product.id}`}
              onClick={handleIncrease}
              disabled={isOutOfStock || quantity >= product.stock}
              className="w-6 h-6 flex items-center justify-center rounded text-stone-600 hover:text-stone-900 hover:bg-white disabled:opacity-30 transition-all cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Add to Basket Button */}
          <button
            id={`add-to-cart-btn-${product.id}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider py-2 px-3 rounded-lg shadow-xs transition-all duration-200 cursor-pointer ${
              isOutOfStock
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                : justAdded
                ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                : 'bg-stone-900 hover:bg-cyan-600 text-white shadow-stone-900/10 active:scale-95'
            }`}
          >
            {isOutOfStock ? (
              <span>{t('common.out_of_stock', 'Out of Stock')}</span>
            ) : justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{t('common.added', 'Added')}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{t('common.add_to_cart', 'Add to Cart')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

