import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore.js';
import { X, Star, ShoppingBag, Heart, ShieldCheck, Check, ArrowRight } from 'lucide-react';
import { sanitizeImageUrl, DEFAULT_PRODUCT_PLACEHOLDER } from '../utils/imageFallback.js';

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
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const activeImages = useMemo(() => {
    if (!quickViewProduct?.images || quickViewProduct.images.length === 0) return [];
    const cleaned = quickViewProduct.images.map(img => ({
      ...img,
      url: sanitizeImageUrl(img.url),
      thumbnailUrl: sanitizeImageUrl(img.thumbnailUrl || img.url)
    }));
    const valid = cleaned.filter(img => !failedImages[img.url]);
    return valid.length > 0 ? valid : cleaned;
  }, [quickViewProduct?.images, failedImages]);

  if (!quickViewProduct) return null;

  const isSaved = wishlistIds.includes(quickViewProduct.id);
  const safeIdx = selectedImageIdx >= activeImages.length ? 0 : selectedImageIdx;
  const currentImage = activeImages[safeIdx]?.url || DEFAULT_PRODUCT_PLACEHOLDER;

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
              className="max-h-full max-w-full object-contain transition-all duration-300"
              referrerPolicy="no-referrer"
              onError={() => {
                if (currentImage !== DEFAULT_PRODUCT_PLACEHOLDER) {
                  setFailedImages(prev => ({ ...prev, [currentImage]: true }));
                }
              }}
            />
          </div>

          {/* Thumbnails */}
          {activeImages.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto max-w-full pb-1">
              {activeImages.map((img, idx) => (
                <button
                  key={img.id || img.url || idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-12 h-12 rounded-xs border p-1 shrink-0 bg-white transition-all cursor-pointer ${
                    safeIdx === idx ? 'border-amber-800 ring-1 ring-amber-800' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.thumbnailUrl || img.url}
                    alt="thumbnail"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                    onError={() => {
                      setFailedImages(prev => ({ ...prev, [img.url]: true }));
                    }}
                  />
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

            {/* Component Notice if not a full hookah pipe */}
            {quickViewProduct.categorySlug !== 'hookahs' && (
              <div className="mt-2.5 p-2 bg-amber-50/80 border border-amber-200/70 rounded-xs flex items-center justify-between gap-2 text-xs">
                <span className="text-amber-950">
                  <span className="font-bold uppercase text-[9px] bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded-xs mr-1">
                    {quickViewProduct.category}
                  </span>
                  {quickViewProduct.category.replace(/s$/, '')} component (not a hookah pipe)
                </span>
                <button
                  onClick={() => {
                    setQuickViewProduct(null);
                    onNavigate('/shop?category=hookahs');
                  }}
                  className="text-amber-900 hover:text-amber-700 font-semibold underline shrink-0 cursor-pointer text-[11px]"
                >
                  View Hookahs &rarr;
                </button>
              </div>
            )}

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

              {/* Add to Cart Logo Button */}
              <button
                id="quick-view-add-cart-btn"
                disabled={quickViewProduct.stock <= 0 || isAdding}
                onClick={handleAddToCart}
                title={quickViewProduct.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                aria-label="Add to Cart"
                className="w-12 h-10 bg-stone-900 hover:bg-amber-900 text-white rounded-xs transition-all duration-200 flex items-center justify-center shadow-xs disabled:opacity-50 cursor-pointer active:scale-95 group relative"
              >
                {isAdding ? (
                  <Check className="w-4 h-4 text-emerald-400 animate-in zoom-in" />
                ) : (
                  <ShoppingBag className="w-4 h-4 transition-transform group-hover:scale-110" />
                )}
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
