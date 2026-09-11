import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Plus,
  Trash2,
  ExternalLink,
  Save,
  RotateCcw,
  Check,
  Eye,
  Type,
  Megaphone,
  Layout,
  ShieldAlert,
  PhoneCall,
  MoveUp,
  MoveDown,
  ArrowRight
} from 'lucide-react';
import { StoreSettings } from '../../types/index.js';

interface StorefrontCmsPanelProps {
  currentSettings: StoreSettings | null;
  onSave: (updated: Partial<StoreSettings>) => Promise<void>;
  saving: boolean;
  adminTheme?: 'obsidian' | 'slate' | 'ivory';
}

const CURATED_PRESET_IMAGES = [
  { label: 'Matte Black Alpha Hookah', url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1400&auto=format&fit=crop' },
  { label: 'Gold Maklaud Dragon', url: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=1400&auto=format&fit=crop' },
  { label: 'Cyberpunk El Bomber Katana', url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=1400&auto=format&fit=crop' },
  { label: 'Wookah European Hardwood', url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1400&auto=format&fit=crop' },
  { label: 'Craft Cut Crystal Base', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1400&auto=format&fit=crop' },
  { label: 'Premium Dark Leaf Tobacco', url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1400&auto=format&fit=crop' }
];

export const StorefrontCmsPanel: React.FC<StorefrontCmsPanelProps> = ({
  currentSettings,
  onSave,
  saving,
  adminTheme = 'obsidian'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'hero' | 'announcements' | 'homepage' | 'compliance'>('hero');

  // Hero Carousel State
  const [heroSlides, setHeroSlides] = useState<string[]>([
    '/accessories/accessories_1.jpg',
    '/accessories/accessories_2.jpg',
    '/accessories/accessories_3.jpg',
    '/tobacco/tobacco_1.jpg',
    '/tobacco/tobacco_2.jpg',
    '/tobacco/tobacco_3.jpg'
  ]);
  const [newSlideUrl, setNewSlideUrl] = useState('');
  const [heroBadge, setHeroBadge] = useState('Imported Hookah Collection');
  const [heroTitle, setHeroTitle] = useState('Russian & European Master Hookahs');
  const [heroSubtitle, setHeroSubtitle] = useState('Alpha Hookah • El Bomber • Maklaud • Steamulation • WOOKAH');
  const [heroCtaText, setHeroCtaText] = useState('Shop the Catalog');
  const [heroCtaLink, setHeroCtaLink] = useState('/shop?category=hookahs');
  const [heroSecondaryBadge, setHeroSecondaryBadge] = useState('2026 Reserve Collection');

  // Global Header & Announcements
  const [announcement, setAnnouncement] = useState('Free shipping on luxury orders above $150 • Authentic Russian & European Hookahs');
  const [storeName, setStoreName] = useState('World Hookah Market');
  const [storeTagline, setStoreTagline] = useState('The Premier Destination for Russian & European Hookahs, Dark Leaf Shisha & Crystal');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('150');
  const [taxRate, setTaxRate] = useState('8.25');

  // Homepage Sections & Copy
  const [newArrivalsTitle, setNewArrivalsTitle] = useState('NEW ARRIVALS');
  const [bestSellersTitle, setBestSellersTitle] = useState('OUR BEST SELLERS');
  const [shippingPropTitle, setShippingPropTitle] = useState('Same Day Dispatch');
  const [shippingPropSubtitle, setShippingPropSubtitle] = useState('USA (1–4 days) · Worldwide (3–14 days)');
  const [discountPropTitle, setDiscountPropTitle] = useState('Save up to 50%');
  const [discountPropSubtitle, setDiscountPropSubtitle] = useState('Direct Importer Bulk Pricing');
  const [supportPropTitle, setSupportPropTitle] = useState('VIP Concierge');
  const [supportPropSubtitle, setSupportPropSubtitle] = useState('Live sommelier flavor advice 7 days a week');
  const [aboutStoryTitle, setAboutStoryTitle] = useState('FUMARE HOOKAH IS AN ONLINE HOOKAH AND SHISHA STORE WITH WORLDWIDE SHIPPING.');
  const [aboutStoryText, setAboutStoryText] = useState(
    'Fumare Hookah offers an extensive selection of premium hookah products, including stems, bowls, flasks, accessories, charcoal, and world-renowned shisha tobacco brands such as MustHave, DarkSide, BlackBurn, Tangiers, and Adalya. We work directly with master manufacturers across Russia, Germany, Poland, and the USA to guarantee 100% authenticity and fresh factory packaging.'
  );
  const [newsletterTitle, setNewsletterTitle] = useState('SUBSCRIBE TO OUR NEWSLETTER TO RECEIVE THE BEST NEW DEALS!');
  const [newsletterSubtitle, setNewsletterSubtitle] = useState('Get first notice on exclusive flavor restocks, limited drops, and member-only coupons.');

  // Support & Compliance
  const [supportEmail, setSupportEmail] = useState('support@fumarehookah.com');
  const [supportPhone, setSupportPhone] = useState('+1 (800) 785-8260');
  const [supportHours, setSupportHours] = useState('Mon - Sun: 9:00 AM - 10:00 PM EST');
  const [storeAddress, setStoreAddress] = useState('742 Evergreen Terrace, Suite 400, Beverly Hills, CA 90210');
  const [prop65Warning, setProp65Warning] = useState(
    'WARNING: This product contains chemicals known to the State of California to cause cancer and birth defects or other reproductive harm.'
  );
  const [ageComplianceNotice, setAgeComplianceNotice] = useState(
    'Strict 21+ Age Verification Enforced. All tobacco purchases require government photo ID validation and adult signature upon courier delivery.'
  );

  // Sync with currentSettings when provided
  useEffect(() => {
    if (!currentSettings) return;

    if (Array.isArray(currentSettings.heroSlides) && currentSettings.heroSlides.length > 0) {
      setHeroSlides(currentSettings.heroSlides);
    } else if (typeof currentSettings.heroSlides === 'string' && currentSettings.heroSlides.trim()) {
      const parsed = currentSettings.heroSlides.split('\n').map((s: string) => s.trim()).filter(Boolean);
      if (parsed.length > 0) setHeroSlides(parsed);
    }

    if (currentSettings.heroBadge) setHeroBadge(currentSettings.heroBadge);
    if (currentSettings.heroTitle) setHeroTitle(currentSettings.heroTitle);
    if (currentSettings.heroSubtitle) setHeroSubtitle(currentSettings.heroSubtitle);
    if (currentSettings.heroCtaText) setHeroCtaText(currentSettings.heroCtaText);
    if (currentSettings.heroCtaLink) setHeroCtaLink(currentSettings.heroCtaLink);
    if (currentSettings.heroSecondaryBadge) setHeroSecondaryBadge(currentSettings.heroSecondaryBadge);

    if (currentSettings.announcement || currentSettings.bannerAnnouncement) {
      setAnnouncement(currentSettings.announcement || currentSettings.bannerAnnouncement || '');
    }
    if (currentSettings.storeName) setStoreName(currentSettings.storeName);
    if (currentSettings.storeTagline) setStoreTagline(currentSettings.storeTagline);
    if (currentSettings.freeShippingThreshold !== undefined) {
      setFreeShippingThreshold(String(currentSettings.freeShippingThreshold));
    }
    if (currentSettings.taxRate !== undefined) {
      setTaxRate(((currentSettings.taxRate || 0) * 100).toFixed(2));
    }

    if (currentSettings.newArrivalsTitle) setNewArrivalsTitle(currentSettings.newArrivalsTitle);
    if (currentSettings.bestSellersTitle) setBestSellersTitle(currentSettings.bestSellersTitle);
    if (currentSettings.shippingPropTitle) setShippingPropTitle(currentSettings.shippingPropTitle);
    if (currentSettings.shippingPropSubtitle) setShippingPropSubtitle(currentSettings.shippingPropSubtitle);
    if (currentSettings.discountPropTitle) setDiscountPropTitle(currentSettings.discountPropTitle);
    if (currentSettings.discountPropSubtitle) setDiscountPropSubtitle(currentSettings.discountPropSubtitle);
    if (currentSettings.supportPropTitle) setSupportPropTitle(currentSettings.supportPropTitle);
    if (currentSettings.supportPropSubtitle) setSupportPropSubtitle(currentSettings.supportPropSubtitle);
    if (currentSettings.aboutStoryTitle) setAboutStoryTitle(currentSettings.aboutStoryTitle);
    if (currentSettings.aboutStoryText) setAboutStoryText(currentSettings.aboutStoryText);
    if (currentSettings.newsletterTitle) setNewsletterTitle(currentSettings.newsletterTitle);
    if (currentSettings.newsletterSubtitle) setNewsletterSubtitle(currentSettings.newsletterSubtitle);

    if (currentSettings.supportEmail) setSupportEmail(currentSettings.supportEmail);
    if (currentSettings.supportPhone) setSupportPhone(currentSettings.supportPhone);
    if (currentSettings.supportHours) setSupportHours(currentSettings.supportHours);
    if (currentSettings.storeAddress) setStoreAddress(currentSettings.storeAddress);
    if (currentSettings.prop65Warning) setProp65Warning(currentSettings.prop65Warning);
    if (currentSettings.ageComplianceNotice) setAgeComplianceNotice(currentSettings.ageComplianceNotice);
  }, [currentSettings]);

  const handleAddSlide = () => {
    if (!newSlideUrl.trim()) return;
    setHeroSlides(prev => [...prev, newSlideUrl.trim()]);
    setNewSlideUrl('');
  };

  const handleRemoveSlide = (index: number) => {
    setHeroSlides(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    setHeroSlides(prev => {
      const copy = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleApplyPreset = (url: string) => {
    if (!heroSlides.includes(url)) {
      setHeroSlides(prev => [...prev, url]);
    }
  };

  const handleSubmitAll = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTax = (parseFloat(taxRate) || 0) / 100;
    const parsedFreeShipping = parseFloat(freeShippingThreshold) || 150;

    const payload: Partial<StoreSettings> = {
      heroSlides,
      heroBadge: heroBadge.trim(),
      heroTitle: heroTitle.trim(),
      heroSubtitle: heroSubtitle.trim(),
      heroCtaText: heroCtaText.trim(),
      heroCtaLink: heroCtaLink.trim(),
      heroSecondaryBadge: heroSecondaryBadge.trim(),

      announcement: announcement.trim(),
      bannerAnnouncement: announcement.trim(),
      storeName: storeName.trim(),
      storeTagline: storeTagline.trim(),
      freeShippingThreshold: parsedFreeShipping,
      taxRate: parsedTax,
      taxRatePercent: parseFloat(taxRate) || 0,

      newArrivalsTitle: newArrivalsTitle.trim(),
      bestSellersTitle: bestSellersTitle.trim(),
      shippingPropTitle: shippingPropTitle.trim(),
      shippingPropSubtitle: shippingPropSubtitle.trim(),
      discountPropTitle: discountPropTitle.trim(),
      discountPropSubtitle: discountPropSubtitle.trim(),
      supportPropTitle: supportPropTitle.trim(),
      supportPropSubtitle: supportPropSubtitle.trim(),
      aboutStoryTitle: aboutStoryTitle.trim(),
      aboutStoryText: aboutStoryText.trim(),
      newsletterTitle: newsletterTitle.trim(),
      newsletterSubtitle: newsletterSubtitle.trim(),

      supportEmail: supportEmail.trim(),
      supportPhone: supportPhone.trim(),
      supportHours: supportHours.trim(),
      storeAddress: storeAddress.trim(),
      prop65Warning: prop65Warning.trim(),
      ageComplianceNotice: ageComplianceNotice.trim()
    };

    await onSave(payload);
  };

  const isDark = adminTheme !== 'ivory';

  const cardBg = isDark ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-900';
  const inputBg = isDark ? 'bg-stone-950 border-stone-700 text-white placeholder-stone-500' : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400';
  const labelColor = isDark ? 'text-stone-300' : 'text-stone-700';
  const mutedText = isDark ? 'text-stone-400' : 'text-stone-500';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* CMS Studio Banner & Controls */}
      <div className={`${cardBg} border rounded-xs p-6 shadow-sm`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800/40 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="font-serif text-xl font-bold tracking-wide">
                Storefront CMS & Content Studio
              </h2>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-xs border border-amber-500/30">
                Live Publishing
              </span>
            </div>
            <p className={`text-xs ${mutedText} max-w-2xl`}>
              Directly edit all consumer-facing images, banners, hero copy, titles, value propositions, and legal notices. Changes propagate immediately across the storefront.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSubmitAll}
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-xs font-bold px-5 py-2.5 rounded-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Publishing Live...' : 'Publish Changes Live'}</span>
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex flex-wrap gap-2 pt-4">
          <button
            type="button"
            onClick={() => setActiveSubTab('hero')}
            className={`px-3.5 py-2 rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'hero'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : isDark ? 'bg-stone-800 text-stone-300 hover:bg-stone-700' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Hero & Carousel ({heroSlides.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('announcements')}
            className={`px-3.5 py-2 rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'announcements'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : isDark ? 'bg-stone-800 text-stone-300 hover:bg-stone-700' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Announcements & Header</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('homepage')}
            className={`px-3.5 py-2 rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'homepage'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : isDark ? 'bg-stone-800 text-stone-300 hover:bg-stone-700' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Homepage Copy & Badges</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('compliance')}
            className={`px-3.5 py-2 rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'compliance'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : isDark ? 'bg-stone-800 text-stone-300 hover:bg-stone-700' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Concierge & Legal Notice</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmitAll} className="space-y-6">
        {/* ============================================================ */}
        {/* 1. HERO CAROUSEL & BANNER TAB */}
        {/* ============================================================ */}
        {activeSubTab === 'hero' && (
          <div className="space-y-6">
            {/* Live Visual Preview of Hero Banner */}
            <div className={`${cardBg} border rounded-xs p-5 shadow-xs space-y-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-500" />
                  <h3 className="font-serif text-sm font-bold uppercase tracking-wider">
                    Live Hero Banner Preview
                  </h3>
                </div>
                <span className="text-[10px] text-stone-400 font-mono">Widescreen Simulation</span>
              </div>

              <div className="relative rounded-xs overflow-hidden h-64 sm:h-80 w-full bg-stone-950 border border-stone-800 flex items-end p-6 sm:p-8">
                {heroSlides.length > 0 && (
                  <img
                    src={heroSlides[0]}
                    alt="Hero slide preview"
                    className="absolute inset-0 w-full h-full object-cover filter brightness-75"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

                <div className="relative z-10 max-w-xl space-y-2 text-white text-left">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-200 backdrop-blur-md">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{heroBadge || 'Hero Tag'}</span>
                  </div>

                  <h1 className="font-serif text-xl sm:text-3xl font-bold leading-tight drop-shadow-md">
                    {heroTitle || 'Main Headline Title'}
                  </h1>

                  <p className="text-xs sm:text-sm text-stone-200 font-medium line-clamp-2">
                    {heroSubtitle || 'Brands and flavor subtitle text'}
                  </p>

                  <div className="pt-2 flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 bg-white text-stone-950 font-bold text-xs px-4 py-2 rounded-xs shadow">
                      <span>{heroCtaText || 'Button Text'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>

                    {heroSecondaryBadge && (
                      <span className="text-[11px] text-stone-300 bg-black/60 px-3 py-1.5 rounded-xs border border-white/10 backdrop-blur-md">
                        {heroSecondaryBadge}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Active Slides Manager */}
            <div className={`${cardBg} border rounded-xs p-6 shadow-xs space-y-4`}>
              <div className="flex items-center justify-between border-b border-stone-800/40 pb-3">
                <div>
                  <h3 className="font-serif text-sm font-bold uppercase tracking-wider">
                    Hero Slide Images Carousel ({heroSlides.length})
                  </h3>
                  <p className={`text-xs ${mutedText} mt-0.5`}>
                    High-definition images rotating on the storefront hero entrance. Drag or reorder to set primary slide.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setHeroSlides([
                    '/accessories/accessories_1.jpg',
                    '/accessories/accessories_2.jpg',
                    '/accessories/accessories_3.jpg',
                    '/tobacco/tobacco_1.jpg',
                    '/tobacco/tobacco_2.jpg',
                    '/tobacco/tobacco_3.jpg'
                  ])}
                  className="text-[11px] text-amber-500 hover:underline cursor-pointer"
                >
                  Reset to Store Defaults
                </button>
              </div>

              {/* Add New Slide Form */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={newSlideUrl}
                  onChange={(e) => setNewSlideUrl(e.target.value)}
                  placeholder="Paste direct image URL (https://... or /path/to/img.jpg)"
                  className={`flex-1 ${inputBg} border rounded-xs px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500`}
                />
                <button
                  type="button"
                  onClick={handleAddSlide}
                  disabled={!newSlideUrl.trim()}
                  className="bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Slide</span>
                </button>
              </div>

              {/* Curated Hookah Image Quick Select */}
              <div className="pt-2">
                <label className={`block text-[11px] font-bold uppercase tracking-wider ${labelColor} mb-2`}>
                  Or Add Curated Luxury Hookah Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {CURATED_PRESET_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset.url)}
                      className="group relative rounded-xs overflow-hidden border border-stone-700 hover:border-amber-500 transition-all text-left p-1 bg-stone-950/60 cursor-pointer"
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-14 object-cover rounded-xs filter brightness-90 group-hover:scale-105 transition-transform"
                      />
                      <span className="text-[10px] text-stone-300 block truncate mt-1 font-medium">
                        + {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Slides List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3">
                {heroSlides.map((url, index) => (
                  <div
                    key={index}
                    className={`relative group rounded-xs border ${isDark ? 'border-stone-800 bg-stone-950' : 'border-stone-200 bg-stone-50'} p-2.5 flex flex-col justify-between space-y-2`}
                  >
                    <div className="relative h-28 w-full rounded-xs overflow-hidden bg-black">
                      <img
                        src={url}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=600';
                        }}
                      />
                      <span className="absolute top-1.5 left-1.5 bg-black/75 text-amber-400 font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-xs">
                        #{index + 1} {index === 0 && '• PRIMARY'}
                      </span>
                    </div>

                    <p className="text-[10px] font-mono truncate text-stone-400" title={url}>
                      {url}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-stone-800/40 text-xs">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveSlide(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-stone-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move left/up"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveSlide(index, 'down')}
                          disabled={index === heroSlides.length - 1}
                          className="p-1 text-stone-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move right/down"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveSlide(index)}
                        className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer flex items-center gap-1 text-[11px]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Text & CTA Customization */}
            <div className={`${cardBg} border rounded-xs p-6 shadow-xs space-y-4`}>
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider border-b border-stone-800/40 pb-2">
                Hero Headline, Subtitle & Call to Action
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className={`block font-bold ${labelColor} mb-1`}>
                    Top Eyebrow Badge
                  </label>
                  <input
                    type="text"
                    value={heroBadge}
                    onChange={(e) => setHeroBadge(e.target.value)}
                    placeholder="e.g. Imported Hookah Collection"
                    className={`w-full ${inputBg} border rounded-xs p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500`}
                  />
                  <p className={`text-[10px] ${mutedText} mt-1`}>Small highlight pill above the headline.</p>
                </div>

                <div>
                  <label className={`block font-bold ${labelColor} mb-1`}>
                    Secondary Verification Badge
                  </label>
                  <input
                    type="text"
                    value={heroSecondaryBadge}
                    onChange={(e) => setHeroSecondaryBadge(e.target.value)}
                    placeholder="e.g. 2026 Reserve Collection"
                    className={`w-full ${inputBg} border rounded-xs p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500`}
                  />
                  <p className={`text-[10px] ${mutedText} mt-1`}>Right pill next to CTA button.</p>
                </div>

                <div className="sm:col-span-2">
                  <label className={`block font-bold ${labelColor} mb-1`}>
                    Main Display Title / Headline
                  </label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="e.g. Russian & European Master Hookahs"
                    className={`w-full ${inputBg} border rounded-xs p-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-amber-500`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={`block font-bold ${labelColor} mb-1`}>
                    Subtitle / Brands Highlight
                  </label>
                  <input
                    type="text"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="e.g. Alpha Hookah • El Bomber • Maklaud • Steamulation • WOOKAH"
                    className={`w-full ${inputBg} border rounded-xs p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500`}
                  />
                </div>

                <div>
                  <label className={`block font-bold ${labelColor} mb-1`}>
                    Primary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={heroCtaText}
                    onChange={(e) => setHeroCtaText(e.target.value)}
                    placeholder="e.g. Shop the Catalog"
                    className={`w-full ${inputBg} border rounded-xs p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500`}
                  />
                </div>

                <div>
                  <label className={`block font-bold ${labelColor} mb-1`}>
                    Primary CTA Link Path
                  </label>
                  <input
                    type="text"
                    value={heroCtaLink}
                    onChange={(e) => setHeroCtaLink(e.target.value)}
                    placeholder="e.g. /shop?category=hookahs"
                    className={`w-full ${inputBg} border rounded-xs p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 2. ANNOUNCEMENTS & HEADER TAB */}
        {/* ============================================================ */}
        {activeSubTab === 'announcements' && (
          <div className="space-y-6">
            <div className={`${cardBg} border rounded-xs p-6 shadow-xs space-y-4`}>
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider border-b border-stone-800/40 pb-2">
                Top Announcement Marquee & Storefront Identity
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className={`block font-bold ${labelColor} mb-1`}>
                    Top Bar Announcement Banner
                  </label>
                  <textarea
                    rows={2}
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                    placeholder="e.g. Free shipping on luxury orders above $150 • Authentic Russian & European Hookahs"
                    className={`w-full ${inputBg} border rounded-xs p-3 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed`}
                  />
                  <p className={`text-[10px] ${mutedText} mt-1`}>
                    Displayed across the very top ticker banner of every storefront page.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block font-bold ${labelColor} mb-1`}>
                      Storefront Name / Brand
                    </label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. World Hookah Market / Fumare Hookah"
                      className={`w-full ${inputBg} border rounded-xs p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500`}
                    />
                  </div>

                  <div>
                    <label className={`block font-bold ${labelColor} mb-1`}>
                      Store Tagline
                    </label>
                    <input
                      type="text"
                      value={storeTagline}
                      onChange={(e) => setStoreTagline(e.target.value)}
                      placeholder="e.g. Authentic Russian & European Master Hookahs"
                      className={`w-full ${inputBg} border rounded-xs p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500`}
                    />
                  </div>

                  <div>
                    <label className={`block font-bold ${labelColor} mb-1`}>
                      Free Shipping Order Threshold ($)
                    </label>
                    <input
                      type="number"
                      value={freeShippingThreshold}
                      onChange={(e) => setFreeShippingThreshold(e.target.value)}
                      className={`w-full ${inputBg} border rounded-xs p-2.5 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500`}
                    />
                  </div>

                  <div>
                    <label className={`block font-bold ${labelColor} mb-1`}>
                      Sales Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className={`w-full ${inputBg} border rounded-xs p-2.5 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 3. HOMEPAGE COPY & BADGES TAB */}
        {/* ============================================================ */}
        {activeSubTab === 'homepage' && (
          <div className="space-y-6">
            <div className={`${cardBg} border rounded-xs p-6 shadow-xs space-y-4`}>
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider border-b border-stone-800/40 pb-2">
                Homepage Section Titles & Headings
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className={`block font-bold ${labelColor} mb-1`}>
                    New Arrivals Section Heading
                  </label>
                  <input
                    type="text"
                    value={newArrivalsTitle}
                    onChange={(e) => setNewArrivalsTitle(e.target.value)}
                    placeholder="e.g. NEW ARRIVALS"
                    className={`w-full ${inputBg} border rounded-xs p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500`}
                  />
                </div>

                <div>
                  <label className={`block font-bold ${labelColor} mb-1`}>
                    Best Sellers Section Heading
                  </label>
                  <input
                    type="text"
                    value={bestSellersTitle}
                    onChange={(e) => setBestSellersTitle(e.target.value)}
                    placeholder="e.g. OUR BEST SELLERS"
                    className={`w-full ${inputBg} border rounded-xs p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500`}
                  />
                </div>
              </div>
            </div>

            {/* Value Proposition Badges */}
            <div className={`${cardBg} border rounded-xs p-6 shadow-xs space-y-4`}>
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider border-b border-stone-800/40 pb-2">
                Homepage Value Proposition Badges
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Badge 1 */}
                <div className={`p-4 border rounded-xs space-y-2 ${isDark ? 'border-stone-800 bg-stone-950' : 'border-stone-200 bg-stone-50'}`}>
                  <span className="text-[10px] uppercase font-bold text-amber-500">Service Badge 1</span>
                  <div>
                    <label className={`block font-bold ${labelColor} mb-1`}>Title</label>
                    <input
                      type="text"
                      value={shippingPropTitle}
                      onChange={(e) => setShippingPropTitle(e.target.value)}
                      className={`w-full ${inputBg} border rounded-xs p-2 focus:outline-none`}
                    />
                  </div>
                  <div>
                    <label className={`block font-bold ${labelColor} mb-1`}>Subtitle</label>
                    <input
                      type="text"
                      value={shippingPropSubtitle}
                      onChange={(e) => setShippingPropSubtitle(e.target.value)}
                      className={`w-full ${inputBg} border rounded-xs p-2 focus:outline-none`}
                    />
                  </div>
                </div>

                {/* Badge 2 */}
                <div className={`p-4 border rounded-xs space-y-2 ${isDark ? 'border-stone-800 bg-stone-950' : 'border-stone-200 bg-stone-50'}`}>
                  <span className="text-[10px] uppercase font-bold text-amber-500">Service Badge 2</span>
                  <div>
                    <label className={`block font-bold ${labelColor} mb-1`}>Title</label>
                    <input
                      type="text"
                      value={discountPropTitle}
                      onChange={(e) => setDiscountPropTitle(e.target.value)}
                      className={`w-full ${inputBg} border rounded-xs p-2 focus:outline-none`}
                    />
                  </div>
                  <div>
                    <label className={`block font-bold ${labelColor} mb-1`}>Subtitle</label>
                    <input
                      type="text"
                      value={discountPropSubtitle}
                      onChange={(e) => setDiscountPropSubtitle(e.target.value)}
                      className={`w-full ${inputBg} border rounded-xs p-2 focus:outline-none`}
                    />
                  </div>
                </div>

                {/* Badge 3 */}
                <div className={`p-4 border rounded-xs space-y-2 ${isDark ? 'border-stone-800 bg-stone-950' : 'border-stone-200 bg-stone-50'}`}>
                  <span className="text-[10px] uppercase font-bold text-amber-500">Service Badge 3</span>
                  <div>
                    <label className={`block font-bold ${labelColor} mb-1`}>Title</label>
                    <input
                      type="text"
                      value={supportPropTitle}
                      onChange={(e) => setSupportPropTitle(e.target.value)}
                      className={`w-full ${inputBg} border rounded-xs p-2 focus:outline-none`}
                    />
                  </div>
                  <div>
                    <label className={`block font-bold ${labelColor} mb-1`}>Subtitle</label>
                    <input
                      type="text"
                      value={supportPropSubtitle}
                      onChange={(e) => setSupportPropSubtitle(e.target.value)}
                      className={`w-full ${inputBg} border rounded-xs p-2 focus:outline-none`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* About Us / Brand Story */}
            <div className={`${cardBg} border rounded-xs p-6 shadow-xs space-y-4`}>
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider border-b border-stone-800/40 pb-2">
                Brand Heritage & Story Section
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className={`block font-bold ${labelColor} mb-1`}>Story Headline</label>
                  <input
                    type="text"
                    value={aboutStoryTitle}
                    onChange={(e) => setAboutStoryTitle(e.target.value)}
                    className={`w-full ${inputBg} border rounded-xs p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold`}
                  />
                </div>

                <div>
                  <label className={`block font-bold ${labelColor} mb-1`}>Story Body Paragraphs</label>
                  <textarea
                    rows={5}
                    value={aboutStoryText}
                    onChange={(e) => setAboutStoryText(e.target.value)}
                    className={`w-full ${inputBg} border rounded-xs p-3 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed`}
                  />
                </div>
              </div>
            </div>

            {/* Newsletter CTA */}
            <div className={`${cardBg} border rounded-xs p-6 shadow-xs space-y-4`}>
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider border-b border-stone-800/40 pb-2">
                Newsletter Section Text
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className={`block font-bold ${labelColor} mb-1`}>Newsletter Headline</label>
                  <input
                    type="text"
                    value={newsletterTitle}
                    onChange={(e) => setNewsletterTitle(e.target.value)}
                    className={`w-full ${inputBg} border rounded-xs p-2.5 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`block font-bold ${labelColor} mb-1`}>Newsletter Subtitle</label>
                  <input
                    type="text"
                    value={newsletterSubtitle}
                    onChange={(e) => setNewsletterSubtitle(e.target.value)}
                    className={`w-full ${inputBg} border rounded-xs p-2.5 focus:outline-none`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 4. CONCIERGE & LEGAL COMPLIANCE TAB */}
        {/* ============================================================ */}
        {activeSubTab === 'compliance' && (
          <div className="space-y-6">
            <div className={`${cardBg} border rounded-xs p-6 shadow-xs space-y-4`}>
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider border-b border-stone-800/40 pb-2">
                Concierge Contact Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className={`block font-bold ${labelColor} mb-1`}>Concierge Support Phone</label>
                  <input
                    type="text"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    className={`w-full ${inputBg} border rounded-xs p-2.5 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`block font-bold ${labelColor} mb-1`}>Concierge Support Email</label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className={`w-full ${inputBg} border rounded-xs p-2.5 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`block font-bold ${labelColor} mb-1`}>Hours of Operation</label>
                  <input
                    type="text"
                    value={supportHours}
                    onChange={(e) => setSupportHours(e.target.value)}
                    className={`w-full ${inputBg} border rounded-xs p-2.5 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`block font-bold ${labelColor} mb-1`}>Physical Showroom / Warehouse Address</label>
                  <input
                    type="text"
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    className={`w-full ${inputBg} border rounded-xs p-2.5 focus:outline-none`}
                  />
                </div>
              </div>
            </div>

            {/* Legal Disclaimers */}
            <div className={`${cardBg} border rounded-xs p-6 shadow-xs space-y-4`}>
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider border-b border-stone-800/40 pb-2">
                Regulatory Disclaimers & Proposition 65
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className={`block font-bold ${labelColor} mb-1`}>
                    California Proposition 65 Warning
                  </label>
                  <textarea
                    rows={3}
                    value={prop65Warning}
                    onChange={(e) => setProp65Warning(e.target.value)}
                    className={`w-full ${inputBg} border rounded-xs p-3 focus:outline-none leading-relaxed`}
                  />
                </div>

                <div>
                  <label className={`block font-bold ${labelColor} mb-1`}>
                    21+ Age Verification & PACT Act Notice
                  </label>
                  <textarea
                    rows={3}
                    value={ageComplianceNotice}
                    onChange={(e) => setAgeComplianceNotice(e.target.value)}
                    className={`w-full ${inputBg} border rounded-xs p-3 focus:outline-none leading-relaxed`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button at bottom */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-bold py-3 px-8 rounded-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md text-xs uppercase tracking-wider disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing Changes Live...' : 'Publish All CMS Content Live'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
