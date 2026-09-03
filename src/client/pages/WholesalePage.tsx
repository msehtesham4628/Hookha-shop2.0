import React, { useState } from 'react';
import { api } from '../services/api.js';
import { useStore } from '../store/useStore.js';
import { submitWholesaleApplication as submitCloudWholesale } from '../services/firebase.js';
import {
  ShieldCheck,
  Building2,
  TrendingUp,
  Truck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface WholesalePageProps {
  onNavigate: (path: string) => void;
}

export const WholesalePage: React.FC<WholesalePageProps> = ({ onNavigate }) => {
  const { showToast } = useStore();
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('HOOKAH_LOUNGE');
  const [taxId, setTaxId] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [estimatedMonthlySpend, setEstimatedMonthlySpend] = useState('$5,000 - $15,000');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !taxId || !contactName || !email) {
      showToast('Please fill all required business fields', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Submit to Firebase Firestore
      try {
        await submitCloudWholesale({
          companyName: businessName,
          contactName,
          email,
          phone: phone || '',
          businessType: (businessType as any) || 'LOUNGE',
          taxId: taxId || undefined,
          website: website || undefined,
          estimatedMonthlyVolume: estimatedMonthlySpend,
          notes: notes || undefined
        });
      } catch (cloudErr) {
        console.warn('Firebase wholesale submission note:', cloudErr);
      }

      const res = await api.submitWholesaleApplication({
        businessName,
        businessType,
        taxId,
        contactName,
        email,
        phone: phone || undefined,
        website: website || undefined,
        estimatedMonthlySpend,
        notes: notes || undefined
      });

      if (res.success) {
        setIsSuccess(true);
        showToast(res.message || 'Application submitted successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Submission failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-stone-50/50 py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Hero */}
        <div className="bg-stone-900 text-white rounded-xs p-8 sm:p-12 border border-stone-800 mb-12 shadow-xl">
          <div className="max-w-3xl space-y-4">
            <span className="inline-block bg-amber-500/20 text-amber-400 text-xs uppercase font-bold tracking-widest px-3 py-1 rounded-xs border border-amber-500/30">
              Commercial B2B Program
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-100">
              Wholesale Partner & Lounge Allotments
            </h1>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Empower your hookah lounge, cigar club, or boutique smoke shop with premier wholesale pricing (35% to 50% below retail), rare 1kg dark leaf master packs, and pallet freight.
            </p>
          </div>
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-stone-200 p-6 rounded-xs shadow-xs space-y-2">
            <div className="p-3 bg-amber-50 text-amber-800 rounded-xs w-fit border border-amber-200">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-base font-bold text-stone-900">Direct Factory Tier Pricing</h3>
            <p className="text-xs text-stone-600 leading-relaxed">Save up to 50% across Wookah, Steamulation, Tangiers, and Alpaca Bowl master cartons.</p>
          </div>

          <div className="bg-white border border-stone-200 p-6 rounded-xs shadow-xs space-y-2">
            <div className="p-3 bg-amber-50 text-amber-800 rounded-xs w-fit border border-amber-200">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-base font-bold text-stone-900">Dedicated Account Concierge</h3>
            <p className="text-xs text-stone-600 leading-relaxed">Personal sommelier for lounge pack menus, staff training, and pre-release allotments.</p>
          </div>

          <div className="bg-white border border-stone-200 p-6 rounded-xs shadow-xs space-y-2">
            <div className="p-3 bg-amber-50 text-amber-800 rounded-xs w-fit border border-amber-200">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-base font-bold text-stone-900">Pallet Freight & Tax Exemption</h3>
            <p className="text-xs text-stone-600 leading-relaxed">Direct LTL freight with certificate of resale state tax exemptions automatically applied.</p>
          </div>
        </div>

        {/* Application Form */}
        <div className="max-w-3xl mx-auto bg-white border border-stone-200 rounded-xs p-8 shadow-xs">
          {isSuccess ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-stone-900">Application Received</h2>
              <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                Thank you for applying to the Fumare Hookah Wholesale Network. A B2B account director will verify your EIN / resale permit and activate your commercial portal within 1 business day.
              </p>
              <button
                onClick={() => onNavigate('/')}
                className="bg-stone-900 text-white text-xs font-semibold px-6 py-2.5 rounded-xs"
              >
                Return to Store
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <h2 className="font-serif text-xl font-bold text-stone-900">Commercial Partner Application</h2>
                <p className="text-xs text-stone-500 mt-1">Please provide your corporate details and state resale permit.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Legal Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mirage Hookah Lounge LLC"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Business Type *</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                  >
                    <option value="HOOKAH_LOUNGE">Hookah Lounge / Shisha Bar</option>
                    <option value="SMOKE_SHOP">Retail Smoke & Vape Shop</option>
                    <option value="DISTRIBUTOR">Regional Tobacco Distributor</option>
                    <option value="RESTAURANT_NIGHTCLUB">Restaurant / Nightclub</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">EIN / Federal Tax ID / Resale License *</label>
                  <input
                    type="text"
                    required
                    placeholder="XX-XXXXXXX"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Business Website or Instagram</label>
                  <input
                    type="text"
                    placeholder="www.yourlounge.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Primary Contact Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="General Manager Name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Commercial Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="purchasing@yourlounge.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Direct Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Estimated Monthly Purchasing Volume</label>
                  <select
                    value={estimatedMonthlySpend}
                    onChange={(e) => setEstimatedMonthlySpend(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                  >
                    <option value="$2,000 - $5,000">$2,000 - $5,000 / month</option>
                    <option value="$5,000 - $15,000">$5,000 - $15,000 / month</option>
                    <option value="$15,000 - $50,000">$15,000 - $50,000 / month</option>
                    <option value="$50,000+">$50,000+ / month (Enterprise Pallet Tier)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Lounge Seating Capacity & Target Brands</label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your hookah table count, current dark leaf brands carried, or specific master cartons needed..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 text-xs p-3 rounded-xs focus:outline-none focus:border-amber-800"
                />
              </div>

              <button
                id="submit-wholesale-app-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-stone-900 hover:bg-amber-900 text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xs transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit Wholesale Application'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
