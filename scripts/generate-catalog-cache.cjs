const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return fallback;
  const num = Number(String(value).replace(/[^0-9.-]+/g, ''));
  return Number.isFinite(num) ? num : fallback;
}

function toBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const norm = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'y'].includes(norm)) return true;
    if (['false', '0', 'no', 'n'].includes(norm)) return false;
  }
  return fallback;
}

function readValue(row, canonicalKey) {
  const aliases = {
    name: ['name', 'product name', 'title', 'product_name'],
    description: ['description', 'desc', 'body', 'details'],
    shortDescription: ['shortdescription', 'short description', 'summary'],
    sourceUrl: ['sourceurl', 'source url', 'product url', 'url'],
    category: ['category', 'cat', 'category name', 'collection'],
    subcategory: ['subcategory', 'sub category', 'sub-category'],
    brand: ['brand', 'brand name', 'vendor', 'manufacturer'],
    sku: ['sku', 'item number', 'barcode', 'upc'],
    price: ['price', 'regular price', 'retail price', 'msrp'],
    salePrice: ['saleprice', 'sale price', 'discount price', 'special price'],
    stock: ['stock', 'inventory', 'qty', 'quantity', 'stock_quantity'],
    tags: ['tags', 'tag', 'keywords'],
    images: ['images', 'image urls', 'image_urls', 'photos', 'gallery'],
    imageUrl: ['imageurl', 'image url', 'image', 'photo', 'featured image'],
    flavor: ['flavor', 'flavor profile', 'flavour'],
    material: ['material', 'build material'],
    color: ['color', 'colour'],
    weight: ['weight', 'grams', 'net weight'],
    isFeatured: ['isfeatured', 'featured'],
    isNewArrival: ['isnewarrival', 'new arrival', 'new'],
    isBestSeller: ['isbestseller', 'best seller', 'bestseller'],
    isActive: ['isactive', 'active', 'published', 'status']
  };

  const normalizedRow = {};
  for (const [key, value] of Object.entries(row || {})) {
    normalizedRow[key.toLowerCase().replace(/[^a-z0-9]/g, '')] = value;
  }

  const lookup = aliases[canonicalKey] || [canonicalKey];
  for (const alias of lookup) {
    const sanitized = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (sanitized in normalizedRow) return normalizedRow[sanitized];
  }
  return undefined;
}

function parseImages(imagesValue, fallbackUrl) {
  const urls = [];
  if (fallbackUrl) urls.push(String(fallbackUrl).trim());
  if (imagesValue) {
    const text = String(imagesValue).trim();
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) urls.push(...parsed.map(v => String(v).trim()));
      else if (parsed && typeof parsed === 'object') urls.push(...Object.values(parsed).map(v => String(v).trim()));
    } catch {
      urls.push(...text.split(/[|,\n]+/).map(v => v.trim()));
    }
  }
  return [...new Set(urls)].filter(url => /^https?:\/\//i.test(url) && !/placeholder|spinner|loading|gravatar|avatar/i.test(url));
}

function detectCategory(name, description, sourceUrl, supplied) {
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

function rowToLegacyProduct(row, index) {
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

const excelPath = path.join(process.cwd(), 'data', 'Fumare-Hookha.xlsx');
const cachePath = path.join(process.cwd(), 'data', 'Fumare-Hookha.cache.json');

console.log('Generating catalog cache from', excelPath, '...');
const start = Date.now();
const workbook = XLSX.read(fs.readFileSync(excelPath), { type: 'buffer' });
const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
const products = rows.map((row, index) => rowToLegacyProduct(row, index)).filter(Boolean);
fs.writeFileSync(cachePath, JSON.stringify(products), 'utf8');
console.log(`Generated cache with ${products.length} products in ${Date.now() - start}ms at ${cachePath}`);
