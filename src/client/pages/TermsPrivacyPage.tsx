import React, { useState } from 'react';
import { Shield, FileText, Lock, AlertTriangle, ArrowLeft, CheckCircle2, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore.js';

interface TermsPrivacyPageProps {
  initialTab?: 'terms' | 'privacy';
  onNavigate: (path: string) => void;
}

export const TermsPrivacyPage: React.FC<TermsPrivacyPageProps> = ({
  initialTab = 'terms',
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);
  const { isAuthenticated } = useStore();

  return (
    <div className="w-full bg-stone-50/60 py-10 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => onNavigate('/')}
            className="text-xs text-stone-500 hover:text-stone-900 transition-colors inline-flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Store</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={() => onNavigate('/account?tab=settings')}
              className="text-xs text-amber-900 hover:text-amber-950 font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Manage Account & Settings</span>
            </button>
          )}
        </div>

        {/* Header */}
        <div className="bg-white border border-stone-200 rounded-xs p-6 sm:p-8 mb-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-800">
                Legal & Privacy Documentation
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                {activeTab === 'terms' ? 'Terms of Service' : 'Privacy & Data Policy'}
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Last updated: January 2026 • Fumare Hookah Global Luxury Shisha & Tobacco Co.
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center p-1 bg-stone-100 rounded-xs text-xs font-semibold">
              <button
                id="terms-tab-btn"
                onClick={() => setActiveTab('terms')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xs transition-colors cursor-pointer ${
                  activeTab === 'terms'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-amber-800" />
                <span>Terms of Service</span>
              </button>
              <button
                id="privacy-tab-btn"
                onClick={() => setActiveTab('privacy')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xs transition-colors cursor-pointer ${
                  activeTab === 'privacy'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-amber-800" />
                <span>Privacy & Policy</span>
              </button>
            </div>
          </div>

          {/* Age Compliance Banner */}
          <div className="mt-6 p-4 bg-amber-50/70 border border-amber-200/80 rounded-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong className="font-semibold block text-stone-900">Mandatory 21+ Age Compliance:</strong>
              Federal regulations mandate that purchasers of shisha tobacco and hookah smoking accessories must be at least 21 years of age. All orders undergo electronic age verification and require an adult signature with government-issued photo ID upon carrier delivery.
            </div>
          </div>
        </div>

        {/* Tab Content: Terms of Service */}
        {activeTab === 'terms' && (
          <div className="bg-white border border-stone-200 rounded-xs p-6 sm:p-8 shadow-xs space-y-8 text-xs text-stone-700 leading-relaxed">
            
            <section className="space-y-2">
              <h2 className="font-serif text-base font-bold text-stone-900">1. Acceptance of Terms</h2>
              <p>
                By accessing, browsing, or purchasing from Fumare Hookah ("Company", "we", "us", or "our"), you agree to be bound by these Terms of Service and all applicable federal, state, and local laws. If you do not agree to each condition set forth, do not access or use our services.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-base font-bold text-stone-900">2. Age Verification & PACT Act Compliance</h2>
              <p>
                You represent and warrant that you are at least 21 years of age. Purchases of shisha tobacco products are strictly regulated under the federal PACT Act and Tobacco 21 (T21) legislation. We utilize third-party age verification databases (such as AgeChecker and LexisNexis) to cross-reference customer identity, date of birth, and billing address. We reserve the right to cancel any order where identity cannot be verified.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-base font-bold text-stone-900">3. Shipping, Logistics & Adult Signature Required</h2>
              <p>
                All packages containing tobacco products are shipped via private adult-signature-required carriers. An adult (21 years or older) residing at the delivery address must present a valid government-issued photo identification to sign for the parcel upon delivery. Failure to provide valid ID will result in delivery failure and return-to-sender restocking charges.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-base font-bold text-stone-900">4. User Accounts & Security</h2>
              <p>
                When creating an account, you must provide accurate, current, and complete information. You are responsible for safeguarding your login credentials. You agree not to disclose your password or OTP authentication codes to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized account activity.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-base font-bold text-stone-900">5. Account Termination & Deletion</h2>
              <p>
                You may terminate your account at any time. Under our user autonomy commitment, you have access to a self-service <strong>Delete Account</strong> option within your Account Settings. Upon initiating account deletion, all personal profile entries, saved delivery addresses, luxury wishlists, and authentication records are permanently erased from our operational databases.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-base font-bold text-stone-900">6. Returns, Refunds & Artisan Product Care</h2>
              <p>
                Due to health and safety regulations, tobacco products and opened accessories cannot be returned once delivered. Unopened hardware, stainless steel stems, hand-blown crystal vases, and heat management devices may be returned within 14 days in original luxury packaging subject to inspection.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-base font-bold text-stone-900">7. Limitation of Liability</h2>
              <p>
                In no event shall Fumare Hookah, its officers, directors, or employees be liable for any indirect, punitive, or consequential damages resulting from the use or inability to use the products purchased through our store.
              </p>
            </section>
          </div>
        )}

        {/* Tab Content: Privacy & Policy */}
        {activeTab === 'privacy' && (
          <div className="bg-white border border-stone-200 rounded-xs p-6 sm:p-8 shadow-xs space-y-8 text-xs text-stone-700 leading-relaxed">
            
            <section className="space-y-2">
              <h2 className="font-serif text-base font-bold text-stone-900">1. Information We Collect</h2>
              <p>
                To provide luxury shisha products and satisfy mandatory 21+ tobacco regulatory compliance, we collect:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-stone-600">
                <li><strong>Identity Data:</strong> Full legal name, date of birth, and identity verification credentials.</li>
                <li><strong>Contact Data:</strong> Email address, mobile telephone number, and residential delivery address.</li>
                <li><strong>Transaction Data:</strong> Historical orders, payment confirmations, shipment tracking numbers, and luxury wishlist preferences.</li>
                <li><strong>Technical Data:</strong> IP address, browser type, and secure authentication tokens.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-base font-bold text-stone-900">2. How We Use Your Data</h2>
              <p>
                We use collected information solely for:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-stone-600">
                <li>Processing, packing, and dispatching your orders with 21+ adult signature delivery.</li>
                <li>Facilitating secure login via email one-time passcodes (OTP) and encrypted password hashing.</li>
                <li>Ensuring compliance with local, state, and federal tobacco excise taxation and PACT Act regulations.</li>
                <li>Communicating private reserve releases and courier arrival notifications (when opted in).</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-base font-bold text-stone-900">3. Data Security & Storage</h2>
              <p>
                All account credentials, password hashes, and personal details are encrypted in transit via TLS 1.3 and at rest using AES-256 standards. Passwords are protected using salted bcrypt hashes. We never store complete credit card details on our servers; payments are processed securely via Level-1 PCI-compliant processors.
              </p>
            </section>

            <section className="space-y-2 bg-rose-50/50 border border-rose-100 p-5 rounded-xs">
              <div className="flex items-center gap-2 text-rose-900 font-bold font-serif text-sm">
                <Trash2 className="w-4 h-4 text-rose-700" />
                <span>4. Right to Erasure & Permanent Account Deletion</span>
              </div>
              <p className="mt-2 text-rose-950">
                In compliance with GDPR, CCPA, and modern privacy standards, you hold the absolute right to have all your personal information permanently deleted from our systems.
              </p>
              <p className="mt-2 text-stone-700">
                <strong>How to Delete Your Account:</strong> You can execute immediate, irreversible account deletion directly inside your <button onClick={() => onNavigate('/account?tab=settings')} className="text-amber-900 underline font-semibold cursor-pointer">Account Settings tab</button>. Clicking "Delete Account" triggers a confirmation dialog to prevent accidental deletion. Upon confirmation:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-stone-600">
                <li>Your profile records, legal name, and phone contact are permanently removed.</li>
                <li>All saved physical delivery addresses and apartment details are wiped.</li>
                <li>Your private wishlist and active cart reservations are cleared.</li>
                <li>Authentication credentials and session tokens are invalidated instantly.</li>
              </ul>
              {isAuthenticated && (
                <div className="pt-3">
                  <button
                    onClick={() => onNavigate('/account?tab=settings')}
                    className="bg-rose-900 hover:bg-rose-950 text-white text-xs font-semibold px-4 py-2 rounded-xs transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Go to Account Settings to Delete Account</span>
                  </button>
                </div>
              )}
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-base font-bold text-stone-900">5. Third-Party Sharing</h2>
              <p>
                We do not sell, rent, or trade your personal data. We share necessary data only with certified service providers essential to fulfilling your orders:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-stone-600">
                <li>Licensed adult-signature courier carriers (e.g. UPS, regional logistics partners).</li>
                <li>Regulatory age verification engines for statutory age clearance.</li>
                <li>Payment gateways (Stripe) for encrypted authorization.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-base font-bold text-stone-900">6. Contact Our Privacy Officer</h2>
              <p>
                If you have questions regarding our privacy practices, data protection compliance, or require manual data assistance, contact us at:
              </p>
              <p className="font-mono text-[11px] text-stone-600 bg-stone-100 p-3 rounded-xs">
                Privacy Officer: privacy@fumarehookah.com<br />
                Address: 742 Luxury Boulevard, Suite 500, Los Angeles, CA 90021<br />
                Direct Inquiries: +1 (800) 785-8260
              </p>
            </section>
          </div>
        )}

      </div>
    </div>
  );
};
