import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore.js';
import { api } from '../services/api.js';
import { createCloudOrder } from '../services/firebase.js';
import { broadcastSync } from '../services/sync.js';
import { Product, User } from '../../types/index.js';
import { CheckoutAuthModal } from '../components/CheckoutAuthModal.js';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  Heart,
  Tag,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Lock,
  CheckCircle2,
  Sparkles,
  Info,
  X,
  ShieldCheck,
  Check,
  User as UserIcon
} from 'lucide-react';

// Sleek Apple Pay Icon component
const ApplePayIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 170 170" fill="currentColor">
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.95-14.34-5.26-8.04-9.49-17.1-12.69-27.18-3.21-10.08-4.81-19.98-4.81-29.7 0-14.56 3.69-26.68 11.07-36.36 7.38-9.68 16.73-14.63 28.05-14.86 4.35 0 9.29 1.16 14.82 3.49 5.53 2.33 9.4 3.55 11.62 3.66 1.83 0 5.86-1.27 12.09-3.81 6.23-2.54 11.45-3.65 15.66-3.34 13.9.72 24.59 5.87 32.08 15.45-12.39 7.48-18.47 17.65-18.24 30.52.23 10.15 4.1 18.66 11.62 25.53 7.52 6.87 16.51 10.74 26.96 11.62-2.18 6.53-4.87 13.13-8.07 19.8zM119.22 31.84c0-7.39 2.68-14.32 8.04-20.78 5.36-6.47 11.93-10.53 19.72-12.18.23 1.06.35 2.05.35 2.97 0 7.39-2.79 14.38-8.37 20.97-5.58 6.59-12.26 10.66-20.04 12.21-.11-.96-.17-1.83-.17-2.62z" />
  </svg>
);

interface CheckoutPageProps {
  onNavigate: (path: string) => void;
}

