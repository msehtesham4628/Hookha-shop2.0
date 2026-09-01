import React, { useState } from 'react';
import { useStore } from '../store/useStore.js';
import { X, Star, ShoppingBag, Heart, ShieldCheck, Check, ArrowRight } from 'lucide-react';

interface QuickViewModalProps {
  onNavigate: (path: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ onNavigate }) => {
  const { quickViewProduct, setQuickViewProduct, addToCart, wishlistIds, toggleWishlist } = useStore();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedFlavor, setSelectedFlavor] = useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  if (!quickViewProduct) return null;

  const isSaved = wishlistIds.includes(quickViewProduct.id);
  const currentImage = quickViewProduct.images[selectedImageIdx]?.url || quickViewProduct.images[0]?.url || 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=800';

  const handleAddToCart = async () => {
    setIsAdding(true);
    await addToCart(quickViewProduct.id, quantity, selectedFlavor || quickViewProduct.flavor, selectedColor || quickViewProduct.color);
    setIsAdding(false);
    setQuickViewProduct(null);
  };

  const handleViewFullDetails = () => {
    const slug = quickViewProduct.slug;
    setQuickViewProduct(null);
    onNavigate(`/product/${slug}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-12 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center animate-in fade-in duration-200">
      <div
        id="quick-view-modal-content"
        className="relative max-w-3xl w-full bg-white rounded-sm shadow-2xl border border-stone-200 overflow-hidden flex flex-col md:flex-row"
      >
        {/* Close Button */}
        <button
          id="close-quick-view-btn"
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/90 text-stone-500 hover:text-stone-900 border border-stone-200 shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Gallery Left Column */}
        <div className="md:w-1/2 bg-stone-50 p-6 flex flex-col items-center justify-between border-r border-stone-200">
          <div className="relative w-full aspect-square flex items-center justify-center">
            <img
              src={currentImage}
              alt={quickViewProduct.name}
              className="max-h-full max-w-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Thumbnails */}
          {quickViewProduct.images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto max-w-full pb-1">
              {quickViewProduct.images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-12 h-12 rounded-xs border p-1 shrink-0 bg-white transition-all ${
                    selectedImageIdx === idx ? 'border-amber-800 ring-1 ring-amber-800' : 'border-stone-200 opacity-70'
                  }`}
                >
                  <img src={img.url} alt="thumbnail" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Specs & Add-to-bag Right Column */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-stone-500 mb-1">
              <span className="font-semibold text-amber-900">{quickViewProduct.brand}</span>
              <span>{quickViewProduct.category}</span>
            </div>

            <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-snug">
              {quickViewProduct.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(quickViewProduct.rating) ? 'fill-amber-500' : 'text-stone-300'}`} />
                ))}
              </div>
              <span className="text-xs text-stone-600 font-semibold">{quickViewProduct.rating.toFixed(1)}</span>
              <span className="text-xs text-stone-400">({quickViewProduct.reviewCount} reviews)</span>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-2 mt-3">
              {quickViewProduct.salePrice ? (
                <>
                  <span className="text-xl font-bold text-amber-900 font-sans">
                    ${quickViewProduct.salePrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-stone-400 line-through">
                    ${quickViewProduct.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-stone-900 font-sans">
                  ${quickViewProduct.price.toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-xs text-stone-600 mt-3 line-clamp-3 leading-relaxed">
              {quickViewProduct.shortDescription || quickViewProduct.description}
            </p>

            {/* Highlights */}
            <div className="mt-4 space-y-1 text-xs text-stone-600 bg-stone-50 p-3 rounded-xs border border-stone-200">
              {quickViewProduct.flavor && (
                <p><strong>Flavor Notes:</strong> <span className="text-amber-900 italic font-medium">{quickViewProduct.flavor}</span></p>
              )}
              {quickViewProduct.material && (
                <p><strong>Material:</strong> {quickViewProduct.material}</p>
              )}
              <p><strong>SKU:</strong> <span className="font-mono text-stone-800">{quickViewProduct.sku}</span></p>
              <p><strong>Availability:</strong> {quickViewProduct.stock > 0 ? <span className="text-emerald-700 font-semibold">In Stock ({quickViewProduct.stock} units)</span> : <span className="text-rose-700 font-semibold">Sold Out</span>}</p>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-6 pt-4 border-t border-stone-200 space-y-3">
            <div className="flex gap-3">
              <div className="flex items-center border border-stone-300 rounded-xs bg-stone-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2.5 py-2 text-stone-600 hover:text-stone-900"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold text-stone-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(quickViewProduct.stock, quantity + 1))}
                  className="px-2.5 py-2 text-stone-600 hover:text-stone-900"
                >
                  +
                </button>
              </div>

              <button
                id="quick-view-add-cart-btn"
                disabled={quickViewProduct.stock <= 0 || isAdding}
                onClick={handleAddToCart}
                className="flex-1 bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold py-2.5 px-4 rounded-xs transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                {isAdding ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                <span>{quickViewProduct.stock <= 0 ? 'Out of Stock' : 'Add to Bag'}</span>
              </button>

              <button
                onClick={() => toggleWishlist(quickViewProduct.id)}
                className="p-2.5 border border-stone-300 rounded-xs hover:border-amber-800 text-stone-700 hover:text-amber-800 transition-colors"
                title={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-amber-700 text-amber-700' : ''}`} />
              </button>
            </div>

            <button
              onClick={handleViewFullDetails}
              className="w-full text-center text-xs text-stone-600 hover:text-amber-900 font-medium py-1 transition-colors flex items-center justify-center gap-1"
            >
              <span>View full specifications & customer reviews</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
