/**
 * Clean e-commerce URL routing helpers for Fumare Hookah
 * Supports:
 * - Category pages: /hookahs, /tobacco, /bowls, /bases, /coal, /accessories, /e-hookah, /vapes
 * - Paginated category pages: /hookahs/page/2
 * - Single products: /hookahs/alpha-hookah-model-x or /hookahs/1
 */

import { isBrandSlug as checkIsBrandSlug, getBrandBySlug } from '../data/brandsData.js';

export const KNOWN_CATEGORY_SLUGS: Record<string, string> = {
  // Hookahs
  hookahs: 'hookahs',
  hookah: 'hookahs',
  'shisha-pipes': 'hookahs',
  'shisha-pipe': 'hookahs',
  'hookah-pipes': 'hookahs',

  // Tobacco / Shisha
  tobacco: 'tobacco',
  shisha: 'tobacco',
  'shisha-tobacco': 'tobacco',
  'hookah-tobacco': 'tobacco',

  // Bowls
  bowls: 'bowls',
  bowl: 'bowls',
  'hookah-bowls': 'bowls',
  'hookah-bowl': 'bowls',

  // Bases / Vases
  bases: 'bases',
  base: 'bases',
  'hookah-bases': 'bases',
  'glass-bases': 'bases',
  vases: 'bases',
  vase: 'bases',

  // Coal / Charcoal
  coal: 'coal',
  coals: 'coal',
  charcoal: 'coal',
  charcoals: 'coal',
  'coconut-coal': 'coal',
  'hookah-coal': 'coal',

  // Accessories
  accessories: 'accessories',
  accessory: 'accessories',
  'hookah-accessories': 'accessories',
  supplies: 'accessories',

  // E-Hookah
  'e-hookah': 'e-hookah',
  ehookah: 'e-hookah',
  'electronic-hookah': 'e-hookah',

  // Vapes
  vapes: 'vapes',
  vape: 'vapes',
  'pod-systems': 'vapes',
  'disposable-vapes': 'vapes'
};

export function getCanonicalCategory(slugOrName?: string | null): string | null {
  if (!slugOrName) return null;
  const clean = slugOrName.toLowerCase().trim().replace(/^\/+|\/+$/g, '');
  return KNOWN_CATEGORY_SLUGS[clean] || null;
}

export function isCategorySlug(slug?: string | null): boolean {
  return !!getCanonicalCategory(slug);
}

export function isBrandSlug(slug?: string | null): boolean {
  return checkIsBrandSlug(slug);
}

export { getBrandBySlug };

export function getCategoryUrl(categorySlug: string, page = 1): string {
  const canonical = getCanonicalCategory(categorySlug) || categorySlug.toLowerCase().trim();
  if (page && page > 1) {
    return `/${canonical}/page/${page}`;
  }
  return `/${canonical}`;
}

export function getBrandUrl(brandSlug: string, categorySlug?: string, page = 1): string {
  const cleanBrand = (brandSlug || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  const canonicalCat = categorySlug ? getCanonicalCategory(categorySlug) : null;
  const basePath = canonicalCat ? `/${canonicalCat}/${cleanBrand}` : `/brand/${cleanBrand}`;
  if (page && page > 1) {
    return `${basePath}/page/${page}`;
  }
  return basePath;
}

export function getBrandsDirectoryUrl(): string {
  return '/brands';
}

export function getProductUrl(product: {
  slug: string;
  categorySlug?: string;
  category?: string;
  id?: string;
}): string {
  const cat = product.categorySlug ? getCanonicalCategory(product.categorySlug) || product.categorySlug : 'product';
  return `/${cat}/${product.slug || product.id}`;
}

