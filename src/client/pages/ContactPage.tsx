import React, { useState } from 'react';
import { api } from '../services/api.js';
import { useStore } from '../store/useStore.js';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { SEOHead } from '../components/SEOHead.js';

interface ContactPageProps {
  onNavigate: (path: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const { showToast } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Order & Product Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast('Please provide your name, email, and message', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.submitContactMessage({
        name,
        email,
        phone: phone || undefined,
        subject,
        message
      });

      if (res.success) {
        setIsSuccess(true);
        showToast(res.message || 'Concierge dossier submitted!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit inquiry', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-stone-50/50 py-12 min-h-screen">
      <SEOHead
        title="Contact Us & Concierge Support | Fumare Hookah"
        ruTitle="Контакты и клиентская поддержка | Fumare Hookah"
        description="Contact Fumare Hookah customer concierge and international wholesale team in Miami, FL. Phone: +1-800-785-8260, Email: support@fumarehookah.com."
        ruDescription="Служба заботы о клиентах и оптовый отдел Fumare Hookah. Консультации по кальянам, табаку и оптовым заказам."
        keywords={['contact Fumare Hookah', 'hookah customer support', 'контакты магазина кальянов', 'Fumare телефон']}
        canonicalPath="/contact"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-[11px] uppercase font-bold tracking-[0.3em] text-amber-800">
            Dedicated Concierge Desk
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            We Are at Your Service
          </h1>
          <p className="text-xs text-stone-600">
            Have questions regarding custom wood finishes, tobacco pairing recommendations, or private lounge freight? Our concierge team responds within 4 business hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Info Column */}
          <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xs p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
              Concierge Headquarters
            </h2>

            <div className="space-y-4 text-xs text-stone-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Beverly Hills Showroom & HQ:</strong>
                  <span>9465 Wilshire Blvd, Suite 800<br />Beverly Hills, CA 90212, USA</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Direct VIP Telephone:</strong>
                  <span>+1 (800) 785-8260</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Concierge Inquiries:</strong>
                  <a href="mailto:concierge@sultanhookah.com" className="text-amber-900 hover:underline">
                    concierge@sultanhookah.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Desk Hours:</strong>
                  <span>Monday - Saturday: 9:00 AM – 8:00 PM PST<br />Sunday: 10:00 AM – 6:00 PM PST</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-xs text-xs text-stone-700 space-y-1">
              <strong className="text-amber-950 font-bold">Lounge & Commercial Orders:</strong>
              <p>For orders exceeding 10 master hookah units or 25kg shisha leaf, please submit a Wholesale Application for discounted volume pricing.</p>
            </div>
          </div>

          {/* Right Contact Form Column */}
          <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xs p-6 sm:p-8 shadow-xs">
            {isSuccess ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-xl font-bold text-stone-900">Inquiry Dispatched</h3>
                <p className="text-xs text-stone-600 max-w-sm mx-auto">
                  Thank you, {name}. Your inquiry has been routed to our sommelier concierge. We will contact you at {email} shortly.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="bg-stone-900 text-white text-xs font-semibold px-4 py-2 rounded-xs"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
                  Submit a Concierge Request
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Julian Vance"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 p-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="julian@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 p-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 p-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Inquiry Nature</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 p-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                    >
                      <option value="Order & Product Inquiry">Order & Product Inquiry</option>
                      <option value="Tobacco Sommelier Advice">Tobacco Sommelier Advice</option>
                      <option value="Break-Free Delivery Warranty">Break-Free Delivery Warranty</option>
                      <option value="Lounge Wholesale Setup">Lounge Wholesale Setup</option>
                      <option value="Custom Artifact Commission">Custom Artifact Commission</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Message Dossier *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How may our concierge assist your shisha experience?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 p-3 rounded-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-stone-900 hover:bg-amber-900 text-white font-bold uppercase tracking-wider py-3 px-6 rounded-xs transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Transmitting...' : 'Send to Concierge'}
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
