import React, { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '../services/api.js';

interface HeroCarouselProps {
  onNavigate: (path: string) => void;
}

const fallbackImage = 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=2000&auto=format&fit=crop';

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onNavigate }) => {
  const [heroImage, setHeroImage] = useState(fallbackImage);

  useEffect(() => {
    api.getProducts({ category: 'hookahs', limit: 1, sort: 'newest' }).then((response) => {
      const imageUrl = response.data?.products?.[0]?.images?.[0]?.url;
      if (response.success && imageUrl) {
        setHeroImage(`/api/image-proxy?url=${encodeURIComponent(imageUrl)}`);
      }
    }).catch(() => {});
  }, []);

  return (
    <section id="hero-carousel" className="relative w-full overflow-hidden bg-[#0d0f12] text-white select-none">
      <div className="relative h-[320px] w-full overflow-hidden sm:h-[380px] md:h-[440px] lg:h-[500px]">
        <img
          src={heroImage}
          alt="Imported hookah catalog"
          className="h-full w-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/40 to-transparent" />
        <div className="absolute inset-0 mx-auto flex max-w-7xl flex-col justify-end px-4 pb-8 sm:px-8 sm:pb-12 lg:px-12">
          <div className="max-w-2xl">
            <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-200 shadow-sm backdrop-blur-md sm:text-xs">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>Imported Hookah Collection</span>
            </div>
            <h2 className="mb-2 text-2xl font-black leading-tight tracking-tight text-white drop-shadow-md sm:text-4xl md:text-5xl">
              Russian & European Master Hookahs
            </h2>
            <p className="mb-4 flex items-center gap-2 text-xs font-medium text-stone-300 drop-shadow-sm sm:text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>Alpha Hookah • El Bomber • Maklaud • Steamulation • WOOKAH</span>
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('/shop?category=hookahs')}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-stone-950 shadow-lg transition-colors hover:bg-stone-200 sm:px-5 sm:py-2.5 sm:text-sm"
              >
                <span>Shop the Catalog</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <span className="hidden items-center gap-1.5 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs font-medium text-stone-300 backdrop-blur-md sm:inline-flex">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Imported Product Catalog</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
