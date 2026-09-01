import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Flame } from 'lucide-react';

interface HeroSlide {
  id: string;
  badge: string;
  brandTag: string;
  headlineMain: string;
  headlineSub: string;
  headlineAccent: string;
  tagline: string;
  targetLink: string;
  bgGradient: string;
  accentColor: string;
  tinImageUrl?: string;
  bannerVisualType: 'musthave' | 'darkside' | 'hookah';
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-musthave-restock',
    badge: 'EXCLUSIVE RESTOCK',
    brandTag: 'MUSTHAVE',
    headlineMain: 'MUSTHAVE',
    headlineAccent: 'BIG RESTOCK',
    headlineSub: 'NEW FLAVORS JUST DROPPED',
    tagline: 'Pinkman • Frosty • Pineapple Rings • Kiwi Smoothie • Space Flavour',
    targetLink: '/shop?brand=musthave-tobacco',
    bgGradient: 'from-[#0b0c10] via-[#12141a] to-[#1f0d0d]',
    accentColor: '#ff2a2a',
    bannerVisualType: 'musthave'
  },
  {
    id: 'slide-darkside-xperience',
    badge: 'FRESH ARRIVAL',
    brandTag: 'DARKSIDE',
    headlineMain: 'DARKSIDE',
    headlineAccent: 'XPERIENCE',
    headlineSub: 'EXCLUSIVE BLENDS RESTOCK',
    tagline: 'Resident Kiwi • Razz B • Urban Gin • Easy Freezy • Ultimate Peach',
    targetLink: '/shop?brand=darkside-tobacco',
    bgGradient: 'from-[#070b12] via-[#0d1624] to-[#041a16]',
    accentColor: '#00d2c4',
    bannerVisualType: 'darkside'
  },
  {
    id: 'slide-alpha-maklaud-hookahs',
    badge: 'RUSSIAN LUXURY',
    brandTag: 'ALPHA HOOKAH & MAKLAUD',
    headlineMain: 'MODEL X & SMART',
    headlineAccent: 'ALPHA HOOKAH',
    headlineSub: 'PREMIUM RUSSIAN HARDWARE',
    tagline: 'Model X Cyber • Smart Exzo Tribal • Maklaud Project 23 • El Bomber',
    targetLink: '/shop?category=hookahs',
    bgGradient: 'from-[#0e0f13] via-[#181a22] to-[#241a0d]',
    accentColor: '#f59e0b',
    bannerVisualType: 'hookah'
  }
];

interface HeroCarouselProps {
  onNavigate: (path: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onNavigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  // Auto-scroll every 5.5s unless paused
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    touchStartXRef.current = null;
  };

