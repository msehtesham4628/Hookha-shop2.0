import React, { useState } from 'react';
import { useStore } from '../store/useStore.js';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Sparkles, Tag, ShieldCheck } from 'lucide-react';

interface CartDrawerProps {
  onNavigate: (path: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const { cart, isCartOpen, setCartOpen, updateCartQuantity, removeCartItem, applyCoupon, isCartLoading } = useStore();
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isCartOpen) return null;

  const freeShippingGoal = 150;
  const progressToFreeShipping = Math.min(100, Math.round((cart.subtotal / freeShippingGoal) * 100));
  const remainingForFreeShipping = Math.max(0, freeShippingGoal - cart.subtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsApplyingCoupon(true);
    const success = await applyCoupon(couponInput.trim());
    setIsApplyingCoupon(false);
    if (success) {
      setCouponInput('');
    }
  };

  const handleProceedToCheckout = () => {
    setCartOpen(false);
    onNavigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        id="cart-drawer-backdrop"
        onClick={() => setCartOpen(false)}
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-stone-200">
          
          {/* Header */}
          <div className="p-5 border-b border-stone-200 bg-stone-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-amber-900" />
              <h2 className="font-serif text-lg font-bold text-stone-900 tracking-wide">
                Your Shopping Bag ({cart.itemCount})
              </h2>
            </div>
            <button
              id="close-cart-btn"
              onClick={() => setCartOpen(false)}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-amber-50/80 px-5 py-3 border-b border-amber-200/60 text-xs">
            {remainingForFreeShipping > 0 ? (
              <div>
                <p className="text-stone-800 font-medium">
                  Add <strong className="text-amber-900 font-bold">${remainingForFreeShipping.toFixed(2)}</strong> more for <span className="font-semibold text-amber-800">Complimentary 2-Day Air</span>
                </p>
                <div className="w-full bg-amber-200/80 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-amber-700 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressToFreeShipping}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>You unlocked Complimentary Express 2-Day Air Delivery!</span>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-stone-800">Your Bag is Empty</h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs">
                    Explore our curated collection of stainless steel hookahs, handcrafted clay bowls, and dark leaf shishas.
                  </p>
                </div>
                <button
                  id="empty-cart-shop-btn"
                  onClick={() => { setCartOpen(false); onNavigate('/shop'); }}
                  className="bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold px-5 py-2.5 rounded-xs transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.id}
                  id={`cart-item-${item.id}`}
                  className="flex gap-4 pb-4 border-b border-stone-100 last:border-0"
                >
                  {/* Item Image */}
                  <div className="w-20 h-20 bg-stone-50 rounded-xs border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center p-2">
                    <img
                      src={item.product.images[0]?.url || 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=200'}
                      alt={item.product.name}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-serif text-xs font-bold text-stone-900 line-clamp-2 leading-snug">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeCartItem(item.id)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.selectedFlavor && (
                        <p className="text-[11px] text-amber-800 italic mt-0.5">
                          Flavor: {item.selectedFlavor}
                        </p>
                      )}
                      {item.selectedColor && (
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Finish: {item.selectedColor}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-stone-300 rounded-xs bg-stone-50">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition-colors disabled:opacity-40"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Total Price for item */}
                      <div className="text-right">
                        <span className="text-xs font-bold text-stone-900 font-sans">
                          ${item.totalPrice.toFixed(2)}
                        </span>
                        {item.quantity > 1 && (
                          <p className="text-[10px] text-stone-400">
                            ${item.unitPrice.toFixed(2)} ea
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cart.items.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50/50 space-y-4">
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                  <input
                    id="cart-coupon-input"
                    type="text"
                    placeholder="Coupon / VIP Promo Code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-stone-300 text-xs text-stone-800 pl-8 pr-3 py-2 rounded-xs focus:outline-none focus:border-amber-700"
                  />
                </div>
                <button
                  id="cart-apply-coupon-btn"
                  type="submit"
                  disabled={isApplyingCoupon || !couponInput.trim()}
                  className="bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold px-3 py-2 rounded-xs transition-colors disabled:opacity-50"
                >
                  {isApplyingCoupon ? '...' : 'Apply'}
                </button>
              </form>

              {/* Order Calculations */}
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">${cart.subtotal.toFixed(2)}</span>
                </div>

                {cart.couponDiscount > 0 && (
                  <div className="flex justify-between text-amber-900 font-medium">
                    <span>Discount ({cart.couponCode})</span>
                    <span>-${cart.couponDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{cart.shippingFee === 0 ? <strong className="text-emerald-700 font-semibold">FREE</strong> : `$${cart.shippingFee.toFixed(2)}`}</span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span>${cart.estimatedTax.toFixed(2)}</span>
                </div>

                <div className="border-t border-stone-200 pt-2 flex justify-between text-sm font-bold text-stone-900">
                  <span>Total</span>
                  <span className="text-base text-amber-900 font-sans">${cart.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                id="cart-checkout-btn"
                onClick={handleProceedToCheckout}
                className="w-full bg-stone-900 hover:bg-amber-900 text-white font-semibold py-3 px-4 rounded-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-xs group"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                <span>256-Bit SSL • Adult Signature Required (Age 21+)</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
