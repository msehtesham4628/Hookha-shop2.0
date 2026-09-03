import React from 'react';
import { useTranslation } from '../i18n/LanguageContext.js';
import { AlertTriangle, Instagram, Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#1f2329] text-stone-300 pt-10 pb-8 border-t border-stone-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Contact & Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-stone-800">
          
          {/* Column 1: Contact Info matching Screenshot 6 */}
          <div className="space-y-3">
            <h5 className="text-white font-bold uppercase tracking-wider text-xs">
              Fumare Hookah
            </h5>
            <div className="space-y-2 text-stone-400">
              <a
                href="https://instagram.com/fumarehookah"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-stone-300 hover:text-cyan-400 transition-colors"
              >
                <Instagram className="w-4 h-4 text-rose-400" />
                <span>@fumarehookah</span>
              </a>

              <a
                href="tel:+16309736648"
                className="flex items-center gap-2 text-stone-300 hover:text-cyan-400 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>+1 (630) 973-6648</span>
              </a>

              <a
                href="mailto:cs@fumarehookah.com"
                className="flex items-center gap-2 text-stone-300 hover:text-cyan-400 transition-colors"
              >
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>cs@fumarehookah.com</span>
              </a>

              <div className="flex items-start gap-2 text-stone-400 pt-1">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>346 Anthony trl, Northbrook, IL 60062, USA</span>
              </div>
            </div>
          </div>

          {/* Column 2: Products Catalog */}
          <div>
            <h5 className="text-white font-bold uppercase tracking-wider text-xs mb-3">
              {t('footer.shop_categories', 'Shop Categories')}
            </h5>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button onClick={() => onNavigate('/shop?category=tobacco')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  {t('nav.tobacco', 'Shisha Tobacco')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop?category=hookahs')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  {t('nav.hookahs', 'Hookahs & Stems')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop?category=bowls')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  {t('nav.bowls', 'Hookah Bowls')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop?category=bases')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  {t('nav.bases', 'Bases & Flasks')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop?category=coal')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  {t('nav.charcoal', 'Coconut Charcoal')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop?category=accessories')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  {t('nav.accessories', 'Accessories & HMD')}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h5 className="text-white font-bold uppercase tracking-wider text-xs mb-3">
              {t('footer.customer_care', 'Customer Support')}
            </h5>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button onClick={() => onNavigate('/wholesale')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  {t('nav.wholesale', 'Wholesale & Lounge B2B')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/account')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  {t('nav.my_account', 'My Account & Orders')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  {t('footer.contact_us', 'Contact Us')}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Compliance & Statement */}
          <div>
            <h5 className="text-white font-bold uppercase tracking-wider text-xs mb-3">
              {t('footer.legal_compliance', 'Legal & Verification')}
            </h5>
            <p className="text-stone-400 leading-relaxed text-[11px] mb-3">
              {t('footer.age_disclaimer', 'All buyers must be 21+ years of age. Adult signature and identity verification required upon delivery.')}
            </p>
            <button
              onClick={() => onNavigate('/contact')}
              className="text-cyan-400 hover:underline text-xs cursor-pointer"
            >
              {t('footer.accessibility_statement', 'Accessibility Statement')}
            </button>
          </div>

        </div>

        {/* Surgeon General Warning Bar */}
        <div className="py-6 border-b border-stone-800 flex items-center gap-3 text-[11px] text-stone-400 leading-relaxed">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong className="text-stone-200 uppercase">{t('footer.warning_label', "SURGEON GENERAL'S WARNING:")}</strong> {t('footer.warning_text', 'Smoking Shisha Tobacco contains nicotine. You must be at least 21 years of age to purchase on this platform.')}
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} Fumare Hookah. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};
