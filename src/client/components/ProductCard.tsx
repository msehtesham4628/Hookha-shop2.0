import React, { useState } from 'react';
import { Product } from '../../types/index.js';
import { useStore } from '../store/useStore.js';
import { useTranslation } from '../i18n/LanguageContext.js';
import { Heart, Eye, ArrowRight, Minus, Plus, Check, Flame } from 'lucide-react';

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

  const isSaved = wishlistIds.includes(product.id);
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0] || { url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=600' };

  const isOutOfStock = product.stock <= 0;
  const hasBulkDiscount = showBulkDiscount || product.tags?.includes('bulk-discount') || product.categorySlug === 'tobacco';

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
    setTimeout(() => setJustAdded(false), 1800);
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

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={handleClick}
      className="group relative bg-white border border-stone-200/90 hover:border-cyan-500/50 rounded-sm transition-all duration-300 flex flex-col cursor-pointer overflow-hidden shadow-2xs hover:shadow-md w-full"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full bg-stone-50/70 overflow-hidden flex items-center justify-center p-3 sm:p-4">
        
        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          {hasBulkDiscount && (
            <span className="inline-flex items-center gap-1 bg-white/95 text-cyan-600 border border-cyan-200 text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-2xs">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>{t('common.bulk_discount', 'Bulk Discount')}</span>
            </span>
          )}
          {product.isOnSale && product.salePrice && !hasBulkDiscount && (
            <span className="bg-cyan-600 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-xs shadow-2xs">
              {t('common.sale', 'Sale')}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={handleToggleWishlist}
          title={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-cyan-600 hover:text-cyan-700 hover:border-cyan-400 transition-all shadow-2xs cursor-pointer"
        >
          <Heart className={`w-4 h-4 transition-all ${isSaved ? 'fill-cyan-600 text-cyan-600 scale-110' : 'text-cyan-600'}`} />
        </button>

        {/* Product Image */}
        <img
          src={primaryImage.url}
          alt={product.name}
          className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Quick View Button on Hover */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            id={`quick-view-btn-${product.id}`}
            onClick={handleQuickView}
            className="w-full bg-white/95 backdrop-blur-xs hover:bg-stone-900 hover:text-white text-stone-800 text-xs font-semibold py-1.5 px-3 border border-stone-300 rounded-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t('common.quick_view', 'Quick View')}</span>
          </button>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-white border-t border-stone-100">
        <div>
          {/* Product Title */}
          <h3 className="font-sans text-xs sm:text-sm font-semibold text-stone-800 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-cyan-600 transition-colors">
            {product.name}
          </h3>

          {/* Pricing */}
          <div className="mt-2 flex items-baseline gap-2">
            {product.salePrice ? (
              <>
                <span className="text-sm sm:text-base font-bold text-stone-900">
                  ${product.salePrice.toFixed(2)}
                </span>
                <span className="text-xs text-stone-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-sm sm:text-base font-bold text-stone-900">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Stepper + Add To Cart Actions */}
        <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          {/* Quantity Stepper */}
          <div className="inline-flex items-center border border-stone-200 rounded-full px-2 py-1 bg-stone-50/50">
            <button
              id={`qty-minus-${product.id}`}
              onClick={handleDecrease}
              disabled={quantity <= 1 || isOutOfStock}
              className="w-5 h-5 flex items-center justify-center text-stone-500 hover:text-stone-900 disabled:opacity-30 transition-colors cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-6 text-center text-xs font-semibold text-stone-800 select-none">
              {quantity}
            </span>
            <button
              id={`qty-plus-${product.id}`}
              onClick={handleIncrease}
              disabled={isOutOfStock || quantity >= product.stock}
              className="w-5 h-5 flex items-center justify-center text-stone-500 hover:text-stone-900 disabled:opacity-30 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            id={`add-to-cart-btn-${product.id}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider transition-all px-2.5 py-1.5 rounded-xs cursor-pointer ${
              isOutOfStock
                ? 'text-stone-400 cursor-not-allowed'
                : justAdded
                ? 'text-emerald-600 bg-emerald-50'
                : 'text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50/60 active:scale-95'
            }`}
          >
            {isOutOfStock ? (
              <span>{t('common.out_of_stock', 'Out of Stock')}</span>
            ) : justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('common.added', 'Added')}</span>
              </>
            ) : (
              <>
                <span>{t('common.add_to_cart', 'ADD TO CART')}</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-600 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
