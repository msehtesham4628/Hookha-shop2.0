import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LanguageCode, LanguageOption, SUPPORTED_LANGUAGES, translations } from './translations.js';
import { translateTexts } from '../services/api.js';

interface LanguageContextType {
  currentLanguage: LanguageCode;
  languageOption: LanguageOption;
  setLanguage: (lang: LanguageCode) => void;
  autoDetected: boolean;
  t: (key: string, defaultVal?: string, vars?: Record<string, string | number>) => string;
  supportedLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'whm_language';
const AUTO_KEY = 'whm_lang_auto_checked';

function detectBrowserLanguage(): LanguageCode {
  if (typeof window === 'undefined' || !navigator) return 'en';
  
  const userLangs = [
    navigator.language,
    ...(navigator.languages || [])
  ].filter(Boolean);

  for (const l of userLangs) {
    const code = l.toLowerCase().split('-')[0];
    if (/^[a-z]{2,3}$/.test(code)) return code;
  }

  return 'en';
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<LanguageCode>('en');
  const [autoDetected, setAutoDetected] = useState<boolean>(false);
  const [translatedDictionary, setTranslatedDictionary] = useState<Record<string, string> | null>(null);

  const isLocalLanguage = (language: LanguageCode) => Object.prototype.hasOwnProperty.call(translations, language);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
    if (saved && /^[a-z]{2,3}$/i.test(saved)) {
      setCurrentLanguageState(saved);
      setAutoDetected(false);
    } else {
      const detected = detectBrowserLanguage();
      setCurrentLanguageState(detected);
      setAutoDetected(true);
      localStorage.setItem(STORAGE_KEY, detected);
      localStorage.setItem(AUTO_KEY, 'true');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setTranslatedDictionary(null);
    if (isLocalLanguage(currentLanguage) || currentLanguage === 'en') return;

    const sourceEntries = Object.entries(translations.en);
    translateTexts(sourceEntries.map(([, text]) => text), currentLanguage)
      .then((translated) => {
        if (!cancelled) {
          setTranslatedDictionary(Object.fromEntries(sourceEntries.map(([key], index) => [key, translated[index] || sourceEntries[index][1]])));
        }
      })
      .catch(() => {
        if (!cancelled) setTranslatedDictionary(null);
      });

    return () => {
      cancelled = true;
    };
  }, [currentLanguage]);

  useEffect(() => {
    const opt = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = opt.dir;
  }, [currentLanguage]);

  const setLanguage = (lang: LanguageCode) => {
    setCurrentLanguageState(lang);
    setAutoDetected(false);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  const t = (key: string, defaultVal?: string, vars?: Record<string, string | number>): string => {
    const langDict = translatedDictionary || translations[currentLanguage] || translations.en;
    let text = langDict[key] || translations.en[key] || defaultVal || key;

    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }

    return text;
  };

  const languageOption = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || {
    code: currentLanguage,
    label: currentLanguage.toUpperCase(),
    nativeLabel: currentLanguage.toUpperCase(),
    flag: '🌐',
    dir: ['ar', 'fa', 'he', 'ur'].includes(currentLanguage) ? 'rtl' as const : 'ltr' as const
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        languageOption,
        setLanguage,
        autoDetected,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}

export const useLanguage = useTranslation;