  return (
    <div
      id="hero-carousel"
      className="relative w-full bg-[#0d0f12] text-white select-none overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Aspect Ratio Container: 2.2:1 on mobile, 2.6:1 on desktop */}
      <div className="relative w-full min-h-[280px] sm:min-h-[340px] md:min-h-[400px] lg:min-h-[460px] flex items-center justify-center overflow-hidden">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id}
              onClick={() => onNavigate(slide.targetLink)}
              className={`absolute inset-0 w-full h-full cursor-pointer transition-all duration-700 ease-out flex items-center justify-center ${
                isActive ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-98 pointer-events-none'
              }`}
            >
              {/* Background gradient & atmosphere */}
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.bgGradient}`} />

              {/* Decorative Subtle Grid / Particle Noise */}
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                  backgroundSize: '24px 24px'
                }}
              />

              {/* VISUAL LAYOUT 1: MUSTHAVE BANNER (Matches Screenshot 1) */}
              {slide.bannerVisualType === 'musthave' && (
                <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 flex flex-col items-center justify-center text-center">
                  
                  {/* MustHave Brand Icon & Small Header */}
                  <div className="flex items-center gap-2 mb-2 animate-fade-in">
                    <div className="w-8 h-8 rounded-full bg-white text-stone-950 font-black text-xs flex items-center justify-center shadow-lg border border-white/40">
                      MH
                    </div>
                    <span className="text-[11px] sm:text-xs uppercase tracking-[0.3em] font-extrabold text-stone-300">
                      MUSTHAVE TOBACCO
                    </span>
                  </div>

                  {/* High-Impact Main Stencil Headline: MUSTHAVE */}
                  <div className="relative tracking-tighter">
                    <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-stone-200 to-stone-400 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] leading-none font-sans">
                      MUSTHAVE
                    </h1>
                  </div>

                  {/* Red Brush Headline: BIG RESTOCK */}
                  <div className="mt-1 sm:mt-2 relative">
                    <span className="inline-block text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-wider text-[#ff2e2e] drop-shadow-[0_0_20px_rgba(255,46,46,0.6)] transform -rotate-1 font-serif italic">
                      BIG RESTOCK
                    </span>
                  </div>

                  {/* Chalk Script Sub-headline: NEW FLAVORS JUST DROPPED */}
                  <p className="mt-2 text-xs sm:text-sm md:text-base font-bold tracking-[0.2em] text-stone-200 uppercase drop-shadow-md">
                    ★ NEW FLAVORS JUST DROPPED ★
                  </p>

                  {/* Flavor ticker line */}
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] sm:text-xs text-stone-300">
                    <Flame className="w-3.5 h-3.5 text-[#ff2e2e]" />
                    <span>Pinkman • Frosty • Pineapple Rings • Kiwi Smoothie • Space Flavour</span>
                  </div>
                </div>
              )}

              {/* VISUAL LAYOUT 2: DARKSIDE XPERIENCE (Matches Screenshot 2) */}
              {slide.bannerVisualType === 'darkside' && (
                <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 flex flex-col items-center justify-center text-center">
                  
                  {/* Brand Tag */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-black text-cyan-400 font-black text-xs flex items-center justify-center shadow-lg border border-cyan-500/40">
                      DS
                    </div>
                    <span className="text-[11px] sm:text-xs uppercase tracking-[0.3em] font-extrabold text-cyan-300">
                      DARKSIDE CORE & XPERIENCE
                    </span>
                  </div>

                  {/* Main Headline */}
                  <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 via-white to-cyan-400 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] leading-none">
                    DARKSIDE
                  </h1>

                  {/* Accent Neon Subtitle */}
                  <div className="mt-1 sm:mt-2">
                    <span className="inline-block text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-wider text-[#00e5d4] drop-shadow-[0_0_24px_rgba(0,229,212,0.7)] font-sans">
                      XPERIENCE DROP
                    </span>
                  </div>

                  <p className="mt-2 text-xs sm:text-sm md:text-base font-bold tracking-[0.2em] text-cyan-100 uppercase drop-shadow-md">
                    ★ RESIDENT KIWI • RAZZ B • URBAN GIN • EASY FREEZY ★
                  </p>

                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-cyan-500/20 text-[10px] sm:text-xs text-cyan-200">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Heavy Russian Dark Leaf • Intense Uncut Molasses</span>
                  </div>
                </div>
              )}

              {/* VISUAL LAYOUT 3: ALPHA HOOKAH & MAKLAUD (Matches Screenshot 3) */}
              {slide.bannerVisualType === 'hookah' && (
                <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 flex flex-col items-center justify-center text-center">
                  
                  {/* Brand Tag */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shadow-lg border border-amber-300">
                      AH
                    </div>
                    <span className="text-[11px] sm:text-xs uppercase tracking-[0.3em] font-extrabold text-amber-300">
                      ALPHA HOOKAH • MAKLAUD • EL BOMBER
                    </span>
                  </div>

                  {/* Main Headline */}
                  <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-white to-amber-400 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] leading-none">
                    MODEL X & SMART
                  </h1>

                  {/* Accent Subtitle */}
                  <div className="mt-1 sm:mt-2">
                    <span className="inline-block text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-wider text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)] font-sans">
                      RUSSIAN LUXURY HARDWARE
                    </span>
                  </div>

                  <p className="mt-2 text-xs sm:text-sm md:text-base font-bold tracking-[0.2em] text-amber-100 uppercase drop-shadow-md">
                    ★ AEROSPACE STAINLESS STEEL • MAGNETIC PURGES ★
                  </p>

                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/20 text-[10px] sm:text-xs text-amber-200">
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    <span>Free Shipping on Orders Over $89 • Master Distributor</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Carousel Navigation Arrow Controls (< and >) */}
        <button
          id="hero-carousel-prev-btn"
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          className="absolute left-2 sm:left-4 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xl"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          id="hero-carousel-next-btn"
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          className="absolute right-2 sm:right-4 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xl"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Bottom Progress Dot Indicators */}
        <div className="absolute bottom-3 left-0 right-0 z-20 flex items-center justify-center gap-2">
          {HERO_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`h-1.5 transition-all duration-300 rounded-full ${
                idx === currentIndex ? 'w-6 bg-cyan-400' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
