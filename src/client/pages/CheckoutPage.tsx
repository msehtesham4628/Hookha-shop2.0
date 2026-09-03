import React, { useState } from 'react';
import { useStore } from '../store/useStore.js';
import { api } from '../services/api.js';
import { createCloudOrder } from '../services/firebase.js';
import { broadcastSync } from '../services/sync.js';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  Tag,
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface CheckoutPageProps {
  onNavigate: (path: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { user, cart, applyCoupon, loadCart, showToast } = useStore();

  // Form State
  const [email, setEmail] = useState(user?.email || '');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('CA');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');

  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  // Payment Form
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE_CREDIT_CARD' | 'TEST_INSTANT'>('STRIPE_CREDIT_CARD');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-stone-500">Please add items to your cart before proceeding to checkout.</p>
        <button
          onClick={() => onNavigate('/shop')}
          className="bg-stone-900 text-white text-xs font-semibold px-6 py-2.5 rounded-xs"
        >
          Explore Collection
        </button>
      </div>
    );
  }

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    await applyCoupon(couponCode.trim());
    setIsApplyingCoupon(false);
  };

  const handleFillSandboxCard = () => {
    setCardNumber('4242 •••• •••• 4242');
    setCardExp('12/28');
    setCardCvc('888');
    showToast('Stripe test sandbox card details loaded', 'info');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!ageConfirmed) {
      setErrorMsg('You must certify that you are at least 21 years of age.');
      showToast('Age certification required', 'error');
      return;
    }

    if (!email || !firstName || !lastName || !street || !city || !postalCode) {
      setErrorMsg('Please complete all mandatory address fields.');
      showToast('Missing required address details', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.createOrder({
        customerEmail: email,
        customerName: `${firstName} ${lastName}`,
        customerPhone: phone || undefined,
        shippingAddress: {
          street,
          city,
          state,
          postalCode,
          country
        },
        paymentMethod,
        couponCode: cart.couponCode
      });

      if (res.success && res.data) {
        // Broadcast new order event so Admin Dashboard and other views reflect immediately
        if (res.data.order) {
          broadcastSync('ORDER_PLACED', { order: res.data.order });
          try {
            await createCloudOrder(res.data.order);
          } catch (cloudErr) {
            console.warn('Firebase order sync notice:', cloudErr);
          }
        }

        // Clear local cart
        await loadCart();
        showToast('Order confirmed! Welcome to Fumare Hookah.', 'success');
        const orderId = res.data.order?.id || res.data.paymentIntentId;
        onNavigate(`/order-success?orderId=${orderId}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process payment');
      showToast(err.message || 'Payment processing error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-stone-50/50 py-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-800 font-semibold mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit Encrypted Secure Checkout</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">
            Finalize Your Acquisition
          </h1>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xs flex items-center gap-3 text-rose-900 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Details, Address, Shipping, Payment */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Contact Information */}
            <div className="bg-white border border-stone-200 rounded-xs p-6 shadow-xs space-y-4">
              <h2 className="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center font-sans">1</span>
                <span>Contact & Age Verification</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">VIP Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="concierge@domain.com"
                    className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">Order receipt and live UPS tracking notifications will be dispatched here.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Mobile Phone (For Carrier Delivery Notifications)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Destination */}
            <div className="bg-white border border-stone-200 rounded-xs p-6 shadow-xs space-y-4">
              <h2 className="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center font-sans">2</span>
                <span>Shipping Address</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9465 Wilshire Blvd"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Apartment, Suite, Unit (Optional)</label>
                  <input
                    type="text"
                    placeholder="Suite 800"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="Beverly Hills"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">State / Province *</label>
                  <input
                    type="text"
                    required
                    placeholder="CA"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">ZIP / Postal Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="90212"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Payment & Compliance */}
            <div className="bg-white border border-stone-200 rounded-xs p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h2 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center font-sans">3</span>
                  <span>Payment Method</span>
                </h2>
                <button
                  type="button"
                  onClick={handleFillSandboxCard}
                  className="text-[11px] text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xs font-semibold border border-amber-200"
                >
                  ⚡ Fill Stripe Test Sandbox
                </button>
              </div>

              {/* Card Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800 font-mono"
                    />
                    <CreditCard className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Expiration</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Security Code (CVC)</label>
                    <input
                      type="text"
                      required
                      placeholder="CVC"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Mandatory 21+ Age Certification Checkbox */}
              <div className="pt-4 border-t border-stone-100">
                <label className="flex items-start gap-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xs cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={ageConfirmed}
                    onChange={(e) => setAgeConfirmed(e.target.checked)}
                    className="mt-0.5 rounded-xs text-amber-900 focus:ring-amber-800"
                  />
                  <span className="text-xs text-stone-800 leading-snug">
                    <strong className="text-amber-950 font-bold">Mandatory Certification:</strong> I hereby certify under penalty of perjury that I am at least <strong>21 years of age</strong>, and I understand that an adult signature with government photo ID is required upon carrier delivery.
                  </span>
                </label>
              </div>

            </div>

          </div>

          {/* Right Column: Order Summary & Placement */}
          <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xs p-6 shadow-xs space-y-6">
            <h2 className="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-3">
              Order Summary ({cart.itemCount} items)
            </h2>

            {/* Item List */}
            <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 pb-3 border-b border-stone-100">
                  <div className="w-14 h-14 bg-stone-50 border border-stone-200 rounded-xs p-1 shrink-0 flex items-center justify-center">
                    <img src={item.product.images[0]?.url} alt={item.product.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-stone-900 truncate">{item.product.name}</p>
                    <p className="text-[11px] text-stone-500">Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</p>
                    {item.selectedFlavor && <p className="text-[10px] text-amber-800 italic">Flavor: {item.selectedFlavor}</p>}
                  </div>
                  <span className="text-xs font-bold text-stone-900 font-sans">${item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Coupon Code Input */}
            <div className="pt-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Promo / VIP Coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="w-full bg-stone-50 border border-stone-300 text-xs pl-8 pr-2 py-2 rounded-xs focus:outline-none focus:border-amber-800"
                  />
                </div>
                <button
                  type="button"
                  disabled={isApplyingCoupon || !couponCode.trim()}
                  onClick={handleApplyCoupon}
                  className="bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold px-3 py-2 rounded-xs transition-colors disabled:opacity-50"
                >
                  {isApplyingCoupon ? '...' : 'Apply'}
                </button>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs text-stone-600 border-t border-stone-100 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900">${cart.subtotal.toFixed(2)}</span>
              </div>

              {cart.couponDiscount > 0 && (
                <div className="flex justify-between text-amber-900 font-medium">
                  <span>VIP Discount ({cart.couponCode})</span>
                  <span>-${cart.couponDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>UPS 2-Day Air Express</span>
                <span>{cart.shippingFee === 0 ? <strong className="text-emerald-700 font-semibold">COMPLIMENTARY</strong> : `$${cart.shippingFee.toFixed(2)}`}</span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Sales Tax</span>
                <span>${cart.estimatedTax.toFixed(2)}</span>
              </div>

              <div className="border-t border-stone-200 pt-3 flex justify-between text-base font-bold text-stone-900">
                <span>Grand Total</span>
                <span className="text-lg text-amber-900 font-sans">${cart.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              id="place-order-submit-btn"
              type="submit"
              disabled={isSubmitting || !ageConfirmed}
              className="w-full bg-stone-900 hover:bg-amber-900 text-white font-bold text-xs uppercase tracking-widest py-4 px-6 rounded-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Authorizing Payment...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Authorize & Place Order (${cart.grandTotal.toFixed(2)})</span>
                </>
              )}
            </button>

            <div className="text-center text-[11px] text-stone-400">
              By authorizing this transaction, you accept Fumare Hookah's terms of service and break-free delivery warranty.
            </div>

          </div>

        </form>

      </div>
    </div>
  );
};
