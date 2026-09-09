import { Router } from 'express';
import { db } from '../db/store.js';
import { mongoService } from '../db/mongodb.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/rbac.middleware.js';
import { Product } from '../../types/index.js';

const router = Router();

router.use(authenticateToken);
router.use(requirePermission('products.import'));

const aliases: Record<string, string[]> = {
  sku: ['sku', 'product sku', 'item sku', 'code'],
  name: ['name', 'product name', 'title'],
  price: ['price', 'regular price', 'selling price', 'unit price'],
  salePrice: ['sale price', 'saleprice', 'discount price', 'offer price'],
  stock: ['stock', 'quantity', 'qty', 'inventory'],
  brand: ['brand', 'brand name'],
  category: ['category', 'category name'],
  subcategory: ['subcategory', 'sub category'],
  description: ['description', 'long description'],
  shortDescription: ['short description', 'shortdescription'],
  imageUrl: ['image url', 'imageurl', 'image', 'primary image', 'primary image url'],
  images: ['images', 'image urls'],
  flavor: ['flavor', 'flavour'],
  material: ['material'],
  color: ['color', 'colour'],
  weight: ['weight'],
  tags: ['tags', 'tag'],
  isActive: ['active', 'is active', 'isactive', 'status'],
  isFeatured: ['featured', 'is featured', 'isfeatured'],
  isBestSeller: ['best seller', 'bestseller', 'is bestseller', 'is best seller'],
  isNewArrival: ['new arrival', 'newarrival', 'is new arrival']
};

function normalizeHeader(value: unknown): string {
  return String(value ?? '').trim().toLowerCase().replace(/[_.-]+/g, ' ').replace(/\s+/g, ' ');
}

