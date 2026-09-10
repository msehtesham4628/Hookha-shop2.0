import { db } from '../db/store.js';
import { SITE_DOMAIN, SITE_NAME } from '../../shared/seoConstants.js';
import { ALL_BRAND_BADGES, CATEGORY_BRAND_MAP } from '../../client/data/brandsData.js';
import { Product, Category, Brand } from '../../types/index.js';

interface SitemapUrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: string;
  alternates?: { lang: string; href: string }[];
  images?: { loc: string; title?: string; caption?: string }[];
}

function escapeXml(unsafe: string | null | undefined): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatUrlEntry(entry: SitemapUrlEntry): string {
  const loc = escapeXml(entry.loc);
  const lastmod = entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>\n` : '';
  const changefreq = entry.changefreq ? `    <changefreq>${entry.changefreq}</changefreq>\n` : '';
  const priority = entry.priority ? `    <priority>${entry.priority}</priority>\n` : '';

  let alternates = '';
  if (entry.alternates && entry.alternates.length > 0) {
    alternates = entry.alternates
      .map(alt => `    <xhtml:link rel="alternate" hreflang="${escapeXml(alt.lang)}" href="${escapeXml(alt.href)}" />\n`)
      .join('');
  }

  let images = '';
  if (entry.images && entry.images.length > 0) {
    images = entry.images
      .filter(img => img && img.loc)
      .slice(0, 5) // Google allows up to 1000 images per URL, 1-5 is optimal
      .map(img => {
        const titleTag = img.title ? `\n      <image:title>${escapeXml(img.title)}</image:title>` : '';
        const capTag = img.caption ? `\n      <image:caption>${escapeXml(img.caption)}</image:caption>` : '';
        return `    <image:image>\n      <image:loc>${escapeXml(img.loc)}</image:loc>${titleTag}${capTag}\n    </image:image>\n`;
      })
      .join('');
  }

  return `  <url>\n    <loc>${loc}</loc>\n${lastmod}${changefreq}${priority}${alternates}${images}  </url>`;
}

function wrapUrlSet(urlsXml: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlsXml}
</urlset>`;
}

// In-memory cache for fast delivery
interface CacheItem {
  xml: string;
  timestamp: number;
  count: number;
}

let unifiedCache: CacheItem | null = null;
let productsCache: CacheItem | null = null;
let brandsCache: CacheItem | null = null;
let categoriesCache: CacheItem | null = null;
let mainPagesCache: CacheItem | null = null;

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function invalidateSitemapCache(): void {
  unifiedCache = null;
  productsCache = null;
  brandsCache = null;
  categoriesCache = null;
  mainPagesCache = null;
}

/**
 * Generates the Main & Static Pages sitemap entries
 */
export function getMainPagesSitemapEntries(baseDomain = SITE_DOMAIN): SitemapUrlEntry[] {
  const now = new Date().toISOString();
  const staticPages = [
    { path: '', changefreq: 'daily' as const, priority: '1.0' },
    { path: 'shop', changefreq: 'daily' as const, priority: '0.95' },
    { path: 'brands', changefreq: 'weekly' as const, priority: '0.90' },
    { path: 'wholesale', changefreq: 'weekly' as const, priority: '0.85' },
    { path: 'about', changefreq: 'monthly' as const, priority: '0.70' },
    { path: 'contact', changefreq: 'monthly' as const, priority: '0.70' }
  ];

  return staticPages.map(page => {
    const fullUrl = page.path ? `${baseDomain}/${page.path}` : `${baseDomain}/`;
    const ruUrl = page.path ? `${baseDomain}/${page.path}?lang=ru` : `${baseDomain}/?lang=ru`;
    return {
      loc: fullUrl,
      lastmod: now,
      changefreq: page.changefreq,
      priority: page.priority,
      alternates: [
        { lang: 'en-US', href: fullUrl },
        { lang: 'en', href: fullUrl },
        { lang: 'ru-RU', href: ruUrl },
        { lang: 'ru', href: ruUrl },
        { lang: 'x-default', href: fullUrl }
      ]
    };
  });
}

/**
 * Generates all Category sitemap entries (both clean canonical path and fallback search filter)
 */
