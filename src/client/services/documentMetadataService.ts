/**
 * Document Head Metadata Service
 * Automatically generates, localizes, and applies document head metadata:
 * - document.title (with brand, category, pagination, and localized fallback)
 * - canonical link (<link rel="canonical" href="..."> with clean SEO URLs)
 * - hreflang links (<link rel="alternate" hreflang="..." href="...">)
 * - OpenGraph metadata (og:title, og:description, og:url, og:image, og:type, og:locale)
 * - Twitter Card metadata (twitter:card, twitter:title, twitter:description, twitter:image)
 * - Meta description & keywords (Google, Yandex, Bing)
 * - Schema.org JSON-LD structured data (Product, ItemList, BreadcrumbList, Organization)
 */

import { Product } from '../../types/index.js';
import {
  SITE_DOMAIN,
  SITE_NAME,
  MARKET_KEYWORDS,
  getProductSchema,
  getItemListSchema,
  getBreadcrumbSchema,
  generateProductMeta
} from '../../shared/seoConstants.js';
import { BrandAvatar, getBrandBySlug, ALL_BRAND_BADGES } from '../data/brandsData.js';
import { getCanonicalCategory, getBrandUrl, getCategoryUrl, getProductUrl } from '../utils/routeHelpers.js';

export interface DocumentMetadata {
  title: string;
  ruTitle?: string;
  description: string;
  ruDescription?: string;
  canonicalUrl: string;
  canonicalPath: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: 'website' | 'product' | 'article';
  keywords: string[];
  jsonLd?: Record<string, any> | Record<string, any>[];
  robots?: string;
  category?: string;
  brand?: string;
}

export interface ProductMetadataInput {
  product: Product;
  categorySlug?: string;
  page?: number;
  lang?: 'en' | 'ru';
}

export interface BrandMetadataInput {
  brandSlug: string;
  brandName?: string;
  brandAvatar?: BrandAvatar;
  categorySlug?: string;
  categoryName?: string;
  page?: number;
  products?: Product[];
  lang?: 'en' | 'ru';
}

export interface CategoryMetadataInput {
  categorySlug: string;
  categoryName?: string;
  brandSlug?: string;
  subcategory?: string;
  page?: number;
  products?: Product[];
  searchQuery?: string;
  bannerImage?: string;
  lang?: 'en' | 'ru';
}