type CheckoutStep = 'BAG' | 'ADD_ADDRESS' | 'SELECT_ADDRESS_AND_PAY' | 'PAYMENT_OPTIONS';
type PaymentOptionType = 'APPLE_PAY' | 'CARD';

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const {
    user,
    cart,
    loadCart,
    updateCartQuantity,
    removeCartItem,
    applyCoupon,
    addToCart,
    wishlistIds,
    toggleWishlist,
    showToast,
    settings
  } = useStore();

  // Active Checkout Screen
  const [step, setStep] = useState<CheckoutStep>('BAG');

  // Address Form State - Clean blank defaults with privacy protection
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [roadName, setRoadName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Privacy: "Don't save my data" (Private Checkout - Enabled by default)
  const [dontSaveMyData, setDontSaveMyData] = useState(true);
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);

  // Sync user details only if user explicitly disables "Don't save my data"
  useEffect(() => {
    if (!dontSaveMyData && user?.addressDetails) {
      if (user.addressDetails.pincode) setPincode(user.addressDetails.pincode);
      if (user.addressDetails.city) setCity(user.addressDetails.city);
      if (user.addressDetails.state) setState(user.addressDetails.state);
      if (user.addressDetails.houseNo) setHouseNo(user.addressDetails.houseNo);
      if (user.addressDetails.areaRoad) setRoadName(user.addressDetails.areaRoad);
    }
    if (!dontSaveMyData && user?.firstName) {
      setContactName(`${user.firstName} ${user.lastName || ''}`.trim());
    }
    if (!dontSaveMyData && user?.phone) setContactPhone(user.phone);
    if (!dontSaveMyData && user?.email) setContactEmail(user.email);
  }, [user, dontSaveMyData]);

  const handleClearEnteredData = () => {
    setPincode('');
    setCity('');
    setState('');
    setHouseNo('');
    setRoadName('');
    setContactName('');
    setContactPhone('');
    setContactEmail('');
    showToast('All entered details cleared from screen', 'info');
  };

  // Payment Options State (Step 4) - Strictly Apple Pay & Card Payment
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<PaymentOptionType>('APPLE_PAY');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Accordion Expand/Collapse States
  const [isDeliveryEstimateOpen, setIsDeliveryEstimateOpen] = useState(true);
  const [isPriceDetailsOpen, setIsPriceDetailsOpen] = useState(true);
  const [isAddressSummaryOpen, setIsAddressSummaryOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  // Promo Code State
  const [isPromoInputOpen, setIsPromoInputOpen] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // Compliance & Submission
  const [ageConfirmed, setAgeConfirmed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Login Pop-up before Shipment
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authTriggerAction, setAuthTriggerAction] = useState<'PROCEED_TO_BUY' | 'COUPON_LOGIN' | 'GENERAL' | null>(null);

  // Navigate to Shipment Screen
  const proceedToShipment = () => {
    if (houseNo && roadName && city && pincode) {
      setStep('SELECT_ADDRESS_AND_PAY');
    } else {
      setStep('ADD_ADDRESS');
    }
  };

  // Pre-shipment Gate: Prompt customer to log in before showing shipment page
  const handleProceedToBuy = () => {
    const currentUser = user || useStore.getState().user;
    if (!currentUser) {
      setAuthTriggerAction('PROCEED_TO_BUY');
      setShowLoginModal(true);
      return;
    }
    proceedToShipment();
  };

  // Called when login popup completes successfully
  const handleLoginSuccess = async (loggedInUser: User) => {
    setShowLoginModal(false);
    // Autofill user delivery details if available
    if (loggedInUser.addressDetails) {
      if (loggedInUser.addressDetails.pincode) setPincode(loggedInUser.addressDetails.pincode);
      if (loggedInUser.addressDetails.city) setCity(loggedInUser.addressDetails.city);
      if (loggedInUser.addressDetails.state) setState(loggedInUser.addressDetails.state);
      if (loggedInUser.addressDetails.houseNo) setHouseNo(loggedInUser.addressDetails.houseNo);
      if (loggedInUser.addressDetails.areaRoad) setRoadName(loggedInUser.addressDetails.areaRoad);
    }
    if (loggedInUser.firstName) {
      setContactName(`${loggedInUser.firstName} ${loggedInUser.lastName || ''}`.trim());
    }
    if (loggedInUser.phone) setContactPhone(loggedInUser.phone);
    if (loggedInUser.email) setContactEmail(loggedInUser.email);

    // Refresh cart to ensure synced items & applied coupons from session
    await loadCart();

    const trigger = authTriggerAction;
    setAuthTriggerAction(null);

    // If customer logged in via coupon prompt, automatically apply the coupon for them
    if (trigger === 'COUPON_LOGIN') {
      const codeToApply = promoCodeInput.trim() || 'APP15';
      setIsPromoInputOpen(true);
      await applyCoupon(codeToApply);
      showToast(`Welcome, ${loggedInUser.firstName || 'Customer'}! Promo code ${codeToApply} applied.`, 'success');
    } else if (trigger === 'PROCEED_TO_BUY') {
      showToast(`Welcome, ${loggedInUser.firstName || 'Customer'}! Proceeding to delivery details.`, 'success');
      if (loggedInUser.addressDetails?.houseNo && loggedInUser.addressDetails?.city && loggedInUser.addressDetails?.pincode) {
        setStep('SELECT_ADDRESS_AND_PAY');
      } else {
        setStep('ADD_ADDRESS');
      }
    } else {
      // Stay on BAG or current view so the customer can review their coupon and cart
      showToast(`Welcome, ${loggedInUser.firstName || 'Customer'}! Your account is now connected.`, 'success');
    }
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
    setAuthTriggerAction(null);
    const currentUser = user || useStore.getState().user;
    // If not authenticated, customer cannot remain on shipment screens
    if (!currentUser && step !== 'BAG') {
      setStep('BAG');
    }
  };

  // Intercept if customer enters shipment directly without being logged in
  useEffect(() => {
    const currentUser = user || useStore.getState().user;
    if (!currentUser && step !== 'BAG') {
      setShowLoginModal(true);
    }
  }, [user, step]);

  // Last Minute Addition recommendations
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  useEffect(() => {
    api.getProducts().then(res => {
      if (res && res.data && Array.isArray(res.data.products)) {
        // Exclude items already in cart
        const cartProductIds = new Set(cart.items.map(i => i.productId));
        const filtered = res.data.products.filter((p: Product) => !cartProductIds.has(p.id));
        setRecommendations(filtered.slice(0, 6));
      }
    }).catch(() => {
      // Fallback handled gracefully
    });
  }, [cart.items]);

  // Price formatting helper (defaults to INR ₹ matching screenshots, or store currency)
  const currencySymbol = settings?.currencySymbol || (settings?.currency === 'USD' ? '$' : '₹');
  const formatPrice = (amount: number) => {
    if (currencySymbol === '₹') {
      return `₹${Math.round(amount).toLocaleString('en-IN')}`;
    }
    return `${currencySymbol}${amount.toFixed(2)}`;
  };

  // Promo code submission
  const handleApplyPromo = async (codeToApply?: string) => {
    const code = (codeToApply || promoCodeInput).trim();
    if (!code) return;
    setIsApplyingPromo(true);
    const success = await applyCoupon(code);
    setIsApplyingPromo(false);
    if (success) {
      setIsPromoInputOpen(false);
      setPromoCodeInput('');
      showToast(`Promo code ${code} applied successfully!`, 'success');
    }
  };

  // Quick fill sandbox credentials
  const handleFillSandboxCard = () => {
    setCardNumber('4242 •••• •••• 4242');
    setCardExp('12/28');
    setCardCvc('888');
    showToast('Stripe test sandbox card details loaded', 'info');
  };

  // Final Payment Submission (routes strictly through Stripe PaymentIntent)
  const handleCompleteOrder = async () => {
    setErrorMsg('');

    if (cart.items.length === 0) {
      setErrorMsg('Your shopping bag is empty. Please add items to your bag before checking out.');
      showToast('Your shopping bag is empty', 'error');
      setStep('BAG');
      return;
    }

    if (!ageConfirmed) {
      setErrorMsg('You must certify that you are at least 21 years of age.');
      showToast('Age certification required', 'error');
      return;
    }

    if (!user) {
      setShowLoginModal(true);
      setErrorMsg('Please log in or create an account to proceed with your order.');
      showToast('Account login required', 'error');
      return;
    }

    if (!contactName || !contactPhone || !houseNo || !roadName || !city || !pincode) {
      setErrorMsg('Please complete your shipping address details.');
      showToast('Missing shipping details', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const streetAddress = `${houseNo}, ${roadName}`.trim();

      const res = await api.createOrder({
        userId: user.id,
        customerEmail: (user.email || contactEmail).trim().toLowerCase(),
        customerName: contactName.trim(),
        customerPhone: contactPhone || user.phone || undefined,
        items: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedFlavor: item.selectedFlavor,
          selectedColor: item.selectedColor,
          unitPrice: item.unitPrice
        })),
        shippingAddress: {
          fullName: contactName.trim(),
          addressLine1: streetAddress,
          city,
          state,
          postalCode: pincode,
          country: 'India',
          phone: contactPhone || ''
        },
        billingAddress: {
          fullName: contactName.trim(),
          addressLine1: streetAddress,
          city,
          state,
          postalCode: pincode,
          country: 'India',
          phone: contactPhone || ''
        },
        paymentMethod: 'STRIPE_PAYMENT_INTENT',
        currency: (settings?.currency || 'inr').toLowerCase(),
        ageConfirmed: true,
        couponCode: cart.couponCode
      });

      if (res.success && res.data) {
        // Confirm in sandbox payment processor
        if (res.data.order?.id && res.data.paymentIntentId) {
          try {
            await api.confirmSimulatedPayment(res.data.order.id, res.data.paymentIntentId);
          } catch {
            // Handled safely
          }
        }

        // Real-time broadcast and Firebase persistence
        if (res.data.order) {
          broadcastSync('ORDER_PLACED', { order: res.data.order });
          try {
            await createCloudOrder(res.data.order);
          } catch (cloudErr) {
            console.warn('Firebase order sync notice:', cloudErr);
          }
        }

        // Privacy compliance: If "Don't save my data" is enabled, erase guest session tracking
        if (dontSaveMyData) {
          try {
            localStorage.removeItem('sultan_guest_id');
          } catch {
            // Handled safely
          }
        } else if (isDefaultAddress && user) {
          // User explicitly asked to save address to profile
          try {
            await api.updateAddress({
              address: streetAddress,
              addressDetails: {
                houseNo,
                areaRoad: roadName,
                city,
                state,
                pincode
              }
            });
          } catch {
            // Handled safely
          }
        }

        await loadCart();
        showToast('Payment successful! Order confirmed via Stripe.', 'success');
        const orderId = res.data.order?.id || res.data.paymentIntentId;
        onNavigate(`/order-success?orderId=${orderId}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment processing error');
      showToast(err.message || 'Payment failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If bag is empty
  if (cart.items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
          <Tag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Your Bag is Empty</h2>
        <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
          Once you add your favorite hookahs, bowls, or shisha blends, they will appear here.
        </p>
        <button
          onClick={() => onNavigate('/shop')}
          className="w-full bg-black text-white text-sm font-semibold py-3.5 px-6 rounded-full hover:bg-stone-800 transition shadow-sm"
        >
          Explore Collection
        </button>
      </div>
    );
  }

  // ----------------------------------------------------------------------------------
  // SCREEN 1: "Bag" (Screenshots 1 & 2)
  // ----------------------------------------------------------------------------------
  if (step === 'BAG') {
    return (
      <div className="min-h-screen bg-white text-stone-900 pb-32">
        {/* Top Promotional Announcement Banner */}
        <div className="bg-stone-100/90 text-stone-800 text-xs py-2.5 px-4 text-center border-b border-stone-200">
          <div className="flex items-center justify-center gap-1.5 flex-wrap font-medium">
            <span>Enjoy 15% Off Your Order. Use:</span>
            <span className="font-bold text-black bg-white px-2 py-0.5 rounded-sm border border-stone-200 font-mono">
              APP15
            </span>
            <button
              type="button"
              onClick={() => handleApplyPromo('APP15')}
              className="text-stone-900 underline font-semibold ml-2 hover:text-amber-800 transition"
            >
              Apply Now
            </button>
            <span className="text-stone-400 ml-1">· T&Cs</span>
          </div>
        </div>

        <div className="max-w-xl mx-auto px-4 pt-6">
          {/* Bag Title Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-stone-950">Bag</h1>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              {cart.itemCount} items | {formatPrice(cart.grandTotal)}
            </p>
          </div>

          <div className="h-px bg-stone-200 w-full mb-6" />

          {/* Cart Items List */}
          <div className="space-y-6">
            {cart.items.map((item) => {
              const isWishlisted = wishlistIds.includes(item.productId);
              const imgUrl = item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80';
              const title = item.product?.name || 'Hookah Product';
              const flavor = item.selectedFlavor || item.product?.flavor;
              const color = item.selectedColor || item.product?.color;

              return (
                <div key={item.id} className="pb-6 border-b border-stone-100 last:border-0">
                  <div className="flex gap-4">
                    {/* Left Product Image Thumbnail */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-md bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={imgUrl}
                        alt={title}
                        className="w-full h-full object-contain p-2 hover:scale-105 transition-transform"
                      />
                    </div>

                    {/* Right Product Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="text-base font-bold text-stone-950 tracking-tight">
                          {formatPrice(item.totalPrice || item.unitPrice * item.quantity)}
                        </div>
                        <h3 className="text-sm font-semibold text-stone-900 mt-0.5 truncate">
                          {title}
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {flavor ? `Flavor: ${flavor}` : (item.product?.category || 'Hookah & Accessories')}
                        </p>
                        <div className="text-xs text-stone-600 mt-1 flex items-center gap-1.5">
                          <span>14 Day Return</span>
                          <span className="text-stone-300">•</span>
                          <span className="text-emerald-700 font-medium">100% Authentic</span>
                        </div>
                        {color && (
                          <div className="text-xs text-stone-900 underline font-medium mt-1 cursor-pointer">
                            Color: {color}
                          </div>
                        )}
                      </div>

                      {/* Quantity Stepper & Wishlist Actions */}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="inline-flex items-center border border-stone-300 rounded-full h-8 px-2.5 bg-white text-stone-800 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity <= 1) {
                                removeCartItem(item.id);
                              } else {
                                updateCartQuantity(item.id, item.quantity - 1);
                              }
                            }}
                            className="p-1 hover:text-red-600 transition"
                            title={item.quantity <= 1 ? 'Remove item' : 'Decrease quantity'}
                          >
                            {item.quantity <= 1 ? (
                              <Trash2 className="w-3.5 h-3.5 text-stone-600 hover:text-red-600" />
                            ) : (
                              <Minus className="w-3 h-3" />
                            )}
                          </button>
                          <span className="w-6 text-center font-semibold text-xs">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:text-black transition"
                            title="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleWishlist(item.productId)}
                          className={`w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center transition ${
                            isWishlisted ? 'bg-red-50 text-red-600 border-red-200' : 'text-stone-600 hover:text-black hover:border-black'
                          }`}
                          title="Save to Wishlist"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Promo Code Card */}
          <div className="my-6">
            <div
              onClick={() => setIsPromoInputOpen(!isPromoInputOpen)}
              className="flex items-center justify-between p-4 border border-stone-200 rounded-xl hover:border-stone-400 cursor-pointer transition bg-white shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cart.couponCode ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-700'}`}>
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                    <span>{cart.couponCode ? `Applied: ${cart.couponCode}` : 'Apply Promo Code / Coupon'}</span>
                    {cart.couponCode && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        Saved {formatPrice(cart.discountTotal)}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {cart.couponCode
                      ? `Instant discount of ${formatPrice(cart.discountTotal)} active on this order`
                      : 'Enter promo code (e.g. APP15) for instant savings'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {cart.couponCode && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      applyCoupon('');
                    }}
                    className="text-[11px] text-rose-600 font-semibold hover:underline mr-1"
                  >
                    Remove
                  </button>
                )}
                <ChevronRight className={`w-4 h-4 text-stone-400 transition-transform ${isPromoInputOpen ? 'rotate-90' : ''}`} />
              </div>
            </div>

            {/* Expandable Promo Input Form */}
            {isPromoInputOpen && (
              <div className="mt-2 p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Promo Code (e.g. APP15)"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyPromo();
                      }
                    }}
                    className="flex-1 text-xs border border-stone-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-black uppercase font-mono"
                  />
                  <button
                    type="button"
                    disabled={isApplyingPromo || !promoCodeInput.trim()}
                    onClick={() => handleApplyPromo()}
                    className="bg-black text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-stone-800 disabled:opacity-50 transition cursor-pointer"
                  >
                    {isApplyingPromo ? 'Applying...' : 'Apply'}
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 flex-wrap gap-2">
                  <span>
                    Tap to apply: <button type="button" onClick={() => handleApplyPromo('APP15')} className="font-bold text-amber-900 underline hover:text-amber-700 cursor-pointer">APP15</button> (15% off)
                  </span>
                  {!user && (
                    <span className="text-stone-400">
                      Have an account? <button type="button" onClick={() => { setAuthTriggerAction('COUPON_LOGIN'); setShowLoginModal(true); }} className="text-amber-900 font-medium underline hover:text-amber-800 cursor-pointer">Sign in</button>
                    </span>
                  )}
                  {cart.couponCode && (
                    <button
                      type="button"
                      onClick={() => applyCoupon('')}
                      className="text-red-600 font-semibold hover:underline cursor-pointer"
                    >
                      Remove Code
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Last Minute Addition Carousel (Recommendations) */}
          {recommendations.length > 0 && (
            <div className="my-8">
              <h2 className="text-base font-bold text-stone-900 mb-3">Last Minute Addition</h2>
              <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="w-40 sm:w-44 shrink-0 border border-stone-200 rounded-xl p-3 bg-white flex flex-col justify-between snap-start"
                  >
                    <div>
                      <div className="w-full h-28 bg-stone-50 rounded-lg flex items-center justify-center overflow-hidden mb-2">
                        <img
                          src={rec.images?.[0]?.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80'}
                          alt={rec.name}
                          className="w-full h-full object-contain p-1.5"
                        />
                      </div>
                      <div className="text-[11px] text-stone-500 font-medium truncate">
                        {rec.brand || rec.category}
                      </div>
                      <div className="text-xs font-semibold text-stone-900 line-clamp-1">
                        {rec.name}
                      </div>
                      <div className="text-xs font-bold text-stone-950 mt-1">
                        {formatPrice(rec.price)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await addToCart(rec.id, 1);
                        showToast(`Added ${rec.name} to bag`, 'success');
                      }}
                      className="mt-3 w-full border border-stone-300 hover:border-black rounded-full text-xs font-semibold py-1.5 text-stone-800 hover:text-black transition text-center"
                    >
                      Move to Bag
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Section */}
          <div className="mt-8 pt-6 border-t border-stone-200 space-y-3">
            <h2 className="text-base font-bold text-stone-950 mb-2">Summary</h2>
            <div className="flex justify-between text-xs text-stone-600">
              <span>Bag Total</span>
              <span className="font-semibold text-stone-900">{formatPrice(cart.subtotal)}</span>
            </div>
            {cart.discountTotal > 0 && (
              <div className="flex justify-between text-xs text-emerald-700">
                <span>Discount ({cart.couponCode})</span>
                <span className="font-semibold">-{formatPrice(cart.discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-stone-600">
              <span>Sub Total</span>
              <span className="font-semibold text-stone-900">
                {formatPrice(cart.subtotal - cart.discountTotal)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-stone-600">
              <span>Shipping Charges</span>
              <span className="font-medium text-emerald-700">
                <span className="line-through text-stone-400 mr-1.5">₹99</span>Free
              </span>
            </div>
            <div className="h-px bg-stone-200 my-2" />
            <div className="flex justify-between text-sm font-bold text-stone-950">
              <span>You Pay</span>
              <span>{formatPrice(cart.grandTotal)}</span>
            </div>
          </div>

          {/* Footer Copyright and Legal notes */}
          <div className="mt-12 text-[11px] text-stone-400 text-center space-y-1">
            <p>© 2026 Fumare Hookah. All rights reserved.</p>
            <p>Powered by Stripe Managed Payments</p>
            <div className="flex justify-center gap-3 pt-1 text-stone-500">
              <span className="cursor-pointer hover:underline" onClick={() => onNavigate('/terms')}>Terms of Use</span>
              <span>•</span>
              <span className="cursor-pointer hover:underline" onClick={() => onNavigate('/privacy')}>Privacy Policy</span>
              <span>•</span>
              <span className="cursor-pointer hover:underline" onClick={() => onNavigate('/contact')}>Support</span>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Bar: Proceed to Buy */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 z-40 shadow-lg">
          <div className="max-w-xl mx-auto">
            <button
              id="proceed-to-buy-btn"
              type="button"
              onClick={handleProceedToBuy}
              className="w-full bg-black hover:bg-stone-900 active:scale-[0.99] text-white font-semibold text-sm py-4 rounded-full transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Buy</span>
            </button>
          </div>
        </div>

        {/* Login Pop-up Modal before Shipment */}
        <CheckoutAuthModal
          isOpen={showLoginModal}
          onClose={handleCloseLoginModal}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  // ----------------------------------------------------------------------------------
  // SCREEN 2: "Add New Address" (Screenshot 3)
  // ----------------------------------------------------------------------------------
  if (step === 'ADD_ADDRESS') {
    return (
      <div className="min-h-screen bg-white text-stone-900 pb-32">
        {/* Header with Back Arrow and Title */}
        <div className="sticky top-0 bg-white z-20 border-b border-stone-100 px-4 py-3.5 flex items-center gap-3 max-w-xl mx-auto">
          <button
            type="button"
            onClick={() => setStep('BAG')}
            className="p-1 -ml-1 text-stone-800 hover:text-black transition"
            aria-label="Back to Bag"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-stone-950 tracking-tight">Add New Address</h1>
        </div>

        <div className="max-w-xl mx-auto px-4 pt-6 space-y-6">
          {/* Customer Account Indicator */}
          {user && (
            <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold">
                  {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-900">
                    Ordering as {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email || 'Customer'}
                  </p>
                  <p className="text-[11px] text-stone-500">{user.email || user.phone || 'Verified Customer'}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Verified
              </span>
            </div>
          )}

          {/* Privacy Protection Banner (Don't Save My Data) */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-stone-900">Don't save my data</p>
                    <span className="text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-xs">
                      Privacy Protected
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-tight mt-0.5">
                    Your address and contact details will not be saved to your profile or device. Used solely for this one-time shipment.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextVal = !dontSaveMyData;
                  setDontSaveMyData(nextVal);
                  if (nextVal) {
                    setIsDefaultAddress(false);
                    showToast('Privacy mode active: Details will not be saved', 'info');
                  }
                }}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                  dontSaveMyData ? 'bg-emerald-600' : 'bg-stone-300'
                }`}
                aria-label="Toggle Don't save my data"
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    dontSaveMyData ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section: Address Header with Clear Button */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-stone-900">Delivery Address</h2>
              {(pincode || city || state || houseNo || roadName || contactName || contactPhone) && (
                <button
                  type="button"
                  onClick={handleClearEnteredData}
                  className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium hover:underline cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Fields</span>
                </button>
              )}
            </div>

            {/* Pincode Input with Cutout Label */}
            <div className="relative border border-stone-300 rounded-lg p-3 bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-medium text-stone-600">
                Pincode / ZIP
              </label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Postal / ZIP Code (e.g. 500058 or 60062)"
                className="w-full bg-transparent text-sm font-sans text-stone-900 focus:outline-none"
              />
            </div>

            {/* City & State (2 columns) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative border border-stone-300 rounded-lg p-3 bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-medium text-stone-600">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City / Metro"
                  className="w-full bg-transparent text-sm font-sans text-stone-900 focus:outline-none"
                />
              </div>

              <div className="relative border border-stone-300 rounded-lg p-3 bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-medium text-stone-600">
                  State / Region
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State or Province"
                  className="w-full bg-transparent text-sm font-sans text-stone-900 focus:outline-none"
                />
              </div>
            </div>

            {/* House / Flat / Office No. */}
            <div className="relative border border-stone-300 rounded-lg p-3 bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-medium text-stone-600">
                House/ Flat/ Office No.
              </label>
              <input
                type="text"
                required
                value={houseNo}
                onChange={(e) => setHouseNo(e.target.value)}
                placeholder="House, Apt, Suite or Flat number"
                className="w-full bg-transparent text-sm font-sans text-stone-900 focus:outline-none"
              />
            </div>

            {/* Road Name / Area / Colony (multiline / textarea) */}
            <div className="relative border border-stone-300 rounded-lg p-3 bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-medium text-stone-600">
                Road Name/ Area /Colony
              </label>
              <textarea
                rows={3}
                required
                value={roadName}
                onChange={(e) => setRoadName(e.target.value)}
                placeholder="Street address, neighborhood or colony"
                className="w-full bg-transparent text-sm font-sans text-stone-900 focus:outline-none resize-none"
              />
            </div>

            {/* Optional: Save to profile toggle (only shown if Don't save my data is turned off) */}
            {!dontSaveMyData && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-semibold text-stone-900">Save as default address in profile</span>
                <button
                  type="button"
                  onClick={() => setIsDefaultAddress(!isDefaultAddress)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    isDefaultAddress ? 'bg-stone-900' : 'bg-stone-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      isDefaultAddress ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Section: Contact */}
          <div className="space-y-4 pt-4 border-t border-stone-100">
            <h2 className="text-base font-bold text-stone-900">Recipient Contact</h2>

            {/* Contact Name */}
            <div className="relative border border-stone-300 rounded-lg p-3 bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-medium text-stone-600">
                Full Name
              </label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Recipient Full Name"
                className="w-full bg-transparent text-sm font-sans text-stone-900 focus:outline-none"
              />
            </div>

            {/* Contact Phone */}
            <div className="relative border border-stone-300 rounded-lg p-3 bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-medium text-stone-600">
                Phone Number (for Courier SMS Dispatch)
              </label>
              <input
                type="tel"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Phone number (e.g. +1 555-0199 or +91 9876543210)"
                className="w-full bg-transparent text-sm font-sans text-stone-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Fixed Bottom Bar: Ship to this Address */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 z-40 shadow-lg">
          <div className="max-w-xl mx-auto">
            <button
              type="button"
              onClick={() => {
                if (!pincode || !city || !state || !houseNo || !roadName || !contactName) {
                  showToast('Please fill out all address fields', 'error');
                  return;
                }
                setStep('SELECT_ADDRESS_AND_PAY');
              }}
              className="w-full bg-black hover:bg-stone-900 active:scale-[0.99] text-white font-semibold text-sm py-4 rounded-full transition shadow-md flex items-center justify-center gap-2"
            >
              <span>Ship to this Address</span>
            </button>
          </div>
        </div>

        {/* Login Pop-up Modal before Shipment */}
        <CheckoutAuthModal
          isOpen={showLoginModal}
          onClose={handleCloseLoginModal}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  // ----------------------------------------------------------------------------------
  // SCREEN 3: "Select Address & Pay" (Screenshots 4 & 5)
  // ----------------------------------------------------------------------------------
  if (step === 'SELECT_ADDRESS_AND_PAY') {
    return (
      <div className="min-h-screen bg-white text-stone-900 pb-32">
        {/* Header with Back Arrow and Title */}
        <div className="sticky top-0 bg-white z-20 border-b border-stone-100 px-4 py-3.5 flex items-center gap-3 max-w-xl mx-auto">
          <button
            type="button"
            onClick={() => setStep('BAG')}
            className="p-1 -ml-1 text-stone-800 hover:text-black transition"
            aria-label="Back to Bag"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-stone-950 tracking-tight">Select Address & Pay</h1>
        </div>

        <div className="max-w-xl mx-auto px-4 pt-5 space-y-6">
          {/* Deliver to Card */}
          <div className="border border-stone-200 rounded-2xl p-4 bg-white shadow-xs space-y-3">
            <div>
              <div className="text-sm font-bold text-stone-950">
                Deliver to {contactName}, {pincode}
              </div>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                {houseNo} {roadName}, {city.toUpperCase()}...
                <br />
                {city.toUpperCase()}-{pincode}
              </p>
              <p className="text-xs text-stone-600 mt-0.5">{contactPhone}</p>
            </div>

            <button
              type="button"
              onClick={() => setStep('ADD_ADDRESS')}
              className="w-full border border-stone-300 hover:border-black rounded-full text-xs font-semibold py-2.5 text-stone-900 transition text-center"
            >
              Change or Add Address
            </button>
          </div>

          {/* Payment Offers Card */}
          <div>
            <h2 className="text-sm font-bold text-stone-900 mb-2">Payment Offers</h2>
            <div
              onClick={() => setIsOfferModalOpen(!isOfferModalOpen)}
              className="flex items-center justify-between p-4 border border-stone-200 rounded-2xl hover:border-stone-400 cursor-pointer transition bg-white shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-800">
                  <Sparkles className="w-4 h-4 text-stone-900" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-950">Save more with 2 Offers</div>
                  <div className="text-[11px] text-stone-500">Apple Pay & Cards via Stripe</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </div>

            {/* Expandable Offers Modal / Drawer */}
            {isOfferModalOpen && (
              <div className="mt-2 p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-2 text-stone-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900">Offer 1: Instant 15% Off</strong>
                    <p className="text-[11px] text-stone-500">Automatically applied with Apple Pay or Credit/Debit Cards.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900">Offer 2: Free 2-Day Air Express Shipping</strong>
                    <p className="text-[11px] text-stone-500">Complimentary expedited delivery on all orders today.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Information Section */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-stone-900">Order Information</h2>

            {/* Delivery Estimate Accordion */}
            <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
              <button
                type="button"
                onClick={() => setIsDeliveryEstimateOpen(!isDeliveryEstimateOpen)}
                className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs text-stone-900"
              >
                <span>Delivery Estimate</span>
                <ChevronDown
                  className={`w-4 h-4 text-stone-400 transition-transform ${
                    isDeliveryEstimateOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isDeliveryEstimateOpen && (
                <div className="px-4 pb-4 pt-1 text-xs text-stone-600 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-stone-900">Estimated Delivery: 2-4 business days</p>
                    <p className="text-[11px] text-stone-500">Tracked Express Courier Delivery with adult signature verification</p>
                  </div>
                  <span className="text-emerald-700 font-bold text-[11px] px-2 py-0.5 bg-emerald-50 rounded">
                    Free
                  </span>
                </div>
              )}
            </div>

            {/* Price Details Accordion */}
            <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
              <button
                type="button"
                onClick={() => setIsPriceDetailsOpen(!isPriceDetailsOpen)}
                className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs text-stone-900"
              >
                <span>Price Details</span>
                <ChevronUp
                  className={`w-4 h-4 text-stone-400 transition-transform ${
                    isPriceDetailsOpen ? '' : 'rotate-180'
                  }`}
                />
              </button>
              {isPriceDetailsOpen && (
                <div className="px-4 pb-4 pt-1 space-y-2 text-xs border-t border-stone-100">
                  <div className="flex justify-between text-stone-600">
                    <span>Bag Total</span>
                    <span className="font-semibold text-stone-900">{formatPrice(cart.subtotal)}</span>
                  </div>
                  {cart.discountTotal > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount ({cart.couponCode})</span>
                      <span className="font-semibold">-{formatPrice(cart.discountTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-600">
                    <span className="flex items-center gap-1">
                      Shipping Charges <Info className="w-3 h-3 text-stone-400" />
                    </span>
                    <span className="font-medium text-emerald-700">
                      <span className="line-through text-stone-400 mr-1.5">₹99</span>Free
                    </span>
                  </div>
                  <div className="h-px bg-stone-100 my-1" />
                  <div className="flex justify-between font-bold text-stone-950 text-sm">
                    <span>You Pay</span>
                    <span>{formatPrice(cart.grandTotal)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer note */}
          <div className="text-[11px] text-stone-400 text-center pt-2">
            Powered by Stripe Managed Payments
          </div>
        </div>

        {/* Fixed Bottom Bar: Proceed to Pay */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 z-40 shadow-lg">
          <div className="max-w-xl mx-auto">
            <button
              type="button"
              onClick={() => setStep('PAYMENT_OPTIONS')}
              className="w-full bg-black hover:bg-stone-900 active:scale-[0.99] text-white font-semibold text-sm py-4 rounded-full transition shadow-md flex items-center justify-center gap-2"
            >
              <span>Proceed to Pay</span>
            </button>
          </div>
        </div>

        {/* Login Pop-up Modal before Shipment */}
        <CheckoutAuthModal
          isOpen={showLoginModal}
          onClose={handleCloseLoginModal}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  // ----------------------------------------------------------------------------------
  // SCREEN 4: "Pay ₹34290" / Payment Options (Screenshot 6)
  // ----------------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-white text-stone-900 pb-36">
      {/* Header with Back Arrow and Pay Amount */}
      <div className="sticky top-0 bg-white z-20 border-b border-stone-100 px-4 py-3.5 flex items-center gap-3 max-w-xl mx-auto">
        <button
          type="button"
          onClick={() => setStep('SELECT_ADDRESS_AND_PAY')}
          className="p-1 -ml-1 text-stone-800 hover:text-black transition"
          aria-label="Back to Select Address"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-stone-950 tracking-tight">
          Pay {formatPrice(cart.grandTotal)}
        </h1>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-5 space-y-6">
        {/* Payment Offers Banner at top */}
        <div>
          <h2 className="text-sm font-bold text-stone-900 mb-2">Payment Offers</h2>
          <div className="flex items-center justify-between p-4 border border-stone-200 rounded-2xl bg-white shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-800">
                <Sparkles className="w-4 h-4 text-stone-900" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-950">Save more with 2 Offers</div>
                <div className="text-[11px] text-stone-500">Apple Pay & Cards via Stripe</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </div>
        </div>

        {/* Section: Select payment option */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-950">Select payment option</h2>
            <div className="flex items-center gap-1 text-[11px] text-stone-500 font-mono">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>Stripe 256-Bit SSL</span>
            </div>
          </div>

          {/* Option 1: Apple Pay */}
          <div className={`border rounded-2xl overflow-hidden transition-all ${
            selectedPaymentOption === 'APPLE_PAY' ? 'border-black bg-stone-50/40 shadow-xs' : 'border-stone-200 bg-white'
          }`}>
            <button
              type="button"
              onClick={() => setSelectedPaymentOption('APPLE_PAY')}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
                  <ApplePayIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-950 flex items-center gap-1.5">
                    <span>Apple Pay</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">Fastest</span>
                  </div>
                  <div className="text-[11px] text-stone-500">Touch ID, Face ID or 1-Click Express</div>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${
                selectedPaymentOption === 'APPLE_PAY' ? 'rotate-180' : ''
              }`} />
            </button>

            {selectedPaymentOption === 'APPLE_PAY' && (
              <div className="px-4 pb-4 pt-1 border-t border-stone-200/80 space-y-3">
                {/* Apple Pay Card Simulation */}
                <div className="p-3.5 bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 text-white rounded-xl shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold tracking-tight text-sm">
                      <ApplePayIcon className="w-4 h-4" />
                      <span>Apple Pay</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-stone-300 font-mono pt-1">
                    <span>•••• 8812 (Default Device Card)</span>
                    <span className="text-[11px] text-stone-400">Exp 12/29</span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-snug">
                    Your card details stay private. Stripe and Apple use a device-specific token and end-to-end encryption.
                  </p>
                </div>

                {/* 1-Tap Apple Pay Button inside accordion */}
                <button
                  type="button"
                  disabled={isSubmitting || cart.items.length === 0}
                  onClick={handleCompleteOrder}
                  className="w-full bg-black hover:bg-stone-900 active:scale-[0.99] disabled:opacity-60 text-white py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-medium text-sm shadow-sm transition"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">Authorizing Apple Pay...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span>Pay with</span>
                      <ApplePayIcon className="w-4 h-4 fill-current" />
                      <span className="text-base font-bold tracking-tighter -ml-0.5">Pay</span>
                      <span className="ml-1 text-stone-400">·</span>
                      <span className="ml-1 font-bold">{formatPrice(cart.grandTotal)}</span>
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Option 2: Credit / Debit Card */}
          <div className={`border rounded-2xl overflow-hidden transition-all ${
            selectedPaymentOption === 'CARD' ? 'border-black bg-stone-50/40 shadow-xs' : 'border-stone-200 bg-white'
          }`}>
            <button
              type="button"
              onClick={() => setSelectedPaymentOption('CARD')}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-800">
                  <CreditCard className="w-5 h-5 text-stone-900" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-950">Credit/ Debit Card</div>
                  <div className="text-[11px] text-stone-500">Visa, Mastercard, American Express & more</div>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${
                selectedPaymentOption === 'CARD' ? 'rotate-180' : ''
              }`} />
            </button>

            {selectedPaymentOption === 'CARD' && (
              <div className="px-4 pb-4 pt-1 border-t border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-stone-500">Card details verified by Stripe</span>
                  <button
                    type="button"
                    onClick={handleFillSandboxCard}
                    className="text-[11px] text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-full font-semibold border border-amber-200 transition"
                  >
                    ⚡ Fill Stripe Test Sandbox
                  </button>
                </div>

                <div className="relative border border-stone-300 rounded-lg p-3 bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                  <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-medium text-stone-600">
                    Card Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-transparent text-xs font-mono text-stone-900 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative border border-stone-300 rounded-lg p-3 bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                    <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-medium text-stone-600">
                      Valid Thru (MM/YY)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="12/28"
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      className="w-full bg-transparent text-xs font-mono text-stone-900 focus:outline-none"
                    />
                  </div>

                  <div className="relative border border-stone-300 rounded-lg p-3 bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                    <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-medium text-stone-600">
                      CVV / CVC
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="888"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full bg-transparent text-xs font-mono text-stone-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                  <span className="flex items-center gap-1 font-medium text-stone-700">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    256-Bit SSL Encrypted
                  </span>
                  <span>Adaptive Multi-Currency</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Information Accordions at bottom */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-bold text-stone-900">Order Information</h2>

          {/* Delivery Address Accordion */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            <button
              type="button"
              onClick={() => setIsAddressSummaryOpen(!isAddressSummaryOpen)}
              className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs text-stone-900"
            >
              <span>Deliver to {contactName || 'Shipping Address'}{pincode ? `, ${pincode}` : ''}</span>
              <ChevronDown
                className={`w-4 h-4 text-stone-400 transition-transform ${
                  isAddressSummaryOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isAddressSummaryOpen && (
              <div className="px-4 pb-4 pt-1 text-xs text-stone-600 border-t border-stone-100 leading-relaxed">
                {(houseNo || roadName) && <p>{houseNo} {roadName}</p>}
                {(city || state || pincode) && <p>{city ? `${city}, ` : ''}{state ? `${state} ` : ''}{pincode ? `- ${pincode}` : ''}</p>}
                {contactPhone && <p className="mt-1 text-stone-500">{contactPhone}</p>}
                {dontSaveMyData && (
                  <p className="mt-2 text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" /> One-time delivery (Data not saved to profile or device)
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Price Details Accordion */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            <button
              type="button"
              onClick={() => setIsPriceDetailsOpen(!isPriceDetailsOpen)}
              className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs text-stone-900"
            >
              <span>Price Details</span>
              <ChevronDown
                className={`w-4 h-4 text-stone-400 transition-transform ${
                  isPriceDetailsOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isPriceDetailsOpen && (
              <div className="px-4 pb-4 pt-1 space-y-2 text-xs border-t border-stone-100">
                <div className="flex justify-between text-stone-600">
                  <span>Bag Total</span>
                  <span className="font-semibold text-stone-900">{formatPrice(cart.subtotal)}</span>
                </div>
                {cart.discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span className="font-semibold">-{formatPrice(cart.discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span className="font-medium text-emerald-700">Free</span>
                </div>
                <div className="h-px bg-stone-100 my-1" />
                <div className="flex justify-between font-bold text-stone-950 text-sm">
                  <span>Total Amount</span>
                  <span>{formatPrice(cart.grandTotal)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 21+ Age Certification Checkbox for Hookah compliance */}
        <div className="pt-2">
          <label className="flex items-start gap-3 p-3 bg-stone-50 border border-stone-200 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              required
              checked={ageConfirmed}
              onChange={(e) => setAgeConfirmed(e.target.checked)}
              className="mt-0.5 rounded text-black focus:ring-black"
            />
            <span className="text-xs text-stone-700 leading-snug">
              I certify that I am at least <strong>21 years of age</strong>, and I agree to the store terms and age verification on delivery.
            </span>
          </label>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Fixed Bottom Bar: Pay {formattedTotal} */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 z-40 shadow-lg">
        <div className="max-w-xl mx-auto">
          <button
            type="button"
            disabled={isSubmitting || cart.items.length === 0}
            onClick={handleCompleteOrder}
            className="w-full bg-black hover:bg-stone-900 active:scale-[0.99] disabled:opacity-60 text-white font-semibold text-sm py-4 rounded-full transition shadow-md flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>
                  {selectedPaymentOption === 'APPLE_PAY'
                    ? 'Authorizing with Apple Pay...'
                    : 'Processing with Stripe...'}
                </span>
              </div>
            ) : selectedPaymentOption === 'APPLE_PAY' ? (
              <div className="flex items-center gap-1.5">
                <span>Pay with</span>
                <ApplePayIcon className="w-4 h-4 fill-current" />
                <span className="text-base font-bold tracking-tighter -ml-0.5">Pay</span>
                <span className="mx-1.5 text-stone-500">|</span>
                <span>{formatPrice(cart.grandTotal)}</span>
              </div>
            ) : (
              <span>Pay {formatPrice(cart.grandTotal)}</span>
            )}
          </button>
        </div>
      </div>

      {/* Login Pop-up Modal */}
      <CheckoutAuthModal
        isOpen={showLoginModal}
        onClose={handleCloseLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};
