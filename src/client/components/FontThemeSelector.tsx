import React, { useState, useEffect } from 'react';
import { Type, Check, Sparkles } from 'lucide-react';

export type FontVibe = 'avant-garde' | 'imperial' | 'cyber' | 'haute';

interface FontOption {
  id: FontVibe;
  name: string;
  tagline: string;
  displayFont: string;
  bodyFont: string;
  sampleText: string;
  accentBadge: string;
}

const FONT_OPTIONS: FontOption[] = [
  {
    id: 'avant-garde',
    name: 'Avant-Garde Lounge',
    tagline: 'Bold, contemporary European nightlife & luxury boutique',
    displayFont: 'Syne (Avant-Garde)',
    bodyFont: 'Outfit (Geometric Sans)',
    sampleText: 'FUMARE HOOKAH',
    accentBadge: 'Cool & Edgy'
  },
  {
    id: 'imperial',
    name: 'Imperial Palace',
    tagline: 'Regal Byzantine gold, sculpted Middle-Eastern royal shisha',
    displayFont: 'Cinzel Decorative & Cinzel',
    bodyFont: 'Plus Jakarta Sans',
    sampleText: 'FUMARE HOOKAH',
    accentBadge: 'Royal Luxury'
  },
  {
    id: 'cyber',
    name: 'Cyber Hookah',
    tagline: 'Precision engineered modern stems, sleek high-tech minimalism',
    displayFont: 'Outfit Display',
    bodyFont: 'Outfit Tech Sans',
    sampleText: 'FUMARE HOOKAH',
    accentBadge: 'High-Tech'
  },
  {
    id: 'haute',
    name: 'Haute Shisha',
    tagline: 'High-fashion editorial elegance with high-contrast serifs',
    displayFont: 'Playfair Display',
    bodyFont: 'Outfit Sans',
    sampleText: 'FUMARE HOOKAH',
    accentBadge: 'Editorial'
  }
];

export const FontThemeSelector: React.FC = () => {
  const [currentVibe, setCurrentVibe] = useState<FontVibe>('avant-garde');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fumare_font_vibe') as FontVibe | null;
      if (saved && ['avant-garde', 'imperial', 'cyber', 'haute'].includes(saved)) {
        setCurrentVibe(saved);
        document.documentElement.setAttribute('data-font-vibe', saved);
      } else {
        document.documentElement.setAttribute('data-font-vibe', 'avant-garde');
      }
    } catch {
      document.documentElement.setAttribute('data-font-vibe', 'avant-garde');
    }
  }, []);

  const handleSelectVibe = (vibe: FontVibe) => {
    setCurrentVibe(vibe);
    document.documentElement.setAttribute('data-font-vibe', vibe);
    try {
      localStorage.setItem('fumare_font_vibe', vibe);
    } catch {}
  };

  const activeOption = FONT_OPTIONS.find((opt) => opt.id === currentVibe) || FONT_OPTIONS[0];

  return (
    <aside aria-label="Typography Font Switcher" className="fixed bottom-4 right-4 z-40 select-none">
      {/* Expanded Modal / Popover */}
      {isOpen && (
        <div className="mb-2 w-80 sm:w-92 bg-stone-900/95 backdrop-blur-md text-stone-100 rounded-2xl shadow-2xl border border-stone-700/80 p-4 transition-all animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Type className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Cool Fonts & Typography
                </h4>
                <p className="text-[10px] text-stone-400">Choose your website aesthetic</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-white text-xs p-1 rounded-md hover:bg-stone-800 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 space-y-2 max-h-76 overflow-y-auto pr-1 no-scrollbar">
            {FONT_OPTIONS.map((option) => {
              const isSelected = option.id === currentVibe;
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectVibe(option.id)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500/80 shadow-md shadow-amber-500/10'
                      : 'bg-stone-800/60 hover:bg-stone-800 border-stone-700/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      {option.name}
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-stone-700 text-stone-300 border border-stone-600">
                      {option.accentBadge}
                    </span>
                  </div>

                  <p className="text-[10px] text-stone-400 line-clamp-1 leading-snug">
                    {option.tagline}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-stone-800/80 text-[11px]">
                    <span className="text-stone-400 text-[10px]">
                      Display: <strong className="text-stone-200">{option.displayFont}</strong>
                    </span>
                    <span
                      className={`text-xs font-bold tracking-widest ${
                        option.id === 'avant-garde'
                          ? 'font-syne'
                          : option.id === 'imperial'
                          ? 'font-cinzel-dec'
                          : option.id === 'haute'
                          ? 'font-playfair'
                          : 'font-outfit'
                      } ${isSelected ? 'text-amber-300' : 'text-stone-300'}`}
                    >
                      FUMARE
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between text-[10px] text-stone-400">
            <span className="inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Real-time typography update</span>
            </span>
            <span className="text-amber-400 font-semibold">{activeOption.name}</span>
          </div>
        </div>
      )}

      {/* Floating Trigger Pill */}
      <button
        id="font-theme-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Switch website typography style"
        className="flex items-center gap-2 bg-stone-900/90 hover:bg-stone-900 text-white px-3 py-2 rounded-full border border-stone-700/80 shadow-lg backdrop-blur-md transition-all hover:scale-104 cursor-pointer group"
      >
        <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
          <Type className="w-3 h-3" />
        </div>
        <span className="text-[11px] font-bold tracking-wider text-stone-200 group-hover:text-amber-300 uppercase">
          Font: <span className="text-white">{activeOption.name.split(' ')[0]}</span>
        </span>
      </button>
    </aside>
  );
};
