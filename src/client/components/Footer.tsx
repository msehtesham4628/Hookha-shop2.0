import React, { useState } from 'react';
import { api } from '../services/api.js';
import { useStore } from '../store/useStore.js';
import { Shield, Sparkles, Truck, CheckCircle2, ArrowRight, Lock, AlertTriangle } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { showToast } = useStore();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    try {
      setIsSubscribing(true);
      const res = await api.subscribeNewsletter(email);
      if (res.success) {
        setIsSuccess(true);
        setEmail('');
        showToast(res.message || 'Subscribed to Private Reserve', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Subscription failed', 'error');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      {/* 4 Trust & Excellence Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 border-b border-stone-800/80">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-stone-900 border border-stone-800 rounded-xs text-amber-500 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-stone-100 font-semibold text-sm tracking-wide">Authenticity Guaranteed</h4>
              <p className="text-stone-400 text-xs mt-1 leading-relaxed">Direct manufacturer import with holographic serial verification.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-stone-900 border border-stone-800 rounded-xs text-amber-500 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-stone-100 font-semibold text-sm tracking-wide">Break-Free Packing</h4>
              <p className="text-stone-400 text-xs mt-1 leading-relaxed">Custom double-boxed high-density foam for all crystal glass bases.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-stone-900 border border-stone-800 rounded-xs text-amber-500 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-stone-100 font-semibold text-sm tracking-wide">Sommelier Selection</h4>
              <p className="text-stone-400 text-xs mt-1 leading-relaxed">Hand-curated dark leaf reserves and artisan stoneware bowls.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-stone-900 border border-stone-800 rounded-xs text-amber-500 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-stone-100 font-semibold text-sm tracking-wide">Age 21+ Compliant</h4>
              <p className="text-stone-400 text-xs mt-1 leading-relaxed">Certified ID verification and strict federal tobacco compliance.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          
          {/* Brand Info & Newsletter */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <span className="font-serif text-2xl font-bold tracking-[0.2em] text-stone-100">
                SULTAN
              </span>
              <p className="text-[10px] uppercase tracking-[0.3em] text-amber-500 font-semibold mt-0.5">
                HOOKAH CO. • LUXURY ARTIFACTS
              </p>
            </div>

            <p className="text-stone-400 text-xs leading-relaxed max-w-md">
              Purveyor of the world's most distinguished stainless steel hookahs, Bohemian cut crystal vases, and rare dark leaf tobacco blends. Sourced across Warsaw, Munich, Moscow, and San Diego.
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <p className="text-xs uppercase font-bold tracking-widest text-stone-200 mb-2">
                Join the Private Reserve Club
              </p>
              <p className="text-stone-400 text-xs mb-3">
                Receive private access to limited batch drops, rare vintage leaf allocations, and VIP lounge events.
              </p>

              {isSuccess ? (
                <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-950/40 border border-amber-900/60 p-3 rounded-xs">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Welcome to the Sultan Reserve. Verification confirmation sent.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                  <input
                    id="newsletter-email-input"
                    type="email"
                    required
                    placeholder="Enter your VIP email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-stone-900 border border-stone-800 text-stone-100 placeholder-stone-500 text-xs px-3.5 py-2.5 rounded-xs focus:outline-none focus:border-amber-600 transition-colors"
                  />
                  <button
                    id="newsletter-submit-btn"
                    type="submit"
                    disabled={isSubscribing}
                    className="bg-amber-700 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xs transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <span>{isSubscribing ? 'Joining...' : 'Subscribe'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Quick Links Columns */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-stone-100 mb-4">
              Masterpieces
            </h5>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li><button onClick={() => onNavigate('/shop?category=hookahs')} className="hover:text-amber-400 transition-colors">Luxury Hookahs</button></li>
              <li><button onClick={() => onNavigate('/shop?category=tobacco-flavor')} className="hover:text-amber-400 transition-colors">Dark Leaf Shisha</button></li>
              <li><button onClick={() => onNavigate('/shop?category=bowls-phunnels')} className="hover:text-amber-400 transition-colors">Hand-Thrown Bowls</button></li>
              <li><button onClick={() => onNavigate('/shop?category=charcoal')} className="hover:text-amber-400 transition-colors">Coconut Charcoals</button></li>
              <li><button onClick={() => onNavigate('/shop?category=heat-management')} className="hover:text-amber-400 transition-colors">Heat Management (HMD)</button></li>
              <li><button onClick={() => onNavigate('/shop?onSale=true')} className="hover:text-amber-400 transition-colors">Private Vault Sale</button></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-stone-100 mb-4">
              Concierge & B2B
            </h5>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li><button onClick={() => onNavigate('/wholesale')} className="hover:text-amber-400 transition-colors">Lounge Wholesale Portal</button></li>
              <li><button onClick={() => onNavigate('/account')} className="hover:text-amber-400 transition-colors">Track Order Delivery</button></li>
              <li><button onClick={() => onNavigate('/contact')} className="hover:text-amber-400 transition-colors">VIP Concierge Desk</button></li>
              <li><button onClick={() => onNavigate('/about')} className="hover:text-amber-400 transition-colors">Artisan Heritage</button></li>
              <li><button onClick={() => onNavigate('/admin')} className="text-stone-500 hover:text-amber-400 transition-colors">Staff Login</button></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-stone-100 mb-4">
              Concierge HQ
            </h5>
            <div className="space-y-3 text-xs text-stone-400">
              <p>9465 Wilshire Blvd, Suite 800<br />Beverly Hills, CA 90212</p>
              <p>Email: <a href="mailto:concierge@sultanhookah.com" className="text-amber-400 hover:underline">concierge@sultanhookah.com</a></p>
              <p>Phone: +1 (800) 785-8260</p>
              <p className="text-[11px] text-stone-500">Mon - Sat: 9:00 AM - 8:00 PM PST</p>
            </div>
          </div>

        </div>
      </div>

      {/* Mandatory Tobacco & Age Warning Statement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 border-t border-stone-800/80">
        <div className="bg-stone-900/90 border border-stone-800 p-4 rounded-xs flex flex-col md:flex-row items-start md:items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 md:mt-0" />
          <div className="text-[11px] text-stone-400 leading-relaxed">
            <strong className="text-stone-200 uppercase font-semibold">SURGEON GENERAL'S WARNING:</strong> Smoking Shisha Tobacco contains nicotine, an addictive chemical. It increases the risk of heart disease, stroke, and emphysema. You must be at least 21 years of age to purchase products on this platform. Age verification is strictly performed during checkout and upon adult signature carrier delivery.
          </div>
        </div>
      </div>

      {/* Copyright and Bottom Sub-bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-stone-900 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
        <p>© {new Date().getFullYear()} Sultan Hookah Co. All rights reserved. Registered trademark.</p>
        <div className="flex items-center gap-6">
          <span>Encrypted 256-Bit SSL</span>
          <span>•</span>
          <span>UPS 2-Day Air Express</span>
          <span>•</span>
          <span>California Prop 65 Compliant</span>
        </div>
      </div>
    </footer>
  );
};
