import React from 'react';

interface ProductCardSkeletonProps {
  className?: string;
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`relative bg-white border border-stone-200/90 rounded-xl flex flex-col overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.03)] w-full select-none ${className}`}
      aria-hidden="true"
    >
      {/* 1. Top Showcase & Image Area */}
      <div className="relative aspect-square w-full bg-gradient-to-b from-stone-50/90 via-stone-50/40 to-stone-100/50 p-4 sm:p-5 flex items-center justify-center overflow-hidden skeleton-shimmer">
        
        {/* Top-Left Badge Skeleton */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          <div className="h-4 w-12 rounded-md bg-stone-200/80 animate-pulse" />
        </div>

        {/* Top-Right Wishlist Button Skeleton */}
        <div className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 border border-stone-200/70 flex items-center justify-center shadow-2xs">
          <div className="w-3.5 h-3.5 rounded-full bg-stone-200/90 animate-pulse" />
        </div>

        {/* Center Product Silhouette Placeholder */}
        <div className="relative w-3/5 h-3/5 rounded-xl bg-stone-100/90 border border-stone-200/40 flex items-center justify-center p-3">
          <div className="w-8 h-16 rounded-md bg-stone-200/60 animate-pulse" />
        </div>
      </div>

      {/* 2. Product Details Body */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-white border-t border-stone-100/80 space-y-3">
        <div className="space-y-2">
          {/* Brand & Star Rating Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="h-3 w-16 bg-stone-200/90 rounded-xs animate-pulse" />
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-2xs bg-amber-200/70 animate-pulse" />
              <div className="h-3 w-6 bg-stone-200/90 rounded-xs animate-pulse" />
              <div className="h-2.5 w-5 bg-stone-100 rounded-xs animate-pulse" />
            </div>
          </div>

          {/* Product Title (2 lines) */}
          <div className="space-y-1.5 min-h-[2.5rem] pt-0.5">
            <div className="h-3.5 sm:h-4 w-11/12 bg-stone-200/90 rounded-xs animate-pulse" />
            <div className="h-3.5 sm:h-4 w-3/5 bg-stone-200/70 rounded-xs animate-pulse" />
          </div>

          {/* Key Characteristic / Flavor Pill */}
          <div className="pt-1">
            <div className="h-5 w-24 rounded-md bg-stone-100/90 border border-stone-200/70 animate-pulse" />
          </div>

          {/* Stock Status Indicator */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
            <div className="h-2.5 w-28 bg-stone-200/70 rounded-xs animate-pulse" />
          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline justify-between gap-2 pt-1">
            <div className="flex items-baseline gap-2">
              <div className="h-5 w-16 bg-stone-300/80 rounded-xs animate-pulse" />
              <div className="h-3.5 w-10 bg-stone-200/60 rounded-xs animate-pulse" />
            </div>
            <div className="h-4 w-12 bg-rose-50 border border-rose-100/80 rounded animate-pulse" />
          </div>
        </div>

        {/* 3. Action Footer: Ergonomic Stepper + Add to Cart Button */}
        <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          {/* Stepper skeleton */}
          <div className="h-7 w-20 border border-stone-200/90 rounded-lg bg-stone-50/80 flex items-center justify-between px-2 animate-pulse">
            <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
            <div className="w-3 h-2.5 rounded-2xs bg-stone-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
          </div>

          {/* Add to basket button skeleton */}
          <div className="w-9 h-8 sm:w-10 sm:h-8 rounded-lg bg-stone-100 border border-stone-200/80 flex items-center justify-center animate-pulse">
            <div className="w-4 h-4 rounded-xs bg-stone-300/80" />
          </div>
        </div>
      </div>
    </div>
  );
};
