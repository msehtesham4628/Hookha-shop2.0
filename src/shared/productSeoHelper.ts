/**
 * Dynamic Product SEO Meta Helper
 * Generates unique, search-engine-optimized Meta Titles, Descriptions, and Keywords
 * tailored for Google, Yandex, Bing, OpenGraph, and Twitter Cards.
 */

import { SITE_DOMAIN, SITE_NAME } from './seoConstants.js';

export interface ProductMetaInput {
  id?: string;
  name: string;
  slug?: string;
  sku?: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  salePrice?: number;
  currency?: string;
  brand?: string;
  brandSlug?: string;
  category?: string;
  categorySlug?: string;
  subcategory?: string;
  flavor?: string;
  material?: string;
  color?: string;
  weight?: number | string;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  specifications?: Array<{ label: string; value: string }>;
  images?: Array<{ url: string; alt?: string; thumbnailUrl?: string }>;
  seoTitle?: string;
  seoDescription?: string;
}

export interface ProductMetaOptions {
  lang?: 'en' | 'ru';
  siteName?: string;
  includePrice?: boolean;
  includeStock?: boolean;
  includeBrand?: boolean;
  maxLengthTitle?: number;
  maxLengthDescription?: number;
}

export interface ProductMetaData {
  title: string;
  description: string;
  ruTitle: string;
  ruDescription: string;
  keywords: string[];
  canonicalUrl: string;
  openGraph: {
    title: string;
    description: string;
    type: 'product';
    url: string;
    image?: string;
  };
  twitter: {
    card: 'summary_large_image';
    title: string;
    description: string;
    image?: string;
  };
}

/**
 * Truncate a text string cleanly at a word boundary, avoiding partial words or hanging punctuation.
 */
export function truncateCleanly(text: string, maxLength: number, appendEllipsis = true): string {
  if (!text) return '';
  const trimmed = text.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= maxLength) return trimmed;

  const targetLimit = appendEllipsis ? Math.max(maxLength - 3, 10) : maxLength;
  let truncated = trimmed.slice(0, targetLimit);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > targetLimit * 0.7) {
    truncated = truncated.slice(0, lastSpace);
  }
  // Strip trailing punctuation
  truncated = truncated.replace(/[,;:\-\s]+$/, '');
  return appendEllipsis ? `${truncated}...` : truncated;
}

/**
 * Extracts distinguishing features (weight, flavor, material, color, pack size) from product data.
 */
export function extractProductAttributes(product: ProductMetaInput) {
  // 1. Pack size / Weight / Puffs
  let weightOrSize = '';
  if (product.weight) {
    const wNum = typeof product.weight === 'number' ? product.weight : parseFloat(product.weight);
    if (!isNaN(wNum) && wNum > 0) {
      weightOrSize = wNum >= 1000 ? `${(wNum / 1000).toFixed(wNum % 1000 === 0 ? 0 : 1)}kg` : `${wNum}g`;
    }
  }

  // Fallback: extract weight or puffs from product name or short description
  if (!weightOrSize) {
    const sizeMatch = product.name.match(/\b(\d+(?:\.\d+)?)\s*(gr|g|gram|grams|kg|ml|oz|puffs)\b/i);
    if (sizeMatch) {
      weightOrSize = `${sizeMatch[1]}${sizeMatch[2].toLowerCase()}`;
    }
  }

  // 2. Flavor / Taste notes
  let flavor = product.flavor || '';
  if (!flavor && product.specifications) {
    const flavorSpec = product.specifications.find(s => 
      /flavor|taste|вкус/i.test(s.label)
    );
    if (flavorSpec) flavor = flavorSpec.value;
  }
  if (!flavor && product.shortDescription) {
    // Common format: "DarkSide BERGAMONSTR – Spicy and slightly tart taste of ripe bergamot"
    const dashMatch = product.shortDescription.match(/[–—\-]\s*([^.!\n]+)/);
    if (dashMatch && dashMatch[1].length < 60) {
      flavor = dashMatch[1].trim();
    }
  }

  // 3. Material / Craft
  let material = product.material || '';
  if (!material && product.specifications) {
    const matSpec = product.specifications.find(s => 
      /material|craft|материал/i.test(s.label)
    );
    if (matSpec) material = matSpec.value;
  }

  // 4. Color / Finish
  let color = product.color || '';
  if (!color && product.specifications) {
    const colorSpec = product.specifications.find(s => 
      /color|colour|цвет/i.test(s.label)
    );
    if (colorSpec) color = colorSpec.value;
  }

  // 5. Best descriptive category / subcategory descriptor
  let categoryDescriptor = '';
  const sub = product.subcategory || '';
  const cat = product.category || '';
  if (sub && !product.name.toLowerCase().includes(sub.toLowerCase())) {
    categoryDescriptor = sub;
  } else if (cat && !product.name.toLowerCase().includes(cat.toLowerCase())) {
    categoryDescriptor = cat;
  }

  return {
    weightOrSize,
    flavor,
    material,
    color,
    categoryDescriptor,
    brand: product.brand || ''
  };
}

