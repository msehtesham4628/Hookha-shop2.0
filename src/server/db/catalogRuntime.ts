import fs from 'node:fs';
import path from 'node:path';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_BRANDS } from './seedData.js';

/**
 * Production catalog override.
 *
 * The seed catalog contains demo/placeholder imagery. When the synchronized
 * catalog files exist, replace the demo arrays before DatabaseStore initializes.
 * This keeps the existing store architecture while ensuring the storefront
 * never mixes demo products with the live catalog.
 */
const DB_DIR = path.resolve(process.cwd(), 'src/server/db');

function readJson<T>(fileName: string): T | null {
  try {
    const filePath = path.join(DB_DIR, fileName);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch (error) {
    console.warn(`[CatalogRuntime] Could not read ${fileName}:`, error);
    return null;
  }
}

const catalogProducts = readJson<any[]>('scrapedProducts.json');
const catalogCategories = readJson<any[]>('scrapedCategories.json');
const catalogBrands = readJson<any[]>('scrapedBrands.json');

if (Array.isArray(catalogProducts) && catalogProducts.length > 0) {
  const cleanedProducts = catalogProducts.map((product) => {
    const rawBrand = String(product.brand || '').trim();
    const isWhmBrand = /world\s*hookah\s*market/i.test(rawBrand) || /world-hookah-market/i.test(String(product.brandSlug || ''));

    const images = Array.isArray(product.images)
      ? product.images.filter((image) => {
          const url = String(image?.url || '');
          return url && !/images\.unsplash\.com/i.test(url);
        })
      : [];

    return {
      ...product,
      brand: isWhmBrand || !rawBrand ? 'Fumare Hookah' : rawBrand,
      brandSlug: isWhmBrand || !rawBrand
        ? 'fumare-hookah'
        : (product.brandSlug || rawBrand.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
      images
    };
  });

  INITIAL_PRODUCTS.splice(0, INITIAL_PRODUCTS.length, ...cleanedProducts);
  console.log(`[CatalogRuntime] Using ${cleanedProducts.length} synchronized products; demo seed products disabled.`);
}

if (Array.isArray(catalogCategories) && catalogCategories.length > 0) {
  INITIAL_CATEGORIES.splice(0, INITIAL_CATEGORIES.length, ...catalogCategories);
  console.log(`[CatalogRuntime] Using ${catalogCategories.length} synchronized categories.`);
}

if (Array.isArray(catalogBrands) && catalogBrands.length > 0) {
  const cleanedBrands = catalogBrands.map((brand) => {
    const rawName = String(brand.name || '').trim();
    const isWhmBrand = /world\s*hookah\s*market/i.test(rawName) || /world-hookah-market/i.test(String(brand.slug || ''));
    return {
      ...brand,
      name: isWhmBrand || !rawName ? 'Fumare Hookah' : rawName,
      slug: isWhmBrand || !rawName ? 'fumare-hookah' : (brand.slug || rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
    };
  });

  INITIAL_BRANDS.splice(0, INITIAL_BRANDS.length, ...cleanedBrands);
  console.log(`[CatalogRuntime] Using ${cleanedBrands.length} synchronized brands.`);
}
