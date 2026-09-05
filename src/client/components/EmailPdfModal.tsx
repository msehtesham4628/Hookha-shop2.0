import React, { useState, useEffect } from 'react';
import { Mail, Download, Check, AlertCircle, Loader2, X, FileText, Send, ShieldCheck } from 'lucide-react';
import { Order } from '../../types/index.js';
import { downloadOrderInvoicePDF, sendInvoicePDFViaEmail } from '../utils/pdfGenerator.js';

interface EmailPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  initialEmail?: string;
  onSuccess?: (message: string) => void;
}

export const EmailPdfModal: React.FC<EmailPdfModalProps> = ({
  isOpen,
  onClose,
  order,
  initialEmail,
  onSuccess
}) => {
  const [email, setEmail] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [sentRecipient, setSentRecipient] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail || order.customerEmail || '');
      setError(null);
      setSentSuccess(false);
      setCustomNote('');
    }
  }, [isOpen, initialEmail, order]);

  if (!isOpen) return null;

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid recipient email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await sendInvoicePDFViaEmail(order.orderNumber || order.id, email.trim(), order, customNote.trim() || undefined);
      setSentSuccess(true);
      setSentRecipient(email.trim());
      if (onSuccess) {
        onSuccess(res.message || `Invoice PDF successfully emailed to ${email.trim()}`);
      }
    } catch (err: any) {
      console.error('Error sending invoice email:', err);
      setError(err.message || 'Unable to email invoice PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    setDownloading(true);
    try {
      downloadOrderInvoicePDF(order, customNote || undefined);
    } catch (err: any) {
      console.error('Failed to download invoice PDF:', err);
      setError('Failed to generate PDF download. Please try again.');
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  return (
    <div
      id="email-pdf-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="email-pdf-modal-content"
        className="bg-white rounded-xs border border-stone-200 shadow-2xl max-w-lg w-full overflow-hidden text-stone-900"
      >
        {/* Header */}
        <div className="bg-stone-900 text-white px-5 py-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xs bg-amber-900/80 flex items-center justify-center text-amber-300">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Email Invoice & Receipt PDF</h3>
              <p className="text-[11px] text-stone-400 font-mono">
                Order #{order.orderNumber} • ${order.total.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-xs transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {sentSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-stone-900">
                  Invoice PDF Dispatched
                </h4>
                <p className="text-xs text-stone-600 mt-1 max-w-sm mx-auto leading-relaxed">
                  Your official commercial invoice and purchase dossier have been sent to{' '}
                  <strong className="text-stone-900 font-semibold">{sentRecipient}</strong> with the vector PDF attached.
                </p>
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xs text-[11px] text-stone-600 max-w-xs mx-auto text-left space-y-1 font-mono">
                <div>• File: Invoice-{order.orderNumber}.pdf</div>
                <div>• Courier: {order.carrier || 'Standard Courier'}</div>
                <div>• Total: ${order.total.toFixed(2)}</div>
              </div>

              <div className="pt-3 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-2 border border-stone-300 hover:border-stone-400 text-stone-700 text-xs font-semibold rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Local Copy</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendEmail} className="space-y-4">
              {/* Brief Order Summary Banner */}
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xs flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block">Customer / Recipient</span>
                  <span className="font-semibold text-stone-800">{order.customerName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block">Status</span>
                  <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-xs">
                    {order.paymentStatus || 'PAID'}
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xs text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Destination Email */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Recipient Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="invoice-recipient-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. yourname@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-xs focus:ring-1 focus:ring-amber-800 focus:border-amber-800 outline-none"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  We'll send the official printable PDF invoice directly as an attachment.
                </p>
              </div>

              {/* Optional Memo / Note */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Personal Note / Memo <span className="text-stone-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. For tax filing or company reimbursement"
                  maxLength={120}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xs focus:ring-1 focus:ring-amber-800 focus:border-amber-800 outline-none"
                />
              </div>

              {/* Compliance note */}
              <div className="flex items-center gap-2 p-2.5 bg-amber-50/60 border border-amber-200/60 rounded-xs text-[11px] text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0" />
                <span>Includes adult signature compliance verification and carrier tracking metadata.</span>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full sm:w-auto px-4 py-2.5 border border-stone-300 hover:border-stone-400 text-stone-700 text-xs font-semibold rounded-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Direct PDF download to your device"
                >
                  {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>Download PDF</span>
                </button>

                <div className="w-full sm:w-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/2 sm:w-auto px-4 py-2.5 text-stone-600 hover:text-stone-900 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="send-invoice-email-btn"
                    type="submit"
                    disabled={loading}
                    className="w-1/2 sm:w-auto bg-amber-900 hover:bg-amber-800 text-white text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
