import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { Order } from '../../types/index.js';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Package,
  Truck,
  ShieldCheck,
  Calendar,
  MapPin,
  ArrowRight,
  Printer,
  Mail,
  Download
} from 'lucide-react';
import { EmailPdfModal } from '../components/EmailPdfModal.js';
import { downloadOrderInvoicePDF } from '../utils/pdfGenerator.js';

interface OrderSuccessPageProps {
  orderId?: string;
  onNavigate: (path: string) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ orderId, onNavigate }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailPdfOpen, setIsEmailPdfOpen] = useState(false);

  const handleDownloadPdf = () => {
    if (!order) return;
    try {
      downloadOrderInvoicePDF(order);
    } catch (e) {
      console.error('Failed to download invoice PDF:', e);
    }
  };

  useEffect(() => {
    // Fire festive luxury confetti on mount
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#78350f', '#d97706', '#f59e0b', '#1c1917']
    });

    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getOrderById(orderId);
        if (res.success && res.data) {
          setOrder(res.data);
        }
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return (
    <div className="w-full bg-stone-50/50 py-12 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Header Box */}
        <div className="bg-white border border-stone-200 rounded-xs p-8 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-amber-800">
              Acquisition Confirmed
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Thank You for Your Order
            </h1>
          </div>

          <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
            Your high-grade hookah artifacts and dark leaf reserve have been assigned to our master packing division. A confirmation dossier was dispatched to your email.
          </p>

          {order && (
            <div className="inline-flex items-center gap-3 bg-stone-50 border border-stone-200 px-4 py-2 rounded-xs text-xs font-mono text-stone-800">
              <span>Order Number: <strong>{order.orderNumber}</strong></span>
              <span>•</span>
              <span>Tracking: <strong>{order.trackingNumber}</strong></span>
            </div>
          )}
        </div>

        {/* Order Fulfillment Timeline */}
        <div className="mt-6 bg-white border border-stone-200 rounded-xs p-6 shadow-xs">
          <h3 className="font-serif text-sm font-bold text-stone-900 mb-6 uppercase tracking-wider">
            Fulfillment & Delivery Progression
          </h3>

          <div className="relative flex justify-between items-center text-center">
            {/* Timeline connector bar */}
            <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-stone-200 -translate-y-1/2 -z-0" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white">
                ✓
              </div>
              <span className="text-[11px] font-bold text-stone-900 mt-2">Payment Confirmed</span>
              <span className="text-[10px] text-stone-400">Authorized</span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-amber-700 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white">
                <Package className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-amber-900 mt-2">Luxury Packing</span>
              <span className="text-[10px] text-stone-400">Break-Free Polyfoam</span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center text-xs font-bold ring-4 ring-white">
                <Truck className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-medium text-stone-600 mt-2">Dispatched</span>
              <span className="text-[10px] text-stone-400">UPS 2-Day Air</span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center text-xs font-bold ring-4 ring-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-medium text-stone-600 mt-2">Delivered</span>
              <span className="text-[10px] text-stone-400">Adult 21+ Signature</span>
            </div>
          </div>
        </div>

        {/* Order Details & Summary */}
        {order && (
          <div className="mt-6 bg-white border border-stone-200 rounded-xs p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h4 className="font-serif text-sm font-bold text-stone-900">Ordered Items</h4>
                <p className="text-xs text-stone-500">{order.items.length} items total</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="order-success-email-pdf-btn"
                  type="button"
                  onClick={() => setIsEmailPdfOpen(true)}
                  className="text-xs bg-amber-900 hover:bg-amber-800 text-white font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xs transition-colors cursor-pointer shadow-2xs"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-300" />
                  <span>Email PDF</span>
                </button>

                <button
                  id="order-success-download-pdf-btn"
                  type="button"
                  onClick={handleDownloadPdf}
                  className="text-xs text-stone-700 hover:text-stone-900 flex items-center gap-1.5 border border-stone-300 px-3 py-1.5 rounded-xs hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-stone-500" />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1.5 border border-stone-300 px-3 py-1.5 rounded-xs hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-stone-50">
                  <div>
                    <span className="font-semibold text-stone-900">{item.productName}</span>
                    <span className="text-stone-400 ml-2">Qty: {item.quantity}</span>
                    {item.selectedFlavor && <span className="text-amber-800 italic block text-[11px]">Flavor: {item.selectedFlavor}</span>}
                  </div>
                  <span className="font-bold text-stone-900 font-sans">${item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-stone-100 text-xs">
              <div>
                <span className="font-bold text-stone-900 uppercase tracking-wider block mb-1">Destination Address:</span>
                <p className="text-stone-600 leading-relaxed">
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                  {order.shippingAddress.country}
                </p>
              </div>

              <div className="space-y-1 text-right">
                <div className="flex justify-between">
                  <span className="text-stone-500">Subtotal</span>
                  <span className="font-semibold text-stone-900">${order.subtotal.toFixed(2)}</span>
                </div>
                {order.discountTotal > 0 && (
                  <div className="flex justify-between text-amber-900">
                    <span>Discount</span>
                    <span>-${order.discountTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-500">Express Shipping</span>
                  <span className="font-semibold text-stone-900">{order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-100">
                  <span>Grand Total</span>
                  <span className="text-amber-900 font-sans">${order.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {order && (
            <>
              <button
                onClick={() => onNavigate(`/track-order?orderId=${encodeURIComponent(order.orderNumber)}`)}
                className="w-full sm:w-auto bg-amber-900 hover:bg-amber-800 text-white text-xs font-semibold uppercase tracking-wider px-6 py-3.5 rounded-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>Track Real-Time Status</span>
              </button>

              <button
                onClick={() => setIsEmailPdfOpen(true)}
                className="w-full sm:w-auto bg-white border border-stone-300 hover:border-stone-400 text-stone-800 text-xs font-semibold uppercase tracking-wider px-6 py-3.5 rounded-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-amber-800" />
                <span>Email PDF Receipt</span>
              </button>
            </>
          )}
          <button
            onClick={() => onNavigate('/')}
            className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider px-8 py-3.5 rounded-xs transition-colors shadow-xs cursor-pointer"
          >
            Return to Storefront
          </button>
        </div>

        {/* Email PDF Modal */}
        {order && (
          <EmailPdfModal
            isOpen={isEmailPdfOpen}
            onClose={() => setIsEmailPdfOpen(false)}
            order={order}
            initialEmail={order.customerEmail}
          />
        )}

      </div>
    </div>
  );
};
