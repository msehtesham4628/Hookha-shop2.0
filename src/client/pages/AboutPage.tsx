import React from 'react';
import { Shield, Sparkles, Award, Globe, Heart, CheckCircle2 } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full bg-stone-50/50 py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[11px] uppercase font-bold tracking-[0.3em] text-amber-800">
            Heritage & Distribution
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 leading-tight">
            The Premier Destination for Russian & World Hookah Culture
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Founded in 2018, World Hookah Market is the leading master distributor and online retailer for authentic Russian hookah brands, premium shisha tobacco, artisan bowls, and heat management systems.
          </p>
        </div>

        {/* 2 Column Image & Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white border border-stone-200 p-8 sm:p-12 rounded-xs shadow-xs">
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-900">Uncompromising Materiality</span>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              V2A Surgical Stainless Steel & Bohemian Crystal
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Every Fumare stem is CNC-machined to microscopic tolerances in Germany and Poland. Unlike traditional brass or zinc hookahs, surgical stainless steel is completely impervious to ghosting—ensuring that even the most pungent double apple or cane mint leaves zero residual aroma after a simple rinse.
            </p>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Our crystal vases are individually mouth-blown in the historic Bohemian region of the Czech Republic, using heavy 24% leaded crystal that delivers unmatched acoustic resonance and tipping stability.
            </p>
          </div>

          <div className="aspect-4/3 bg-stone-100 rounded-xs overflow-hidden border border-stone-200">
            <img
              src="https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=800"
              alt="Craftsmanship"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-stone-200 p-6 rounded-xs shadow-xs space-y-3">
            <Shield className="w-6 h-6 text-amber-800" />
            <h3 className="font-serif text-base font-bold text-stone-900">Direct Sourcing Guarantee</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              We hold authorized distribution rights for Alpha Hookah, El Bomber, MattPear, Maklaud, MustHave, DarkSide, Bonche, BlackBurn, Oblako, Kong, and Kaloud. Every product ships with verified serial tags.
            </p>
          </div>

          <div className="bg-white border border-stone-200 p-6 rounded-xs shadow-xs space-y-3">
            <Sparkles className="w-6 h-6 text-amber-800" />
            <h3 className="font-serif text-base font-bold text-stone-900">Sommelier Tobacco Selection</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Our shisha curators rigorously test every harvest of Burley and Virginia dark leaf for moisture equilibrium, heat sensitivity, and flavor longevity.
            </p>
          </div>

          <div className="bg-white border border-stone-200 p-6 rounded-xs shadow-xs space-y-3">
            <Award className="w-6 h-6 text-amber-800" />
            <h3 className="font-serif text-base font-bold text-stone-900">Break-Free Fulfillment</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Proprietary shock-absorbing molded foam envelopes protect delicate cut crystal and stoneware bowls on their journey to your residence.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