// Category fallback metadata directory
const CATEGORY_META_CONFIG: Record<string, {
  name: string;
  ruName: string;
  title: string;
  ruTitle: string;
  description: string;
  ruDescription: string;
  bannerImage: string;
}> = {
  hookahs: {
    name: 'Hookahs',
    ruName: 'Кальяны',
    title: 'Russian & Modern Hookahs | Buy Alpha Hookah, MattPear & El Bomber',
    ruTitle: 'Купить кальяны Alpha Hookah, MattPear, El Bomber | Доставка по США и РФ',
    description: 'Shop genuine Russian stainless steel hookahs from Alpha Hookah, MattPear, El Bomber, and Maklaud. 100% authentic master distributor with express shipping.',
    ruDescription: 'Оригинальные российские кальяны из нержавеющей стали AISI 304: Alpha Hookah, MattPear, El Bomber. Гарантия производителя, быстрая доставка.',
    bannerImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80'
  },
  tobacco: {
    name: 'Shisha Tobacco',
    ruName: 'Табак для кальяна',
    title: 'Dark Leaf Shisha Tobacco | MustHave, DarkSide, BlackBurn & Bonche',
    ruTitle: 'Купить табак для кальяна MustHave, DarkSide, BlackBurn | США и РФ',
    description: 'Explore master distributed dark leaf and blonde hookah tobacco: MustHave, DarkSide, BlackBurn, Bonche, Element, and Tangiers. Fresh factory seals.',
    ruDescription: 'Каталог крепкого и легкого табака для кальяна: MustHave, DarkSide, BlackBurn, Bonche. Оригинальные акцизные пачки, быстрая доставка.',
    bannerImage: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=1200&q=80'
  },
  bowls: {
    name: 'Hookah Bowls',
    ruName: 'Чаши для кальяна',
    title: 'Hookah Bowls | Oblako, Kong, Alpaca & Cosmo Phunnel Bowls',
    ruTitle: 'Чаши для кальяна Oblako, Kong, Alpaca | Фанел и глина',
    description: 'Premium glazed and unglazed clay hookah bowls: Oblako phunnels, Kong character bowls, and heat-retaining Turkish killer bowls.',
    ruDescription: 'Глиняные и глазурованные чаши для кальяна Облако (Oblako), Конг (Kong), классические и фанел для идеального жара.',
    bannerImage: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1200&q=80'
  },
  bases: {
    name: 'Hookah Bases',
    ruName: 'Колбы для кальяна',
    title: 'Handmade Crystal & Glass Hookah Bases | Caesar Crystal & Drop Vases',
    ruTitle: 'Колбы для кальяна | Хрустальные колбы Caesar Crystal и капля',
    description: 'Luxury Bohemian mouth-blown crystal vases, Russian heavy drop craft bases, and replacement glass hookahs vases.',
    ruDescription: 'Хрустальные колбы ручной выдувки Caesar Crystal, классические крафтовые колбы капля из тяжелого стекла.',
    bannerImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80'
  },
  coal: {
    name: 'Coconut Charcoal',
    ruName: 'Уголь для кальяна',
    title: 'Natural Coconut Hookah Charcoal | 26mm & 28mm Coco Loco & Oasis',
    ruTitle: 'Кокосовый уголь для кальяна 26мм и 28мм Coco Loco, Oasis',
    description: '100% natural organic coconut charcoal cubes: Coco Loco 26mm, 28mm jumbo cubes, minimal ash, zero chemical odor.',
    ruDescription: 'Натуральный кокосовый уголь для кальяна Coco Loco, Oasis 26мм и 28мм. Без запаха, низкая зольность, долгий жар.',
    bannerImage: 'https://images.unsplash.com/photo-1542314831-c6a4d275727a?auto=format&fit=crop&w=1200&q=80'
  },
  accessories: {
    name: 'Hookah Accessories',
    ruName: 'Аксессуары для кальяна',
    title: 'HMDs, Tongs, Hoses & Trays | Kaloud Lotus, Na Grani & Blade Tongs',
    ruTitle: 'Калауды, щипцы, шланги для кальяна | Kaloud Lotus, На Грани',
    description: 'Essential hookah engineering: stainless steel Na Grani heat managers, Kaloud Lotus, soft-touch silicone hoses, and Blade tongs.',
    ruDescription: 'Контроллеры жара (калауды) На Грани, Kaloud Lotus, дизайнерские щипцы Blade, силиконовые шланги soft-touch.',
    bannerImage: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=1200&q=80'
  },
  'e-hookah': {
    name: 'Electronic Hookahs',
    ruName: 'Электронные кальяны',
    title: 'Electronic Hookahs & Vaporizer Heads | Ooka & Portable E-Shisha',
    ruTitle: 'Электронные кальяны и чаши | Ooka, E-Shisha',
    description: 'Modern heatless and charcoal-free electronic hookahs, pod heads, and luxury portable electronic shisha systems.',
    ruDescription: 'Современные электронные кальяны без угля, электронные чаши для традиционных шахт и портативные устройства.',
    bannerImage: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80'
  },
  vapes: {
    name: 'Vapes & Disposables',
    ruName: 'Вейпы и одноразки',
    title: 'Disposables & Pod Vapes | Al Fakher Crown Bar & Geek Bar',
    ruTitle: 'Вейпы и одноразовые электронные сигареты | Al Fakher Crown Bar',
    description: 'Top-tier disposable vapes, high puff count devices, and premium nicotine salt shisha flavors from Al Fakher and Geek Bar.',
    ruDescription: 'Одноразовые электронные сигареты Al Fakher Crown Bar, Geek Bar и компактные pod-системы.',
    bannerImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80'
  }
};

/**
 * Ensures an absolute canonical URL using SITE_DOMAIN
 */
