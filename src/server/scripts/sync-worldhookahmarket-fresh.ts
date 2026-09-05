import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://worldhookahmarket.com';
const OUT = path.resolve(process.cwd(), 'src/server/db');
const CONCURRENCY = 8;
const MAX_RETRIES = 4;
const MAX_SITEMAPS = 100;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const htmlDecode = (value: string) => value
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#8211;/g, '–');
const stripHtml = (value: string) => htmlDecode(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
const slugify = (value: string) => stripHtml(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function get(url: string): Promise<string> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': 'FumareHookah-WHM-Catalog-Sync/2.0',
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      if (response.ok) return await response.text();
      if (response.status === 404) return '';
    } catch {}
    await sleep(700 * (attempt + 1));
  }
  return '';
}

function absolute(value: string) {
  if (!value) return '';
  try { return new URL(value, BASE).href; } catch { return ''; }
}

function locs(xml: string) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) => htmlDecode(match[1])).filter(Boolean);
}

function hrefs(html: string) {
  return [...html.matchAll(/href=["']([^"']+)["']/gi)]
    .map((match) => absolute(match[1]))
    .filter((url) => url.startsWith(BASE));
}

function meta(html: string, key: string) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["']`, 'i')
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(html);
    if (match) return htmlDecode(match[1]);
  }
  return '';
}

function canonical(html: string, fallback: string) {
  const match = /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i.exec(html)
    || /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i.exec(html);
  return absolute(match?.[1] || fallback);
}

function jsonLd(html: string): any[] {
  const output: any[] = [];
  for (const match of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(match[1].trim());
      const values = Array.isArray(parsed) ? parsed : [parsed];
      for (const value of values) {
        if (value?.['@graph']) output.push(...(Array.isArray(value['@graph']) ? value['@graph'] : [value['@graph']]));
        else output.push(value);
      }
    } catch {}
  }
  return output;
}

function productJson(html: string) {
  return jsonLd(html).find((value) => {
    const type = value?.['@type'];
    return type === 'Product' || (Array.isArray(type) && type.includes('Product'));
  }) || {};
}

function allImages(html: string, ld: any, productName: string) {
  const found = new Set<string>();
  const add = (value: any) => {
    const url = absolute(typeof value === 'string' ? value : value?.url || value?.contentUrl || '');
    if (/wp-content\/uploads\//i.test(url) && /\.(?:jpe?g|png|webp|avif)(?:\?.*)?$/i.test(url)) {
      found.add(url.replace(/-\d+x\d+(?=\.[a-z]+(?:\?.*)?$)/i, ''));
    }
  };
  const ldImages = Array.isArray(ld?.image) ? ld.image : ld?.image ? [ld.image] : [];
  ldImages.forEach(add);
  for (const key of ['og:image', 'twitter:image']) add(meta(html, key));
  for (const match of html.matchAll(/(?:src|data-src|data-large_image|data-image|content)=["']([^"']+)["']/gi)) add(match[1]);
  return [...found].map((url, index) => ({
    id: `img-${hash(url)}-${index}`,
    url,
    thumbnailUrl: url,
    alt: productName,
    isPrimary: index === 0,
    sortOrder: index + 1
  }));
}

