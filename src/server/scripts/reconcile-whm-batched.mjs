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
    const r = await fetch(url, { signal: c.signal, headers: { 'user-agent': 'FumareHookahCatalogSync/1.0' } });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return await r.text();
  } finally { clearTimeout(t); }
}
function xmlLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map(m => m[1].trim());
}
function clean(s='') { return s.replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&#8217;|&#x2019;/g,"'").replace(/\s+/g,' ').trim(); }
function slug(s='') { return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
function abs(u) { try { return new URL(u, BASE).href; } catch { return ''; } }
function jsonLd(html) {
  const out=[];
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { out.push(JSON.parse(m[1].trim())); } catch {}
  }
  return out.flatMap(x => Array.isArray(x) ? x : [x]);
}
function meta(html, name, attr='property') {
  const re = new RegExp(`<meta[^>]+${attr}=["']${name.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i');
  return clean(html.match(re)?.[1] || '');
}
function parseProduct(url, html) {
  const data = jsonLd(html).find(x => x && (x['@type']==='Product' || (Array.isArray(x['@type']) && x['@type'].includes('Product')))) || {};
  const offers = Array.isArray(data.offers) ? data.offers[0] : (data.offers || {});
  const imageList = Array.isArray(data.image) ? data.image : (data.image ? [data.image] : []);
  const og = meta(html,'og:image');
  if (og) imageList.push(og);
  const images = [...new Set(imageList.map(abs).filter(Boolean))].map((u,i)=>({id:`img-${i+1}`,url:u,thumbnailUrl:u,isPrimary:i===0,sortOrder:i+1,alt:String(data.name||'Fumare Hookah product')}));
  const pathParts = new URL(url).pathname.split('/').filter(Boolean);
  const catIdx = pathParts.indexOf('product-category');
  const categoryPath = catIdx >= 0 ? pathParts.slice(catIdx+1) : [];
  let categorySlug = categoryPath.at(-1) || 'uncategorized';
  if (categoryPath.includes('e-hookah')) categorySlug='e-hookah';
  if (categoryPath.includes('vape') || categoryPath.includes('vapes')) categorySlug='vapes';
  const name = clean(data.name || meta(html,'og:title','property') || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '');
  const brandObj = data.brand;
  const brand = clean(typeof brandObj === 'string' ? brandObj : brandObj?.name || 'Fumare Hookah');
  const price = Number(offers.price || 0) || 0;
  const sku = clean(data.sku || '');
  const description = clean(data.description || meta(html,'description','name') || '');
  const id = `whm-${slug(name)}-${sku ? slug(sku) : slug(url).slice(-30)}`;
  return { id, name, slug: slug(name), sku, price, salePrice: price, description, shortDescription: description.slice(0,300), brand, brandSlug: slug(brand), category: categorySlug, categorySlug, productUrl:url, images, inStock: !/out of stock|sold out/i.test(html), isActive:true, source:'worldhookahmarket' };
}

async function main() {
  fs.mkdirSync(OUT,{recursive:true});
  console.log('[WHM] Starting bounded-memory catalog reconciliation...');
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
  fs.writeFileSync(STATE_OUT,JSON.stringify({source:BASE,status:'validated',syncedAt:new Date().toISOString(),products:products.length,brands:brands.size,categories:categories.size,failed},null,2));
  console.log(`[WHM] VALIDATED: ${products.length} products, ${brands.size} brands, ${categories.size} categories.`);
}
main().catch(e=>{console.error('[WHM] FAILED:',e);process.exit(1);});
