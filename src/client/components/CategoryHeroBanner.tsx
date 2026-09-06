import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Category, Brand } from '../../types/index.js';

interface CategoryHeroBannerProps {
  category?: Category;
  categorySlug: string;
  brand?: Brand;
  brandSlug: string;
  subcategories: string[];
  selectedSubcategory: string;
  onSelectSubcategory: (subcategory: string) => void;
  productCount: number;
  onNavigate: (path: string) => void;
  onResetCategory: () => void;
}

const HEROES: Record<string, { image: string; title: string; description: string }> = {
  hookahs: { image: '/hookahs/hookahs_1.jpg', title: 'Russian & European Master Hookahs', description: 'Alpha Hookah • El Bomber • Maklaud • Steamulation • WOOKAH • MattPear' },
  tobacco: { image: '/tobacco/tobacco_1.jpg', title: 'Dark & Blonde Leaf Tobaccos', description: 'MustHave • DarkSide • BlackBurn • Tangiers • Bonche • Chabacco • Spectrum' },
  bowls: { image: '/bowls/bowls_1.jpg', title: 'Hookah Bowls', description: 'Oblako • Kong Bowls • Alpaca • Solaris • Target • Cosmo' },
  bases: { image: '/bases/bases_1.jpg', title: 'Crystal Glass & Russian Drop Vases', description: 'Caesar Crystal • Craft Glass • Big Maks • WOOKAH Crystal' },
  coal: { image: '/tobacco/tobacco_1.jpg', title: 'Coals', description: 'Coco Loco • One Nation • Oasis Charcoal • 26mm & 28mm Cubes' },
  accessories: { image: '/accessories/accessories_1.jpg', title: 'HMD, Hoses, Tongs & Session Gear', description: 'Kaloud Lotus • Na Grani • Blade Hookah • Alpha Tongs • Silicone Hoses' },
  'e-hookah': { image: '/e-hookah/e-hookah_1.jpg', title: 'E-Hookahs', description: 'Ooka • Aspire Proteus • Clean Charcoal-Free Vapor' },
  vapes: { image: '/vapes/vapes_1.jpg', title: 'Vapes', description: 'GeekVape • Vaporesso • Lost Mary • Elf Bar • SMOK' },
  'wholesale-supplies': { image: '/home/home_1.jpg', title: 'Wholesale Lounge Supplies & Bulk Packs', description: '1kg Shisha Tins • 20kg Master Coal Cartons • Lounge Hygiene Packs' },
  all: { image: '/home/home_1.jpg', title: 'All Hookahs & Tobaccos', description: 'Russian & European Hookahs • Dark Leaf Tobacco • Artisan Bowls • Crystal Bases' }
};

const HOOKAH_SLIDES = ['/hookahs/hookahs_1.jpg', '/hookahs/hookahs_2.jpg', '/hookahs/hookahs_3.jpg'];

