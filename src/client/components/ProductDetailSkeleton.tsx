import React from 'react';
import { ProductCardSkeleton } from './ProductCardSkeleton.js';

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="w-full bg-stone-50/40 py-8 select-none" aria-hidden="true">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 1. Breadcrumbs Skeleton */}
        <nav className="flex items-center gap-2 text-xs text-stone-300 mb-6">
          <div className="h-3 w-10 bg-stone-200 rounded-xs animate-pulse" />
          <span>/</span>
          <div className="h-3 w-16 bg-stone-200 rounded-xs animate-pulse" />
          <span>/</span>
          <div className="h-3 w-20 bg-stone-200 rounded-xs animate-pulse" />
          <span>/</span>
          <div className="h-3 w-32 bg-stone-300 rounded-xs animate-pulse" />
        </nav>

        {/* 2. Main Hero Container (Gallery + Purchase Info) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white border border-stone-200 rounded-xs p-6 sm:p-8 shadow-xs">
          
          {/* Left Column: Product Imagery Gallery */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            {/* Main Showcase Box */}
            <div className="relative aspect-square w-full bg-gradient-to-b from-stone-50/80 via-white to-stone-50/50 border border-stone-200 rounded-xs flex items-center justify-center p-8 overflow-hidden skeleton-shimmer">
              {/* Badge placeholder */}
              <div className="absolute top-4 left-4 h-6 w-20 bg-amber-900/20 rounded-xs animate-pulse" />

              {/* Central silhouette illustration placeholder */}
              <div className="w-2/5 h-3/5 rounded-2xl bg-stone-100/90 border border-stone-200/50 flex items-center justify-center p-4">
                <div className="w-12 h-32 rounded-lg bg-stone-200/70 animate-pulse" />
              </div>
            </div>

            {/* Thumbnail Selectors Strip */}
            <div className="flex gap-3 overflow-x-auto pb-1">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-16 h-16 rounded-xs border p-1.5 shrink-0 bg-stone-50 relative overflow-hidden skeleton-shimmer ${
                    idx === 0 ? 'border-amber-900/50 ring-1 ring-amber-800/30' : 'border-stone-200'
                  }`}
                >
                  <div className="w-full h-full rounded-xs bg-stone-200/50 animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Product Purchase Info */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              {/* Brand & SKU Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="h-3.5 w-24 bg-amber-900/20 rounded-xs animate-pulse" />
                <div className="h-3 w-16 bg-stone-200 rounded-xs animate-pulse" />
              </div>

              {/* Title (2 lines) */}
              <div className="space-y-2.5 pt-1">
                <div className="h-8 w-11/12 bg-stone-200/90 rounded-xs animate-pulse" />
                <div className="h-8 w-3/5 bg-stone-200/80 rounded-xs animate-pulse" />
              </div>

              {/* Category context box */}
              <div className="mt-4 p-3 bg-stone-50 border border-stone-200/80 rounded-xs flex items-center gap-3">
                <div className="h-4 w-20 bg-stone-200 rounded-xs animate-pulse shrink-0" />
                <div className="h-3 w-3/4 bg-stone-200/70 rounded-xs animate-pulse" />
              </div>

              {/* Rating & Review row */}
              <div className="flex items-center gap-3 mt-4">
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-4 h-4 rounded-2xs bg-amber-300/70 animate-pulse" />
                  ))}
                </div>
                <div className="h-3.5 w-8 bg-stone-200 rounded-xs animate-pulse" />
                <div className="h-3.5 w-24 bg-stone-200/80 rounded-xs animate-pulse" />
                <span className="text-stone-300">|</span>
                <div className="h-3.5 w-32 bg-emerald-100 rounded-xs animate-pulse" />
              </div>

              {/* Pricing & Stock banner */}
              <div className="flex items-baseline gap-3 mt-4 pt-4 border-t border-stone-100">
                <div className="h-9 w-28 bg-stone-300/90 rounded-xs animate-pulse" />
                <div className="h-5 w-16 bg-stone-200/70 rounded-xs animate-pulse" />
                <div className="h-5 w-44 bg-emerald-50 border border-emerald-200/80 rounded-xs animate-pulse" />
              </div>

              {/* Short Description */}
              <div className="space-y-2 mt-4">
                <div className="h-3.5 w-full bg-stone-200/80 rounded-xs animate-pulse" />
                <div className="h-3.5 w-11/12 bg-stone-200/80 rounded-xs animate-pulse" />
                <div className="h-3.5 w-3/4 bg-stone-200/70 rounded-xs animate-pulse" />
              </div>

              {/* Sommelier / Flavor / Characteristic Matrix Box */}
              <div className="mt-5 bg-amber-50/60 border border-amber-200/70 p-3.5 rounded-xs space-y-2">
                <div className="h-3.5 w-48 bg-amber-900/20 rounded-xs animate-pulse" />
                <div className="h-3 w-4/5 bg-stone-200/80 rounded-xs animate-pulse" />
              </div>

              {/* Stock Status Indicator */}
              <div className="mt-4">
                <div className="h-7 w-60 bg-emerald-50 border border-emerald-200 rounded-xs flex items-center px-3 gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="h-3 w-48 bg-emerald-200/60 rounded-xs" />
                </div>
              </div>
            </div>

            {/* Action Form: Stepper + Add To Bag + Wishlist */}
            <div className="pt-6 border-t border-stone-200 space-y-4">
              <div className="flex items-center gap-3">
                {/* Quantity Stepper Skeleton */}
                <div className="h-12 w-28 border border-stone-300 rounded-xs bg-stone-50 flex items-center justify-between px-3">
                  <div className="w-4 h-4 bg-stone-300 rounded-xs animate-pulse" />
                  <div className="w-5 h-4 bg-stone-400 rounded-xs animate-pulse" />
                  <div className="w-4 h-4 bg-stone-300 rounded-xs animate-pulse" />
                </div>

                {/* Add to Cart Button Skeleton */}
                <div className="h-12 w-16 bg-stone-900 text-white rounded-xs flex items-center justify-center shadow-xs opacity-90">
                  <div className="w-5 h-5 rounded-xs bg-stone-700 animate-pulse" />
                </div>

                {/* Wishlist Button Skeleton */}
                <div className="h-12 w-12 border border-stone-300 rounded-xs bg-stone-50 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-xs bg-stone-300 animate-pulse" />
                </div>
              </div>

              {/* Guarantees row */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-900/20 shrink-0 animate-pulse" />
                  <div className="h-3 w-40 bg-stone-200 rounded-xs animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-900/20 shrink-0 animate-pulse" />
                  <div className="h-3 w-36 bg-stone-200 rounded-xs animate-pulse" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 3. Frequently Paired Together Section Skeleton */}
        <div className="bg-white border border-stone-200 rounded-xs p-6 shadow-xs space-y-4">
          <div className="h-6 w-48 bg-stone-200/90 rounded-xs animate-pulse" />
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-stone-100 border border-stone-200 rounded-xs p-1 skeleton-shimmer" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-24 bg-stone-200 rounded-xs animate-pulse" />
                  <div className="h-3 w-16 bg-stone-200 rounded-xs animate-pulse" />
                </div>
              </div>
              <span className="text-xl text-stone-300 font-light">+</span>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-stone-100 border border-stone-200 rounded-xs p-1 skeleton-shimmer" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-24 bg-stone-200 rounded-xs animate-pulse" />
                  <div className="h-3 w-16 bg-stone-200 rounded-xs animate-pulse" />
                </div>
              </div>
            </div>
            <div className="md:ml-auto">
              <div className="h-10 w-44 bg-stone-900/20 rounded-xs animate-pulse" />
            </div>
          </div>
        </div>

        {/* 4. Specifications & Reviews Tabs Skeleton */}
        <div className="bg-white border border-stone-200 rounded-xs overflow-hidden shadow-xs">
          <div className="flex border-b border-stone-200 bg-stone-50/50">
            <div className="px-6 py-3.5 border-b-2 border-amber-900 bg-white">
              <div className="h-4 w-28 bg-stone-300 rounded-xs animate-pulse" />
            </div>
            <div className="px-6 py-3.5">
              <div className="h-4 w-28 bg-stone-200 rounded-xs animate-pulse" />
            </div>
            <div className="px-6 py-3.5">
              <div className="h-4 w-28 bg-stone-200 rounded-xs animate-pulse" />
            </div>
          </div>
          <div className="p-6 sm:p-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between py-2 border-b border-stone-100">
                  <div className="h-3 w-28 bg-stone-200 rounded-xs animate-pulse" />
                  <div className="h-3 w-24 bg-stone-200 rounded-xs animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Recommended / Related Products Skeleton Grid */}
        <div className="mt-16 space-y-6">
          <div className="h-7 w-56 bg-stone-200/90 rounded-xs animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[0, 1, 2, 3].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
