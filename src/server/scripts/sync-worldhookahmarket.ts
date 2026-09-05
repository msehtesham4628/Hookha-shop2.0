import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://worldhookahmarket.com';
const OUT = path.resolve(process.cwd(), 'src/server/db');
const CONCURRENCY = 6;
const MAX_RETRIES = 3;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const slugify = (value: string) => value.toLowerCase().trim().replace(/&amp;/g, '&').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const htmlDecode = (value: string) => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const stripHtml = (value: string) => htmlDecode(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());

async function get(url: string): Promise<string> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'HookhaShopCatalogSync/1.0 (+catalog sync)' } });
      if (res.ok) return await res.text();
      if (res.status === 404) return '';
    } catch {}
    await sleep(500 * (attempt + 1));
  }
  return '';
}

function absolute(url: string) {
  if (!url) return '';
  try { return new URL(url, BASE).href; } catch { return ''; }
}

function urlsFromSitemap(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map(m => htmlDecode(m[1])).filter(Boolean);
}

function links(html: string): string[] {
  return [...html.matchAll(/href=["']([^"']+)["']/gi)].map(m => absolute(m[1])).filter(u => u.startsWith(BASE));
}

function meta(html: string, key: string) {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]+content=["']([^"']*)["']`, 'i');
  return htmlDecode(re.exec(html)?.[1] || '');
}

function title(html: string) { return stripHtml(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] || ''); }

function images(html: string): string[] {
  const found = new Set<string>();
  for (const m of html.matchAll(/(?:src|data-src|data-large_image|content)=["']([^"']+)["']/gi)) {
    const u = absolute(m[1]);
    if (/wp-content\/uploads\//i.test(u) && /\.(?:jpe?g|png|webp|avif)(?:\?|$)/i.test(u)) found.add(u.replace(/-\d+x\d+(?=\.[a-z]+(?:\?|$))/i, ''));
  }
  return [...found];
}

function price(html: string) {
  const values = [...html.matchAll(/(?:data-price=["']|class=["'][^"']*(?:price|amount)[^"']*["'][^>]*>)[^$€£\d]*([$€£]?\s*[\d,]+(?:\.\d{1,2})?)/gi)]
    .map(m => Number((m[1].match(/[\d,]+(?:\.\d{1,2})?/)?.[0] || '').replace(/,/g, ''))).filter(Number.isFinite);
  return values[0] || 0;
}

function productJson(html: string): any[] {
  const out: any[] = [];
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const json = JSON.parse(m[1].trim());
      const list = Array.isArray(json) ? json : [json];
      for (const item of list) {
        if (item && (item['@type'] === 'Product' || item.name) && item.name) out.push(item);
      }
    } catch {}
  }
  return out;
}

function isProductUrl(url: string) { return /\/product\/[^/?#]+\/?$/i.test(url); }
function isCategoryUrl(url: string) { return /\/product-category\//i.test(url); }

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const sitemap = await get(`${BASE}/sitemap_index.xml`);
  let urls = urlsFromSitemap(sitemap);
  if (!urls.length) urls = urlsFromSitemap(await get(`${BASE}/sitemap.xml`));

  const childSitemaps = urls.filter(u => /sitemap/i.test(u) && !/product-sitemap/i.test(u));
  for (const sm of childSitemaps.slice(0, 30)) urls.push(...urlsFromSitemap(await get(sm)));

  const productUrls = [...new Set(urls.filter(isProductUrl))];
  const categoryUrls = [...new Set(urls.filter(isCategoryUrl))];

  // Sitemap can omit products. Discover product links from category/home pages too.
  const discoveryPages = [...new Set([BASE, ...categoryUrls.slice(0, 250)])];
  for (const page of discoveryPages) {
    const html = await get(page);
    for (const u of links(html)) if (isProductUrl(u)) productUrls.push(u);
  }

  const uniqueProducts = [...new Set(productUrls)];
  const products: any[] = [];
  let cursor = 0;
  async function worker() {
    while (cursor < uniqueProducts.length) {
      const i = cursor++;
      const url = uniqueProducts[i];
      const html = await get(url);
      if (!html) continue;
      const ld = productJson(html).find(x => x['@type'] === 'Product') || productJson(html)[0] || {};
      const name = stripHtml(ld.name || meta(html, 'og:title') || title(html)).replace(/\s*[-|].*$/, '').trim();
      if (!name) continue;
      const brandValue = typeof ld.brand === 'object' ? ld.brand?.name : ld.brand;
      const imageList = Array.isArray(ld.image) ? ld.image : (ld.image ? [ld.image] : images(html));
      const cleanImages = [...new Set(imageList.map((x: any) => absolute(typeof x === 'string' ? x : x?.url || '')).filter(Boolean))];
      const offers = Array.isArray(ld.offers) ? ld.offers[0] : ld.offers;
      const rawPrice = Number(offers?.price ?? 0) || price(html);
      const availability = String(offers?.availability || '').toLowerCase();
      const canonical = absolute((/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i.exec(html)?.[1] || url));
      const parts = canonical.replace(BASE, '').split('/').filter(Boolean);
      const categoryIndex = parts.indexOf('product-category');
      const categorySlug = categoryIndex >= 0 ? parts[categoryIndex + 1] : 'uncategorized';
      const brand = String(brandValue || '').trim();
      const now = new Date().toISOString();
      products.push({
        id: `whm-${slugify(name)}-${Math.abs(hash(url))}`,
        name,
        slug: parts[parts.indexOf('product') + 1] || slugify(name),
        sku: String(ld.sku || `WHM-${Math.abs(hash(url))}`),
        description: stripHtml(ld.description || meta(html, 'description') || name),
        shortDescription: stripHtml(ld.description || name).slice(0, 240),
        price: rawPrice,
        currency: String(offers?.priceCurrency || 'USD'),
        brand: brand || 'World Hookah Market',
        brandSlug: slugify(brand || 'world-hookah-market'),
        category: categorySlug === 'uncategorized' ? 'Uncategorized' : categorySlug.replace(/-/g, ' '),
        categorySlug,
        images: cleanImages.map((img, index) => ({ id: `img-${index}-${Math.abs(hash(img))}`, url: img, thumbnailUrl: img, alt: name, isPrimary: index === 0, sortOrder: index + 1 })),
        stock: /outofstock|out of stock/i.test(availability) ? 0 : 999,
        lowStockThreshold: 5,
        tags: [],
        specifications: [],
        rating: Number(ld.aggregateRating?.ratingValue || 0) || 0,
        reviewCount: Number(ld.aggregateRating?.reviewCount || 0) || 0,
        isFeatured: false,
        isNewArrival: false,
        isBestSeller: false,
        isOnSale: Boolean(offers?.priceSpecification || /sale/i.test(html)),
        isActive: true,
        ageRestricted: true,
        seoTitle: meta(html, 'og:title') || name,
        seoDescription: meta(html, 'description') || stripHtml(ld.description || name).slice(0, 155),
        sourceUrl: canonical,
        createdAt: now,
        updatedAt: now
      });
      if ((i + 1) % 25 === 0) console.log(`[WHM] ${i + 1}/${uniqueProducts.length}`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  const dedup = new Map<string, any>();
  for (const p of products) dedup.set(p.sourceUrl || p.id, p);
  const finalProducts = [...dedup.values()];

  const categoryMap = new Map<string, any>();
  for (const p of finalProducts) {
    if (!categoryMap.has(p.categorySlug)) categoryMap.set(p.categorySlug, { id: `cat-${p.categorySlug}`, name: p.category, slug: p.categorySlug, description: '', imageUrl: p.images[0]?.url, bannerUrl: p.images[0]?.url, subcategories: [], productCount: 0, isActive: true, sortOrder: categoryMap.size + 1 });
    categoryMap.get(p.categorySlug).productCount++;
  }

  const brandMap = new Map<string, any>();
  for (const p of finalProducts) {
    const key = p.brandSlug;
    if (!brandMap.has(key)) brandMap.set(key, { id: `brand-${key}`, name: p.brand, slug: key, description: `Products by ${p.brand}.`, logoUrl: p.images[0]?.url, bannerUrl: p.images[0]?.url, productCount: 0, isActive: true });
    brandMap.get(key).productCount++;
  }

  await fs.writeFile(path.join(OUT, 'scrapedProducts.json'), JSON.stringify(finalProducts, null, 2));
  await fs.writeFile(path.join(OUT, 'scrapedCategories.json'), JSON.stringify([...categoryMap.values()], null, 2));
  await fs.writeFile(path.join(OUT, 'scrapedBrands.json'), JSON.stringify([...brandMap.values()], null, 2));
  await fs.writeFile(path.join(OUT, 'worldhookahmarket-sync.json'), JSON.stringify({ source: BASE, syncedAt: new Date().toISOString(), products: finalProducts.length, categories: categoryMap.size, brands: brandMap.size }, null, 2));
  console.log(`[WHM] Sync complete: ${finalProducts.length} products, ${categoryMap.size} categories, ${brandMap.size} brands.`);
}

function hash(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return h >>> 0;
}

main().catch(error => { console.error(error); process.exit(1); });
