import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

// Excel is the catalog source of truth. The old split JSON files remain in the
// repository as archived/import material, but Vercel must never read them.
const originalReadFileSync = fs.readFileSync.bind(fs);
const originalExistsSync = fs.existsSync.bind(fs);

const normalizeHeader = (value: unknown): string =>
  String(value ?? '').trim().toLowerCase().replace(/[_.-]+/g, ' ').replace(/\s+/g, ' ');

const aliases: Record<string, string[]> = {
  sku: ['sku', 'product sku', 'item sku', 'code'],
  name: ['name', 'product name', 'title', 'product_name'],
  price: ['price', 'regular price', 'selling price', 'unit price'],
  salePrice: ['sale price', 'saleprice', 'discount price', 'offer price'],
  stock: ['stock', 'quantity', 'qty', 'inventory'],
  brand: ['brand', 'brand name'],
  category: ['category', 'category name'],
  subcategory: ['subcategory', 'sub category'],
  description: ['description', 'long description'],
  shortDescription: ['short description', 'shortdescription'],
  imageUrl: ['image url', 'imageurl', 'image', 'primary image', 'primary image url'],
  images: ['images', 'image urls', 'image_urls'],
  sourceUrl: ['product url', 'product_url', 'url', 'source url'],
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

function readValue(row: Record<string, unknown>, field: string): unknown {
  const normalized = new Map<string, unknown>();
  for (const [key, value] of Object.entries(row)) normalized.set(normalizeHeader(key), value);
  for (const alias of aliases[field] || []) {
    const value = normalized.get(normalizeHeader(alias));
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  return undefined;
}

function toNumber(value: unknown, fallback = 0): number {
  if (value === undefined || value === null || String(value).trim() === '') return fallback;
  const parsed = Number(String(value).replace(/[$,₹]/g, '').trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value: unknown, fallback = true): boolean {
  if (value === undefined || value === null || String(value).trim() === '') return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (['true', 'yes', 'y', '1', 'active', 'enabled'].includes(normalized)) return true;
  if (['false', 'no', 'n', '0', 'inactive', 'disabled'].includes(normalized)) return false;
  return fallback;
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'product';
}

function parseImages(value: unknown, primary: unknown): string[] {
  const urls: string[] = [];
  if (primary) urls.push(String(primary).trim());
  if (Array.isArray(value)) {
    for (const item of value) urls.push(typeof item === 'string' ? item : String((item as any)?.url || '').trim());
  } else if (value) {
    const text = String(value).trim();
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        for (const item of parsed) urls.push(typeof item === 'string' ? item : String(item?.url || '').trim());
      } else {
        urls.push(...text.split(/[|,\n]+/).map(v => v.trim()));
      }
    } catch {
      urls.push(...text.split(/[|,\n]+/).map(v => v.trim()));
    }
  }
  return [...new Set(urls)].filter(url => /^https?:\/\//i.test(url) && !/placeholder|spinner|loading|gravatar|avatar/i.test(url));
}

function detectCategory(name: string, description: string, sourceUrl: string, supplied: string): string {
  const text = `${name} ${description} ${sourceUrl}`.toLowerCase();
  if (/e-?hookah|electronic hookah|smart head|hookah pod/.test(text)) return 'E-Hookah';
  if (/vape|puff|nicotine|pod system|disposable/.test(text)) return 'Vapes';
  if (/charcoal|coconut coal|quick light|hookah coal|hookah charcoal/.test(text)) return 'Coal';
  if (/tobacco|shisha tobacco|hookah tobacco|molasses|dark leaf|blonde leaf|cigar leaf/.test(text)) return 'Tobacco';
  if (/\bbowls?\b|phunnel|killer bowl|hookah bowl|clay bowl/.test(text)) return 'Bowls';
  if (/\bbases?\b|glass vase|vase for hookah|crystal base|hookah base/.test(text)) return 'Bases';
  if (/\bhookahs?\b|shisha pipe|nargile|hookah stem|hookah set/.test(text)) return 'Hookahs';
  return supplied || 'Accessories';
}

function rowToLegacyProduct(row: Record<string, unknown>, index: number) {
  const name = String(readValue(row, 'name') ?? '').trim();
  const description = String(readValue(row, 'description') ?? '').trim();
  const sourceUrl = String(readValue(row, 'sourceUrl') ?? '').trim();
  if (!name && !sourceUrl) return null;

  const suppliedCategory = String(readValue(row, 'category') ?? '').trim();
  const category = detectCategory(name, description, sourceUrl, suppliedCategory);
  const brand = String(readValue(row, 'brand') ?? '').trim() || name.split(/\s+/)[0] || 'Fumare Hookah';
  const sku = String(readValue(row, 'sku') ?? '').trim();
  const slug = slugify(name || sourceUrl);
  const images = parseImages(readValue(row, 'images'), readValue(row, 'imageUrl'));
  const price = toNumber(readValue(row, 'price'), 0);
  const salePriceValue = readValue(row, 'salePrice');
  const salePrice = salePriceValue === undefined ? undefined : toNumber(salePriceValue, 0);
  const stock = Math.max(0, Math.trunc(toNumber(readValue(row, 'stock'), 100)));
  const tagsValue = readValue(row, 'tags');
  const tags = tagsValue ? String(tagsValue).split(/[|,]+/).map(v => v.trim()).filter(Boolean) : [category, brand].filter(Boolean);
  const now = new Date().toISOString();

  return {
    id: `excel-${sku || slug}-${index + 1}`,
    name,
    slug,
    sku,
    description,
    shortDescription: String(readValue(row, 'shortDescription') ?? description).slice(0, 240),
    price,
    ...(salePrice !== undefined ? { salePrice } : {}),
    currency: 'USD',
    brand,
    brandSlug: slugify(brand),
    category,
    categorySlug: slugify(category),
    subcategory: readValue(row, 'subcategory') ? String(readValue(row, 'subcategory')) : undefined,
    flavor: readValue(row, 'flavor') ? String(readValue(row, 'flavor')) : undefined,
    material: readValue(row, 'material') ? String(readValue(row, 'material')) : undefined,
    color: readValue(row, 'color') ? String(readValue(row, 'color')) : undefined,
    weight: readValue(row, 'weight') !== undefined ? Math.trunc(toNumber(readValue(row, 'weight'), 0)) : undefined,
    images: images.slice(0, 20).map((url, imageIndex) => ({
      id: `${slug}-image-${imageIndex + 1}`,
      url,
      thumbnailUrl: url,
      alt: `${name} product image ${imageIndex + 1}`,
      isPrimary: imageIndex === 0,
      sortOrder: imageIndex + 1
    })),
    stock,
    lowStockThreshold: 5,
    tags,
    specifications: [],
    rating: 0,
    reviewCount: 0,
    isFeatured: toBoolean(readValue(row, 'isFeatured'), false),
    isNewArrival: toBoolean(readValue(row, 'isNewArrival'), false),
    isBestSeller: toBoolean(readValue(row, 'isBestSeller'), false),
    isOnSale: salePrice !== undefined && salePrice < price,
    isActive: toBoolean(readValue(row, 'isActive'), true),
    ageRestricted: true,
    seoTitle: `${name} | Fumare Hookah`,
    seoDescription: description.slice(0, 155),
    sourceUrl,
    createdAt: now,
    updatedAt: now
  };
}

function resolveExcelPath(): string {
  const candidates = [
    path.join(process.cwd(), 'data', 'Fumare-Hookha.xlsx'),
    path.join('/var/task', 'data', 'Fumare-Hookha.xlsx')
  ];
  try {
    const dir = typeof __dirname !== 'undefined' ? __dirname : path.dirname(new URL(import.meta.url).pathname);
    candidates.push(path.join(dir, '..', 'data', 'Fumare-Hookha.xlsx'));
  } catch {}
  return candidates.find(candidate => originalExistsSync(candidate)) || candidates[0];
}

function resolveCachePath(excelFile: string): string {
  return excelFile.replace(/\.xlsx$/i, '.cache.json');
}

let excelCatalogJson: string | null = null;

function loadExcelCatalogJson(): string {
  if (excelCatalogJson !== null) return excelCatalogJson;
  const excelFile = resolveExcelPath();
  const cacheFile = resolveCachePath(excelFile);

  // 1. Fast path: load pre-parsed JSON cache if it exists and is fresh
  try {
    if (originalExistsSync(cacheFile)) {
      if (!originalExistsSync(excelFile)) {
        excelCatalogJson = originalReadFileSync(cacheFile, 'utf8');
        console.log(`[Excel Catalog] Loaded from fast JSON cache (${cacheFile})`);
        return excelCatalogJson;
      }
      const excelStat = fs.statSync(excelFile);
      const cacheStat = fs.statSync(cacheFile);
      if (cacheStat.mtimeMs >= excelStat.mtimeMs && cacheStat.size > 1000) {
        excelCatalogJson = originalReadFileSync(cacheFile, 'utf8');
        console.log(`[Excel Catalog] Loaded from fast JSON cache in ~20ms (${cacheFile})`);
        return excelCatalogJson;
      }
    }
  } catch (cacheErr) {
    // If cache read fails, fall back gracefully to XLSX parsing below
  }

  // 2. Slow path: read binary XLSX and parse
  const workbook = XLSX.read(originalReadFileSync(excelFile), { type: 'buffer' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!firstSheet) throw new Error('Fumare-Hookha.xlsx has no worksheet.');
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '' });
  const products = rows.map((row, index) => rowToLegacyProduct(row, index)).filter(Boolean);
  excelCatalogJson = JSON.stringify(products);
  console.log(`[Excel Catalog] Loaded ${products.length} products from data/Fumare-Hookha.xlsx`);

  // Write cache for future executions
  try {
    fs.writeFileSync(cacheFile, excelCatalogJson, 'utf8');
  } catch {}

  return excelCatalogJson;
}

// Keep legacy JSON files in GitHub if desired, but make them invisible to the
// runtime. The store's existing loader now receives Excel-derived records through
// its legacy JSON boundary, so no product JSON file is a catalog source anymore.
(fs as any).existsSync = (filePath: any) => {
  const normalized = String(filePath || '').replace(/\\/g, '/');
  if (/(?:^|\/)src\/server\/db\/products-[1-5]\.json$/i.test(normalized) ||
      /(?:^|\/)src\/server\/db\/scrapedProducts\.json$/i.test(normalized)) return false;
  if (/(?:^|\/)src\/server\/db\/products-6\.json$/i.test(normalized)) return true;
  return originalExistsSync(filePath);
};

(fs as any).readFileSync = (filePath: any, ...args: any[]) => {
  const normalized = String(filePath || '').replace(/\\/g, '/');
  if (/(?:^|\/)src\/server\/db\/products-6\.json$/i.test(normalized)) return loadExcelCatalogJson();
  if (/(?:^|\/)src\/server\/db\/products-[1-5]\.json$/i.test(normalized) ||
      /(?:^|\/)src\/server\/db\/scrapedProducts\.json$/i.test(normalized)) {
    return typeof args[0] === 'string' || (args[0] && typeof args[0] === 'object' && args[0].encoding)
      ? '[]'
      : Buffer.from('[]');
  }
  return originalReadFileSync(filePath, ...args);
};

let appPromise: Promise<any> | null = null;
let dbPromise: Promise<any> | null = null;
let mongoPromise: Promise<any> | null = null;
let adminDbSyncPromise: Promise<boolean> | null = null;

async function loadRuntime() {
  if (!appPromise || !dbPromise || !mongoPromise) {
    const runtime = await Promise.all([
      import('../src/server/app.js'),
      import('../src/server/db/store.js'),
      import('../src/server/db/mongodb.js')
    ]);
    appPromise = Promise.resolve(runtime[0].default);
    dbPromise = Promise.resolve(runtime[1].db);
    mongoPromise = Promise.resolve(runtime[2].mongoService);
  }
  return Promise.all([appPromise, dbPromise, mongoPromise]);
}

async function ensureAdminDatabaseReady(): Promise<boolean> {
  const [, db, mongoService] = await loadRuntime();
  if (!process.env.MONGODB_URI) return false;

  if (!adminDbSyncPromise) {
    adminDbSyncPromise = (async () => {
      const connected = await mongoService.connect();
      if (!connected) return false;
      const summary = await mongoService.syncWithStore(db);
      const status = mongoService.getStatus();
      if (!status.isConnected) return false;
      console.log('[Vercel Serverless] Admin MongoDB hydration complete:', summary.summary);
      return true;
    })().catch((err: any) => {
      console.warn('[Vercel Serverless] Admin MongoDB hydration notice:', err);
      adminDbSyncPromise = null;
      return false;
    });
  }

  return adminDbSyncPromise;
}

export default async function vercelApiHandler(req: any, res: any) {
  const [app] = await loadRuntime();

  const queryPath = typeof req.query?.path === 'string' ? req.query.path : '';
  let normalizedRequestPath = '';

  if (queryPath) {
    const normalizedPath = queryPath.startsWith('/') ? queryPath : `/${queryPath}`;
    normalizedRequestPath = `/api${normalizedPath}`;
    const requestUrl = new URL(req.url || '/', 'http://vercel.local');
    requestUrl.searchParams.delete('path');
    req.url = `${normalizedRequestPath}${requestUrl.search || ''}`;
  } else if (req.url && (req.url === '/api/index' || req.url.startsWith('/api/index?'))) {
    const requestUrl = new URL(req.url, 'http://vercel.local');
    const param = requestUrl.searchParams.get('path');
    if (param) {
      requestUrl.searchParams.delete('path');
      const normalizedPath = param.startsWith('/') ? param : `/${param}`;
      normalizedRequestPath = `/api${normalizedPath}`;
      req.url = `${normalizedRequestPath}${requestUrl.search || ''}`;
    } else {
      normalizedRequestPath = '/api/health';
      req.url = `/api/health${requestUrl.search || ''}`;
    }
  } else if (req.url && !req.url.startsWith('/api')) {
    const normalized = req.url.startsWith('/') ? req.url : `/${req.url}`;
    normalizedRequestPath = `/api${normalized}`;
    req.url = normalizedRequestPath;
  } else {
    normalizedRequestPath = req.url?.split('?')[0] || '';
  }

  if (normalizedRequestPath.startsWith('/api/admin')) {
    const hydration = ensureAdminDatabaseReady();
    const mongoReady = await Promise.race([
      hydration,
      new Promise<boolean>(resolve => setTimeout(() => resolve(false), 10000))
    ]);

    if (!mongoReady) {
      res.setHeader('X-MongoDB-Mode', 'local-cache');
      console.warn('[Vercel Serverless] MongoDB hydration exceeded gateway budget; serving resilient local cache.');
      void hydration.catch(() => undefined);
    } else {
      res.setHeader('X-MongoDB-Mode', 'mongodb');
    }
  }

  return app(req, res);
}
