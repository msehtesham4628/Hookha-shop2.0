import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext.js';
import { Globe, ChevronDown, Check, Sparkles } from 'lucide-react';
import { LanguageCode } from '../i18n/translations.js';

interface LanguageSelectorProps {
  variant?: 'topbar' | 'compact' | 'drawer';
  theme?: 'light' | 'dark';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'topbar', theme = 'light' }) => {
  const { currentLanguage, languageOption, setLanguage, autoDetected, supportedLanguages, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  if (variant === 'drawer') {
    const isDark = theme === 'dark';
    return (
      <div className={`border-t ${isDark ? 'border-stone-800' : 'border-stone-200'} pt-4 mt-4`}>
        <div className={`flex items-center gap-2 mb-2.5 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-stone-300' : 'text-stone-900'}`}>
          <Globe className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-amber-900'}`} />
          <span>{t('topbar.switch_language', 'Select Language')}</span>
          {autoDetected && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded-xs font-semibold ${isDark ? 'bg-amber-950 text-amber-300 border border-amber-800/60' : 'bg-amber-100 text-amber-900'}`}>
              Auto
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {supportedLanguages.map((lang) => {
            const isSelected = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`flex items-center justify-between px-2.5 py-2 text-xs rounded-sm border transition-colors cursor-pointer ${
                  isSelected
                    ? isDark
                      ? 'bg-amber-800 text-white border-amber-600 font-bold shadow-xs'
                      : 'bg-amber-900 text-white border-amber-900 font-bold shadow-xs'
                    : isDark
                      ? 'bg-stone-800/90 hover:bg-stone-700 text-stone-200 border-stone-700'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300 font-medium'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-sm">{lang.flag}</span>
                  <span>{lang.nativeLabel}</span>
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-amber-300" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        id="language-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 transition-colors cursor-pointer rounded-xs ${
          variant === 'topbar'
            ? 'text-stone-300 hover:text-white text-[10px] sm:text-[11px] font-medium py-0.5 px-2 bg-stone-900/60 hover:bg-stone-900 border border-stone-700/60'
            : 'text-stone-700 hover:text-amber-900 text-xs font-semibold py-1.5 px-2.5 bg-stone-100/80 border border-stone-200'
        }`}
        title="Change language / Сменить язык"
      >
        <span className="text-xs">{languageOption.flag}</span>
        <span className="font-medium tracking-normal">{languageOption.nativeLabel}</span>
        {autoDetected && (
          <span className="hidden sm:inline-flex items-center gap-0.5 bg-amber-500/20 text-amber-300 text-[9px] px-1 py-0.2 rounded-xs">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Auto</span>
          </span>
        )}
        <ChevronDown className="w-3 h-3 text-stone-400" />
      </button>

      {isOpen && (
        <div
          id="language-dropdown-menu"
          className="absolute right-0 mt-1.5 w-48 bg-white border border-stone-200 rounded-xs shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <div className="px-3 py-1.5 border-b border-stone-100 flex items-center justify-between text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
            <span>{t('topbar.switch_language', 'Language')}</span>
            {autoDetected && <span className="text-amber-700 font-bold">Auto-Detected</span>}
          </div>

          <div className="py-1">
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors text-left ${
                  currentLanguage === lang.code
                    ? 'bg-amber-50 text-amber-950 font-bold'
                    : 'text-stone-700 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{lang.flag}</span>
                  <div>
                    <span className="block leading-tight">{lang.nativeLabel}</span>
                    <span className="block text-[10px] text-stone-400 leading-none">{lang.label}</span>
                  </div>
                </div>
                {currentLanguage === lang.code && (
                  <Check className="w-3.5 h-3.5 text-amber-800" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
