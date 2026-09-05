import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DB = path.join(ROOT, 'src/server/db');
const OUT = path.join(DB, 'scrapedProducts.json');
const CATEGORIES_OUT = path.join(DB, 'scrapedCategories.json');
const BRANDS_OUT = path.join(DB, 'scrapedBrands.json');

const PARTS = [1, 2, 3, 4].map((n) =>
  `https://raw.githubusercontent.com/msehtesham4628/Image_scraper/main/split_products/products-${n}.json`
);

const slugify = (value) => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'uncategorized';
const cleanText = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();
const isWhm = (value) => /world\s*hookah\s*market|world-hookah-market/i.test(String(value || ''));

function normalizeImages(raw, name) {
  const urls = Array.isArray(raw) ? raw : [];
  const seen = new Set();
  return urls.map((url, i) => cleanText(url)).filter((url) => {
    if (!/^https?:\/\//i.test(url) || seen.has(url)) return false;
    const lower = url.toLowerCase();
    if (/images\.unsplash\.com|gravatar|avatar|placeholder|spinner|loading|\/logo\b/i.test(lower)) return false;
    seen.add(url);
    return true;
  }).slice(0, 20).map((url, i) => ({
    id: `${slugify(name)}-image-${i + 1}`,
    url,
    thumbnailUrl: url,
    alt: `${name} product image ${i + 1}`,
    isPrimary: i === 0,
    sortOrder: i,
  }));
}

function inferCategory(product) {
  const explicit = cleanText(product.category);
  if (explicit && !isWhm(explicit)) return explicit;
  const text = `${product.product_name || ''} ${product.product_url || ''}`.toLowerCase();
  if (/\be-?hookah|hookah pod|flavor pod|disposable hookah|electronic hookah/i.test(text)) return 'E-Hookah';
  if (/\bvape|disposable|puff|nicotine|salt nic|pod system/i.test(text)) return 'Vapes';
  if (/charcoal|coconut coal|quick light|cube.*coal/i.test(text)) return 'Coal';
  if (/tobacco|shisha|hookah tobacco|molasses/i.test(text)) return 'Tobacco';
  if (/hookah|shisha|hmd|heat management|mouthpiece|hose|bowl|tongs|cleaning|adapter|tray/i.test(text)) return 'Accessories';
  return 'Accessories';
}

function inferBrand(product) {
  const explicit = cleanText(product.brand);
  if (explicit && !isWhm(explicit)) return explicit;
  const name = cleanText(product.product_name);
  const known = [
    'MustHave', 'DarkSide Tobacco', 'Tangiers', 'Ooka', 'Aspire Proteus', 'Enso', 'HeyBar', 'Kori', 'XKAH',
    'Adalya', 'Flamingo', 'Kori Hola', 'ZColors', 'Coco Loco', 'One Nation', 'Oasis Charcoal', 'Kaloud',
    'Na Grani', 'Blade Hookah', 'Alpha Hookah', 'Alpha Tongs', 'Blackburn', 'Bonche', 'Element', 'Starbuzz',
    'Trifecta', 'Fumari', 'Social Smoke', 'Al Fakher', 'Mason', 'Werkbund', 'Steamulation', 'Vyro', 'Moze',
  ];
  const match = known.find((brand) => new RegExp(`^${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(name));
  if (match) return match;
  const first = name.split(/\s+/)[0];
  return first && first.length > 1 ? first : 'Fumare Hookah';
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'Fumare-Catalog-Importer/1.0' } });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

const all = [];
for (const url of PARTS) {
  console.log(`[catalog] Fetching ${url}`);
  const data = await fetchJson(url);
  if (!Array.isArray(data)) throw new Error(`Expected JSON array from ${url}`);
  all.push(...data);
}

const byKey = new Map();
for (const raw of all) {
  const name = cleanText(raw.product_name || raw.name);
  const productUrl = cleanText(raw.product_url || raw.url);
  const sku = cleanText(raw.sku);
  const key = (productUrl || sku || name).toLowerCase();
  if (!key || byKey.has(key)) continue;

  const brand = inferBrand(raw);
  const category = inferCategory(raw);
  const priceText = String(raw.price ?? '').replace(/,/g, '');
  const priceMatch = priceText.match(/\d+(?:\.\d{1,2})?/);
  const price = priceMatch ? Number(priceMatch[0]) : 0;
  const slugBase = slugify(name);
  const images = normalizeImages(raw.image_urls || raw.images, name);

  byKey.set(key, {
    id: `whm-${sku ? slugify(sku) : slugBase}`,
    name: name || 'Unnamed Product',
    slug: slugBase,
    sku: sku || `WHM-${slugBase}`,
    description: cleanText(raw.description),
    shortDescription: cleanText(raw.description).slice(0, 240),
    price,
    currency: 'USD',
    brand,
    brandSlug: slugify(brand),
    category,
    categorySlug: slugify(category),
    images,
    stock: 100,
    lowStockThreshold: 5,
    tags: [category, brand].filter(Boolean),
    specifications: [],
    rating: 0,
    reviewCount: 0,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    isOnSale: false,
    isActive: true,
    ageRestricted: true,
    seoTitle: `${name || 'Product'} | Fumare Hookah`,
    seoDescription: cleanText(raw.description).slice(0, 155),
    sourceUrl: productUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

const products = [...byKey.values()];
fs.mkdirSync(DB, { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(products, null, 2));

const categoriesMap = new Map();
const brandsMap = new Map();
for (const product of products) {
  if (!categoriesMap.has(product.categorySlug)) categoriesMap.set(product.categorySlug, {
    id: `cat-${product.categorySlug}`,
    name: product.category,
    slug: product.categorySlug,
    description: `${product.category} at Fumare Hookah`,
    subcategories: [],
    productCount: 0,
    isActive: true,
    sortOrder: categoriesMap.size,
    seoTitle: `${product.category} | Fumare Hookah`,
    seoDescription: `Shop ${product.category} at Fumare Hookah.`,
  });
  categoriesMap.get(product.categorySlug).productCount++;

  if (!brandsMap.has(product.brandSlug)) brandsMap.set(product.brandSlug, {
    id: `brand-${product.brandSlug}`,
    name: product.brand,
    slug: product.brandSlug,
    logoUrl: '',
    bannerUrl: '',
    productCount: 0,
    isActive: true,
    seoTitle: `${product.brand} | Fumare Hookah`,
    seoDescription: `Shop ${product.brand} products at Fumare Hookah.`,
  });
  brandsMap.get(product.brandSlug).productCount++;
}

fs.writeFileSync(CATEGORIES_OUT, JSON.stringify([...categoriesMap.values()], null, 2));
fs.writeFileSync(BRANDS_OUT, JSON.stringify([...brandsMap.values()], null, 2));
console.log(`[catalog] Imported ${products.length} unique products, ${categoriesMap.size} categories, ${brandsMap.size} brands.`);
