import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.js';
import { onSync } from '../services/sync.js';
import { ProductCard } from '../components/ProductCard.js';
import { HeroCarousel } from '../components/HeroCarousel.js';
import { Product } from '../../types/index.js';
import { useStore } from '../store/useStore.js';
import { SEOHead } from '../components/SEOHead.js';
import { getWebSiteSchema, getOrganizationSchema, getFAQSchema, MARKET_KEYWORDS } from '../../shared/seoConstants.js';
import {
  ChevronLeft,
  ChevronRight,
  Gift,
  X,
  ShoppingBag,
  MessageSquare,
  Clock,
  Package,
  Sparkles,
  Tag,
  Mail,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

interface BrandAvatar {
  name: string;
  slug: string;
  bgClass: string;
  textColor: string;
  borderClass?: string;
  badgeText?: string;
  imageUrl?: string;
}

interface BlogPostCard {
  id: string;
  title: string;
  ghostBg: string;
  ghostEmoji: string;
  tag: string;
  readTime: string;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { cart, setCartOpen, showToast } = useStore();
  const [tobaccoProducts, setTobaccoProducts] = useState<Product[]>([]);
  const [hookahProducts, setHookahProducts] = useState<Product[]>([]);
  const [bowlProducts, setBowlProducts] = useState<Product[]>([]);
  const [baseProducts, setBaseProducts] = useState<Product[]>([]);
  const [coalProducts, setCoalProducts] = useState<Product[]>([]);
  const [accessoryProducts, setAccessoryProducts] = useState<Product[]>([]);
  const [ehookahProducts, setEhookahProducts] = useState<Product[]>([]);
  const [vapeProducts, setVapeProducts] = useState<Product[]>([]);
  const [newInProducts, setNewInProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Floating widgets state
  const [showPointsBanner, setShowPointsBanner] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Carousel Refs for horizontal scrolling
  const tobaccoScrollRef = useRef<HTMLDivElement>(null);
  const hookahScrollRef = useRef<HTMLDivElement>(null);
  const bowlScrollRef = useRef<HTMLDivElement>(null);
  const baseScrollRef = useRef<HTMLDivElement>(null);
  const coalScrollRef = useRef<HTMLDivElement>(null);
  const accessoryScrollRef = useRef<HTMLDivElement>(null);
  const ehookahScrollRef = useRef<HTMLDivElement>(null);
  const vapeScrollRef = useRef<HTMLDivElement>(null);
  const postsScrollRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const loadHomeData = async () => {
    try {
      const [
        tobaccoRes,
        hookahsRes,
        bowlsRes,
        basesRes,
        coalsRes,
        accessoriesRes,
        ehookahRes,
        vapeRes,
        newInRes,
        bestRes
      ] = await Promise.all([
        api.getProducts({ category: 'tobacco', limit: 12 }),
        api.getProducts({ category: 'hookahs', limit: 12 }),
        api.getProducts({ category: 'bowls', limit: 12 }),
        api.getProducts({ category: 'bases', limit: 12 }),
        api.getProducts({ category: 'coal', limit: 12 }),
        api.getProducts({ category: 'accessories', limit: 12 }),
        api.getProducts({ category: 'e-hookah', limit: 12 }),
        api.getProducts({ category: 'vapes', limit: 12 }),
        api.getProducts({ newArrival: true, limit: 8 }),
        api.getProducts({ bestSeller: true, limit: 8 })
      ]);

      if (tobaccoRes.success && tobaccoRes.data) {
        setTobaccoProducts(tobaccoRes.data.products);
      }
      if (hookahsRes.success && hookahsRes.data) {
        setHookahProducts(hookahsRes.data.products);
      }
      if (bowlsRes.success && bowlsRes.data) {
        setBowlProducts(bowlsRes.data.products);
      }
      if (basesRes.success && basesRes.data) {
        setBaseProducts(basesRes.data.products);
      }
      if (coalsRes.success && coalsRes.data) {
        setCoalProducts(coalsRes.data.products);
      }
      if (accessoriesRes.success && accessoriesRes.data) {
        setAccessoryProducts(accessoriesRes.data.products);
      }
      if (ehookahRes.success && ehookahRes.data) {
        setEhookahProducts(ehookahRes.data.products);
      }
      if (vapeRes.success && vapeRes.data) {
        setVapeProducts(vapeRes.data.products);
      }
      if (newInRes.success && newInRes.data) {
        setNewInProducts(newInRes.data.products);
      }
      if (bestRes.success && bestRes.data) {
        setBestSellers(bestRes.data.products);
      }
    } catch (err) {
      console.error('Failed to load homepage data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();

    // Instant sync whenever admin changes products, inventory, or categories
    const unsub = onSync('*', (event) => {
      if (
        event.type === 'PRODUCT_UPDATED' ||
        event.type === 'INVENTORY_UPDATED' ||
        event.type === 'ORDER_PLACED' ||
        event.type === 'CATEGORY_UPDATED' ||
        event.type === 'REFRESH_ALL'
      ) {
        loadHomeData();
      }
    });

    // Refresh when switching back to tab
    const handleFocus = () => {
      loadHomeData();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      unsub();
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Top Brands / Subcategories for each category
  const tobaccoBrands: BrandAvatar[] = [
    { name: 'MustHave Tobacco', slug: 'musthave-tobacco', bgClass: 'bg-white', textColor: 'text-stone-900', borderClass: 'border border-stone-300 shadow-xs', badgeText: 'MUSTHAVE' },
    { name: 'DarkSide Tobacco', slug: 'darkside-tobacco', bgClass: 'bg-stone-900', textColor: 'text-white', badgeText: 'DARKSIDE' },
    { name: 'BlackBurn Tobacco', slug: 'blackburn-tobacco', bgClass: 'bg-stone-900', textColor: 'text-stone-100', borderClass: 'border border-stone-700 shadow-xs', badgeText: 'BLACKBURN' },
    { name: 'Bonche Tobacco', slug: 'bonche-tobacco', bgClass: 'bg-stone-800', textColor: 'text-amber-200', badgeText: 'BONCHE' },
    { name: 'Tangiers', slug: 'tangiers', bgClass: 'bg-emerald-950', textColor: 'text-emerald-300', badgeText: 'TANGIERS' },
    { name: 'Adalya Tobacco', slug: 'adalya-tobacco', bgClass: 'bg-red-900', textColor: 'text-white', badgeText: 'ADALYA' },
    { name: 'Serbetli tobacco', slug: 'serbetli-tobacco', bgClass: 'bg-rose-50', textColor: 'text-rose-800', borderClass: 'border border-rose-200', badgeText: 'Serbetli' },
    { name: 'Banger Hookah Tobacco', slug: 'banger-tobacco', bgClass: 'bg-amber-900', textColor: 'text-amber-100', badgeText: 'BANGER' },
    { name: 'Element Tobacco', slug: 'element-tobacco', bgClass: 'bg-cyan-900', textColor: 'text-cyan-100', badgeText: 'ELEMENT' }
  ];

  const hookahBrands: BrandAvatar[] = [
    { name: 'Alpha Hookah', slug: 'alpha-hookah', bgClass: 'bg-white', textColor: 'text-stone-900', borderClass: 'border border-stone-300 shadow-xs', badgeText: 'ALPHA' },
    { name: 'El Bomber Hookah', slug: 'el-bomber', bgClass: 'bg-stone-900', textColor: 'text-red-500', badgeText: 'EL BOMBER' },
    { name: 'MattPear Hookah', slug: 'mattpear', bgClass: 'bg-emerald-900', textColor: 'text-emerald-100', badgeText: 'MATTPEAR' },
    { name: 'Maklaud Hookah', slug: 'maklaud-hookah', bgClass: 'bg-stone-950', textColor: 'text-amber-400', badgeText: 'MAKLAUD' },
    { name: 'WOOKAH Hookah', slug: 'wookah', bgClass: 'bg-amber-900', textColor: 'text-amber-100', badgeText: 'WOOKAH' },
    { name: 'Japona Hookah', slug: 'japona-hookah', bgClass: 'bg-stone-800', textColor: 'text-stone-100', badgeText: 'JAPONA' },
    { name: 'Steamulation Hookah', slug: 'steamulation-hookah', bgClass: 'bg-slate-100', textColor: 'text-slate-900', borderClass: 'border border-slate-300', badgeText: 'STEAM' }
  ];

  const bowlBrands: BrandAvatar[] = [
    { name: 'Oblako bowls', slug: 'oblako-bowls', bgClass: 'bg-sky-50', textColor: 'text-sky-800', borderClass: 'border border-sky-300', badgeText: 'OBLAKO' },
    { name: 'Kong Bowls', slug: 'kong-bowls', bgClass: 'bg-orange-950', textColor: 'text-orange-400', badgeText: 'KONG' },
    { name: 'Alpaca Bowls', slug: 'alpaca-bowls', bgClass: 'bg-stone-800', textColor: 'text-stone-100', badgeText: 'ALPACA' },
    { name: 'Solaris Bowls', slug: 'solaris-bowls', bgClass: 'bg-indigo-900', textColor: 'text-indigo-200', badgeText: 'SOLARIS' },
    { name: 'Target Bowls', slug: 'target-bowls', bgClass: 'bg-rose-950', textColor: 'text-rose-300', badgeText: 'TARGET' }
  ];

  const baseBrands: BrandAvatar[] = [
    { name: 'Caesar Crystal', slug: 'caesar-crystal', bgClass: 'bg-blue-950', textColor: 'text-blue-200', badgeText: 'CAESAR' },
    { name: 'Craft Glass', slug: 'craft-glass', bgClass: 'bg-stone-800', textColor: 'text-amber-300', badgeText: 'CRAFT' },
    { name: 'WOOKAH Crystal', slug: 'wookah', bgClass: 'bg-amber-900', textColor: 'text-amber-100', badgeText: 'WOOKAH' }
  ];

  const coalBrands: BrandAvatar[] = [
    { name: 'Coco Loco', slug: 'coco-loco', bgClass: 'bg-stone-900', textColor: 'text-amber-400', badgeText: 'COCO LOCO' },
    { name: 'One Nation', slug: 'one-nation', bgClass: 'bg-red-950', textColor: 'text-red-200', badgeText: '1 NATION' },
    { name: 'Oasis Charcoal', slug: 'oasis-charcoal', bgClass: 'bg-emerald-900', textColor: 'text-emerald-100', badgeText: 'OASIS' }
  ];

  const accessoryBrands: BrandAvatar[] = [
    { name: 'Kaloud', slug: 'kaloud', bgClass: 'bg-white', textColor: 'text-stone-950', borderClass: 'border border-stone-300', badgeText: 'KALOUD' },
    { name: 'Na Grani HMD', slug: 'na-grani', bgClass: 'bg-stone-900', textColor: 'text-stone-200', badgeText: 'NA GRANI' },
    { name: 'Blade Hookah', slug: 'blade-hookah', bgClass: 'bg-purple-950', textColor: 'text-purple-200', badgeText: 'BLADE' },
    { name: 'Alpha Tongs', slug: 'alpha-hookah', bgClass: 'bg-stone-800', textColor: 'text-amber-400', badgeText: 'ALPHA' }
  ];

  const ehookahBrands: BrandAvatar[] = [
  {
    name: 'Enso',
    slug: 'enso',
    bgClass: 'bg-stone-950',
    textColor: 'text-cyan-400',
    badgeText: 'ENSO',
    imageUrl: ''
  },
  {
    name: 'HeyBar',
    slug: 'heybar',
    bgClass: 'bg-orange-950',
    textColor: 'text-orange-300',
    badgeText: 'HEYBAR',
    imageUrl: ''
  },
  {
    name: 'Kori',
    slug: 'kori',
    bgClass: 'bg-emerald-900',
    textColor: 'text-emerald-100',
    badgeText: 'KORI',
    imageUrl: ''
  },
  {
    name: 'XKAH',
    slug: 'xkah',
    bgClass: 'bg-slate-900',
    textColor: 'text-slate-100',
    badgeText: 'XKAH',
    imageUrl: ''
  }
];

  const vapeBrands: BrandAvatar[] = [
    { name: 'Adalya', slug: 'adalya', bgClass: 'bg-rose-900', textColor: 'text-rose-100', badgeText: 'ADALYA' },
    { name: 'Flamingo', slug: 'flamingo', bgClass: 'bg-pink-700', textColor: 'text-white', badgeText: 'FLAMINGO' },
    { name: 'Kori Hola', slug: 'kori-hola', bgClass: 'bg-blue-900', textColor: 'text-blue-100', badgeText: 'KORI HOLA' },
    { name: 'ZColors', slug: 'zcolors', bgClass: 'bg-purple-900', textColor: 'text-purple-100', badgeText: 'ZCOLORS' }
  ];

  const blogPosts: BlogPostCard[] = [
    {
      id: 'post-1',
      title: 'Heat Management 101: How to Pack the Perfect Dark Leaf Bowl',
      ghostBg: 'border-stone-200 hover:border-[#0088cc]',
      ghostEmoji: '💨',
      tag: 'Guides',
      readTime: '4 min read'
    },
    {
      id: 'post-2',
      title: 'Top 5 Russian Hookah Tobacco Flavors You Must Try This Year',
      ghostBg: 'border-stone-200 hover:border-[#0088cc]',
      ghostEmoji: '🍂',
      tag: 'Flavor Spotlight',
      readTime: '5 min read'
    },
    {
      id: 'post-3',
      title: 'Coconut Charcoal vs Quick Light: The Science of Clean Smoke',
      ghostBg: 'border-stone-200 hover:border-[#0088cc]',
      ghostEmoji: '🔥',
      tag: 'Essentials',
      readTime: '3 min read'
    },
    {
      id: 'post-4',
      title: 'Stainless Steel vs Anodized Aluminum: Choosing Your Next Stem',
      ghostBg: 'border-stone-200 hover:border-[#0088cc]',
      ghostEmoji: '🛡️',
      tag: 'Hardware',
      readTime: '6 min read'
    }
  ];

  const categoryFallbackImages = {
    tobacco: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=600&auto=format&fit=crop',
    hookahs: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=600&auto=format&fit=crop',
    bowls: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600&auto=format&fit=crop',
    bases: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop',
    coal: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=600&auto=format&fit=crop',
    accessories: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop',
    ehookah: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop',
    vapes: 'https://images.unsplash.com/photo-1528701800487-ba012498db85?q=80&w=600&auto=format&fit=crop'
  } as const;

  const BrandAvatarBadge: React.FC<{ brand: BrandAvatar; category: keyof typeof categoryFallbackImages }> = ({ brand, category }) => {
    const imageSrc = brand.imageUrl || categoryFallbackImages[category];

    return (
      <div
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-108 shadow-xs overflow-hidden ${brand.bgClass} ${brand.textColor} ${brand.borderClass || ''}`}
      >
        <img
          src={imageSrc}
          alt={brand.name}
          className="w-full h-full rounded-full object-cover bg-white"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = categoryFallbackImages[category];
          }}
        />
      </div>
    );
  };

  const totalCartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSent(true);
    setTimeout(() => {
      setShowFeedbackModal(false);
      setFeedbackSent(false);
      setFeedbackText('');
    }, 1500);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setNewsletterSuccess(true);
    showToast('Subscribed to Fumare Hookah newsletter!', 'success');
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSuccess(false), 3000);
  };

  return (
    <div className="w-full bg-[#f8f9fa] pb-20 text-stone-900 font-sans">
      {/* Search Engine Optimization for USA & Russia (#1 Ranking Architecture) */}
      <SEOHead
        title="Fumare Hookah - Premier Hookahs, Shisha Tobacco, Bowls & Accessories"
        ruTitle="Fumare Hookah - Официальный магазин кальянов и табака | Доставка в США и РФ"
        description="The leading online store and master distributor for Alpha Hookah, MustHave, DarkSide, Oblako, Kong, MattPear, Wookah, Kaloud & premium shisha tobacco in USA & Russia."
        ruDescription="Официальный мастер-дистрибьютор Alpha Hookah, MustHave, DarkSide, Oblako, Kong, MattPear и элитного табака для кальяна. Быстрая доставка по США и РФ."
        keywords={MARKET_KEYWORDS.global}
        canonicalPath="/"
        jsonLd={[getWebSiteSchema(), getOrganizationSchema(), getFAQSchema()]}
      />
      
      {/* 1. HERO IMAGE CAROUSEL (3 Scrolling Visual Slides matching Screenshot 1) */}
      <HeroCarousel onNavigate={onNavigate} />

      {/* 2. SECTION: TOBACCO (Screenshot 1 & 2) */}
      <section id="section-tobacco" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
        
        {/* Section Header with Blue Accent Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-300 relative mb-6">
          <div className="relative">
            <h2 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-wider text-stone-900">
              TOBACCO
            </h2>
            {/* Solid Royal Blue Underline Bar */}
            <div className="absolute -bottom-[14px] left-0 h-[4px] w-full bg-[#0088cc] z-10"></div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => scrollContainer(tobaccoScrollRef, 'left')}
                className="w-7 h-7 rounded-full border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors shadow-2xs"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollContainer(tobaccoScrollRef, 'right')}
                className="w-7 h-7 rounded-full border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors shadow-2xs"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => onNavigate('/shop?category=tobacco')}
              className="text-xs font-bold text-stone-600 hover:text-[#0088cc] transition-colors uppercase tracking-wider"
            >
              ― View All
            </button>
          </div>
        </div>

        {/* Tobacco Products Horizontal Slider Track */}
        <div
          ref={tobaccoScrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x snap-mandatory"
        >
          {tobaccoProducts.map((product) => (
            <div key={product.id} className="w-[230px] sm:w-[250px] md:w-[270px] shrink-0 snap-start">
              <ProductCard
                product={product}
                showBulkDiscount={true}
                onNavigate={(slug) => onNavigate(`/product/${slug}`)}
              />
            </div>
          ))}
        </div>

        {/* Top Tobacco Brands Badges */}
        <div className="mt-8 pt-6 border-t border-stone-200">
          <h3 className="text-left text-sm font-bold uppercase tracking-wider text-stone-800 mb-5">
            Top Tobacco Brands
          </h3>

          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto pb-2 scrollbar-none">
            {tobaccoBrands.map((brand, bIdx) => (
              <div
                key={`hp-tobacco-${brand.slug}-${bIdx}`}
                onClick={() => onNavigate(`/shop?brand=${brand.slug}`)}
                className="flex flex-col items-center gap-2 cursor-pointer group select-none shrink-0"
              >
                <BrandAvatarBadge brand={brand} category="tobacco" />
                <span className="text-[11px] sm:text-xs font-semibold text-stone-700 group-hover:text-[#0088cc] transition-colors text-center max-w-[90px] line-clamp-2 leading-tight">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* 4. SECTION: HOOKAHS (Screenshot 2 & 3) */}
      <section id="section-hookahs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        
        {/* Section Header with Teal Accent Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-300 relative mb-6">
          <div className="relative">
            <h2 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-wider text-stone-900">
              HOOKAHS
            </h2>
            {/* Solid Cyan/Teal Underline Bar */}
            <div className="absolute -bottom-[14px] left-0 h-[4px] w-full bg-[#00b5ad] z-10"></div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => scrollContainer(hookahScrollRef, 'left')}
                className="w-7 h-7 rounded-full border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors shadow-2xs"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollContainer(hookahScrollRef, 'right')}
                className="w-7 h-7 rounded-full border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors shadow-2xs"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => onNavigate('/shop?category=hookahs')}
              className="text-xs font-bold text-stone-600 hover:text-[#00b5ad] transition-colors uppercase tracking-wider"
            >
              ― View All
            </button>
          </div>
        </div>

        {/* Hookahs Horizontal Slider Track */}
        <div
          ref={hookahScrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x snap-mandatory"
        >
          {hookahProducts.map((product) => (
            <div key={product.id} className="w-[230px] sm:w-[250px] md:w-[270px] shrink-0 snap-start">
              <ProductCard
                product={product}
                onNavigate={(slug) => onNavigate(`/product/${slug}`)}
              />
            </div>
          ))}
        </div>

        {/* Top Hookah Brands Badges */}
        <div className="mt-8 pt-6 border-t border-stone-200">
          <h3 className="text-left text-sm font-bold uppercase tracking-wider text-stone-800 mb-5">
            Top Hookah Brands
          </h3>

          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto pb-2 scrollbar-none">
            {hookahBrands.map((brand, bIdx) => (
              <div
                key={`hp-hookah-${brand.slug}-${bIdx}`}
                onClick={() => onNavigate(`/shop?brand=${brand.slug}`)}
                className="flex flex-col items-center gap-2 cursor-pointer group select-none shrink-0"
              >
                <BrandAvatarBadge brand={brand} category="hookahs" />
                <span className="text-[11px] sm:text-xs font-semibold text-stone-700 group-hover:text-[#00b5ad] transition-colors text-center max-w-[90px] line-clamp-2 leading-tight">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* 5. SECTION: BOWLS (Screenshot 3) */}
      <section id="section-bowls" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        
        {/* Section Header with Coral Accent Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-300 relative mb-6">
          <div className="relative">
            <h2 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-wider text-stone-900">
              BOWLS
            </h2>
            {/* Solid Coral Underline Bar */}
            <div className="absolute -bottom-[14px] left-0 h-[4px] w-full bg-[#f26c60] z-10"></div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => scrollContainer(bowlScrollRef, 'left')}
                className="w-7 h-7 rounded-full border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors shadow-2xs"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollContainer(bowlScrollRef, 'right')}
                className="w-7 h-7 rounded-full border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors shadow-2xs"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => onNavigate('/shop?category=bowls')}
              className="text-xs font-bold text-stone-600 hover:text-[#f26c60] transition-colors uppercase tracking-wider"
            >
              ― View All
            </button>
          </div>
        </div>

        {/* Bowls Horizontal Slider Track */}
        <div
          ref={bowlScrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x snap-mandatory"
        >
          {bowlProducts.map((product) => (
            <div key={product.id} className="w-[230px] sm:w-[250px] md:w-[270px] shrink-0 snap-start">
              <ProductCard
                product={product}
                onNavigate={(slug) => onNavigate(`/product/${slug}`)}
              />
            </div>
          ))}
        </div>

        {/* Top Bowls Brands Badges */}
        <div className="mt-8 pt-6 border-t border-stone-200">
          <h3 className="text-left text-sm font-bold uppercase tracking-wider text-stone-800 mb-5">
            Top Bowl Brands
          </h3>

          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto pb-2 scrollbar-none">
            {bowlBrands.map((brand, bIdx) => (
              <div
                key={`hp-bowl-${brand.slug}-${bIdx}`}
                onClick={() => onNavigate(`/shop?brand=${brand.slug}`)}
                className="flex flex-col items-center gap-2 cursor-pointer group select-none shrink-0"
              >
                <BrandAvatarBadge brand={brand} category="bowls" />
                <span className="text-[11px] sm:text-xs font-semibold text-stone-700 group-hover:text-[#f26c60] transition-colors text-center max-w-[90px] line-clamp-2 leading-tight">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* 6. SECTION: BASES */}
      <section id="section-bases" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        <div className="flex items-center justify-between pb-3 border-b border-stone-300 relative mb-6">
          <div className="relative">
            <h2 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-wider text-stone-900">
              BASES
            </h2>
            <div className="absolute -bottom-[14px] left-0 h-[4px] w-full bg-[#3b82f6] z-10"></div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => scrollContainer(baseScrollRef, 'left')}
                className="w-7 h-7 rounded-full border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors shadow-2xs"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollContainer(baseScrollRef, 'right')}
                className="w-7 h-7 rounded-full border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors shadow-2xs"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => onNavigate('/shop?category=bases')}
              className="text-xs font-bold text-stone-600 hover:text-[#3b82f6] transition-colors uppercase tracking-wider"
            >
              ― View All
            </button>
          </div>
        </div>

        <div
          ref={baseScrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x snap-mandatory"
        >
          {baseProducts.map((product) => (
            <div key={product.id} className="w-[230px] sm:w-[250px] md:w-[270px] shrink-0 snap-start">
              <ProductCard
                product={product}
                onNavigate={(slug) => onNavigate(`/product/${slug}`)}
              />
            </div>
          ))}
        </div>

        {/* Top Base Brands Badges */}
        <div className="mt-8 pt-6 border-t border-stone-200">
          <h3 className="text-left text-sm font-bold uppercase tracking-wider text-stone-800 mb-5">
            Top Base Brands
          </h3>
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto pb-2 scrollbar-none">
            {baseBrands.map((brand, bIdx) => (
              <div
                key={`hp-base-${brand.slug}-${bIdx}`}
                onClick={() => onNavigate(`/shop?brand=${brand.slug}`)}
                className="flex flex-col items-center gap-2 cursor-pointer group select-none shrink-0"
              >
                <BrandAvatarBadge brand={brand} category="bases" />
                <span className="text-[11px] sm:text-xs font-semibold text-stone-700 group-hover:text-[#3b82f6] transition-colors text-center max-w-[90px] line-clamp-2 leading-tight">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. SECTION: COAL */}
      <section id="section-coal" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        <div className="flex items-center justify-between pb-3 border-b border-stone-300 relative mb-6">
          <div className="relative">
            <h2 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-wider text-stone-900">
              COAL
            </h2>
            <div className="absolute -bottom-[14px] left-0 h-[4px] w-full bg-[#f97316] z-10"></div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => scrollContainer(coalScrollRef, 'left')}
                className="w-7 h-7 rounded-full border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors shadow-2xs"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollContainer(coalScrollRef, 'right')}
                className="w-7 h-7 rounded-full border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors shadow-2xs"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => onNavigate('/shop?category=coal')}
              className="text-xs font-bold text-stone-600 hover:text-[#f97316] transition-colors uppercase tracking-wider"
            >
              ― View All
            </button>
          </div>
        </div>

        <div
          ref={coalScrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x snap-mandatory"
        >
          {coalProducts.map((product) => (
            <div key={product.id} className="w-[230px] sm:w-[250px] md:w-[270px] shrink-0 snap-start">
              <ProductCard
                product={product}
                onNavigate={(slug) => onNavigate(`/product/${slug}`)}
              />
            </div>
          ))}
        </div>

        {/* Top Coal Brands Badges */}
        <div className="mt-8 pt-6 border-t border-stone-200">
          <h3 className="text-left text-sm font-bold uppercase tracking-wider text-stone-800 mb-5">
            Top Coal Brands
          </h3>
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto pb-2 scrollbar-none">
            {coalBrands.map((brand, bIdx) => (
              <div
                key={`hp-coal-${brand.slug}-${bIdx}`}
                onClick={() => onNavigate(`/shop?brand=${brand.slug}`)}
                className="flex flex-col items-center gap-2 cursor-pointer group select-none shrink-0"
              >
                <BrandAvatarBadge brand={brand} category="coal" />
                <span className="text-[11px] sm:text-xs font-semibold text-stone-700 group-hover:text-[#f97316] transition-colors text-center max-w-[90px] line-clamp-2 leading-tight">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. SECTION: ACCESSORIES */}
      <section id="section-accessories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        <div className="flex items-center justify-between pb-3 border-b border-stone-300 relative mb-6">
          <div className="relative">
            <h2 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-wider text-stone-900">
              ACCESSORIES
            </h2>
            <div className="absolute -bottom-[14px] left-0 h-[4px] w-full bg-[#8b5cf6] z-10"></div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => scrollContainer(accessoryScrollRef, 'left')}
                className="w-7 h-7 rounded-full border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors shadow-2xs"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollContainer(accessoryScrollRef, 'right')}
                className="w-7 h-7 rounded-full border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors shadow-2xs"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => onNavigate('/shop?category=accessories')}
              className="text-xs font-bold text-stone-600 hover:text-[#8b5cf6] transition-colors uppercase tracking-wider"
            >
              ― View All
            </button>
          </div>
        </div>

        <div
          ref={accessoryScrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x snap-mandatory"
        >
          {accessoryProducts.map((product) => (
            <div key={product.id} className="w-[230px] sm:w-[250px] md:w-[270px] shrink-0 snap-start">
              <ProductCard
                product={product}
                onNavigate={(slug) => onNavigate(`/product/${slug}`)}
              />
            </div>
          ))}
        </div>

        {/* Top Accessory Brands Badges */}
        <div className="mt-8 pt-6 border-t border-stone-200">
          <h3 className="text-left text-sm font-bold uppercase tracking-wider text-stone-800 mb-5">
            Top Accessory Brands
          </h3>
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto pb-2 scrollbar-none">
            {accessoryBrands.map((brand, bIdx) => (
              <div
                key={`hp-acc-${brand.slug}-${bIdx}`}
                onClick={() => onNavigate(`/shop?brand=${brand.slug}`)}
                className="flex flex-col items-center gap-2 cursor-pointer group select-none shrink-0"
              >
                <BrandAvatarBadge brand={brand} category="accessories" />
                <span className="text-[11px] sm:text-xs font-semibold text-stone-700 group-hover:text-[#8b5cf6] transition-colors text-center max-w-[90px] line-clamp-2 leading-tight">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. SECTION: E-HOOKAH */}
      <section id="section-ehookah" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        <div className="flex items-center justify-between pb-3 border-b border-stone-300 relative mb-6">
          <div className="relative">
            <h2 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-wider text-stone-900">
              E-HOOKAH
            </h2>
            <div className="absolute -bottom-[14px] left-0 h-[4px] w-full bg-[#06b6d4] z-10"></div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => scrollContainer(ehookahScrollRef, 'left')}
                className="w-7 h-7 rounded-full border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors shadow-2xs"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollContainer(ehookahScrollRef, 'right')}
                className="w-7 h-7 rounded-full border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors shadow-2xs"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => onNavigate('/shop?category=e-hookah')}
              className="text-xs font-bold text-stone-600 hover:text-[#06b6d4] transition-colors uppercase tracking-wider"
            >
              ― View All
            </button>
          </div>
        </div>

        <div
          ref={ehookahScrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x snap-mandatory"
        >
          {ehookahProducts.map((product) => (
            <div key={product.id} className="w-[230px] sm:w-[250px] md:w-[270px] shrink-0 snap-start">
              <ProductCard
                product={product}
                onNavigate={(slug) => onNavigate(`/product/${slug}`)}
              />
            </div>
          ))}
        </div>

        {/* Top E-Hookah Brands Badges */}
        <div className="mt-8 pt-6 border-t border-stone-200">
          <h3 className="text-left text-sm font-bold uppercase tracking-wider text-stone-800 mb-5">
            Top E-Hookah Brands
          </h3>
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto pb-2 scrollbar-none">
            {ehookahBrands.map((brand, bIdx) => (
              <div
                key={`hp-ehookah-${brand.slug}-${bIdx}`}
                onClick={() => onNavigate(`/shop?brand=${brand.slug}`)}
                className="flex flex-col items-center gap-2 cursor-pointer group select-none shrink-0"
              >
                <BrandAvatarBadge brand={brand} category="ehookah" />
                <span className="text-[11px] sm:text-xs font-semibold text-stone-700 group-hover:text-[#06b6d4] transition-colors text-center max-w-[90px] line-clamp-2 leading-tight">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. SECTION: VAPES */}
      <section id="section-vapes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        <div className="flex items-center justify-between pb-3 border-b border-stone-300 relative mb-6">
          <div className="relative">
            <h2 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-wider text-stone-900">
              VAPES
            </h2>
            <div className="absolute -bottom-[14px] left-0 h-[4px] w-full bg-[#ec4899] z-10"></div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => scrollContainer(vapeScrollRef, 'left')}
                className="w-7 h-7 rounded-full border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors shadow-2xs"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollContainer(vapeScrollRef, 'right')}
                className="w-7 h-7 rounded-full border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors shadow-2xs"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => onNavigate('/shop?category=vapes')}
              className="text-xs font-bold text-stone-600 hover:text-[#ec4899] transition-colors uppercase tracking-wider"
            >
              ― View All
            </button>
          </div>
        </div>

        <div
          ref={vapeScrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x snap-mandatory"
        >
          {vapeProducts.map((product) => (
            <div key={product.id} className="w-[230px] sm:w-[250px] md:w-[270px] shrink-0 snap-start">
              <ProductCard
                product={product}
                onNavigate={(slug) => onNavigate(`/product/${slug}`)}
              />
            </div>
          ))}
        </div>

        {/* Top Vape Brands Badges */}
        <div className="mt-8 pt-6 border-t border-stone-200">
          <h3 className="text-left text-sm font-bold uppercase tracking-wider text-stone-800 mb-5">
            Top Vape Brands
          </h3>
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto pb-2 scrollbar-none">
            {vapeBrands.map((brand, bIdx) => (
              <div
                key={`hp-vape-${brand.slug}-${bIdx}`}
                onClick={() => onNavigate(`/shop?brand=${brand.slug}`)}
                className="flex flex-col items-center gap-2 cursor-pointer group select-none shrink-0"
              >
                <BrandAvatarBadge brand={brand} category="vapes" />
                <span className="text-[11px] sm:text-xs font-semibold text-stone-700 group-hover:text-[#ec4899] transition-colors text-center max-w-[90px] line-clamp-2 leading-tight">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. THREE SERVICE VALUE GUARANTEE BOXES (Screenshots 3 & 4) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Box 1: Same Day Shipping */}
          <div className="bg-white border border-stone-200/90 rounded-sm p-5 flex items-center gap-4 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-[#0088cc]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900 leading-tight">
                Shiping on the same day
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                USA(1-4 days) Internationl(3-30 days)
              </p>
            </div>
          </div>

          {/* Box 2: Free Shipping over $89 */}
          <div className="bg-white border border-stone-200/90 rounded-sm p-5 flex items-center gap-4 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <Package className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900 leading-tight">
                Free shipping
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                for orders over $89
              </p>
            </div>
          </div>

          {/* Box 3: Save up to 50% */}
          <div className="bg-white border border-stone-200/90 rounded-sm p-5 flex items-center gap-4 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
              <Tag className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900 leading-tight">
                Save up to 50% with
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                Fumare Hookah
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 7. SECTION: NEW IN (Screenshots 4 & 5) */}
      <section id="section-new-in" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-stone-900">
            NEW IN
          </h2>
          <div className="w-12 h-[3px] bg-[#0088cc] mx-auto mt-2"></div>
        </div>

        {/* 3-Column Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {newInProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showBulkDiscount={true}
              onNavigate={(slug) => onNavigate(`/product/${slug}`)}
            />
          ))}
        </div>
      </section>

      {/* 8. SECTION: OUR BEST SELLERS (Screenshots 5 & 6) */}
      <section id="section-best-sellers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-stone-900">
            OUR BEST SELLERS
          </h2>
          <div className="w-12 h-[3px] bg-[#0088cc] mx-auto mt-2"></div>
        </div>

        {/* 3-Column Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showBulkDiscount={true}
              onNavigate={(slug) => onNavigate(`/product/${slug}`)}
            />
          ))}
        </div>
      </section>

      {/* 9. SECTION: POSTS (Screenshot 6) */}
      <section id="section-posts" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-stone-900">
            POSTS
          </h2>
          <div className="w-12 h-[3px] bg-[#0088cc] mx-auto mt-2"></div>
        </div>

        {/* Posts Horizontal Slider Track */}
        <div
          ref={postsScrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x snap-mandatory"
        >
          {blogPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => onNavigate('/blog')}
              className={`w-[260px] sm:w-[280px] p-5 rounded-sm border cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col justify-between shrink-0 snap-start bg-white ${post.ghostBg}`}
            >
              <div>
                {/* Ghost Emoji Header */}
                <div className="text-3xl mb-3">{post.ghostEmoji}</div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#0088cc]">
                  {post.tag}
                </span>
                <h3 className="text-sm font-bold text-stone-900 mt-1 leading-snug line-clamp-3">
                  {post.title}
                </h3>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-500 font-medium">
                <span>{post.readTime}</span>
                <span className="text-[#0088cc] font-bold inline-flex items-center gap-1">
                  Read ➔
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. SECTION: SEO / ABOUT US STORY (Screenshot 6) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-stone-200 text-stone-700">
        <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-stone-900 mb-3">
          FUMARE HOOKAH IS ONLINE HOOKAH AND SHISHA STORE WITH WORLDWIDE SHIPPING.
        </h2>
        <div className="space-y-3 text-xs sm:text-sm text-stone-600 leading-relaxed max-w-5xl">
          <p>
            Fumare Hookah offers an extensive selection of premium hookah products, including stems, bowls, flasks, accessories, charcoal, and world-renowned shisha tobacco brands such as MustHave, DarkSide, BlackBurn, Tangiers, and Adalya. We work directly with master manufacturers across Russia, Germany, Poland, and the USA to guarantee 100% authenticity and fresh factory packaging.
          </p>
          <p>
            Whether you are a seasoned connoisseur seeking heavy dark leaf blends, artisan Bohemian crystal vases, or commercial hookah lounges requiring reliable bulk wholesale distribution, our dedicated fulfillment center provides same-day dispatch, secure break-free packaging, and insured global delivery.
          </p>
        </div>
      </section>

      {/* 11. SECTION: NEWSLETTER SUBSCRIBE BAR (Screenshot 6) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-stone-200 rounded-sm p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-full bg-cyan-50 border border-cyan-200 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 text-[#00b5ad]" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-stone-900">
                SUBSCRIBE TO OUR NEWSLETTER TO RECEIVE BEST NEW DEALS!
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Get first notice on exclusive flavor restocks and special discounts.
              </p>
            </div>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="w-full md:w-auto flex items-center gap-2 max-w-md">
            <input
              type="email"
              required
              placeholder="Your email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 min-w-[200px] sm:min-w-[260px] bg-stone-50 border border-stone-300 text-xs px-3.5 py-2.5 rounded-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#00b5ad]"
            />
            <button
              type="submit"
              className="bg-[#00c5b2] hover:bg-[#00b5ad] text-white p-2.5 rounded-xs transition-colors shrink-0 shadow-xs flex items-center justify-center"
              title="Subscribe"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>

      {/* 12. FLOATING REGISTRATION & POINTS NOTIFICATION BANNER (STICKY BOTTOM) */}
      {showPointsBanner && (
        <div
          id="sticky-points-banner"
          className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-40 bg-stone-950/95 backdrop-blur-md text-white border border-stone-800 rounded-full py-2.5 px-4 sm:px-5 flex items-center justify-between gap-3 shadow-2xl animate-fade-in max-w-md"
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
            <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="line-clamp-1">Register and get 1000 points ($10)</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="points-get-btn"
              onClick={() => onNavigate('/auth/register')}
              className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold px-3 py-1 rounded-full transition-colors shadow-xs"
            >
              Get $10
            </button>
            <button
              id="points-close-btn"
              onClick={() => setShowPointsBanner(false)}
              className="text-stone-400 hover:text-white p-1 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 13. FLOATING CART ACTION BUTTON (BOTTOM RIGHT) */}
      <button
        id="floating-cart-btn"
        onClick={() => setCartOpen(true)}
        className="fixed bottom-20 right-4 sm:right-6 z-40 w-13 h-13 rounded-full bg-black text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform border border-stone-800 group"
        title="View Cart"
      >
        <ShoppingBag className="w-5 h-5 text-white" />
        <span className="absolute -top-1 -right-1 bg-[#00c5b2] text-stone-950 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
          {totalCartCount}
        </span>
      </button>

      {/* 14. FLOATING FEEDBACK SIDE TAB (RIGHT EDGE) */}
      <button
        id="floating-feedback-tab"
        onClick={() => setShowFeedbackModal(true)}
        className="fixed top-1/2 right-0 -translate-y-1/2 z-40 bg-stone-900 hover:bg-[#0088cc] text-white text-[11px] font-bold uppercase tracking-widest py-2 px-1.5 rounded-l-md shadow-lg transition-colors writing-vertical select-none"
        style={{ writingMode: 'vertical-rl' }}
      >
        FEEDBACK
      </button>

      {/* 15. FEEDBACK MODAL OVERLAY */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full p-6 shadow-2xl relative animate-fade-in text-left">
            <button
              onClick={() => setShowFeedbackModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3 text-[#0088cc]">
              <MessageSquare className="w-5 h-5" />
              <h3 className="font-bold text-lg text-stone-900">Your Feedback Matters</h3>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              Help us improve Fumare Hookah. Let us know if you are looking for specific tobacco flavors, hookah models, or wholesale options.
            </p>

            {feedbackSent ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xs p-4 text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm">Thank You!</h4>
                <p className="text-xs">Your feedback has been received by our store team.</p>
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} className="space-y-4">
                <textarea
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Type your message, requested brands, or experience..."
                  required
                  className="w-full text-xs p-3 border border-stone-300 rounded-xs focus:ring-1 focus:ring-[#0088cc] focus:border-[#0088cc] outline-none resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[#0088cc] hover:bg-[#0077b3] text-white rounded-xs transition-colors shadow-2xs"
                  >
                    Send Feedback
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
