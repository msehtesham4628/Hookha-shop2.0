import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DB = path.join(ROOT, 'src/server/db');
const BASE = 'https://raw.githubusercontent.com/msehtesham4628/Image_scraper/main/clean_catalog';
const PARTS = [1, 2, 3, 4, 5, 6].map(n => `${BASE}/products-${n}.json`);
const slug = v => String(v || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'uncategorized';
const text = v => String(v ?? '').replace(/\s+/g, ' ').trim();
const category = p => {
  const explicit = text(p.category);
  const s = `${p.product_name || ''} ${p.description || ''} ${p.product_url || ''}`.toLowerCase();
  if (/e-?hookah|electronic hookah|smart head|hookah pod/.test(s)) return 'E-Hookah';
  if (/vape|puff|nicotine|pod system|disposable/.test(s)) return 'Vapes';
  if (/charcoal|coconut coal|quick light|hookah coal|hookah charcoal/.test(s)) return 'Coal';
  if (/tobacco|shisha tobacco|hookah tobacco|molasses|dark leaf|blonde leaf|cigar leaf/.test(s)) return 'Tobacco';
  if (/\bbowls?\b|phunnel|killer bowl|hookah bowl|clay bowl/.test(s)) return 'Bowls';
  if (/\bbases?\b|glass vase|vase for hookah|crystal base|hookah base/.test(s)) return 'Bases';
  if (/\bhookahs?\b|shisha pipe|nargile|hookah stem|hookah set/.test(s)) return 'Hookahs';
  return explicit || 'Accessories';
};
const brand = p => {
  const explicit = text(p.brand); if (explicit) return explicit;
  const n = text(p.product_name); const known = ['Al Fakher','Alpha Hookah','Blackburn','Bonche','Element','Adalya','Tangiers','MustHave','DarkSide','Trifecta','Fumari','Starbuzz','Mason','Steamulation','Vyro','Moze','Kaloud','Werkbund','Oblako','Maklaud'];
  return known.find(b => n.toLowerCase().startsWith(b.toLowerCase())) || n.split(/\s+/)[0] || 'Fumare Hookah';
};
const images = (arr, name) => (Array.isArray(arr) ? arr : []).filter(u => /^https?:\/\//i.test(u) && !/placeholder|spinner|loading|gravatar|avatar/i.test(u)).slice(0,20).map((url,i) => ({id:`${slug(name)}-image-${i+1}`,url,thumbnailUrl:url,alt:`${name} product image ${i+1}`,isPrimary:i===0,sortOrder:i}));
const all=[];
for (const url of PARTS) { console.log('[catalog] Fetching',url); const r=await fetch(url); if(!r.ok) throw new Error(`HTTP ${r.status}: ${url}`); const d=await r.json(); if(!Array.isArray(d)) throw new Error(`Invalid JSON array: ${url}`); all.push(...d); }
const seen=new Set(), products=[];
for (const p of all) {
  const name=text(p.product_name||p.name), sourceUrl=text(p.product_url||p.url), key=sourceUrl.toLowerCase()||name.toLowerCase();
  if(!key||seen.has(key)) continue; seen.add(key);
  const b=brand(p), c=category(p), s=slug(name), imgs=images(p.image_urls||p.images,name);
  const priceMatch=String(p.price??'').replace(/,/g,'').match(/\d+(?:\.\d{1,2})?/), price=priceMatch?Number(priceMatch[0]):0;
  products.push({id:`whm-${s}`,name,slug:s,sku:text(p.sku),description:text(p.description),shortDescription:text(p.description).slice(0,240),price,currency:'USD',brand:b,brandSlug:slug(b),category:c,categorySlug:slug(c),images:imgs,stock:100,lowStockThreshold:5,tags:[c,b].filter(Boolean),specifications:[],rating:0,reviewCount:0,isFeatured:false,isNewArrival:false,isBestSeller:false,isOnSale:false,isActive:true,ageRestricted:true,seoTitle:`${name} | Fumare Hookah`,seoDescription:text(p.description).slice(0,155),sourceUrl,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
}
fs.mkdirSync(DB,{recursive:true});
fs.writeFileSync(path.join(DB,'scrapedProducts.json'),JSON.stringify(products,null,2));
const cats=new Map(), brands=new Map();
for(const p of products){if(!cats.has(p.categorySlug))cats.set(p.categorySlug,{id:`cat-${p.categorySlug}`,name:p.category,slug:p.categorySlug,description:`${p.category} at Fumare Hookah`,subcategories:[],productCount:0,isActive:true,sortOrder:cats.size});cats.get(p.categorySlug).productCount++;if(!brands.has(p.brandSlug))brands.set(p.brandSlug,{id:`brand-${p.brandSlug}`,name:p.brand,slug:p.brandSlug,logoUrl:'',bannerUrl:'',productCount:0,isActive:true});brands.get(p.brandSlug).productCount++;}
fs.writeFileSync(path.join(DB,'scrapedCategories.json'),JSON.stringify([...cats.values()],null,2));
fs.writeFileSync(path.join(DB,'scrapedBrands.json'),JSON.stringify([...brands.values()],null,2));
console.log(`[catalog] Imported ${products.length} products, ${cats.size} categories, ${brands.size} brands.`);