function readValue(row: Record<string, unknown>, field: string): unknown {
  const normalized = new Map<string, unknown>();
  for (const [key, value] of Object.entries(row)) normalized.set(normalizeHeader(key), value);
  for (const alias of aliases[field] || []) {
    const value = normalized.get(normalizeHeader(alias));
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  return undefined;
}

function toNumber(value: unknown, fallback?: number): number | undefined {
  if (value === undefined || value === null || String(value).trim() === '') return fallback;
  const parsed = Number(String(value).replace(/[$,]/g, '').trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value: unknown, fallback?: boolean): boolean | undefined {
  if (value === undefined || value === null || String(value).trim() === '') return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (['true', 'yes', 'y', '1', 'active', 'enabled'].includes(normalized)) return true;
  if (['false', 'no', 'n', '0', 'inactive', 'disabled'].includes(normalized)) return false;
  return fallback;
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function normalizeImages(row: Record<string, unknown>, name: string) {
  const rawImages = readValue(row, 'images');
  const primary = readValue(row, 'imageUrl');
  const urls: string[] = [];
  if (primary) urls.push(String(primary).trim());
  if (rawImages) urls.push(...String(rawImages).split(/[|,\n]+/).map(v => v.trim()).filter(Boolean));
  return [...new Set(urls)].map((url, index) => ({
    id: `img-${Date.now()}-${index}`,
    url,
    alt: name,
    isPrimary: index === 0,
    sortOrder: index + 1
  }));
}

function rowToProduct(row: Record<string, unknown>, existing?: Product): Product {
  const now = new Date().toISOString();
  const name = String(readValue(row, 'name') ?? existing?.name ?? '').trim();
  const sku = String(readValue(row, 'sku') ?? existing?.sku ?? '').trim().toUpperCase();
  const category = String(readValue(row, 'category') ?? existing?.category ?? 'Accessories').trim();
  const brand = String(readValue(row, 'brand') ?? existing?.brand ?? 'Imported Brand').trim();
  const price = toNumber(readValue(row, 'price'), existing?.price ?? 0) ?? 0;
  const salePrice = toNumber(readValue(row, 'salePrice'), existing?.salePrice);
  const stock = Math.max(0, Math.trunc(toNumber(readValue(row, 'stock'), existing?.stock ?? 0) ?? 0));
  const imageValues = normalizeImages(row, name);

  const product: Product = existing ? { ...existing } : {
    id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name, slug: `${slugify(name)}-${Math.floor(100 + Math.random() * 900)}`, sku,
    description: '', shortDescription: '', price, currency: 'USD', brand, brandSlug: slugify(brand),
    category, categorySlug: slugify(category), images: [], stock, lowStockThreshold: 5,
    tags: [], specifications: [], rating: 5, reviewCount: 0, isFeatured: false, isNewArrival: false,
    isBestSeller: false, isOnSale: false, isActive: true, ageRestricted: true,
    seoTitle: `${name} | Fumare Hookah`, seoDescription: '', createdAt: now, updatedAt: now
  };

  const description = readValue(row, 'description');
  const shortDescription = readValue(row, 'shortDescription');
  const subcategory = readValue(row, 'subcategory');
  const flavor = readValue(row, 'flavor');
  const material = readValue(row, 'material');
  const color = readValue(row, 'color');
  const weight = toNumber(readValue(row, 'weight'));
  const tags = readValue(row, 'tags');
  const active = toBoolean(readValue(row, 'isActive'));
  const featured = toBoolean(readValue(row, 'isFeatured'));
  const bestSeller = toBoolean(readValue(row, 'isBestSeller'));
  const newArrival = toBoolean(readValue(row, 'isNewArrival'));

  product.name = name; product.sku = sku; product.price = price; product.salePrice = salePrice;
  product.isOnSale = salePrice !== undefined && salePrice < price;
  product.brand = brand; product.brandSlug = slugify(brand); product.category = category; product.categorySlug = slugify(category);
  if (description !== undefined) product.description = String(description);
  if (shortDescription !== undefined) product.shortDescription = String(shortDescription);
  if (subcategory !== undefined) product.subcategory = String(subcategory);
  if (flavor !== undefined) product.flavor = String(flavor);
  if (material !== undefined) product.material = String(material);
  if (color !== undefined) product.color = String(color);
  if (weight !== undefined) product.weight = Math.trunc(weight);
  if (tags !== undefined) product.tags = String(tags).split(/[|,]+/).map(v => v.trim()).filter(Boolean);
  if (active !== undefined) product.isActive = active;
  if (featured !== undefined) product.isFeatured = featured;
  if (bestSeller !== undefined) product.isBestSeller = bestSeller;
  if (newArrival !== undefined) product.isNewArrival = newArrival;
  if (readValue(row, 'stock') !== undefined) product.stock = stock;
  if (imageValues.length > 0) product.images = imageValues;
  product.updatedAt = now;
  return product;
}

// POST /api/admin/products/excel-sync
// SKU is the stable product key. The workbook is authoritative: rows are upserted
// and products missing from the workbook are removed from MongoDB and memory.
router.post('/products/excel-sync', async (req: AuthenticatedRequest, res) => {
  const rows = req.body?.rows;
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ success: false, error: { code: 'EMPTY_EXCEL', message: 'No Excel rows were supplied.' } });
  }

  const normalizedRows = rows.filter(row => row && typeof row === 'object') as Record<string, unknown>[];
  const errors: string[] = [];
  const seenSkus = new Set<string>();
  for (let i = 0; i < normalizedRows.length; i++) {
    const sku = String(readValue(normalizedRows[i], 'sku') ?? '').trim().toUpperCase();
    const name = String(readValue(normalizedRows[i], 'name') ?? '').trim();
    const price = toNumber(readValue(normalizedRows[i], 'price'));
    if (!sku || !name || price === undefined) errors.push(`Row ${i + 2}: SKU, Name and Price are required.`);
    else if (seenSkus.has(sku)) errors.push(`Row ${i + 2}: duplicate SKU '${sku}'.`);
    seenSkus.add(sku);
  }
  if (errors.length > 0) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_EXCEL', message: errors.slice(0, 50).join(' ') }, errors });
  }

  const connected = await mongoService.connect();
  if (!connected) return res.status(503).json({ success: false, error: { code: 'MONGODB_UNAVAILABLE', message: 'MongoDB is not connected. Excel sync was not applied.' } });

  try {
    const existing = await mongoService.getDocuments<Product>('products');
    const bySku = new Map(existing.map(p => [String(p.sku).trim().toUpperCase(), p]));
    const imported = normalizedRows.map(row => rowToProduct(row, bySku.get(String(readValue(row, 'sku')).trim().toUpperCase())));

    await mongoService.saveManyDocuments('products', imported, 250);

    const importedSkus = new Set(imported.map(p => p.sku.toUpperCase()));
    const removed = existing.filter(p => !importedSkus.has(String(p.sku).trim().toUpperCase()));
    for (const product of removed) await mongoService.deleteDocument('products', { id: product.id });

    // Make the current Lambda memory exactly match the workbook immediately.
    db.products = imported;
    const importedIds = new Set(imported.map(p => p.id));
    db.persistenceData.deletedProductIds = db.persistenceData.deletedProductIds.filter(id => !importedIds.has(id));
    db.persistenceData.productOverrides = {};
    await mongoService.saveDocument('persistence', { id: 'store_persistence', ...db.persistenceData });
    await mongoService.refreshCounts();

    console.log(`[Excel Sync] ${imported.length} products applied; ${removed.length} removed.`);
    return res.json({
      success: true,
      message: `Excel catalog synchronized successfully. ${imported.length} products are now authoritative.`,
      data: {
        imported: imported.length,
        updated: imported.filter(p => bySku.has(p.sku.toUpperCase())).length,
        created: imported.filter(p => !bySku.has(p.sku.toUpperCase())).length,
        removed: removed.length,
        total: imported.length
      }
    });
  } catch (err: any) {
    console.error('[Excel Sync] Failed:', err);
    return res.status(500).json({ success: false, error: { code: 'EXCEL_SYNC_FAILED', message: err?.message || 'Excel synchronization failed.' } });
  }
});

export default router;
