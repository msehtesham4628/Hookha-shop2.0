import React from 'react';
import { useStore } from '../store/useStore.js';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export const AgeGateModal: React.FC = () => {
  const { isAgeVerified, setAgeVerified } = useStore();

  if (isAgeVerified) return null;

  const handleConfirmAge = () => {
    setAgeVerified(true);
  };

  const handleDeclineAge = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div
        id="age-gate-dialog"
        className="w-full max-w-md bg-white border border-stone-300 rounded-sm shadow-2xl p-6 sm:p-8 text-center"
      >
        <div className="mx-auto w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 tracking-wide mb-1">
          Age Verification Required
        </h3>
        
        <p className="text-[11px] uppercase tracking-widest text-amber-800 font-semibold mb-4">
          SULTAN HOOKAH CO. • LUXURY PURVEYOR
        </p>

        <div className="bg-stone-50 border border-stone-200 p-4 rounded-xs text-xs text-stone-600 leading-relaxed mb-6 text-left">
          <p className="mb-2">
            You must be at least <strong>21 years of age</strong> to view and purchase premium shisha tobacco, hookahs, and related accessories.
          </p>
          <p className="text-[11px] text-stone-500 italic">
            By entering, you confirm you meet the legal smoking age in your jurisdiction. Age is verified via ID upon checkout and carrier delivery.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            id="age-gate-confirm-btn"
            onClick={handleConfirmAge}
            className="flex-1 bg-stone-900 hover:bg-amber-900 text-white font-semibold text-xs py-3 px-4 rounded-xs transition-colors shadow-xs"
          >
            I am 21 or Older — Enter
          </button>
          <button
            id="age-gate-decline-btn"
            onClick={handleDeclineAge}
            className="sm:w-auto bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs py-3 px-4 rounded-xs transition-colors"
          >
            Exit Store
          </button>
        </div>
      </div>
    </div>
  );
};