function numberValue(value: any) {
  const match = String(value ?? '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function firstPrice(html: string, ld: any) {
  const offers = Array.isArray(ld?.offers) ? ld.offers[0] : ld?.offers;
  const direct = numberValue(offers?.price);
  if (direct) return direct;
  const matches = [...html.matchAll(/(?:class=["'][^"']*(?:price|amount)[^"']*["'][^>]*>|data-price=["'])([^<"']+)/gi)]
    .map((match) => numberValue(match[1])).filter((value) => value > 0);
  return matches[0] || 0;
}

function breadcrumbs(html: string) {
  const values: string[] = [];
  for (const match of html.matchAll(/(?:breadcrumb|woocommerce-breadcrumb)[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/gi)) {
    const value = stripHtml(match[1]);
    if (value) values.push(value);
  }
  return [...new Set(values)];
}

function categoryFromUrl(url: string) {
  const parts = url.replace(BASE, '').split('/').filter(Boolean);
  const index = parts.indexOf('product-category');
  const path = index >= 0 ? parts.slice(index + 1).map(slugify).filter(Boolean) : [];
  const first = path[0] || '';
  const second = path[1] || '';
  if (first === 'hookah' && /^(e-hookah|e-hookah-heads|electronic)/.test(second)) return { slug: 'e-hookah', name: 'E-Hookah', path };
  if (/^(vape|vapes|vape-pod|vape-pods)$/.test(first)) return { slug: 'vapes', name: 'Vapes', path };
  if (/^(tobacco|shisha-tobacco)$/.test(first)) return { slug: 'tobacco', name: 'Tobacco', path };
  if (/^hookah$/.test(first)) return { slug: 'hookahs', name: 'Hookahs', path };
  if (/^bowl?s?$/.test(first)) return { slug: 'bowls', name: 'Bowls', path };
  if (/^base?s?$/.test(first)) return { slug: 'bases', name: 'Bases', path };
  if (/^(coal|charcoal)$/.test(first)) return { slug: 'coal', name: 'Coal', path };
  if (/^accessor(y|ies)$/.test(first)) return { slug: 'accessories', name: 'Accessories', path };
  return { slug: slugify(first) || 'uncategorized', name: first ? first.replace(/-/g, ' ') : 'Uncategorized', path };
}

function classifyProduct(url: string, html: string) {
  const categoryUrls = hrefs(html).filter((value) => /\/product-category\//i.test(value));
  const candidates = [url, ...categoryUrls];
  for (const candidate of candidates) {
    const info = categoryFromUrl(candidate);
    if (info.slug !== 'uncategorized') return info;
  }
  const crumbs = breadcrumbs(html).map(slugify);
  if (crumbs.includes('e-hookah')) return { slug: 'e-hookah', name: 'E-Hookah', path: crumbs };
  if (crumbs.includes('vape') || crumbs.includes('vapes')) return { slug: 'vapes', name: 'Vapes', path: crumbs };
  return categoryFromUrl(url);
}

function cleanBrand(value: any) {
  const name = stripHtml(typeof value === 'object' ? value?.name || '' : String(value || ''));
  if (!name || /world\s*hookah\s*market/i.test(name)) return '';
  return name;
}

function brandFromPage(html: string, ld: any, category: any) {
  const direct = cleanBrand(ld?.brand);
  if (direct) return direct;
  const metaBrand = cleanBrand(meta(html, 'product:brand'));
  if (metaBrand) return metaBrand;
  const selectors = [
    /itemprop=["']brand["'][^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i,
    /class=["'][^"']*(?:brand|product-brand)[^"']*["'][^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i
  ];
  for (const selector of selectors) {
    const match = selector.exec(html);
    const value = cleanBrand(match?.[1]);
    if (value) return value;
  }
  const path = category.path || [];
  const likelyBrand = path.length > 1 ? path[path.length - 1] : '';
  if (likelyBrand && !['tobacco', 'hookah', 'bowls', 'bases', 'coal', 'accessories', 'vape', 'vapes', 'e-hookah'].includes(likelyBrand)) {
    return likelyBrand.replace(/-/g, ' ').replace(/\b\w/g, (letter: string) => letter.toUpperCase());
  }
  return '';
}

async function discoverSitemaps() {
  const candidates = [
    `${BASE}/wp-sitemap.xml`,
    `${BASE}/sitemap_index.xml`,
    `${BASE}/sitemap.xml`,
    `${BASE}/product-sitemap.xml`,
    `${BASE}/product-sitemap1.xml`,
    `${BASE}/product-category-sitemap.xml`
  ];
  const queue = [...candidates];
  const seen = new Set<string>();
  const urls: string[] = [];
  while (queue.length && seen.size < MAX_SITEMAPS) {
    const sitemap = queue.shift()!;
    if (seen.has(sitemap)) continue;
    seen.add(sitemap);
    const xml = await get(sitemap);
    if (!xml || !/<(?:urlset|sitemapindex)\b/i.test(xml)) continue;
    for (const loc of locs(xml)) {
      if (/\.xml(?:\?|$)/i.test(loc)) queue.push(loc);
      else urls.push(loc);
    }
  }
  return [...new Set(urls)];
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const sitemapUrls = await discoverSitemaps();
  const productUrls = new Set<string>();
  const categoryUrls = new Set<string>();
  for (const url of sitemapUrls) {
    if (/\/product\/[^/?#]+\/?$/i.test(url)) productUrls.add(url);
    if (/\/product-category\//i.test(url)) categoryUrls.add(url);
  }

  // Also discover products from every category page, including nested categories.
  const discovery = [BASE, ...categoryUrls];
  let cursor = 0;
  async function discoverWorker() {
    while (cursor < discovery.length) {
      const page = discovery[cursor++];
      const html = await get(page);
      if (!html) continue;
      for (const link of hrefs(html)) {
        if (/\/product\/[^/?#]+\/?$/i.test(link)) productUrls.add(link);
        if (/\/product-category\//i.test(link)) categoryUrls.add(link);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => discoverWorker()));

  const urls = [...productUrls];
  const products: any[] = [];
  cursor = 0;
  async function productWorker() {
    while (cursor < urls.length) {
      const url = urls[cursor++];
      const html = await get(url);
      if (!html) continue;
      const ld = productJson(html);
      const canonicalUrl = canonical(html, url);
      const name = stripHtml(ld.name || meta(html, 'og:title') || meta(html, 'twitter:title'))
        .replace(/\s+(?:\||–|-)\s+World Hookah Market.*$/i, '').trim();
      if (!name) continue;
      const category = classifyProduct(canonicalUrl, html);
      const brand = brandFromPage(html, ld, category) || 'Fumare Hookah';
      const images = allImages(html, ld, name);
      const offers = Array.isArray(ld.offers) ? ld.offers[0] : ld.offers;
      const availability = String(offers?.availability || '').toLowerCase();
      const description = stripHtml(ld.description || meta(html, 'description') || name);
      const now = new Date().toISOString();
      products.push({
        id: `whm-${hash(canonicalUrl)}`,
        name,
        slug: canonicalUrl.match(/\/product\/([^/?#]+)/i)?.[1] || slugify(name),
        sku: String(ld.sku || ld.mpn || `WHM-${hash(canonicalUrl)}`),
        description,
        shortDescription: description.slice(0, 240),
        price: firstPrice(html, ld),
        currency: String(offers?.priceCurrency || 'USD'),
        brand,
        brandSlug: slugify(brand),
        category: category.name,
        categorySlug: category.slug,
        categoryPath: category.path,
        images,
        stock: /outofstock|out of stock/i.test(availability) ? 0 : 999,
        lowStockThreshold: 5,
        tags: [],
        specifications: [],
        rating: numberValue(ld.aggregateRating?.ratingValue),
        reviewCount: numberValue(ld.aggregateRating?.reviewCount),
        isFeatured: false,
        isNewArrival: false,
        isBestSeller: false,
        isOnSale: Boolean(offers?.priceSpecification) || /onsale|sale-price/i.test(html),
        isActive: true,
        ageRestricted: true,
        seoTitle: meta(html, 'og:title') || name,
        seoDescription: meta(html, 'description') || description.slice(0, 155),
        sourceUrl: canonicalUrl,
        createdAt: now,
        updatedAt: now
      });
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => productWorker()));

  const deduped = [...new Map(products.map((product) => [product.sourceUrl, product])).values()];
  if (!deduped.length) throw new Error('WHM sync found 0 products. Refusing to overwrite the existing catalog.');

  const categories = new Map<string, any>();
  for (const product of deduped) {
    const key = product.categorySlug;
    if (!categories.has(key)) categories.set(key, {
      id: `cat-${key}`,
      name: product.category,
      slug: key,
      description: '',
      imageUrl: product.images[0]?.url || '',
      bannerUrl: product.images[0]?.url || '',
      subcategories: [],
      productCount: 0,
      isActive: true,
      sortOrder: categories.size + 1
    });
    categories.get(key).productCount++;
  }

  const brands = new Map<string, any>();
  for (const product of deduped) {
    const key = product.brandSlug;
    if (!brands.has(key)) brands.set(key, {
      id: `brand-${key}`,
      name: product.brand,
      slug: key,
      description: `Products by ${product.brand}.`,
      logoUrl: product.images[0]?.url || '',
      bannerUrl: product.images[0]?.url || '',
      productCount: 0,
      isActive: true
    });
    const brand = brands.get(key);
    brand.productCount++;
    if (!brand.logoUrl && product.images[0]?.url) brand.logoUrl = product.images[0].url;
  }

  // Replace the catalog from zero: these files are the only catalog source used by the build.
  await fs.writeFile(path.join(OUT, 'scrapedProducts.json'), JSON.stringify(deduped, null, 2));
  await fs.writeFile(path.join(OUT, 'scrapedCategories.json'), JSON.stringify([...categories.values()], null, 2));
  await fs.writeFile(path.join(OUT, 'scrapedBrands.json'), JSON.stringify([...brands.values()], null, 2));
  await fs.writeFile(path.join(OUT, 'worldhookahmarket-sync.json'), JSON.stringify({
    source: BASE,
    mode: 'full-rebuild',
    syncedAt: new Date().toISOString(),
    products: deduped.length,
    categories: categories.size,
    brands: brands.size,
    productUrlsDiscovered: urls.length,
    categoryUrlsDiscovered: categoryUrls.size
  }, null, 2));

  console.log(`[WHM] FULL REBUILD complete: ${deduped.length} products, ${categories.size} categories, ${brands.size} brands.`);
}

function hash(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return h >>> 0;
}

main().catch((error) => { console.error('[WHM] FULL REBUILD FAILED:', error); process.exit(1); });