export function buildAbsoluteUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_DOMAIN}${cleanPath}`;
}

/**
 * Extracts the highest quality image suitable for OpenGraph / Twitter cards
 */
function resolveBestOgImage(images?: Array<{ url: string }>, fallback?: string): string {
  if (images && images.length > 0 && images[0]?.url) {
    const raw = images[0].url;
    if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) {
      return raw.startsWith('/') ? `${SITE_DOMAIN}${raw}` : raw;
    }
  }
  if (fallback) {
    return fallback.startsWith('/') ? `${SITE_DOMAIN}${fallback}` : fallback;
  }
  return `${SITE_DOMAIN}/logo.png`;
}

/**
 * Generates document head metadata for a Product Detail page.
 */
export function generateProductMetadata({
  product,
  categorySlug
}: ProductMetadataInput): DocumentMetadata {
  const rawMeta = generateProductMeta(product, { siteName: SITE_NAME });
  const canonicalCategory = getCanonicalCategory(categorySlug || product.categorySlug) || product.categorySlug || 'product';
  const canonicalPath = getProductUrl({
    slug: product.slug,
    categorySlug: canonicalCategory,
    id: product.id
  });
  const canonicalUrl = buildAbsoluteUrl(canonicalPath);

  // Highest quality primary image
  const ogImage = resolveBestOgImage(product.images, `${SITE_DOMAIN}/logo.png`);

  // Rich Title resolution
  let title = rawMeta.title;
  if (!title.includes(SITE_NAME) && !title.includes('Fumare')) {
    title = `${title} | ${SITE_NAME}`;
  }

  // Localized Russian Title
  const ruTitle = rawMeta.ruTitle
    ? (rawMeta.ruTitle.includes(SITE_NAME) ? rawMeta.ruTitle : `${rawMeta.ruTitle} | ${SITE_NAME}`)
    : `Купить ${product.name} от ${product.brand} | ${SITE_NAME}`;

  // Schema.org Product markup with Offer & Breadcrumbs
  const productSchema = getProductSchema({
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    price: product.price,
    salePrice: product.salePrice,
    brand: product.brand,
    category: product.category,
    categorySlug: canonicalCategory,
    images: product.images,
    stock: product.stock,
    rating: product.rating,
    reviewCount: product.reviewCount
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: product.category || 'Shop', url: getCategoryUrl(canonicalCategory) },
    ...(product.brand ? [{ name: product.brand, url: getBrandUrl(product.brandSlug || product.brand, canonicalCategory) }] : []),
    { name: product.name, url: canonicalPath }
  ]);

  return {
    title,
    ruTitle,
    description: rawMeta.description,
    ruDescription: rawMeta.ruDescription,
    canonicalUrl,
    canonicalPath,
    ogImage,
    ogImageAlt: `${product.name} by ${product.brand} - Genuine Master Distributor Item`,
    ogType: 'product',
    keywords: rawMeta.keywords,
    jsonLd: [productSchema, breadcrumbSchema],
    category: product.category,
    brand: product.brand
  };
}

/**
 * Generates document head metadata for Brand and Brand Category pages.
 * Supports:
 * - Dedicated Brand page: /brands/alpha-hookah or /brand/alpha-hookah
 * - Brand Sub-Category under a Category: /hookahs/alpha-hookah or /tobacco/musthave-tobacco
 * - Pagination: /hookahs/alpha-hookah/page/2
 */
export function generateBrandMetadata({
  brandSlug,
  brandName,
  brandAvatar,
  categorySlug,
  categoryName,
  page = 1,
  products = []
}: BrandMetadataInput): DocumentMetadata {
  const brandObj = brandAvatar || getBrandBySlug(brandSlug) || ALL_BRAND_BADGES.find(b => b.slug === brandSlug);
  const displayName = brandName || brandObj?.name || brandSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const canonicalCat = categorySlug ? getCanonicalCategory(categorySlug) : null;
  const catConfig = canonicalCat ? CATEGORY_META_CONFIG[canonicalCat] : undefined;
  const catDisplayName = categoryName || catConfig?.name || (canonicalCat ? canonicalCat.charAt(0).toUpperCase() + canonicalCat.slice(1) : '');

  // Build Canonical Path
  const canonicalPath = getBrandUrl(brandSlug, canonicalCat || undefined, page);
  const canonicalUrl = buildAbsoluteUrl(canonicalPath);

  // Pagination suffixes
  const pageSuffixEn = page > 1 ? ` (Page ${page})` : '';
  const pageSuffixRu = page > 1 ? ` (Страница ${page})` : '';

  let title = '';
  let ruTitle = '';
  let description = '';
  let ruDescription = '';

  if (canonicalCat && catDisplayName) {
    // Brand Category Page (e.g. /hookahs/alpha-hookah)
    title = `${displayName} ${catDisplayName}${pageSuffixEn} | Official Master Catalog & Distributor | ${SITE_NAME}`;
    ruTitle = `${catDisplayName} ${displayName}${pageSuffixRu} | Официальный каталог и цены | ${SITE_NAME}`;
    description = `Shop genuine ${displayName} ${catDisplayName.toLowerCase()} at Fumare Hookah. 100% verified master distributor inventory with guaranteed factory seals, serial numbers, and fast express shipping across USA & worldwide.`;
    ruDescription = `Официальный каталог ${catDisplayName.toLowerCase()} бренда ${displayName}. 100% оригинальная продукция с гарантией качества, прямые поставки и экспресс-доставка.`;
  } else {
    // Dedicated Brand Hub (e.g. /brand/alpha-hookah)
    title = `${displayName} - Official Catalog & Verified Master Distributor${pageSuffixEn} | ${SITE_NAME}`;
    ruTitle = `${displayName} - Официальный каталог кальянов и табака${pageSuffixRu} | ${SITE_NAME}`;
    description = `Explore the official ${displayName} collection at Fumare Hookah. Factory direct master distribution of genuine hookahs, shisha flavors, and accessories with fast international delivery.`;
    ruDescription = `Официальный каталог бренда ${displayName} в магазине Fumare Hookah. Полный ассортимент оригинальных кальянов, табака и аксессуаров.`;
  }

  // OpenGraph Image Resolution:
  // 1. Top featured product image
  // 2. Brand avatar image/logo
  // 3. Category banner
  // 4. Default logo
  let ogImage = `${SITE_DOMAIN}/logo.png`;
  if (products.length > 0 && products[0]?.images?.[0]?.url) {
    ogImage = resolveBestOgImage(products[0].images);
  } else if (brandObj?.imageUrl) {
    ogImage = brandObj.imageUrl.startsWith('http') ? brandObj.imageUrl : `${SITE_DOMAIN}${brandObj.imageUrl}`;
  } else if (catConfig?.bannerImage) {
    ogImage = catConfig.bannerImage;
  }

  // Keywords
  const baseCategoryKeywords = canonicalCat && MARKET_KEYWORDS.categories[canonicalCat as keyof typeof MARKET_KEYWORDS.categories]
    ? MARKET_KEYWORDS.categories[canonicalCat as keyof typeof MARKET_KEYWORDS.categories].en
    : [];

  const keywords = Array.from(new Set([
    displayName,
    `${displayName} hookahs`,
    `${displayName} tobacco`,
    `${displayName} USA`,
    `buy ${displayName}`,
    `купить ${displayName}`,
    ...(catDisplayName ? [`${displayName} ${catDisplayName}`, `${catDisplayName} ${displayName}`] : []),
    ...baseCategoryKeywords,
    'official master distributor',
    'Fumare Hookah'
  ]));

  // Schema.org Structured Data
  const itemListSchema = getItemListSchema(
    `${displayName} ${catDisplayName || 'Catalog'}`,
    products.slice(0, 24).map(p => ({
      name: p.name,
      url: getProductUrl({ slug: p.slug, categorySlug: canonicalCat || p.categorySlug, id: p.id }),
      image: p.images?.[0]?.url
    }))
  );

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Brands', url: '/brands' }
  ];

  if (canonicalCat && catDisplayName) {
    breadcrumbs.push({ name: catDisplayName, url: getCategoryUrl(canonicalCat) });
  }

  breadcrumbs.push({ name: displayName, url: canonicalPath });
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbs);

  return {
    title,
    ruTitle,
    description,
    ruDescription,
    canonicalUrl,
    canonicalPath,
    ogImage,
    ogImageAlt: `${displayName} Official Master Collection at Fumare Hookah`,
    ogType: 'website',
    keywords,
    jsonLd: [itemListSchema, breadcrumbSchema],
    brand: displayName,
    category: catDisplayName || undefined
  };
}

/**
 * Generates document head metadata for Category pages (/hookahs, /tobacco, etc.).
 */
export function generateCategoryMetadata({
  categorySlug,
  categoryName,
  brandSlug,
  subcategory,
  page = 1,
  products = [],
  searchQuery,
  bannerImage
}: CategoryMetadataInput): DocumentMetadata {
  const canonicalCat = getCanonicalCategory(categorySlug);
  const catConfig = canonicalCat ? CATEGORY_META_CONFIG[canonicalCat] : undefined;
  const brandObj = brandSlug ? (getBrandBySlug(brandSlug) || ALL_BRAND_BADGES.find(b => b.slug === brandSlug)) : undefined;

  // If a brand is specified under category, delegate to generateBrandMetadata
  if (brandSlug) {
    return generateBrandMetadata({
      brandSlug,
      brandName: brandObj?.name,
      brandAvatar: brandObj,
      categorySlug: canonicalCat || categorySlug,
      categoryName: categoryName || catConfig?.name,
      page,
      products
    });
  }

  const catDisplayName = categoryName || catConfig?.name || (canonicalCat ? canonicalCat.charAt(0).toUpperCase() + canonicalCat.slice(1) : 'Hookah & Shisha Catalog');
  const catRuName = catConfig?.ruName || catDisplayName;

  // Build Canonical Path
  let canonicalPath = getCategoryUrl(canonicalCat || categorySlug, page);
  if (searchQuery) {
    canonicalPath = `/shop?search=${encodeURIComponent(searchQuery)}`;
  }
  const canonicalUrl = buildAbsoluteUrl(canonicalPath);

  // Pagination suffix
  const pageSuffixEn = page > 1 ? ` (Page ${page})` : '';
  const pageSuffixRu = page > 1 ? ` (Страница ${page})` : '';

  let title = catConfig
    ? `${catConfig.title}${pageSuffixEn} | ${SITE_NAME}`
    : `${catDisplayName}${pageSuffixEn} | Premier Hookahs & Tobacco | ${SITE_NAME}`;

  let ruTitle = catConfig
    ? `${catConfig.ruTitle}${pageSuffixRu} | ${SITE_NAME}`
    : `Купить ${catRuName}${pageSuffixRu} с быстрой доставкой | ${SITE_NAME}`;

  if (subcategory) {
    title = `${subcategory} - ${catDisplayName}${pageSuffixEn} | ${SITE_NAME}`;
    ruTitle = `${subcategory} - ${catRuName}${pageSuffixRu} | ${SITE_NAME}`;
  } else if (searchQuery) {
    title = `Search: "${searchQuery}" | ${SITE_NAME}`;
    ruTitle = `Поиск: "${searchQuery}" | ${SITE_NAME}`;
  }

  const description = catConfig
    ? catConfig.description
    : `Shop authentic ${catDisplayName} featuring world-renowned Russian & European manufacturers. Fast express shipping across USA, Russia, and worldwide.`;

  const ruDescription = catConfig
    ? catConfig.ruDescription
    : `Большой выбор в категории ${catRuName}. 100% оригинальная сертифицированная продукция, гарантия качества и оперативная доставка.`;

  // Image Selection
  let ogImage = bannerImage || catConfig?.bannerImage;
  if (!ogImage && products.length > 0 && products[0]?.images?.[0]?.url) {
    ogImage = resolveBestOgImage(products[0].images);
  }
  if (!ogImage) {
    ogImage = `${SITE_DOMAIN}/logo.png`;
  }

  // Keywords
  const categoryKeywords = canonicalCat && MARKET_KEYWORDS.categories[canonicalCat as keyof typeof MARKET_KEYWORDS.categories]
    ? MARKET_KEYWORDS.categories[canonicalCat as keyof typeof MARKET_KEYWORDS.categories].en
    : [];

  const keywords = Array.from(new Set([
    catDisplayName,
    catRuName,
    ...(subcategory ? [subcategory] : []),
    ...categoryKeywords,
    'Fumare Hookah',
    'buy hookah online',
    'купить кальян'
  ]));

  const itemListSchema = getItemListSchema(
    catDisplayName,
    products.slice(0, 24).map(p => ({
      name: p.name,
      url: getProductUrl({ slug: p.slug, categorySlug: canonicalCat || p.categorySlug, id: p.id }),
      image: p.images?.[0]?.url
    }))
  );

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
    { name: catDisplayName, url: canonicalPath }
  ];
  if (subcategory) {
    breadcrumbs.push({ name: subcategory, url: `${canonicalPath}?sub=${encodeURIComponent(subcategory)}` });
  }
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbs);

  return {
    title,
    ruTitle,
    description,
    ruDescription,
    canonicalUrl,
    canonicalPath,
    ogImage,
    ogImageAlt: `${catDisplayName} Collection at Fumare Hookah`,
    ogType: 'website',
    keywords,
    jsonLd: [itemListSchema, breadcrumbSchema],
    category: catDisplayName
  };
}

// Internal DOM manipulation helpers
function updateOrCreateMetaTag(selector: string, attributeName: string, attributeValue: string, content: string): void {
  if (typeof document === 'undefined') return;
  let element = document.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateOrCreateLinkTag(rel: string, href: string, hreflang?: string): void {
  if (typeof document === 'undefined') return;
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;

  let element = document.querySelector(selector) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    if (hreflang) {
      element.setAttribute('hreflang', hreflang);
    }
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

/**
 * Applies the generated metadata payload directly to the document head.
 * Handles document.title, canonical, hreflang, OpenGraph, Twitter, and Schema.org JSON-LD.
 */
export function applyDocumentMetadata(metadata: DocumentMetadata, lang: 'en' | 'ru' = 'en'): void {
  if (typeof document === 'undefined') return;

  const isRussian = lang === 'ru';

  // 1. Resolve Localized Title
  let activeTitle = isRussian && metadata.ruTitle ? metadata.ruTitle : metadata.title;
  if (!activeTitle.includes(SITE_NAME) && !activeTitle.includes('Fumare')) {
    activeTitle = `${activeTitle} | ${SITE_NAME}`;
  }
  document.title = activeTitle;

  // 2. Resolve Localized Description
  const activeDescription = isRussian && metadata.ruDescription ? metadata.ruDescription : metadata.description;

  // 3. Keywords
  const defaultKeywords = MARKET_KEYWORDS.global;
  const combinedKeywords = Array.from(new Set([...(metadata.keywords || []), ...defaultKeywords])).join(', ');

  // 4. Canonical and Alternate Hreflang URLs
  const canonicalUrl = metadata.canonicalUrl;
  const cleanPath = metadata.canonicalPath || '/';
  const enUrl = buildAbsoluteUrl(cleanPath);
  const ruUrl = cleanPath.includes('?')
    ? buildAbsoluteUrl(`${cleanPath}&lang=ru`)
    : buildAbsoluteUrl(`${cleanPath}?lang=ru`);

  // Standard Meta Tags
  updateOrCreateMetaTag('meta[name="description"]', 'name', 'description', activeDescription);
  updateOrCreateMetaTag('meta[name="keywords"]', 'name', 'keywords', combinedKeywords);
  updateOrCreateMetaTag('meta[name="robots"]', 'name', 'robots', metadata.robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  updateOrCreateMetaTag('meta[name="googlebot"]', 'name', 'googlebot', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
  updateOrCreateMetaTag('meta[name="yandex"]', 'name', 'yandex', 'index, follow');
  updateOrCreateMetaTag('meta[name="geo.region"]', 'name', 'geo.region', 'US;RU');
  updateOrCreateMetaTag('meta[name="geo.placename"]', 'name', 'geo.placename', 'United States; Russia');

  // Canonical & Hreflang Link Tags
  updateOrCreateLinkTag('canonical', canonicalUrl);
  updateOrCreateLinkTag('alternate', enUrl, 'en-US');
  updateOrCreateLinkTag('alternate', enUrl, 'en');
  updateOrCreateLinkTag('alternate', ruUrl, 'ru-RU');
  updateOrCreateLinkTag('alternate', ruUrl, 'ru');
  updateOrCreateLinkTag('alternate', canonicalUrl, 'x-default');

  // OpenGraph Meta Tags
  updateOrCreateMetaTag('meta[property="og:title"]', 'property', 'og:title', activeTitle);
  updateOrCreateMetaTag('meta[property="og:description"]', 'property', 'og:description', activeDescription);
  updateOrCreateMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
  updateOrCreateMetaTag('meta[property="og:type"]', 'property', 'og:type', metadata.ogType || 'website');
  updateOrCreateMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);
  updateOrCreateMetaTag('meta[property="og:locale"]', 'property', 'og:locale', isRussian ? 'ru_RU' : 'en_US');
  updateOrCreateMetaTag('meta[property="og:locale:alternate"]', 'property', 'og:locale:alternate', isRussian ? 'en_US' : 'ru_RU');

  if (metadata.ogImage) {
    updateOrCreateMetaTag('meta[property="og:image"]', 'property', 'og:image', metadata.ogImage);
    updateOrCreateMetaTag('meta[property="og:image:alt"]', 'property', 'og:image:alt', metadata.ogImageAlt || activeTitle);
  }

  // Twitter Card Tags
  updateOrCreateMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  updateOrCreateMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', activeTitle);
  updateOrCreateMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', activeDescription);
  if (metadata.ogImage) {
    updateOrCreateMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', metadata.ogImage);
  }

  // Structured Data (JSON-LD)
  let jsonLdScript = document.getElementById('seo-dynamic-jsonld') as HTMLScriptElement | null;
  if (metadata.jsonLd) {
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = 'seo-dynamic-jsonld';
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = JSON.stringify(metadata.jsonLd);
  } else if (jsonLdScript) {
    jsonLdScript.remove();
  }
}
