import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { ProductCard } from '../components/ProductCard.js';
import { Product, Category, Brand } from '../../types/index.js';
import {
  ArrowRight,
  Shield,
  Truck,
  Sparkles,
  Flame,
  Award,
  ChevronRight,
  Star,
  Package,
  CheckCircle2
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [tobaccoProducts, setTobaccoProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes, brandRes] = await Promise.all([
          api.getProducts({ limit: 20 }),
          api.getCategories(),
          api.getBrands()
        ]);

        if (prodRes.success && prodRes.data) {
          const prods = prodRes.data.products;
          setFeaturedProducts(prods.filter(p => p.categorySlug === 'hookahs' || p.isFeatured).slice(0, 4));
          setTobaccoProducts(prods.filter(p => p.categorySlug === 'tobacco-flavor').slice(0, 4));
          setNewArrivals(prods.filter(p => p.isNewArrival).slice(0, 4));
        }

        if (catRes.success && catRes.data) {
          setCategories(catRes.data.slice(0, 6));
        }

        if (brandRes.success && brandRes.data) {
          setBrands(brandRes.data);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="w-full bg-stone-50/50">
      {/* 1. HERO BANNER */}
      <section className="relative bg-white border-b border-stone-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-xs text-amber-900 text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Haute Shisha & Architectural Hookahs</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 leading-[1.1] tracking-tight">
              The Sovereign Standard of Luxury Smoking.
            </h1>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-xl">
              Engineered from V2A surgical stainless steel, Bohemian hand-cut crystal, and aged European hardwoods. Curated for distinguished lounges and discerning connoisseurs.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                id="hero-shop-hookahs-btn"
                onClick={() => onNavigate('/shop?category=hookahs')}
                className="bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold uppercase tracking-widest px-8 py-4 rounded-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-xs group"
              >
                <span>Explore Masterpieces</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="hero-shop-tobacco-btn"
                onClick={() => onNavigate('/shop?category=tobacco-flavor')}
                className="bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-semibold uppercase tracking-widest px-8 py-4 rounded-xs border border-stone-300 transition-colors text-center"
              >
                Dark Leaf Reserve
              </button>
            </div>

            <div className="pt-6 border-t border-stone-100 flex items-center gap-8 text-xs text-stone-500">
              <div>
                <strong className="text-stone-900 font-bold block text-sm">100% Authentic</strong>
                <span>Verified Direct Sourcing</span>
              </div>
              <div className="w-px h-8 bg-stone-200" />
              <div>
                <strong className="text-stone-900 font-bold block text-sm">Break-Free</strong>
                <span>Custom Foam Double-Boxing</span>
              </div>
              <div className="w-px h-8 bg-stone-200" />
              <div>
                <strong className="text-stone-900 font-bold block text-sm">Age 21+</strong>
                <span>Certified ID Compliance</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative aspect-4/5 w-full bg-stone-100 rounded-sm border border-stone-200 overflow-hidden shadow-xl p-4 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=1000&auto=format&fit=crop"
                alt="Wookah Luxury Stainless Steel Shisha"
                className="w-full h-full object-cover object-center rounded-xs"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-xs border border-stone-200 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-900">Featured Artifact</span>
                    <h4 className="font-serif text-sm font-bold text-stone-900">Wookah Masterpiece Oak Crystal</h4>
                  </div>
                  <span className="text-sm font-bold text-stone-900 font-sans">$449.00</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. BRAND LOGO TICKER */}
      <section className="bg-white py-6 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[10px] uppercase font-bold tracking-[0.25em] text-stone-400 mb-4">
            Official Authorized Purveyor of World-Renowned Hookah Houses
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-xs font-serif font-semibold tracking-wider text-stone-700">
            {brands.map((b) => (
              <button
                key={b.id}
                onClick={() => onNavigate(`/shop?brand=${b.slug}`)}
                className="hover:text-amber-900 transition-colors uppercase"
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CATEGORY SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-widest text-amber-800">Curated Catalog</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Explore by Discipline
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/shop')}
            className="text-xs font-semibold text-amber-900 hover:underline flex items-center gap-1"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate(`/shop?category=${cat.slug}`)}
              className="group relative bg-white border border-stone-200 rounded-xs p-4 text-center cursor-pointer hover:border-amber-800 hover:shadow-md transition-all flex flex-col items-center justify-between"
            >
              <div className="w-16 h-16 rounded-full bg-stone-50 border border-stone-200 overflow-hidden flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <img
                  src={cat.imageUrl || 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=200'}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="font-serif text-xs font-bold text-stone-900 group-hover:text-amber-900 transition-colors">
                {cat.name}
              </h3>
              <span className="text-[10px] text-stone-400 mt-1">
                {cat.productCount || 'Explore'} items
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURED HOOKAH MASTERPIECES */}
      <section className="bg-white border-y border-stone-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[11px] uppercase font-bold tracking-widest text-amber-800">Precision Metallurgy</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                Architectural Hookah Stems
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/shop?category=hookahs')}
              className="text-xs font-semibold text-amber-900 hover:underline flex items-center gap-1"
            >
              <span>Explore All Hookahs</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onNavigate={(slug) => onNavigate(`/product/${slug}`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. DARK LEAF SOMMELIER & SHISHA FLAVORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-widest text-amber-800">Sommelier Selection</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Dark Leaf Shisha Reserve
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/shop?category=tobacco-flavor')}
            className="text-xs font-semibold text-amber-900 hover:underline flex items-center gap-1"
          >
            <span>Explore All Flavors</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tobaccoProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={(slug) => onNavigate(`/product/${slug}`)}
            />
          ))}
        </div>
      </section>

      {/* 6. WHOLESALE & LOUNGE PARTNERSHIP PROMO */}
      <section className="bg-stone-900 text-white border-y border-stone-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <span className="inline-block bg-amber-500/20 text-amber-400 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-xs border border-amber-500/30">
              B2B Commercial Accounts
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-100">
              Supply Your Hookah Lounge or Retail Store
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Gain direct access to master wholesale pricing (35% - 50% margins), bulk 1kg dark leaf allotments, priority pallet freight, and dedicated account management.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
            <button
              id="home-wholesale-apply-btn"
              onClick={() => onNavigate('/wholesale')}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold uppercase tracking-wider px-6 py-3.5 rounded-xs transition-colors text-center shadow-xs"
            >
              Apply for Wholesale Tier
            </button>
            <button
              onClick={() => onNavigate('/contact')}
              className="bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold uppercase tracking-wider px-6 py-3.5 rounded-xs transition-colors text-center"
            >
              Contact B2B Concierge
            </button>
          </div>
        </div>
      </section>

      {/* 7. NEW ARRIVALS & ACCESSORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-widest text-amber-800">Fresh Vault Releases</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              New Arrivals & Essentials
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/shop?newArrival=true')}
            className="text-xs font-semibold text-amber-900 hover:underline flex items-center gap-1"
          >
            <span>View All New Arrivals</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={(slug) => onNavigate(`/product/${slug}`)}
            />
          ))}
        </div>
      </section>

    </div>
  );
};
