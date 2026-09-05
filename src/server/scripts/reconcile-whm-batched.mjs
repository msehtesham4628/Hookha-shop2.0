import fs from 'node:fs';
import path from 'node:path';

const BASE = 'https://worldhookahmarket.com';
const OUT = path.join(process.cwd(), 'src/server/db');
const PRODUCTS_OUT = path.join(OUT, 'scrapedProducts.json');
const CATEGORIES_OUT = path.join(OUT, 'scrapedCategories.json');
const BRANDS_OUT = path.join(OUT, 'scrapedBrands.json');
const STATE_OUT = path.join(OUT, 'worldhookahmarket-sync.json');
const BATCH = 50;
const TIMEOUT = 20000;

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function get(url) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), TIMEOUT);
  try {
    const r = await fetch(url, { signal: c.signal, headers: { 'user-agent': 'FumareHookahCatalogSync/2.0' } });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return await r.text();
  } finally { clearTimeout(t); }
}
function xmlLocs(xml) { return [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map(m => m[1].trim()); }
function clean(s='') { return s.replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&#8217;|&#x2019;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim(); }
function slug(s='') { return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
function abs(u) { try { return new URL(u, BASE).href; } catch { return ''; } }
function jsonLd(html) {
  const out=[];
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed=JSON.parse(m[1].trim());
      out.push(...(Array.isArray(parsed) ? parsed : [parsed]));
    } catch {}
  }
  return out.flatMap(x => x?.['@graph'] ? (Array.isArray(x['@graph']) ? x['@graph'] : [x['@graph']]) : [x]);
}
function meta(html, name, attr='property') {
  const re = new RegExp(`<meta[^>]+${attr}=["']${name.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i');
  return clean(html.match(re)?.[1] || '');
}

function imageCandidates(html) {
  const found = [];
  const add = (value, score, reason) => {
    const u = abs(value);
    if (!u || !/\/wp-content\/uploads\//i.test(u)) return;
    if (!/\.(?:jpe?g|png|webp|avif)(?:\?.*)?$/i.test(u)) return;
    if (/logo|icon|avatar|banner|payment|sprite|placeholder|woocommerce-placeholder/i.test(u)) return;
    const cleanUrl = u.replace(/-\d+x\d+(?=\.[a-z]+(?:\?.*)?$)/i, '');
    found.push({ url: cleanUrl, score, reason });
  };

  // WooCommerce's actual product gallery is the highest-confidence source.
  const galleryBlocks = [
    ...html.matchAll(/<[^>]*class=["'][^"']*woocommerce-product-gallery__image[^"']*["'][^>]*>[\s\S]*?<\/[^>]+>/gi),
    ...html.matchAll(/<[^>]*class=["'][^"']*woocommerce-product-gallery[^"']*["'][^>]*>[\s\S]*?<\/[^>]+>/gi),
    ...html.matchAll(/<[^>]*class=["'][^"']*product-gallery[^"']*["'][^>]*>[\s\S]*?<\/[^>]+>/gi)
  ];
  for (const block of galleryBlocks) {
    const text = block[0];
    for (const m of text.matchAll(/(?:data-large_image|data-full|href|data-src|src)=["']([^"']+)["']/gi)) add(m[1], 100, 'woocommerce-gallery');
    for (const m of text.matchAll(/srcset=["']([^"']+)["']/gi)) {
      const urls = m[1].split(',').map(x => x.trim().split(/\s+/)[0]);
      urls.forEach(u => add(u, 95, 'woocommerce-gallery-srcset'));
    }
  }

  // Common WooCommerce image wrappers when the gallery class is on a parent.
  for (const m of html.matchAll(/(?:data-large_image|data-large-image)=["']([^"']+)["']/gi)) add(m[1], 90, 'large-image');
  for (const m of html.matchAll(/class=["'][^"']*(?:wp-post-image|attachment-woocommerce_single|product-image)[^"']*["'][^>]*[\s\S]{0,500}?(?:src|data-src)=["']([^"']+)["']/gi)) add(m[1], 85, 'product-image');

  return found;
}

function productImages(html, data, productName, productSlug) {
  const found = imageCandidates(html);
  const ldImages = Array.isArray(data.image) ? data.image : (data.image ? [data.image] : []);
  const addLd = value => {
    const u = typeof value === 'string' ? value : value?.url || value?.contentUrl || '';
    if (u) {
      const score = 70 + (slug(u).includes(productSlug) ? 20 : 0);
      found.push({ url: abs(u), score, reason: 'json-ld' });
    }
  };
  ldImages.forEach(addLd);

  // OG image is only a low-priority fallback; it must never beat a product-gallery image.
  const og = meta(html,'og:image');
  if (og) found.push({ url: abs(og), score: 40, reason: 'og-image' });

  const nameTokens = slug(productName).split('-').filter(x => x.length >= 3);
  const unique = new Map();
  for (const item of found) {
    if (!item.url || !/^https:\/\//i.test(item.url)) continue;
    const u = item.url.toLowerCase();
    let score = item.score;
    for (const token of nameTokens) if (u.includes(token)) score += 4;
    if (/\.(?:jpe?g|png|webp|avif)(?:\?|$)/i.test(u)) score += 1;
    const existing = unique.get(item.url);
    if (!existing || score > existing.score) unique.set(item.url, { ...item, score });
  }

  const sorted = [...unique.values()].sort((a,b) => b.score - a.score);
  return sorted.slice(0, 12).map((item,i) => ({
    id:`img-${i+1}`,
    url:item.url,
    thumbnailUrl:item.url,
    isPrimary:i===0,
    sortOrder:i+1,
    alt:productName
  }));
}

function parseProduct(url, html) {
  const data = jsonLd(html).find(x => x && (x['@type']==='Product' || (Array.isArray(x['@type']) && x['@type'].includes('Product')))) || {};
  const offers = Array.isArray(data.offers) ? data.offers[0] : (data.offers || {});
  const name = clean(data.name || meta(html,'og:title','property') || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '');
  const productSlug = slug(name);
  const images = productImages(html, data, name, productSlug);
  const pathParts = new URL(url).pathname.split('/').filter(Boolean);
  const catIdx = pathParts.indexOf('product-category');
  const categoryPath = catIdx >= 0 ? pathParts.slice(catIdx+1) : [];
  let categorySlug = categoryPath.at(-1) || 'uncategorized';
  if (categoryPath.includes('e-hookah')) categorySlug='e-hookah';
  if (categoryPath.includes('vape') || categoryPath.includes('vapes')) categorySlug='vapes';
  const brandObj = data.brand;
  const brand = clean(typeof brandObj === 'string' ? brandObj : brandObj?.name || 'Fumare Hookah');
  const price = Number(offers.price || 0) || 0;
  const sku = clean(data.sku || '');
  const description = clean(data.description || meta(html,'description','name') || '');
  const id = `whm-${slug(name)}-${sku ? slug(sku) : slug(url).slice(-30)}`;
  return { id, name, slug: productSlug, sku, price, salePrice: price, description, shortDescription: description.slice(0,300), brand, brandSlug: slug(brand), category: categorySlug, categorySlug, productUrl:url, images, inStock: !/out of stock|sold out/i.test(html), isActive:true, source:'worldhookahmarket' };
}

async function main() {
  fs.mkdirSync(OUT,{recursive:true});
  console.log('[WHM] Starting bounded-memory catalog reconciliation with product-gallery image extraction...');
  const root = await get(`${BASE}/sitemap_index.xml`).catch(async()=>get(`${BASE}/sitemap.xml`));
  const maps = xmlLocs(root);
  const productMaps = maps.filter(u=>/product|post/i.test(u));
  const urls = new Set();
  for (const map of productMaps.length ? productMaps : maps) {
    try {
      const xml = await get(map);
      for (const u of xmlLocs(xml)) if (/\/product\//i.test(u)) urls.add(u.split('?')[0]);
    } catch(e) { console.warn('[WHM] sitemap skipped:', map, e.message); }
  }
  if (!urls.size) throw new Error('WHM product sitemap returned zero product URLs; existing catalog was not modified.');
  console.log(`[WHM] Discovered ${urls.size} product URLs.`);
  const products=[]; const brands=new Map(); const categories=new Map(); let done=0, failed=0;
  const list=[...urls];
  for (let i=0;i<list.length;i+=BATCH) {
    const batch=list.slice(i,i+BATCH);
    const rows=await Promise.all(batch.map(async url=>{try{return parseProduct(url,await get(url));}catch(e){failed++; return null;}}));
    for(const p of rows.filter(Boolean)) {
      if(!p.name) continue; products.push(p);
      categories.set(p.categorySlug,{id:`cat-${p.categorySlug}`,name:p.categorySlug.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),slug:p.categorySlug,productCount:(categories.get(p.categorySlug)?.productCount||0)+1,isActive:true});
      const key=p.brandSlug||'fumare-hookah';
      const old=brands.get(key)||{id:`brand-${key}`,name:p.brand||'Fumare Hookah',slug:key,logoUrl:'',productCount:0,isActive:true};
      old.productCount++; if(!old.logoUrl && p.images[0]?.url) old.logoUrl=p.images[0].url; brands.set(key,old);
    }
    done=Math.min(i+BATCH,list.length);
    if(done%250===0 || done===list.length) console.log(`[WHM] ${done}/${list.length} processed; products=${products.length}; failed=${failed}`);
    await sleep(50);
  }
  if(products.length < Math.max(100, Math.floor(urls.size*0.5))) throw new Error(`Validation failed: only ${products.length}/${urls.size} products parsed. Existing catalog was not modified.`);
  const tmp = p => `${p}.tmp`;
  fs.writeFileSync(tmp(PRODUCTS_OUT),JSON.stringify(products,null,2));
  fs.writeFileSync(tmp(CATEGORIES_OUT),JSON.stringify([...categories.values()],null,2));
  fs.writeFileSync(tmp(BRANDS_OUT),JSON.stringify([...brands.values()],null,2));
  fs.renameSync(tmp(PRODUCTS_OUT),PRODUCTS_OUT); fs.renameSync(tmp(CATEGORIES_OUT),CATEGORIES_OUT); fs.renameSync(tmp(BRANDS_OUT),BRANDS_OUT);
  fs.writeFileSync(STATE_OUT,JSON.stringify({source:BASE,status:'validated',syncedAt:new Date().toISOString(),products:products.length,brands:brands.size,categories:categories.size,failed,imageExtraction:'woocommerce-product-gallery-first'},null,2));
  console.log(`[WHM] VALIDATED: ${products.length} products, ${brands.size} brands, ${categories.size} categories.`);
}
main().catch(e=>{console.error('[WHM] FAILED:',e);process.exit(1);});