export function getCategoriesSitemapEntries(baseDomain = SITE_DOMAIN): SitemapUrlEntry[] {
  const now = new Date().toISOString();
  const seenUrls = new Set<string>();
  const entries: SitemapUrlEntry[] = [];

  // 1. Categories from DB
  const categories = db.categories.filter(c => c.isActive !== false && !db.isCategoryDeleted(c.id || c.slug));

  for (const cat of categories) {
    const slug = cat.slug.toLowerCase().trim();
    if (!slug) continue;

    // Canonical direct URL (e.g., https://fumarehookah.com/hookahs)
    const canonicalUrl = `${baseDomain}/${slug}`;
    if (!seenUrls.has(canonicalUrl)) {
      seenUrls.add(canonicalUrl);
      const ruUrl = `${canonicalUrl}?lang=ru`;
      entries.push({
        loc: canonicalUrl,
        lastmod: now,
        changefreq: 'daily',
        priority: '0.90',
        alternates: [
          { lang: 'en-US', href: canonicalUrl },
          { lang: 'en', href: canonicalUrl },
          { lang: 'ru-RU', href: ruUrl },
          { lang: 'ru', href: ruUrl },
          { lang: 'x-default', href: canonicalUrl }
        ]
      });
    }

    // Shop filter URL (e.g., https://fumarehookah.com/shop?category=hookahs)
    const shopFilterUrl = `${baseDomain}/shop?category=${encodeURIComponent(slug)}`;
    if (!seenUrls.has(shopFilterUrl)) {
      seenUrls.add(shopFilterUrl);
      const ruShopUrl = `${shopFilterUrl}&lang=ru`;
      entries.push({
        loc: shopFilterUrl,
        lastmod: now,
        changefreq: 'daily',
        priority: '0.80',
        alternates: [
          { lang: 'en-US', href: shopFilterUrl },
          { lang: 'en', href: shopFilterUrl },
          { lang: 'ru-RU', href: ruShopUrl },
          { lang: 'ru', href: ruShopUrl },
          { lang: 'x-default', href: shopFilterUrl }
        ]
      });
    }
  }

  return entries;
}

/**
 * Generates all Brand sitemap entries (dedicated brand hubs, category-nested brands, and shop filters)
 */
