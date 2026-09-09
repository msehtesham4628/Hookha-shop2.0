import { Router } from 'express';
import { db } from '../db/store.js';
import { mongoService } from '../db/mongodb.js';
import { Product } from '../../types/index.js';

const router = Router();

function csvParse(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some(v => v.trim() !== '')) rows.push(row);
      row = [];
    } else cell += ch;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  const headers = (rows.shift() || []).map(h => h.trim());
  return rows.map(values => Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ''])));
}

const aliases: Record<string, string[]> = {
  sku: ['sku', 'product sku', 'item sku', 'code'], name: ['name', 'product name', 'title'],
  price: ['price', 'regular price', 'selling price', 'unit price'], salePrice: ['sale price', 'saleprice', 'discount price', 'offer price'],
  stock: ['stock', 'quantity', 'qty', 'inventory'], brand: ['brand', 'brand name'], category: ['category', 'category name'],
  description: ['description', 'long description'], shortDescription: ['short description', 'shortdescription'],
  imageUrl: ['image url', 'imageurl', 'image', 'primary image', 'primary image url'], images: ['images', 'image urls'],
  flavor: ['flavor', 'flavour'], material: ['material'], color: ['color', 'colour'], weight: ['weight'], tags: ['tags', 'tag'],
  isActive: ['active', 'is active', 'isactive', 'status'], isFeatured: ['featured', 'is featured', 'isfeatured'],
  isBestSeller: ['best seller', 'bestseller', 'is bestseller', 'is best seller'], isNewArrival: ['new arrival', 'newarrival', 'is new arrival']
};
const norm = (v: unknown) => String(v ?? '').trim().toLowerCase().replace(/[_.-]+/g, ' ').replace(/\s+/g, ' ');
function value(row: Record<string, unknown>, field: string) {
  const map = new Map(Object.entries(row).map(([k, v]) => [norm(k), v]));
  for (const a of aliases[field] || []) { const v = map.get(norm(a)); if (v !== undefined && String(v).trim() !== '') return v; }
  return undefined;
}
function num(v: unknown, fallback?: number) { if (v === undefined || v === null || String(v).trim() === '') return fallback; const n = Number(String(v).replace(/[$,]/g, '').trim()); return Number.isFinite(n) ? n : fallback; }
function bool(v: unknown, fallback?: boolean) { if (v === undefined || v === null || String(v).trim() === '') return fallback; const s = String(v).trim().toLowerCase(); if (['true','yes','y','1','active','enabled'].includes(s)) return true; if (['false','no','n','0','inactive','disabled'].includes(s)) return false; return fallback; }
function slug(v: string) { return v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
function product(row: Record<string, unknown>, existing?: Product): Product {
  const now = new Date().toISOString(); const name = String(value(row,'name') ?? existing?.name ?? '').trim(); const sku = String(value(row,'sku') ?? existing?.sku ?? '').trim().toUpperCase();
  const brand = String(value(row,'brand') ?? existing?.brand ?? 'Imported Brand').trim(); const category = String(value(row,'category') ?? existing?.category ?? 'Accessories').trim();
  const price = num(value(row,'price'), existing?.price ?? 0) ?? 0; const sale = num(value(row,'salePrice'), existing?.salePrice); const stock = Math.max(0, Math.trunc(num(value(row,'stock'), existing?.stock ?? 0) ?? 0));
  const p: Product = existing ? { ...existing } : { id:`prod-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, name, slug:`${slug(name)}-${Math.floor(100+Math.random()*900)}`, sku, description:'', shortDescription:'', price, currency:'USD', brand, brandSlug:slug(brand), category, categorySlug:slug(category), images:[], stock, lowStockThreshold:5, tags:[], specifications:[], rating:5, reviewCount:0, isFeatured:false, isNewArrival:false, isBestSeller:false, isOnSale:false, isActive:true, ageRestricted:true, seoTitle:`${name} | Fumare Hookah`, seoDescription:'', createdAt:now, updatedAt:now };
  p.name=name; p.sku=sku; p.price=price; p.salePrice=sale; p.isOnSale=sale !== undefined && sale < price; p.brand=brand; p.brandSlug=slug(brand); p.category=category; p.categorySlug=slug(category); p.stock=stock;
  for (const [f, key] of [['description','description'],['shortDescription','shortDescription'],['flavor','flavor'],['material','material'],['color','color']] as const) { const v=value(row,key); if(v!==undefined) (p as any)[f]=String(v); }
  const tags=value(row,'tags'); if(tags!==undefined) p.tags=String(tags).split(/[|,]+/).map(v=>v.trim()).filter(Boolean);
  for (const [field,key] of [['isActive','isActive'],['isFeatured','isFeatured'],['isBestSeller','isBestSeller'],['isNewArrival','isNewArrival']] as const) { const v=bool(value(row,key)); if(v!==undefined) (p as any)[field]=v; }
  const rawImages=value(row,'images'); const primary=value(row,'imageUrl'); const urls=[...(primary?[String(primary).trim()]:[]), ...(rawImages?String(rawImages).split(/[|,\n]+/).map(v=>v.trim()).filter(Boolean):[])];
  if(urls.length) p.images=[...new Set(urls)].map((url,i)=>({id:`img-${Date.now()}-${i}`,url,alt:name,isPrimary:i===0,sortOrder:i+1}));
  p.updatedAt=now; return p;
}

async function sync(rows: Record<string, unknown>[]) {
  const existing = await mongoService.getDocuments<Product>('products');
  const bySku = new Map(existing.map(p => [String(p.sku).trim().toUpperCase(), p]));
  const imported = rows.map(r => product(r, bySku.get(String(value(r,'sku') ?? '').trim().toUpperCase())));
  await mongoService.saveManyDocuments('products', imported, 250);
  const keys = new Set(imported.map(p => p.sku.toUpperCase()));
  const removed = existing.filter(p => !keys.has(String(p.sku).trim().toUpperCase()));
  for (const p of removed) await mongoService.deleteDocument('products', { id:p.id });
  db.products=imported; db.persistenceData.productOverrides={};
  db.persistenceData.deletedProductIds=db.persistenceData.deletedProductIds.filter(id=>!new Set(imported.map(p=>p.id)).has(id));
  await mongoService.saveDocument('persistence',{id:'store_persistence',...db.persistenceData}); await mongoService.refreshCounts();
  return { imported:imported.length, updated:imported.filter(p=>bySku.has(p.sku.toUpperCase())).length, created:imported.filter(p=>!bySku.has(p.sku.toUpperCase())).length, removed:removed.length, total:imported.length };
}

// Called by Vercel Cron. The Google Sheet must be shared so its CSV export is readable.
router.get('/google-sheet-sync', async (req, res) => {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) return res.status(401).json({success:false,error:'Unauthorized'});
  const sheetId = process.env.GOOGLE_SHEET_ID || '1HA0qAPe8xB3wqhotJeju_vbKnK0Cahtu82PKAdAznqY';
  const gid = process.env.GOOGLE_SHEET_GID || '0';
  try {
    const url=`https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/export?format=csv&gid=${encodeURIComponent(gid)}`;
    const upstream=await fetch(url,{redirect:'follow'}); if(!upstream.ok) throw new Error(`Google Sheet returned HTTP ${upstream.status}`);
    const rows=csvParse(await upstream.text()); if(!rows.length) throw new Error('Google Sheet contains no product rows');
    for(const [i,r] of rows.entries()) { if(!String(value(r,'sku')??'').trim() || !String(value(r,'name')??'').trim() || num(value(r,'price'))===undefined) throw new Error(`Invalid row ${i+2}: SKU, Name and Price are required`); }
    const connected=await mongoService.connect(); if(!connected) return res.status(503).json({success:false,error:'MongoDB unavailable'});
    const data=await sync(rows); console.log(`[Google Sheet Sync] ${data.imported} products applied; ${data.removed} removed.`); return res.json({success:true,data});
  } catch(err:any) { console.error('[Google Sheet Sync]',err); return res.status(500).json({success:false,error:err?.message||'Google Sheet sync failed'}); }
});
export default router;
