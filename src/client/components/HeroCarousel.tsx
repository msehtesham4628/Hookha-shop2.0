import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  targetLink: string;
  imageUrl: string;
  accentColor: string;
  brandLogos: string[];
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-precision-hookahs',
    badge: 'AEROSPACE GRADE AISI 304',
    title: 'Russian & European Master Hookahs',
    subtitle: 'Alpha Hookah • El Bomber • Maklaud • Steamulation • WOOKAH',
    targetLink: '/shop?category=hookahs',
    imageUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=2000&auto=format&fit=crop',
    accentColor: '#00b5ad',
    brandLogos: ['Alpha', 'Maklaud', 'El Bomber']
  },
  {
    id: 'slide-dark-leaf-tobacco',
    badge: '100+ FRESH SEALED BLENDS',
    title: 'Toasted Dark & Blonde Leaf Tobacco',
    subtitle: 'MustHave • DarkSide • BlackBurn • Tangiers • Bonche',
    targetLink: '/shop?category=tobacco',
    imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=2000&auto=format&fit=crop',
    accentColor: '#0088cc',
    brandLogos: ['MustHave', 'DarkSide', 'BlackBurn']
  },
  {
    id: 'slide-artisan-bowls',
    badge: 'HANDCRAFTED CLAY & GLAZED PHUNNELS',
    title: 'Artisan Thermal Retention Bowls',
    subtitle: 'Oblako • Kong Bowls • Alpaca • Solaris • Cosmo',
    targetLink: '/shop?category=bowls',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop',
    accentColor: '#f26c60',
    brandLogos: ['Oblako', 'Kong', 'Alpaca']
  },
  {
    id: 'slide-crystal-bases-coal',
    badge: 'HAND-CUT CRYSTAL & 100% COCONUT SHELL',
    title: 'Bohemian Crystal Bases & Natural Coal',
    subtitle: 'Caesar Crystal • Coco Loco • Na Grani • Kaloud Lotus',
    targetLink: '/shop?category=bases',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2000&auto=format&fit=crop',
    accentColor: '#f59e0b',
    brandLogos: ['Caesar', 'Coco Loco', 'Na Grani']
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
      {/* Aspect Ratio Container for 2-4 Visual Photo Slides */}
      <div className="relative w-full h-[320px] sm:h-[380px] md:h-[440px] lg:h-[500px] overflow-hidden">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id}
              onClick={() => onNavigate(slide.targetLink)}
              className={`absolute inset-0 w-full h-full cursor-pointer transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Slide Hero Image (Full Bleed Photography) */}
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className={`w-full h-full object-cover object-center transition-transform duration-7000 ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
                referrerPolicy="no-referrer"
                loading={index === 0 ? 'eager' : 'lazy'}
              />

              {/* Gradient Scrims: Dark gradient at bottom & left for visual contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/40 to-transparent" />

              {/* Minimal, Sleek Content Overlay (Not Text Heavy) */}
              <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 flex flex-col justify-end pb-8 sm:pb-12 z-20">
                <div className="max-w-2xl">
                  {/* Subtle Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/20 text-stone-200 mb-2.5 shadow-sm">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{slide.badge}</span>
                  </div>

                  {/* Clean, High-Contrast Title */}
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-md leading-tight mb-2">
                    {slide.title}
                  </h2>

                  {/* Single Line Brand Highlight */}
                  <p className="text-xs sm:text-sm text-stone-300 font-medium mb-4 drop-shadow-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: slide.accentColor }} />
                    <span>{slide.subtitle}</span>
                  </p>

                  {/* Minimal Call-To-Action Button */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(slide.targetLink);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white text-stone-950 hover:bg-stone-200 transition-all duration-200 shadow-lg hover:scale-102 active:scale-98 cursor-pointer"
                    >
                      <span>Explore Collection</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    
                    <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-stone-300 font-medium bg-black/40 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>100% Guaranteed Authentic</span>
                    </span>
                  </div>
                </div>
              </div>
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
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
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
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Bottom Slide Indicators (4 Dots / Pills) */}
        <div className="absolute bottom-4 right-4 sm:right-8 z-30 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <span className="text-[10px] font-mono text-stone-400 font-bold mr-1">
            0{currentIndex + 1} / 0{HERO_SLIDES.length}
          </span>
          {HERO_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                idx === currentIndex ? 'w-5 bg-cyan-400' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
