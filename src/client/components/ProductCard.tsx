import React, { useState } from 'react';
import { Product } from '../../types/index.js';
import { useStore } from '../store/useStore.js';
import { Heart, Eye, ShoppingBag, Star, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onNavigate?: (slug: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const { addToCart, wishlistIds, toggleWishlist, setQuickViewProduct, isCartLoading } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const isSaved = wishlistIds.includes(product.id);
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0] || { url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=600' };
  const secondaryImage = product.images.find(img => !img.isPrimary) || primaryImage;

  const currentImage = isHovered && secondaryImage.url ? secondaryImage.url : primaryImage.url;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    setIsAdding(true);
    await addToCart(product.id, 1);
    setIsAdding(false);
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white border border-stone-200/80 hover:border-amber-700/40 rounded-sm transition-all duration-300 flex flex-col cursor-pointer overflow-hidden shadow-xs hover:shadow-md"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full bg-stone-50 overflow-hidden flex items-center justify-center p-4">
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 items-start">
          {product.isOnSale && product.salePrice && (
            <span className="bg-amber-900 text-amber-50 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-xs">
              Save ${Math.round(product.price - product.salePrice)}
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-stone-900 text-stone-100 text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-xs">
              Best Seller
            </span>
          )}
          {product.isNewArrival && !product.isBestSeller && (
            <span className="bg-amber-700/90 text-white text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-xs">
              Reserve Edition
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={handleToggleWishlist}
          title={isSaved ? 'Remove from wishlist' : 'Add to luxury wishlist'}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs border border-stone-200 flex items-center justify-center text-stone-700 hover:text-amber-800 transition-colors shadow-xs"
        >
          <Heart className={`w-4 h-4 transition-all ${isSaved ? 'fill-amber-700 text-amber-700 scale-110' : ''}`} />
        </button>

        {/* Product Image */}
        <img
          src={currentImage}
          alt={product.name}
          className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Quick Action Overlay */}
        <div className={`absolute bottom-3 left-3 right-3 flex gap-2 transition-all duration-200 z-10 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
          <button
            id={`quick-view-btn-${product.id}`}
            onClick={handleQuickView}
            className="flex-1 bg-white/95 backdrop-blur-xs hover:bg-white text-stone-900 text-xs font-semibold py-2 px-2.5 border border-stone-300 rounded-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-stone-600" />
            <span>Quick View</span>
          </button>
          
          <button
            id={`quick-add-btn-${product.id}`}
            disabled={isOutOfStock || isAdding}
            onClick={handleAddToCart}
            className={`px-3 py-2 text-xs font-semibold rounded-xs shadow-xs flex items-center justify-center transition-colors ${
              isOutOfStock
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-stone-900 hover:bg-amber-800 text-white'
            }`}
            title="Add to Bag"
          >
            {isAdding ? <Check className="w-3.5 h-3.5 animate-bounce" /> : <ShoppingBag className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white border-t border-stone-100">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-stone-500 mb-1">
            <span className="font-semibold text-amber-900/80">{product.brand}</span>
            <span>{product.category}</span>
          </div>

          {/* Product Title */}
          <h3 className="font-serif text-sm md:text-base font-semibold text-stone-900 leading-snug line-clamp-2 group-hover:text-amber-900 transition-colors">
            {product.name}
          </h3>

          {/* Flavor/Material Attribute */}
          {product.flavor && (
            <p className="text-[12px] text-stone-600 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-700/80 inline-block"></span>
              <span className="italic">{product.flavor}</span>
            </p>
          )}
          {product.material && !product.flavor && (
            <p className="text-[12px] text-stone-500 mt-1">
              {product.material}
            </p>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
          {/* Pricing */}
          <div className="flex items-baseline gap-2">
            {product.salePrice ? (
              <>
                <span className="text-base md:text-lg font-semibold text-amber-900 font-sans">
                  ${product.salePrice.toFixed(2)}
                </span>
                <span className="text-xs text-stone-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-base md:text-lg font-semibold text-stone-900 font-sans">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Rating or Stock Alert */}
          {isOutOfStock ? (
            <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-xs">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-xs">
              {product.stock} left
            </span>
          ) : (
            <div className="flex items-center gap-1 text-stone-600 text-xs">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span className="font-medium text-stone-800">{product.rating.toFixed(1)}</span>
              <span className="text-[10px] text-stone-400">({product.reviewCount})</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