export function getBrandsSitemapEntries(baseDomain = SITE_DOMAIN): SitemapUrlEntry[] {
  const now = new Date().toISOString();
  const seenUrls = new Set<string>();
  const entries: SitemapUrlEntry[] = [];

  // Aggregate brand information from DB and curated catalogues
  const brandSlugMap = new Map<string, { name: string; slug: string; categories: Set<string> }>();

  // 1. Brands from DB
  for (const b of db.brands) {
    if (b.isActive === false || db.isBrandDeleted(b.id || b.slug)) continue;
    const slug = b.slug.toLowerCase().trim();
    if (!slug) continue;
    if (!brandSlugMap.has(slug)) {
      brandSlugMap.set(slug, { name: b.name, slug, categories: new Set() });
    }
  }

  // 2. Brands from DB Products (cross-referencing categories)
  for (const p of db.products) {
    if (p.isActive === false || db.isProductDeleted(p.id)) continue;
    const brandSlug = (p.brandSlug || p.brand || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const categorySlug = (p.categorySlug || p.category || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    if (brandSlug) {
      let brandObj = brandSlugMap.get(brandSlug);
      if (!brandObj) {
        brandObj = { name: p.brand || brandSlug, slug: brandSlug, categories: new Set() };
        brandSlugMap.set(brandSlug, brandObj);
      }
      if (categorySlug && categorySlug !== 'uncategorized' && categorySlug !== 'shop') {
        brandObj.categories.add(categorySlug);
      }
    }
  }

  // 3. Curated Brand Badges
  for (const badge of ALL_BRAND_BADGES) {
    const slug = badge.slug.toLowerCase().trim();
    if (!slug) continue;
    let brandObj = brandSlugMap.get(slug);
    if (!brandObj) {
      brandObj = { name: badge.name, slug, categories: new Set() };
      brandSlugMap.set(slug, brandObj);
    }
    if (badge.category) {
      brandObj.categories.add(badge.category.toLowerCase().trim());
    }
  }

  // 4. Category-Brand mapping
  for (const [cat, brands] of Object.entries(CATEGORY_BRAND_MAP)) {
    for (const b of brands) {
      const slug = b.slug.toLowerCase().trim();
      let brandObj = brandSlugMap.get(slug);
      if (!brandObj) {
        brandObj = { name: b.name, slug, categories: new Set() };
        brandSlugMap.set(slug, brandObj);
      }
      brandObj.categories.add(cat.toLowerCase().trim());
    }
  }

  // Generate URLs for each brand
  for (const brand of brandSlugMap.values()) {
    // A. Dedicated Brand Catalog Hub (/brand/:brandSlug)
    const brandHubUrl = `${baseDomain}/brand/${brand.slug}`;
    if (!seenUrls.has(brandHubUrl)) {
      seenUrls.add(brandHubUrl);
      const ruHubUrl = `${brandHubUrl}?lang=ru`;
      entries.push({
        loc: brandHubUrl,
        lastmod: now,
        changefreq: 'weekly',
        priority: '0.85',
        alternates: [
          { lang: 'en-US', href: brandHubUrl },
          { lang: 'en', href: brandHubUrl },
          { lang: 'ru-RU', href: ruHubUrl },
          { lang: 'ru', href: ruHubUrl },
          { lang: 'x-default', href: brandHubUrl }
        ]
      });
    }

    // B. Category-nested Brand Catalog (/categorySlug/:brandSlug)
    for (const catSlug of brand.categories) {
      const catBrandUrl = `${baseDomain}/${catSlug}/${brand.slug}`;
      if (!seenUrls.has(catBrandUrl)) {
        seenUrls.add(catBrandUrl);
        const ruCatBrandUrl = `${catBrandUrl}?lang=ru`;
        entries.push({
          loc: catBrandUrl,
          lastmod: now,
          changefreq: 'weekly',
          priority: '0.85',
          alternates: [
            { lang: 'en-US', href: catBrandUrl },
            { lang: 'en', href: catBrandUrl },
            { lang: 'ru-RU', href: ruCatBrandUrl },
            { lang: 'ru', href: ruCatBrandUrl },
            { lang: 'x-default', href: catBrandUrl }
          ]
        });
      }
    }

    // C. Fallback Shop Filter (/shop?brand=:brandSlug)
    const shopBrandUrl = `${baseDomain}/shop?brand=${encodeURIComponent(brand.slug)}`;
    if (!seenUrls.has(shopBrandUrl)) {
      seenUrls.add(shopBrandUrl);
      const ruShopBrandUrl = `${shopBrandUrl}&lang=ru`;
      entries.push({
        loc: shopBrandUrl,
        lastmod: now,
        changefreq: 'weekly',
        priority: '0.75',
        alternates: [
          { lang: 'en-US', href: shopBrandUrl },
          { lang: 'en', href: shopBrandUrl },
          { lang: 'ru-RU', href: ruShopBrandUrl },
          { lang: 'ru', href: ruShopBrandUrl },
          { lang: 'x-default', href: shopBrandUrl }
        ]
      });
    }
  }

  return entries;
}

/**
 * Generates all Product sitemap entries with clean canonical URLs, images, and localized hreflangs
 */
export function getProductsSitemapEntries(baseDomain = SITE_DOMAIN): SitemapUrlEntry[] {
  const seenUrls = new Set<string>();
  const entries: SitemapUrlEntry[] = [];
  const activeProducts = db.products.filter(p => p.isActive !== false && !db.isProductDeleted(p.id));

  for (const product of activeProducts) {
    const slug = product.slug?.trim();
    if (!slug) continue;

    const catSlug = product.categorySlug || 'product';
    const canonicalPath = `/${catSlug}/${slug}`;
    const canonicalUrl = `${baseDomain}${canonicalPath}`;

    if (seenUrls.has(canonicalUrl)) continue;
    seenUrls.add(canonicalUrl);

    const ruUrl = `${canonicalUrl}?lang=ru`;
    const lastmod = product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString();

    // Priority based on sales/stock status
    let priority = '0.90';
    if (product.isFeatured || product.isBestSeller) {
      priority = '0.95';
    } else if (product.stock <= 0) {
      priority = '0.70';
    }

    // Product Images
    const images: { loc: string; title?: string; caption?: string }[] = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      for (const img of product.images) {
        const url = typeof img === 'string' ? img : img?.url;
        if (url && /^https?:\/\//i.test(url)) {
          images.push({
            loc: url,
            title: product.name,
            caption: product.shortDescription || `${product.name} - official distributor item at ${SITE_NAME}`
          });
        }
      }
    }

    entries.push({
      loc: canonicalUrl,
      lastmod,
      changefreq: 'daily',
      priority,
      alternates: [
        { lang: 'en-US', href: canonicalUrl },
        { lang: 'en', href: canonicalUrl },
        { lang: 'ru-RU', href: ruUrl },
        { lang: 'ru', href: ruUrl },
        { lang: 'x-default', href: canonicalUrl }
      ],
      images: images.length > 0 ? images : undefined
    });
  }

  return entries;
}

/**
 * Generates the unified, comprehensive XML sitemap containing all existing products, brands, and categories
 */
export function generateUnifiedSitemapXml(baseDomain = SITE_DOMAIN, forceFresh = false): { xml: string; count: number } {
  const now = Date.now();
  if (!forceFresh && unifiedCache && now - unifiedCache.timestamp < CACHE_TTL_MS) {
    return { xml: unifiedCache.xml, count: unifiedCache.count };
  }

  const mainEntries = getMainPagesSitemapEntries(baseDomain);
  const catEntries = getCategoriesSitemapEntries(baseDomain);
  const brandEntries = getBrandsSitemapEntries(baseDomain);
  const productEntries = getProductsSitemapEntries(baseDomain);

  const allEntries = [...mainEntries, ...catEntries, ...brandEntries, ...productEntries];
  const urlsXml = allEntries.map(entry => formatUrlEntry(entry)).join('\n');
  const xml = wrapUrlSet(urlsXml);

  unifiedCache = {
    xml,
    timestamp: now,
    count: allEntries.length
  };

  return { xml, count: allEntries.length };
}

/**
 * Generates dedicated Products XML sitemap
 */
export function generateProductsSitemapXml(baseDomain = SITE_DOMAIN, forceFresh = false): { xml: string; count: number } {
  const now = Date.now();
  if (!forceFresh && productsCache && now - productsCache.timestamp < CACHE_TTL_MS) {
    return { xml: productsCache.xml, count: productsCache.count };
  }

  const entries = getProductsSitemapEntries(baseDomain);
  const urlsXml = entries.map(entry => formatUrlEntry(entry)).join('\n');
  const xml = wrapUrlSet(urlsXml);

  productsCache = { xml, timestamp: now, count: entries.length };
  return { xml, count: entries.length };
}

/**
 * Generates dedicated Brands XML sitemap
 */
export function generateBrandsSitemapXml(baseDomain = SITE_DOMAIN, forceFresh = false): { xml: string; count: number } {
  const now = Date.now();
  if (!forceFresh && brandsCache && now - brandsCache.timestamp < CACHE_TTL_MS) {
    return { xml: brandsCache.xml, count: brandsCache.count };
  }

  const entries = getBrandsSitemapEntries(baseDomain);
  const urlsXml = entries.map(entry => formatUrlEntry(entry)).join('\n');
  const xml = wrapUrlSet(urlsXml);

  brandsCache = { xml, timestamp: now, count: entries.length };
  return { xml, count: entries.length };
}

/**
 * Generates dedicated Categories XML sitemap
 */
export function generateCategoriesSitemapXml(baseDomain = SITE_DOMAIN, forceFresh = false): { xml: string; count: number } {
  const now = Date.now();
  if (!forceFresh && categoriesCache && now - categoriesCache.timestamp < CACHE_TTL_MS) {
    return { xml: categoriesCache.xml, count: categoriesCache.count };
  }

  const entries = getCategoriesSitemapEntries(baseDomain);
  const urlsXml = entries.map(entry => formatUrlEntry(entry)).join('\n');
  const xml = wrapUrlSet(urlsXml);

  categoriesCache = { xml, timestamp: now, count: entries.length };
  return { xml, count: entries.length };
}

/**
 * Generates dedicated Main Pages XML sitemap
 */
export function generateMainPagesSitemapXml(baseDomain = SITE_DOMAIN, forceFresh = false): { xml: string; count: number } {
  const now = Date.now();
  if (!forceFresh && mainPagesCache && now - mainPagesCache.timestamp < CACHE_TTL_MS) {
    return { xml: mainPagesCache.xml, count: mainPagesCache.count };
  }

  const entries = getMainPagesSitemapEntries(baseDomain);
  const urlsXml = entries.map(entry => formatUrlEntry(entry)).join('\n');
  const xml = wrapUrlSet(urlsXml);

  mainPagesCache = { xml, timestamp: now, count: entries.length };
  return { xml, count: entries.length };
}

/**
 * Generates a Sitemap Index linking all sub-sitemaps
 */
export function generateSitemapIndexXml(baseDomain = SITE_DOMAIN): string {
  const now = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseDomain}/sitemap-all.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseDomain}/sitemap-main.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseDomain}/sitemap-categories.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseDomain}/sitemap-brands.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseDomain}/sitemap-products.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;
}