/**
 * Dynamically generates a unique, high-CTR meta title for Google & Bing (50-65 chars).
 */
export function generateProductMetaTitle(
  product: ProductMetaInput,
  options?: ProductMetaOptions
): string {
  const site = options?.siteName || SITE_NAME;
  const maxLen = options?.maxLengthTitle || 65;

  // 1. Explicit SEO override if provided by merchant
  if (product.seoTitle && product.seoTitle.trim()) {
    const custom = product.seoTitle.trim();
    if (custom.includes(site)) return truncateCleanly(custom, maxLen, false);
    const combined = `${custom} | ${site}`;
    return combined.length <= maxLen ? combined : truncateCleanly(custom, maxLen, false);
  }

  const { weightOrSize, flavor, material, categoryDescriptor, brand } = extractProductAttributes(product);

  // Clean brand prefix if already part of product name to avoid repetition (e.g. "DarkSide DarkSide Cola")
  let cleanName = product.name.trim();
  if (brand && cleanName.toLowerCase().startsWith(`${brand.toLowerCase()} `)) {
    // Name already begins with brand
  }

  // Build candidate distinguishing segments
  const candidates: string[] = [];

  // Distinguisher: flavor or material or pack size
  if (flavor && !cleanName.toLowerCase().includes(flavor.toLowerCase()) && flavor.length <= 25) {
    candidates.push(flavor);
  } else if (material && !cleanName.toLowerCase().includes(material.toLowerCase()) && material.length <= 25) {
    candidates.push(material);
  }

  if (weightOrSize && !cleanName.toLowerCase().includes(weightOrSize.toLowerCase())) {
    candidates.push(weightOrSize);
  }

  if (categoryDescriptor && !cleanName.toLowerCase().includes(categoryDescriptor.toLowerCase())) {
    candidates.push(categoryDescriptor);
  }

  // Priority Formula 1: Name + Distinguisher | Category/Brand | Site
  let fullTitle = cleanName;
  if (candidates.length > 0) {
    fullTitle += ` (${candidates[0]})`;
  }

  let finalTitle = `${fullTitle} | ${site}`;

  // If still within character limit, add intent like "Buy Online" or subcategory
  if (finalTitle.length + 14 <= maxLen && categoryDescriptor) {
    finalTitle = `${fullTitle} - ${categoryDescriptor} | ${site}`;
  }

  if (finalTitle.length > maxLen) {
    // Fallback to simpler version: Name | Site
    finalTitle = `${cleanName} | ${site}`;
    if (finalTitle.length > maxLen) {
      finalTitle = `${truncateCleanly(cleanName, maxLen - site.length - 3, false)} | ${site}`;
    }
  }

  return finalTitle;
}

/**
 * Dynamically generates a localized Russian meta title for Yandex & Google.ru.
 */
export function generateProductMetaTitleRu(
  product: ProductMetaInput,
  options?: ProductMetaOptions
): string {
  const site = options?.siteName || SITE_NAME;
  const maxLen = options?.maxLengthTitle || 65;

  const { weightOrSize, flavor } = extractProductAttributes(product);
  const cleanName = product.name.trim();

  let details = '';
  if (flavor && flavor.length <= 20) {
    details = ` (${flavor})`;
  } else if (weightOrSize) {
    details = ` ${weightOrSize}`;
  }

  let candidate = `Купить ${cleanName}${details} | ${site}`;
  if (candidate.length > maxLen) {
    candidate = `Купить ${cleanName} | ${site}`;
    if (candidate.length > maxLen) {
      candidate = `${truncateCleanly(`Купить ${cleanName}`, maxLen - site.length - 3, false)} | ${site}`;
    }
  }
  return candidate;
}

/**
 * Dynamically generates a unique, conversion-focused meta description (140-160 chars).
 */
export function generateProductMetaDescription(
  product: ProductMetaInput,
  options?: ProductMetaOptions
): string {
  const site = options?.siteName || SITE_NAME;
  const maxLen = options?.maxLengthDescription || 160;

  // 1. Explicit SEO override if provided
  if (product.seoDescription && product.seoDescription.trim()) {
    return truncateCleanly(product.seoDescription.trim(), maxLen);
  }

  const { weightOrSize, flavor, material, brand } = extractProductAttributes(product);
  const brandName = brand || site;
  const price = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;

  // Part 1: Primary action & product identification
  let intro = `Buy genuine ${product.name} by ${brandName}.`;

  // Part 2: Distinguishing specifications / flavor notes / craft
  let feature = '';
  if (flavor) {
    feature = ` Features distinct ${flavor} notes.`;
  } else if (material) {
    feature = ` Premium ${material} craftsmanship.`;
  } else if (weightOrSize) {
    feature = ` Genuine ${weightOrSize} original packaging.`;
  } else if (product.shortDescription) {
    const cleanShort = product.shortDescription.replace(/<[^>]*>?/gm, '').trim();
    if (cleanShort && cleanShort.length > 15) {
      feature = ` ${cleanShort}`;
    }
  }

  // Part 3: Stock status, pricing, and shipping reassurance
  let offer = '';
  if (price && price > 0) {
    offer = ` In stock for $${price.toFixed(2)}.`;
  } else if (product.stock !== undefined && product.stock > 0) {
    offer = ` In stock with factory seal.`;
  }

  const closing = ` Fast USA express shipping & worldwide delivery at ${site}.`;

  // Combine and smartly truncate to 140-160 characters
  let fullDesc = `${intro}${feature}${offer}${closing}`;
  if (fullDesc.length > maxLen) {
    // Try without feature if too long
    fullDesc = `${intro}${offer}${closing}`;
  }
  if (fullDesc.length > maxLen) {
    fullDesc = `${intro}${closing}`;
  }

  return truncateCleanly(fullDesc, maxLen);
}

