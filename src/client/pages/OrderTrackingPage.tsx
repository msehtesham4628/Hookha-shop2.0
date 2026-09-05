import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore.js';
import { api } from '../services/api.js';
import { Order } from '../../types/index.js';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Search,
  ArrowRight,
  ChevronRight,
  Calendar,
  MapPin,
  ShieldCheck,
  Phone,
  Mail,
  RefreshCw,
  Box,
  Share2,
  HelpCircle,
  FileText,
  BadgeAlert,
  Download
} from 'lucide-react';
import { EmailPdfModal } from '../components/EmailPdfModal.js';
import { downloadOrderInvoicePDF } from '../utils/pdfGenerator.js';

interface OrderTrackingPageProps {
  initialOrderId?: string;
  onNavigate: (path: string) => void;
}

interface TrackingData {
  order: Order;
  trackingInfo: {
    carrier: string;
    trackingNumber: string;
    trackingUrl: string;
    status: string;
    statusBadge: string;
    progressPercent: number;
    estimatedDelivery: string;
    isDelivered: boolean;
    isOutForDelivery: boolean;
    isInTransit: boolean;
  };
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ initialOrderId, onNavigate }) => {
  const { showToast } = useStore();
  const [query, setQuery] = useState<string>(initialOrderId || '');
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [result, setResult] = useState<TrackingData | null>(null);
  const [copiedTracking, setCopiedTracking] = useState<boolean>(false);
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);
  const [isEmailPdfOpen, setIsEmailPdfOpen] = useState<boolean>(false);

  const handleDownloadPdf = () => {
    if (!result?.order) return;
    try {
      downloadOrderInvoicePDF(result.order);
      showToast('Downloading official commercial invoice PDF...', 'success');
    } catch (err: any) {
      console.error('Failed to download invoice PDF:', err);
      showToast('Failed to generate invoice PDF', 'error');
    }
  };

  // Auto-search if initialOrderId is provided in URL
  useEffect(() => {
    if (initialOrderId) {
      handleTrack(initialOrderId);
    }
  }, [initialOrderId]);

  const handleTrack = async (searchQuery?: string) => {
    const targetQuery = (searchQuery || query).trim();
    if (!targetQuery) {
      setErrorMsg('Please enter an Order ID, Order Number, or Tracking Number.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.trackOrder(targetQuery, email.trim() || undefined);

      if (res.success && res.data) {
        setResult(res.data);
        // Sync URL query without full reload
        const newUrl = `/track-order?orderId=${encodeURIComponent(res.data.order.orderNumber)}`;
        window.history.replaceState({}, '', newUrl);
      } else {
        setErrorMsg('Order could not be located. Please verify your reference number.');
        setResult(null);
      }
    } catch (err: any) {
      const msg = err.message || 'Unable to retrieve tracking information. Please check the Order ID.';
      setErrorMsg(msg);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTracking = (trackingNum: string) => {
    if (!trackingNum) return;
    navigator.clipboard.writeText(trackingNum);
    setCopiedTracking(true);
    showToast('Tracking number copied to clipboard', 'success');
    setTimeout(() => setCopiedTracking(false), 2500);
  };

  const handleShareTracking = () => {
    if (!result) return;
    const url = `${window.location.origin}/track-order?orderId=${encodeURIComponent(result.order.orderNumber)}`;
    navigator.clipboard.writeText(url);
    setCopiedShareLink(true);
    showToast('Direct tracking link copied to clipboard', 'success');
    setTimeout(() => setCopiedShareLink(false), 2500);
  };

  // 5 Standard Milestones
  const getMilestones = (status: string) => {
    const s = (status || '').toUpperCase();
    return [
      {
        id: 'placed',
        label: 'Order Placed',
        desc: 'Payment captured and order received',
        done: ['PLACED', 'PAYMENT_CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(s),
        current: s === 'PLACED'
      },
      {
        id: 'confirmed',
        label: 'Inspected & Packed',
        desc: 'Fragile glassware protected with impact foam',
        done: ['PAYMENT_CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(s),
        current: s === 'PAYMENT_CONFIRMED' || s === 'PROCESSING' || s === 'PACKED'
      },
      {
        id: 'shipped',
        label: 'Dispatched & In Transit',
        desc: 'Package handed over to carrier air logistics',
        done: ['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(s),
        current: s === 'SHIPPED' || s === 'IN_TRANSIT'
      },
      {
        id: 'out',
        label: 'Out for Delivery',
        desc: 'Courier vehicle on final delivery route',
        done: ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(s),
        current: s === 'OUT_FOR_DELIVERY'
      },
      {
        id: 'delivered',
        label: 'Delivered',
        desc: 'Adult 21+ physical ID signature confirmed',
        done: s === 'DELIVERED',
        current: s === 'DELIVERED'
      }
    ];
  };

  const getStatusTheme = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'DELIVERED') {
      return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-900',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        dot: 'bg-emerald-600',
        bar: 'bg-emerald-600'
      };
    }
    if (s === 'OUT_FOR_DELIVERY') {
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-950',
        badge: 'bg-amber-100 text-amber-900 border-amber-300',
        dot: 'bg-amber-600',
        bar: 'bg-amber-600'
      };
    }
    if (s === 'SHIPPED' || s === 'IN_TRANSIT') {
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-950',
        badge: 'bg-blue-100 text-blue-900 border-blue-300',
        dot: 'bg-blue-600',
        bar: 'bg-blue-600'
      };
    }
    if (s === 'PROCESSING' || s === 'PACKED') {
      return {
        bg: 'bg-stone-50',
        border: 'border-stone-300',
        text: 'text-stone-900',
        badge: 'bg-stone-200 text-stone-800 border-stone-300',
        dot: 'bg-stone-700',
        bar: 'bg-stone-700'
      };
    }
    if (s === 'CANCELLED' || s === 'REFUNDED') {
      return {
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        text: 'text-rose-950',
        badge: 'bg-rose-100 text-rose-800 border-rose-300',
        dot: 'bg-rose-600',
        bar: 'bg-rose-600'
      };
    }
    return {
      bg: 'bg-stone-50',
      border: 'border-stone-200',
      text: 'text-stone-900',
      badge: 'bg-stone-100 text-stone-800 border-stone-200',
      dot: 'bg-stone-600',
      bar: 'bg-stone-600'
    };
  };

  return (
    <div className="min-h-screen bg-stone-100/60 pb-16">
      {/* Breadcrumb Header Bar */}
      <div className="bg-white border-b border-stone-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-stone-500">
            <button
              onClick={() => onNavigate('/')}
              className="hover:text-amber-900 transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <button
              onClick={() => onNavigate('/account')}
              className="hover:text-amber-900 transition-colors cursor-pointer"
            >
              Customer Care
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-900 font-medium">Order Tracking</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px] font-semibold tracking-wide uppercase mb-3">
            <Truck className="w-3.5 h-3.5 text-amber-800" />
            Live Shipment Dispatch
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            Order & Shipment Tracker
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
            Enter your Order ID, reference number, or carrier tracking code to monitor real-time fulfillment, transit location, and carrier tracking links.
          </p>
        </div>

        {/* Search Box Card */}
        <div className="bg-white border border-stone-200 rounded-sm p-5 sm:p-7 shadow-xs mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTrack();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
              {/* Order ID / Tracking Number Input */}
              <div className="md:col-span-7 space-y-1.5">
                <label htmlFor="order-tracking-input" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Order ID or Tracking Code <span className="text-amber-900">*</span>
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="order-tracking-input"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. SLT-2026-1003 or 9400111899..."
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xs text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-800 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              {/* Optional Email Input */}
              <div className="md:col-span-3 space-y-1.5">
                <label htmlFor="order-email-input" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Billing Email <span className="text-stone-400 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="order-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xs text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-800 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 flex items-end">
                <button
                  id="submit-order-track-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold uppercase tracking-wider py-3 px-4 rounded-xs transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer h-[42px]"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Tracking...</span>
                    </>
                  ) : (
                    <>
                      <span>Track Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Demo Fill Pills */}
            <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-stone-500 text-[11px] font-medium flex items-center gap-1">
                <FileText className="w-3 h-3 text-amber-800" />
                Quick Test Reference IDs:
              </span>
              <button
                type="button"
                onClick={() => {
                  setQuery('SLT-2026-1004');
                  setEmail('customer@example.com');
                  handleTrack('SLT-2026-1004');
                }}
                className="bg-stone-100 hover:bg-amber-100/70 border border-stone-200 text-stone-800 text-[11px] px-2.5 py-1 rounded-xs transition-colors font-mono cursor-pointer"
              >
                SLT-2026-1004 (DHL Out for Delivery)
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery('SLT-2026-1003');
                  setEmail('customer@example.com');
                  handleTrack('SLT-2026-1003');
                }}
                className="bg-stone-100 hover:bg-amber-100/70 border border-stone-200 text-stone-800 text-[11px] px-2.5 py-1 rounded-xs transition-colors font-mono cursor-pointer"
              >
                SLT-2026-1003 (FedEx In Transit)
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery('SLT-2026-1001');
                  setEmail('customer@example.com');
                  handleTrack('SLT-2026-1001');
                }}
                className="bg-stone-100 hover:bg-amber-100/70 border border-stone-200 text-stone-800 text-[11px] px-2.5 py-1 rounded-xs transition-colors font-mono cursor-pointer"
              >
                SLT-2026-1001 (UPS Delivered)
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery('SLT-2026-1002');
                  setEmail('customer@example.com');
                  handleTrack('SLT-2026-1002');
                }}
                className="bg-stone-100 hover:bg-amber-100/70 border border-stone-200 text-stone-800 text-[11px] px-2.5 py-1 rounded-xs transition-colors font-mono cursor-pointer"
              >
                SLT-2026-1002 (Processing)
              </button>
            </div>
          </form>

          {/* Error Notice */}
          {errorMsg && (
            <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xs flex items-start gap-3 text-xs text-rose-900">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Unable to Locate Shipment</p>
                <p className="text-rose-800">{errorMsg}</p>
                <p className="text-[11px] text-rose-600">
                  Tip: Reference codes are formatted like <span className="font-mono font-semibold">SLT-2026-XXXX</span> or carrier numbers like <span className="font-mono">1Z...</span> / <span className="font-mono">9400...</span>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tracking Results View */}
        {result && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 1. Main Shipment Header Card */}
            {(() => {
              const theme = getStatusTheme(result.trackingInfo.status);
              const milestones = getMilestones(result.trackingInfo.status);

              return (
                <div className={`bg-white border ${theme.border} rounded-sm shadow-xs overflow-hidden`}>
                  {/* Top Status Header */}
                  <div className={`p-5 sm:p-6 ${theme.bg} border-b ${theme.border}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-xs border ${theme.badge}`}>
                            {result.trackingInfo.statusBadge}
                          </span>
                          <span className="text-xs text-stone-500 font-mono">
                            Order #{result.order.orderNumber}
                          </span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
                          Estimated Delivery: {result.trackingInfo.estimatedDelivery}
                        </h2>
                        <p className="text-xs text-stone-600 mt-0.5">
                          Carrier: <strong className="text-stone-800">{result.trackingInfo.carrier}</strong>
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          id="order-tracking-email-pdf-btn"
                          type="button"
                          onClick={() => setIsEmailPdfOpen(true)}
                          className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          title="Email official PDF invoice"
                        >
                          <Mail className="w-3.5 h-3.5 text-amber-300" />
                          <span>Email PDF</span>
                        </button>

                        <button
                          id="order-tracking-download-pdf-btn"
                          type="button"
                          onClick={handleDownloadPdf}
                          className="px-3 py-2 bg-white border border-stone-200 hover:border-stone-400 text-stone-700 text-xs rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Download invoice PDF"
                        >
                          <Download className="w-3.5 h-3.5 text-stone-500" />
                          <span>PDF</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleShareTracking}
                          className="px-3 py-2 bg-white border border-stone-200 hover:border-stone-400 text-stone-700 text-xs rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Share direct tracking link"
                        >
                          {copiedShareLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-stone-500" />}
                          <span>{copiedShareLink ? 'Link Copied' : 'Share'}</span>
                        </button>

                        <a
                          id="carrier-portal-direct-btn"
                          href={result.trackingInfo.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-amber-900 hover:bg-amber-800 text-white text-xs font-semibold rounded-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <span>Carrier Website</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between text-xs text-stone-600 mb-1.5">
                        <span className="font-semibold">Transit Progress</span>
                        <span className="font-mono font-bold text-stone-800">{result.trackingInfo.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-stone-200/80 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${theme.bar} transition-all duration-700 ease-out`}
                          style={{ width: `${result.trackingInfo.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 5-Step Visual Milestone Stepper */}
                  <div className="p-5 sm:p-7 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 sm:gap-2">
                      {milestones.map((m, idx) => (
                        <div key={m.id} className="relative flex sm:flex-col items-start sm:items-center text-left sm:text-center group">
                          {/* Connector line for desktop */}
                          {idx < milestones.length - 1 && (
                            <div
                              className={`hidden sm:block absolute top-4 left-1/2 w-full h-0.5 z-0 ${
                                m.done && milestones[idx + 1].done ? 'bg-amber-800' : 'bg-stone-200'
                              }`}
                            />
                          )}

                          {/* Step Icon Badge */}
                          <div
                            className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mr-3 sm:mr-0 sm:mb-2 transition-all ${
                              m.current
                                ? 'bg-amber-900 text-white ring-4 ring-amber-100 shadow-xs'
                                : m.done
                                ? 'bg-stone-900 text-white'
                                : 'bg-stone-100 text-stone-400 border border-stone-300'
                            }`}
                          >
                            {m.done ? (
                              <Check className="w-4 h-4 text-white" />
                            ) : (
                              <span>{idx + 1}</span>
                            )}
                          </div>

                          {/* Step Labels */}
                          <div>
                            <p className={`text-xs font-semibold ${m.current ? 'text-amber-950 font-bold' : m.done ? 'text-stone-900' : 'text-stone-400'}`}>
                              {m.label}
                            </p>
                            <p className="text-[10px] text-stone-500 leading-tight mt-0.5 hidden sm:block">
                              {m.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 2. Carrier Details & Live Dispatch Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Carrier & Tracking Card */}
              <div className="bg-white border border-stone-200 rounded-sm p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                      Carrier Details
                    </span>
                    <span className="text-[10px] font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200 font-mono">
                      Air Dispatch
                    </span>
                  </div>

                  <p className="text-sm font-bold text-stone-900">{result.trackingInfo.carrier}</p>
                  
                  <div className="mt-3 p-2.5 bg-stone-50 border border-stone-200 rounded-xs">
                    <span className="text-[10px] text-stone-500 uppercase font-mono block">Tracking Code</span>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="font-mono text-xs font-bold text-stone-900 break-all">
                        {result.trackingInfo.trackingNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyTracking(result.trackingInfo.trackingNumber)}
                        className="p-1.5 hover:bg-stone-200 rounded text-stone-600 transition-colors shrink-0 cursor-pointer"
                        title="Copy tracking number"
                      >
                        {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-stone-100">
                  <a
                    href={result.trackingInfo.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold uppercase tracking-wider py-2.5 px-3 rounded-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <span>Direct Tracking Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Delivery Destination Card */}
              <div className="bg-white border border-stone-200 rounded-sm p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                      Destination
                    </span>
                    <MapPin className="w-4 h-4 text-amber-800" />
                  </div>

                  <p className="text-xs font-bold text-stone-900">
                    {result.order.customerName}
                  </p>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {result.order.shippingAddress.addressLine1}
                    {result.order.shippingAddress.addressLine2 ? `, ${result.order.shippingAddress.addressLine2}` : ''}<br />
                    {result.order.shippingAddress.city}, {result.order.shippingAddress.state} {result.order.shippingAddress.postalCode}<br />
                    {result.order.shippingAddress.country}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2 text-[11px] text-stone-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Age 21+ Adult Signature Required at Delivery</span>
                </div>
              </div>

              {/* Order Security & Handling Card */}
              <div className="bg-white border border-stone-200 rounded-sm p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                      Handling Specifications
                    </span>
                    <Box className="w-4 h-4 text-stone-600" />
                  </div>

                  <ul className="space-y-2 text-xs text-stone-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Custom anti-break foam casing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Tamper-evident security seal</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Fully insured transport guarantee</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-500">
                  <span>Order Placed: </span>
                  <strong className="text-stone-700">
                    {new Date(result.order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </strong>
                </div>
              </div>
            </div>

            {/* 3. Detailed Real-Time Event Timeline & Package Items */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Event Timeline (7 cols) */}
              <div className="lg:col-span-7 bg-white border border-stone-200 rounded-sm p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3.5 mb-5">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-800" />
                    <h3 className="font-serif text-sm font-bold text-stone-900">
                      Real-Time Activity Timeline
                    </h3>
                  </div>
                  <span className="text-[11px] text-stone-500">
                    {result.order.timeline.length} milestone updates
                  </span>
                </div>

                {result.order.timeline && result.order.timeline.length > 0 ? (
                  <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                    {result.order.timeline.map((event, idx) => (
                      <div key={idx} className="relative group">
                        {/* Dot on line */}
                        <div
                          className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white ${
                            idx === result.order.timeline.length - 1
                              ? 'bg-amber-900 ring-4 ring-amber-100'
                              : 'bg-stone-800'
                          }`}
                        />

                        <div>
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                              {event.status.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[11px] text-stone-400 font-mono">
                              {new Date(event.timestamp).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          {event.note && (
                            <p className="text-xs text-stone-600 mt-1 leading-relaxed bg-stone-50/70 p-2.5 rounded-xs border border-stone-100">
                              {event.note}
                            </p>
                          )}

                          {event.actor && (
                            <span className="text-[10px] text-stone-400 italic block mt-1">
                              Logged by: {event.actor}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-stone-400">
                    No milestone logs recorded yet for this reference.
                  </div>
                )}
              </div>

              {/* Package Contents & Order Items (5 cols) */}
              <div className="lg:col-span-5 bg-white border border-stone-200 rounded-sm p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3.5 mb-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-800" />
                      <h3 className="font-serif text-sm font-bold text-stone-900">
                        Shipment Contents ({result.order.items.length})
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-stone-900">
                      ${result.order.total.toFixed(2)}
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {result.order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 rounded border border-stone-100 bg-stone-50/40">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 object-cover rounded-xs border border-stone-200 shrink-0 bg-white"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-stone-900 truncate">
                            {item.productName}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                            <span>Qty: {item.quantity}</span>
                            {item.flavor && <span className="text-amber-800 truncate">• {item.flavor}</span>}
                          </div>
                        </div>
                        <span className="text-xs font-semibold font-mono text-stone-800">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Financial Summary */}
                  <div className="mt-4 pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono font-medium">${result.order.subtotal.toFixed(2)}</span>
                    </div>
                    {result.order.discount > 0 && (
                      <div className="flex justify-between text-amber-900 font-medium">
                        <span>Discount</span>
                        <span className="font-mono">-${result.order.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Express Shipping</span>
                      <span className="font-mono">{result.order.shippingFee === 0 ? 'FREE' : `$${result.order.shippingFee.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span className="font-mono">${result.order.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-stone-900 pt-2 border-t border-stone-200 text-sm">
                      <span>Total</span>
                      <span className="font-mono text-amber-950">${result.order.total.toFixed(2)}</span>
                    </div>

                    {/* Commercial Invoice Actions */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-stone-500 font-medium">Commercial Invoice</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setIsEmailPdfOpen(true)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-semibold rounded-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Email PDF</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleDownloadPdf}
                          className="px-2 py-1 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 text-[11px] font-medium rounded-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Concierge Support Link */}
                <div className="mt-5 pt-4 border-t border-stone-100 bg-stone-50 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 p-4 rounded-b-sm">
                  <div className="flex items-start gap-2 text-xs">
                    <HelpCircle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-stone-800">Questions about this shipment?</span>
                      <p className="text-stone-500 text-[11px] mt-0.5">
                        Our luxury concierge team is available 24/7 for address adjustments or urgent carrier assistance.
                      </p>
                      <button
                        type="button"
                        onClick={() => onNavigate('/contact')}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 hover:text-amber-700 hover:underline mt-1.5 cursor-pointer"
                      >
                        <span>Contact Shipping Concierge</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Default Help & FAQ Section when no order is displayed */}
        {!result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
            <div className="bg-white border border-stone-200 rounded-sm p-5 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-900 flex items-center justify-center mb-1">
                <Truck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Fast Dispatch</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                All premium hookah and tobacco orders confirmed before 2:00 PM EST ship the same business day via UPS or FedEx air.
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-sm p-5 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-900 flex items-center justify-center mb-1">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Adult 21+ Verification</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Per federal regulations, adult signature and valid government photo identification are mandatory upon parcel handover.
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-sm p-5 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-900 flex items-center justify-center mb-1">
                <Phone className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Concierge Helpline</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Need to redirect a shipment or hold at a carrier facility? Call our dedicated team at +1 (630) 973-6648.
              </p>
            </div>
          </div>
        )}

        {/* Email Invoice PDF Modal */}
        {result?.order && (
          <EmailPdfModal
            isOpen={isEmailPdfOpen}
            onClose={() => setIsEmailPdfOpen(false)}
            order={result.order}
            initialEmail={email || (result.order.customerEmail.includes('***') ? '' : result.order.customerEmail)}
            onSuccess={(msg) => showToast(msg, 'success')}
          />
        )}
      </div>
    </div>
  );
};
