import React, { useState, useEffect } from 'react';
import { Type, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { useStore } from '../store/useStore.js';

export type FontVibe = 'avant-garde' | 'imperial' | 'cyber' | 'haute';

export interface FontOption {
  id: FontVibe;
  name: string;
  tagline: string;
  displayFont: string;
  bodyFont: string;
  sampleText: string;
  accentBadge: string;
}

export const FONT_OPTIONS: FontOption[] = [
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
  const { isAdmin, settings, updateFontVibe, loadSettings } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  // Sync font from store settings or localStorage on initial load
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const currentVibe: FontVibe = (settings?.fontVibe as FontVibe) || (() => {
    try {
      const saved = localStorage.getItem('fumare_font_vibe') as FontVibe | null;
      if (saved && ['avant-garde', 'imperial', 'cyber', 'haute'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'avant-garde';
  })();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-font-vibe', currentVibe);
    }
  }, [currentVibe]);

  // Only Admins can see and toggle the floating font widget
  if (!isAdmin) {
    return null;
  }

  const handleSelectVibe = async (vibe: FontVibe) => {
    await updateFontVibe(vibe);
  };

  const activeOption = FONT_OPTIONS.find((opt) => opt.id === currentVibe) || FONT_OPTIONS[0];

  return (
    <aside aria-label="Admin Typography Control" className="fixed bottom-4 right-4 z-40 select-none">
      {/* Expanded Modal / Popover */}
      {isOpen && (
        <div className="mb-2 w-80 sm:w-96 bg-stone-900/95 backdrop-blur-md text-stone-100 rounded-2xl shadow-2xl border border-amber-600/50 p-4 transition-all animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Admin Typography Control
                  </h4>
                  <span className="text-[9px] bg-amber-900/80 text-amber-200 font-bold px-1.5 py-0.2 rounded">
                    Global
                  </span>
                </div>
                <p className="text-[10px] text-stone-400">Sets store-wide font for all visitors</p>
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
                      ? 'bg-amber-950/40 border-amber-500/80 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/40'
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
              <span>Broadcasts to all customers</span>
            </span>
            <span className="text-amber-400 font-semibold">{activeOption.name}</span>
          </div>
        </div>
      )}

      {/* Floating Trigger Pill for Admins */}
      <button
        id="font-theme-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Admin: Switch website typography style globally"
        className="flex items-center gap-2 bg-stone-900/95 hover:bg-stone-900 text-white px-3 py-2 rounded-full border border-amber-600/70 shadow-xl backdrop-blur-md transition-all hover:scale-104 cursor-pointer group ring-1 ring-amber-500/30"
      >
        <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
          <Type className="w-3 h-3" />
        </div>
        <span className="text-[11px] font-bold tracking-wider text-stone-200 group-hover:text-amber-300 uppercase flex items-center gap-1">
          <span>Font:</span>
          <span className="text-amber-400">{activeOption.name.split(' ')[0]}</span>
          <span className="text-[9px] bg-amber-950 text-amber-300 px-1 py-0.2 rounded border border-amber-700/50">Admin</span>
        </span>
      </button>
    </aside>
  );
};
