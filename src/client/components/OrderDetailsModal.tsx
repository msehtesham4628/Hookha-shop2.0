import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types/index.js';
import { useStore } from '../store/useStore.js';
import {
  X,
  Package,
  Truck,
  Calendar,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  Clock,
  CreditCard,
  Tag,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  ShoppingBag,
  ArrowRight,
  Download
} from 'lucide-react';
import { EmailPdfModal } from './EmailPdfModal.js';
import { downloadOrderInvoicePDF } from '../utils/pdfGenerator.js';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose, onNavigate }) => {
  const { addToCart, showToast } = useStore();
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [isEmailPdfOpen, setIsEmailPdfOpen] = useState(false);

  const handleDownloadPdf = () => {
    if (!order) return;
    try {
      downloadOrderInvoicePDF(order);
      showToast('Downloading official invoice PDF...', 'success');
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      showToast('Failed to generate invoice PDF', 'error');
    }
  };

  if (!order) return null;

  const currentStatus = (order.orderStatus || order.status || 'PLACED') as string;
  const grandTotal = order.grandTotal ?? order.total ?? 0;
  const subtotal = order.subtotal ?? (grandTotal - (order.shippingFee ?? 0) - (order.tax ?? order.estimatedTax ?? 0) + (order.discountTotal ?? order.discount ?? 0));
  const shippingFee = order.shippingFee ?? 0;
  const tax = order.tax ?? order.estimatedTax ?? 0;
  const discountTotal = order.discountTotal ?? order.discount ?? 0;
  const trackingNumber = order.trackingNumber || 'WH-TRK-7892401';
  const carrier = order.carrier || 'UPS Express (Guaranteed 2-Day)';

  // Helper to generate real carrier tracking link
  const getTrackingUrl = (trk: string, car?: string) => {
    const c = car?.toLowerCase() || '';
    if (c.includes('ups') || trk.startsWith('1Z')) {
      return `https://www.ups.com/track?tracknum=${encodeURIComponent(trk)}`;
    }
    if (c.includes('fedex')) {
      return `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(trk)}`;
    }
    if (c.includes('dhl')) {
      return `https://www.dhl.com/en/express/tracking.html?AWB=${encodeURIComponent(trk)}`;
    }
    if (c.includes('usps')) {
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(trk)}`;
    }
    return `https://parcelsapp.com/en/tracking/${encodeURIComponent(trk)}`;
  };

  const handleCopyTracking = () => {
    if (!trackingNumber) return;
    navigator.clipboard.writeText(trackingNumber);
    setCopiedTracking(true);
    showToast('Tracking number copied to clipboard', 'success');
    setTimeout(() => setCopiedTracking(false), 2500);
  };

  const handleReorder = async () => {
    try {
      setReordering(true);
      for (const item of order.items) {
        if (item.productId) {
          await addToCart(
            item.productId,
            item.quantity || 1,
            item.flavor || (item as any).selectedFlavor,
            item.color || (item as any).selectedColor
          );
        }
      }
      showToast('All items added to your cart!', 'success');
      onClose();
      onNavigate('/cart');
    } catch (err) {
      console.error('Failed to reorder items:', err);
      showToast('Error adding items to cart', 'error');
    } finally {
      setReordering(false);
    }
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Delivered</span>
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[11px] font-bold bg-sky-100 text-sky-900 border border-sky-300">
            <Truck className="w-3.5 h-3.5 text-sky-700" />
            <span>In Transit (Shipped)</span>
          </span>
        );
      case 'PROCESSING':
      case 'PACKED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Package className="w-3.5 h-3.5 text-amber-700" />
            <span>Master Packing</span>
          </span>
        );
      case 'PAYMENT_CONFIRMED':
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Payment Verified</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
            <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
            <span>Cancelled</span>
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[11px] font-bold bg-stone-200 text-stone-800 border border-stone-300">
            <span>Refunded</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>Order Placed</span>
          </span>
        );
    }
  };

  // Progression Stepper logic
  const steps = [
    { label: 'Placed', status: 'PLACED', desc: 'Order received & logged' },
    { label: 'Payment', status: 'PAYMENT_CONFIRMED', desc: 'Securely authorized' },
    { label: 'Packing', status: 'PROCESSING', desc: 'Polyfoam cushioned' },
    { label: 'Shipped', status: 'SHIPPED', desc: 'Carrier in-transit' },
    { label: 'Delivered', status: 'DELIVERED', desc: 'Adult 21+ Signature' }
  ];

  const getStepIndex = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'DELIVERED') return 4;
    if (s === 'SHIPPED') return 3;
    if (s === 'PROCESSING' || s === 'PACKED') return 2;
    if (s === 'PAYMENT_CONFIRMED' || s === 'PAID') return 1;
    return 0;
  };

  const currentStepIdx = getStepIndex(currentStatus);

  return (
    <div
      id="order-details-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="order-details-modal-content"
        className="relative max-w-4xl w-full bg-white rounded-xs shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xs bg-amber-900/60 border border-amber-600/40 text-amber-300 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-base sm:text-lg font-bold text-stone-100 tracking-tight">
                  Order #{order.orderNumber}
                </h2>
                <span className="text-stone-400 text-xs hidden sm:inline">•</span>
                <span className="text-stone-400 text-xs hidden sm:inline">
                  {new Date(order.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-[11px] text-amber-200/80 font-mono">
                Dossier Reference: {order.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="order-details-email-pdf-btn"
              type="button"
              onClick={() => setIsEmailPdfOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-900 hover:bg-amber-800 text-white text-xs font-semibold rounded-xs transition-colors cursor-pointer shadow-2xs"
              title="Email official PDF invoice"
            >
              <Mail className="w-3.5 h-3.5 text-amber-300" />
              <span>Email PDF</span>
            </button>

            <button
              id="order-details-download-pdf-btn"
              type="button"
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-xs transition-colors cursor-pointer"
              title="Download invoice PDF"
            >
              <Download className="w-3.5 h-3.5 text-stone-400" />
              <span>PDF</span>
            </button>

            <button
              onClick={() => window.print()}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xs transition-colors cursor-pointer"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              id="close-order-details-btn"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xs transition-colors cursor-pointer"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Top Status & Summary Bar */}
          <div className="bg-stone-50 border border-stone-200 rounded-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                  Current Status
                </span>
                <div className="mt-1">{getStatusBadge(currentStatus)}</div>
              </div>

              <div className="h-8 w-px bg-stone-200 hidden sm:block" />

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                  Payment Status
                </span>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-stone-800 font-mono">
                  <CreditCard className="w-3.5 h-3.5 text-stone-500" />
                  {order.paymentStatus || 'PAID'} ({order.paymentMethod || 'Credit Card'})
                </span>
              </div>

              <div className="h-8 w-px bg-stone-200 hidden sm:block" />

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                  Items Count
                </span>
                <span className="mt-1 inline-block text-xs font-semibold text-stone-800">
                  {order.items.reduce((acc, i) => acc + (i.quantity || 1), 0)} Units
                </span>
              </div>
            </div>

            <div className="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-stone-200">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                Grand Total
              </span>
              <span className="font-serif text-xl font-bold text-amber-950">
                ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Stepper / Fulfillment Progression */}
          <div className="border border-stone-200 rounded-xs p-5 bg-white">
            <h3 className="text-xs uppercase font-bold tracking-wider text-stone-800 mb-4 flex items-center justify-between">
              <span>Fulfillment Progression</span>
              <span className="text-[11px] font-normal normal-case text-stone-500">
                Carrier: <strong className="text-stone-800">{carrier}</strong>
              </span>
            </h3>

            <div className="grid grid-cols-5 gap-2 relative">
              {/* Connecting line behind icons */}
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-stone-200 -z-0" />
              <div
                className="absolute top-4 left-6 h-0.5 bg-amber-800 -z-0 transition-all duration-500"
                style={{ width: `${(currentStepIdx / 4) * 88}%` }}
              />

              {steps.map((st, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={st.label} className="relative z-10 flex flex-col items-center text-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white transition-colors ${
                        isPassed
                          ? isCurrent
                            ? 'bg-amber-800 text-white shadow-md'
                            : 'bg-emerald-700 text-white'
                          : 'bg-stone-200 text-stone-400'
                      }`}
                    >
                      {isPassed && !isCurrent ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] font-bold mt-2 leading-tight ${
                        isCurrent ? 'text-amber-900' : isPassed ? 'text-stone-900' : 'text-stone-400'
                      }`}
                    >
                      {st.label}
                    </span>
                    <span className="text-[9px] text-stone-400 hidden sm:block mt-0.5 max-w-[80px] leading-tight">
                      {st.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Tracking & Carrier Action Card */}
          <div className="bg-amber-50/50 border border-amber-200/80 rounded-xs p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-900" />
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  Shipment Tracking
                </span>
                <span className="bg-amber-200/70 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-xs">
                  {carrier.split(' ')[0]}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-stone-600">Tracking Code:</span>
                <code className="font-mono text-xs font-bold text-stone-900 bg-white px-2 py-0.5 rounded-xs border border-amber-200 shadow-2xs">
                  {trackingNumber}
                </code>
                <button
                  onClick={handleCopyTracking}
                  className="inline-flex items-center gap-1 text-[11px] text-amber-900 font-semibold hover:underline bg-white px-2 py-0.5 rounded-xs border border-amber-200 cursor-pointer shadow-2xs"
                  title="Copy tracking code"
                >
                  {copiedTracking ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedTracking ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[11px] text-stone-500">
                Insured priority dispatch with real-time telematics and adult signature confirmation on handover.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <a
                href={getTrackingUrl(trackingNumber, carrier)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-amber-900 hover:bg-amber-950 text-white text-xs font-semibold px-4 py-2.5 rounded-xs transition-colors shadow-xs"
              >
                <span>Track on Carrier Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Ordered Products Table */}
          <div className="border border-stone-200 rounded-xs overflow-hidden">
            <div className="bg-stone-100/80 px-4 py-2.5 border-b border-stone-200 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                Acquired Items ({order.items.length})
              </h4>
              <span className="text-[11px] text-stone-500 font-mono">
                Subtotal: ${subtotal.toFixed(2)}
              </span>
            </div>

            <div className="divide-y divide-stone-100">
              {order.items.map((item, idx) => {
                const itemPrice = (item.price ?? (item as any).unitPrice ?? ((item.subtotal || (item as any).totalPrice || 0) / (item.quantity || 1))) || 0;
                const itemTotal = item.subtotal ?? (item as any).totalPrice ?? (itemPrice * item.quantity);
                const flavor = item.flavor || (item as any).selectedFlavor;
                const color = item.color || (item as any).selectedColor;
                const sku = item.productSku || `SKU-${order.orderNumber}-${idx + 1}`;
                const img = item.productImage || 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=200';

                return (
                  <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xs border border-stone-200 bg-white p-1 shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={img}
                          alt={item.productName}
                          className="max-h-full max-w-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="text-xs font-bold text-stone-900 leading-snug">
                          {item.productName}
                        </h5>
                        <div className="flex items-center gap-2 flex-wrap text-[11px] text-stone-500">
                          <span>SKU: <strong className="font-mono text-stone-700">{sku}</strong></span>
                          {flavor && (
                            <>
                              <span>•</span>
                              <span className="text-amber-900 font-medium bg-amber-50 px-1.5 py-0.2 rounded-xs border border-amber-200">
                                Flavor: {flavor}
                              </span>
                            </>
                          )}
                          {color && (
                            <>
                              <span>•</span>
                              <span className="text-stone-700">Finish: {color}</span>
                            </>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          ${itemPrice.toFixed(2)} × {item.quantity} units
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100">
                      <span className="text-xs font-bold font-mono text-stone-900">
                        ${itemTotal.toFixed(2)}
                      </span>
                      {item.productId && (
                        <button
                          onClick={() => {
                            onClose();
                            onNavigate(`/product/${item.productId}`);
                          }}
                          className="text-[11px] text-amber-900 hover:underline flex items-center gap-0.5 mt-1 cursor-pointer"
                        >
                          <span>View Item</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lower Grid: Address, Payment & Financial Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Delivery Address & Customer Data */}
            <div className="md:col-span-6 space-y-4">
              <div className="border border-stone-200 rounded-xs p-4 bg-white space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                  <MapPin className="w-4 h-4 text-amber-900" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                    Shipping & Handover Address
                  </h4>
                </div>

                <div className="text-xs text-stone-700 space-y-1">
                  <p className="font-bold text-stone-900">
                    {order.shippingAddress?.fullName || order.customerName || 'Private Client'}
                  </p>
                  <p className="text-stone-600">
                    {order.shippingAddress?.addressLine1 || (order.shippingAddress as any)?.street || '9465 Wilshire Blvd, Suite 800'}
                  </p>
                  {(order.shippingAddress?.addressLine2 || (order.shippingAddress as any)?.suite) && (
                    <p className="text-stone-600">{order.shippingAddress?.addressLine2 || (order.shippingAddress as any)?.suite}</p>
                  )}
                  <p className="text-stone-600">
                    {order.shippingAddress?.city || 'Beverly Hills'}, {order.shippingAddress?.state || 'CA'} {order.shippingAddress?.postalCode || (order.shippingAddress as any)?.zip || '90212'}
                  </p>
                  <p className="text-stone-600 font-medium">
                    {order.shippingAddress?.country || 'United States'}
                  </p>
                  
                  <div className="pt-2 mt-2 border-t border-stone-100 text-[11px] text-stone-500 space-y-0.5">
                    {order.customerEmail && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-stone-400" />
                        <span>{order.customerEmail}</span>
                      </div>
                    )}
                    {order.customerPhone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span>{order.customerPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Notes / Instructions if any */}
              {order.notes && (
                <div className="border border-stone-200 rounded-xs p-3.5 bg-stone-50 text-xs">
                  <span className="font-bold text-stone-800 block mb-1">Customer Delivery Instructions:</span>
                  <p className="text-stone-600 italic">{order.notes}</p>
                </div>
              )}
            </div>

            {/* Financial Ledger & Summary */}
            <div className="md:col-span-6 border border-stone-200 rounded-xs p-4 bg-white space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                <FileText className="w-4 h-4 text-amber-900" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  Financial Ledger
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({order.items.length} items)</span>
                  <span className="font-mono font-medium text-stone-900">${subtotal.toFixed(2)}</span>
                </div>

                {discountTotal > 0 && (
                  <div className="flex justify-between text-amber-900 font-semibold bg-amber-50/70 px-2 py-1 rounded-xs">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>Promotional Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                    </span>
                    <span className="font-mono">-${discountTotal.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <span>Insured Express Shipping</span>
                  <span className="font-mono font-medium text-stone-900">
                    {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Estimated Tax & Duty</span>
                  <span className="font-mono font-medium text-stone-900">
                    ${tax.toFixed(2)}
                  </span>
                </div>

                <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-bold text-stone-900">Grand Total</span>
                    <span className="text-[10px] text-stone-400 block font-normal">
                      Settled in USD
                    </span>
                  </div>
                  <span className="font-serif text-lg font-bold text-amber-950 font-mono">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Timeline Audit Logs if present */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="border border-stone-200 rounded-xs p-4 bg-stone-50/60 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                Logistics Event Log
              </h4>
              <div className="space-y-1.5">
                {order.timeline.map((event, i) => (
                  <div key={i} className="flex items-start justify-between text-[11px] py-1 border-b border-stone-200/50 last:border-0">
                    <div>
                      <strong className="text-stone-900 uppercase tracking-tight mr-2">{event.status}:</strong>
                      <span className="text-stone-600">{event.note || 'Status updated'}</span>
                    </div>
                    <span className="text-stone-400 font-mono shrink-0 ml-2">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="bg-stone-50 border-t border-stone-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onNavigate(`/order-success?orderId=${order.id}`);
              }}
              className="text-xs font-semibold text-stone-700 hover:text-stone-950 flex items-center gap-1 border border-stone-300 bg-white px-3.5 py-2 rounded-xs hover:bg-stone-100 transition-colors w-full sm:w-auto justify-center"
            >
              <FileText className="w-3.5 h-3.5 text-stone-500" />
              <span>Full Order Dossier</span>
            </button>
            
            <a
              href={getTrackingUrl(trackingNumber, carrier)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-amber-900 hover:text-amber-950 flex items-center gap-1 border border-amber-300 bg-amber-50/80 px-3.5 py-2 rounded-xs hover:bg-amber-100 transition-colors w-full sm:w-auto justify-center"
            >
              <Truck className="w-3.5 h-3.5 text-amber-800" />
              <span>Direct Carrier Tracking</span>
            </a>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleReorder}
              disabled={reordering}
              className="w-full sm:w-auto bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold px-5 py-2 rounded-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{reordering ? 'Adding Items...' : 'Reorder Entire Basket'}</span>
            </button>
          </div>
        </div>

        {/* Email Invoice PDF Modal */}
        {order && (
          <EmailPdfModal
            isOpen={isEmailPdfOpen}
            onClose={() => setIsEmailPdfOpen(false)}
            order={order}
            initialEmail={order.customerEmail}
            onSuccess={(msg) => showToast(msg, 'success')}
          />
        )}

      </div>
    </div>
  );
};