export const CategoryHeroBanner: React.FC<CategoryHeroBannerProps> = ({ category, categorySlug, brand, brandSlug, subcategories, selectedSubcategory, onSelectSubcategory, productCount, onNavigate }) => {
  const key = categorySlug || 'all';
  const hero = HEROES[key] || HEROES.all;
  const [slide, setSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const title = brand?.name ? `${brand.name} Collection` : category?.name || hero.title;
  const headline = brand?.name ? `${brand.name} — Premium Collection` : hero.title;
  const slides = key === 'hookahs' ? HOOKAH_SLIDES.map((image) => ({ ...hero, image })) : [hero, hero, hero];
  const active = slides[slide];

  useEffect(() => {
    const timer = window.setInterval(() => setSlide((s) => (s + 1) % slides.length), 5500);
    return () => window.clearInterval(timer);
  }, [key, slides.length]);

  return (
    <section className="relative -mx-4 -mt-6 mb-10 w-[calc(100%+2rem)] overflow-hidden bg-stone-950 text-white sm:-mx-6 sm:-mt-8 sm:w-[calc(100%+3rem)] lg:-mx-8 lg:w-[calc(100%+4rem)]">
      <div className="relative min-h-[620px] sm:min-h-[680px] lg:min-h-[760px]">
        <img key={active.image} src={active.image} alt={title} className="absolute inset-0 h-full w-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-950/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/45 to-transparent" />

        <div className={`absolute inset-x-0 top-0 z-20 border-b border-white/10 transition-all duration-300 ${scrolled ? 'bg-stone-950/90 backdrop-blur-xl' : 'bg-stone-950/25 backdrop-blur-sm'}`}>
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <button onClick={() => onNavigate('/')} className="text-left leading-none">
              <span className="block font-serif text-xl font-black tracking-[0.14em] sm:text-2xl">FUMARE HOOKAH</span>
              <span className="block pt-1 text-[8px] font-bold uppercase tracking-[0.38em] text-amber-300">EST. 2018</span>
            </button>
            <nav className="hidden items-center gap-5 lg:flex">
              {['hookahs','tobacco','bowls','bases','coal','accessories','e-hookah','vapes'].map((item) => (
                <button key={item} onClick={() => onNavigate(`/shop?category=${item}`)} className="text-[10px] font-bold uppercase tracking-wider text-stone-200 transition hover:text-amber-300">{item.replace('-', ' ')}</button>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <button onClick={() => onNavigate('/shop')} className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md hover:bg-white/20">Shop</button>
              <button onClick={() => onNavigate('/account?tab=wishlist')} className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md hover:bg-white/20">Account</button>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 mx-auto flex max-w-7xl items-end px-4 pb-12 pt-48 sm:px-8 sm:pb-16 lg:px-12">
          <div className="max-w-4xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-200 backdrop-blur-md"><Sparkles className="h-3 w-3 text-amber-400" />{title}</div>
            <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-white drop-shadow-2xl sm:text-6xl lg:text-7xl">{headline}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-300 sm:text-base">{brand?.description || hero.description}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button onClick={() => onNavigate('/shop')} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black uppercase tracking-wide text-stone-950 transition hover:bg-stone-200">Browse Catalog <ArrowRight className="h-4 w-4" /></button>
              <span className="rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-xs font-semibold text-stone-200 backdrop-blur-md">{productCount.toLocaleString()} products</span>
            </div>
            {subcategories.length > 0 && <div className="mt-6 flex max-w-3xl flex-wrap gap-2">{subcategories.slice(0, 8).map((sub) => <button key={sub} onClick={() => onSelectSubcategory(sub)} className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide backdrop-blur-md transition ${selectedSubcategory === sub ? 'border-white bg-white text-stone-950' : 'border-white/20 bg-black/30 text-white hover:bg-white/15'}`}>{sub}</button>)}</div>}
          </div>
        </div>

        {slides.length > 1 && <>
          <button aria-label="Previous hero" onClick={() => setSlide((slide + slides.length - 1) % slides.length)} className="absolute left-3 top-1/2 z-20 rounded-full border border-white/20 bg-black/30 p-2 backdrop-blur-md hover:bg-black/50"><ChevronLeft className="h-5 w-5" /></button>
          <button aria-label="Next hero" onClick={() => setSlide((slide + 1) % slides.length)} className="absolute right-3 top-1/2 z-20 rounded-full border border-white/20 bg-black/30 p-2 backdrop-blur-md hover:bg-black/50"><ChevronRight className="h-5 w-5" /></button>
          <div className="absolute bottom-5 right-5 z-20 flex gap-1.5">{slides.map((_, i) => <button key={i} aria-label={`Hero slide ${i + 1}`} onClick={() => setSlide(i)} className={`h-1.5 rounded-full transition-all ${i === slide ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} />)}</div>
        </>}
      </div>
    </section>
  );
};