/**
 * Dynamically generates a localized Russian meta description for Yandex & Google.ru.
 */
export function generateProductMetaDescriptionRu(
  product: ProductMetaInput,
  options?: ProductMetaOptions
): string {
  const site = options?.siteName || SITE_NAME;
  const maxLen = options?.maxLengthDescription || 160;

  const { weightOrSize, flavor, material, brand } = extractProductAttributes(product);
  const brandName = brand || site;

  let feature = '';
  if (flavor) {
    feature = ` Вкус: ${flavor}.`;
  } else if (material) {
    feature = ` Материал: ${material}.`;
  } else if (weightOrSize) {
    feature = ` Оригинальная фасовка ${weightOrSize}.`;
  }

  const intro = `Закажите оригинальный ${product.name} от ${brandName}.${feature}`;
  const closing = ` 100% оригинал с гарантией, быстрая доставка по США и РФ в ${site}.`;

  let fullDesc = `${intro}${closing}`;
  if (fullDesc.length > maxLen) {
    fullDesc = `Купить оригинальный ${product.name} от ${brandName}. Гарантия подлинности, быстрая доставка по США и РФ в ${site}.`;
  }

  return truncateCleanly(fullDesc, maxLen);
}

/**
 * Generates unique, high-relevance search keywords for the product.
 */
export function generateProductKeywords(
  product: ProductMetaInput,
  options?: ProductMetaOptions
): string[] {
  const keywords = new Set<string>();
  const name = product.name.trim();
  const brand = product.brand ? product.brand.trim() : '';
  const category = product.category ? product.category.trim() : '';
  const subcategory = product.subcategory ? product.subcategory.trim() : '';
  const site = options?.siteName || SITE_NAME;

  // Primary product targets
  keywords.add(name);
  keywords.add(`buy ${name}`);
  keywords.add(`${name} online`);

  if (brand) {
    keywords.add(brand);
    keywords.add(`${brand} ${name}`);
    keywords.add(`${brand} USA`);
  }

  if (category) {
    keywords.add(category);
    keywords.add(`${category} online`);
  }

  if (subcategory) {
    keywords.add(subcategory);
  }

  const { weightOrSize, flavor, material } = extractProductAttributes(product);
  if (flavor) keywords.add(`${name} ${flavor}`);
  if (weightOrSize) keywords.add(`${name} ${weightOrSize}`);
  if (material) keywords.add(`${material} hookah`);

  // Russian search intent
  keywords.add(`купить ${name}`);
  keywords.add(`${name} оригинал`);
  if (brand) keywords.add(`купить ${brand}`);

  // Brand site tags
  keywords.add(site);

  // Add custom tags if defined on product
  if (Array.isArray(product.tags)) {
    product.tags.forEach(t => {
      if (t && t.trim()) keywords.add(t.trim());
    });
  }

  return Array.from(keywords);
}

/**
 * Master helper function to dynamically generate complete, unique meta titles and descriptions
 * for product detail pages based on product data.
 * 
 * @param product Product data object
 * @param options Customization options (language, site name, character lengths)
 * @returns Comprehensive ProductMetaData with titles, descriptions, OpenGraph, and Twitter tags
 */
export function generateProductMeta(
  product: ProductMetaInput,
  options?: ProductMetaOptions
): ProductMetaData {
  const site = options?.siteName || SITE_NAME;
  const slug = product.slug || product.id || '';
  const canonicalUrl = `${SITE_DOMAIN}/product/${slug}`;

  const title = generateProductMetaTitle(product, options);
  const description = generateProductMetaDescription(product, options);
  const ruTitle = generateProductMetaTitleRu(product, options);
  const ruDescription = generateProductMetaDescriptionRu(product, options);
  const keywords = generateProductKeywords(product, options);

  const primaryImage = product.images && product.images.length > 0 ? product.images[0].url : undefined;

  return {
    title,
    description,
    ruTitle,
    ruDescription,
    keywords,
    canonicalUrl,
    openGraph: {
      title,
      description,
      type: 'product',
      url: canonicalUrl,
      image: primaryImage
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      image: primaryImage
    }
  };
}
