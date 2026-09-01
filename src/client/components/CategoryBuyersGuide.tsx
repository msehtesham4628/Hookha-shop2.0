import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext.js';
import { ChevronDown, ChevronUp, ShieldCheck, Truck, Award, HelpCircle } from 'lucide-react';

interface GuideSection {
  title: string;
  content: string[];
}

const CATEGORY_GUIDES: Record<string, { title: string; subtitle: string; sections: GuideSection[] }> = {
  tobacco: {
    title: 'SO YOU WANT TO BUY HOOKAH TOBACCO & SHISHA ONLINE',
    subtitle: 'Everything you need to know about dark leaf, blonde leaf, and heat management',
    sections: [
      {
        title: 'What to look for when choosing shisha tobacco?',
        content: [
          'Selecting the right shisha tobacco comes down to three fundamental parameters: leaf type (Burley vs Virginia), syrup viscosity, and heat tolerance.',
          'Dark Leaf blends (MustHave, DarkSide, BlackBurn, Tangiers) use unwashed Burley tobacco leaves. They deliver a heavier nicotine concentration, deep tobacco richness, and higher heat resistance.',
          'Blonde Leaf blends (Fumari, Starbuzz, Al Fakher) use washed Virginia leaves. They are smoother on the throat, naturally sweeter, and ideal for casual social sessions.'
        ]
      },
      {
        title: 'Cigar Leaf & Boutique Artisanal Blends',
        content: [
          'Boutique brands like Bonche use 100% whole-leaf Caribbean, Cuban, and Dominican cigar tobacco. These blends are fermented with natural extracts, creating complex chocolate, oak wood, whiskey, and leather notes.',
          'Cigar blends smoke best with low packing density in semi-porcelain phunnel bowls with 2 to 3 coconut charcoal cubes.'
        ]
      },
      {
        title: 'Freshness and Worldwide Delivery Guarantee',
        content: [
          'All tobacco tins sold at World Hookah Market are stored in climate-controlled vaults at 68°F and 65% relative humidity to guarantee maximum flavor saturation and freshness upon arrival.',
          'All shipments are sealed in airtight moisture-barrier bags with age verification and tracked delivery across the USA and internationally.'
        ]
      }
    ]
  },
  hookahs: {
    title: 'BUY HOOKAH ONLINE IN USA WITH WORLDWIDE DELIVERY',
    subtitle: 'Let’s analyze the modern hookah device in more detail',
    sections: [
      {
        title: 'What materials define a modern luxury hookah?',
        content: [
          'Top-tier Russian and European hookahs (such as Alpha Hookah, El Bomber, MattPear, and Maklaud) are constructed from medical and aerospace-grade AISI 304 stainless steel.',
          'Unlike brass or zinc alloys, AISI 304 stainless steel never rusts, never oxidizes, and will not absorb or ghost ghost aromas between different tobacco sessions.',
          'High-density engineering polyacetal (POM-C) is used for purge valves and base connector blocks, providing zero-friction magnetic hose docking and silent multi-directional blow-offs.'
        ]
      },
      {
        title: 'Purge Systems and Vertical Blow-Off Technology',
        content: [
          'Modern hookahs feature engineered vertical purge systems that vent stale smoke upwards toward the coal tray or through laser-cut body channels (as seen in Alpha Hookah Model X and Beat).',
          'Adjustable screw-on diffusers allow users to switch effortlessly between a classic rumbling draw and a whisper-quiet, silky-smooth session.'
        ]
      }
    ]
  },
  bowls: {
    title: 'SO YOU WANT TO BUY A HOOKAH BOWL',
    subtitle: 'Comparing Phunnel, Turkish, Killer, and Character Art Bowls',
    sections: [
      {
        title: 'By type of bowl, how are they divided?',
        content: [
          'Phunnel Bowls (Oblako, Alpaca, Kong): Feature a single raised center hole with an outer moat that locks in all syrup and molasses. Ideal for juicy dark leaf and modern blends.',
          'Turkish & Killer Bowls (Cosmo Bowl, Big Maks): Feature 5 to 7 open bottom holes, forcing heated air through all tobacco strata for maximum nicotine impact.',
          'Character & Sculpture Bowls (Kong Godzilla, Kong Lion): Hand-sculpted high-temperature stoneware that acts as both functional high-performance clay and a visual centerpiece.'
        ]
      },
      {
        title: 'Thermal Processing and Glaze Quality',
        content: [
          'Oblako and Kong use dual-stage firing at 1200°C with food-grade lead-free glaze. This prevents micro-cracking and tobacco juice bleeding, ensuring easy cleaning with just warm water.'
        ]
      }
    ]
  },
  default: {
    title: 'WORLD HOOKAH MARKET — PREMIER AUTHENTIC MASTER DISTRIBUTOR',
    subtitle: 'Official USA and International source for authentic shisha lifestyle goods',
    sections: [
      {
        title: 'Why choose World Hookah Market?',
        content: [
          'We work directly with official manufacturing houses in Russia, Germany, Poland, and the United States. Every item carries guaranteed authenticity seals and serial numbers.',
          'We offer express same-day fulfillment, free shipping over $99 in the contiguous US, and professional B2B wholesale pricing for verified lounges and retailers.'
        ]
      }
    ]
  }
};

export const CategoryBuyersGuide: React.FC<{ categorySlug?: string }> = ({ categorySlug }) => {
  const { t } = useTranslation();
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({ 0: true });

  const guide = (categorySlug && CATEGORY_GUIDES[categorySlug]) || CATEGORY_GUIDES.default;

  const toggleSection = (index: number) => {
    setOpenSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="mt-16 bg-white border border-stone-200/90 rounded-sm p-6 sm:p-8 shadow-2xs">
      {/* Guarantees Header Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-stone-100 mb-6 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-900 flex items-center justify-center flex-shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-stone-900">{t('common.verified_authentic', '100% Authentic Guaranteed')}</p>
            <p className="text-stone-500 text-[11px]">{t('common.official_distributor', 'Official Master Distributor')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-900 flex items-center justify-center flex-shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-stone-900">{t('common.same_day_dispatch', 'Same-Day Dispatch')}</p>
            <p className="text-stone-500 text-[11px]">{t('common.free_shipping', 'Free shipping over $99')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-900 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-stone-900">Secure Age-Verified Checkout</p>
            <p className="text-stone-500 text-[11px]">Strict 21+ compliance</p>
          </div>
        </div>
      </div>

      {/* Guide Title */}
      <div className="mb-6">
        <div className="text-[10px] font-bold uppercase tracking-widest text-amber-800 mb-1">
          {t('category.buyers_guide_title', 'Expert Buyer’s Guide & Knowledge Base')}
        </div>
        <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
          {guide.title}
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          {guide.subtitle}
        </p>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-3">
        {guide.sections.map((section, idx) => {
          const isOpen = !!openSections[idx];
          return (
            <div
              key={idx}
              className="border border-stone-200 rounded-xs overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggleSection(idx)}
                className="w-full flex items-center justify-between p-4 text-left bg-stone-50/70 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <span className="font-serif text-xs sm:text-sm font-bold text-stone-900">
                  {section.title}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-amber-900 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-400 flex-shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="p-4 bg-white border-t border-stone-100 text-xs text-stone-700 leading-relaxed space-y-2.5 animate-in fade-in duration-150">
                  {section.content.map((p, pIdx) => (
                    <p key={pIdx}>{p}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
