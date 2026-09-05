import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const db = path.join(root, 'src/server/db');
const seedPath = path.join(db, 'seedData.ts');
const categoriesPath = path.join(db, 'scrapedCategories.json');
const brandsPath = path.join(db, 'scrapedBrands.json');
const productsPath = path.join(db, 'scrapedProducts.json');

if (!fs.existsSync(seedPath)) process.exit(0);

let source = fs.readFileSync(seedPath, 'utf8');

// Inject synchronized categories and brands when available.
if (fs.existsSync(categoriesPath) && fs.existsSync(brandsPath)) {
  const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
  const rawBrands = JSON.parse(fs.readFileSync(brandsPath, 'utf8'));

  const brands = Array.isArray(rawBrands)
    ? rawBrands.map((brand) => {
        const name = String(brand?.name || '').trim();
        const isWhmBrand = /world\s*hookah\s*market/i.test(name) || /world-hookah-market/i.test(String(brand?.slug || ''));
        return {
          ...brand,
          name: isWhmBrand || !name ? 'Fumare Hookah' : name,
          slug: isWhmBrand || !name ? 'fumare-hookah' : (brand.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
        };
      })
    : [];

  if (Array.isArray(categories) && categories.length) {
    source = source.replace(
      /export const INITIAL_CATEGORIES: Category\[\] = \[[\s\S]*?\n\];\n\nexport const INITIAL_BRANDS/,
      `export const INITIAL_CATEGORIES: Category[] = ${JSON.stringify(categories, null, 2)};\n\nexport const INITIAL_BRANDS`
    );
  }

  if (brands.length) {
    source = source.replace(
      /export const INITIAL_BRANDS: Brand\[\] = \[[\s\S]*?\n\];\n\nexport const INITIAL_PRODUCTS/,
      `export const INITIAL_BRANDS: Brand[] = ${JSON.stringify(brands, null, 2)};\n\nexport const INITIAL_PRODUCTS`
    );
  }

  console.log(`[WHM] Injected ${Array.isArray(categories) ? categories.length : 0} categories and ${brands.length} brands.`);
}

// The seed products contain demo/stock imagery. If a synchronized catalog exists,
// replace the entire demo product array so production cannot mix fake images with
// real catalog products.
if (fs.existsSync(productsPath)) {
  const rawProducts = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  if (Array.isArray(rawProducts) && rawProducts.length) {
    const products = rawProducts.map((product) => {
      const rawBrand = String(product?.brand || '').trim();
      const isWhmBrand = /world\s*hookah\s*market/i.test(rawBrand) || /world-hookah-market/i.test(String(product?.brandSlug || ''));
      const images = Array.isArray(product?.images)
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

    source = source.replace(
      /export const INITIAL_PRODUCTS: Product\[\] = \[[\s\S]*?\n\];\n\nexport const INITIAL_COUPONS/,
      `export const INITIAL_PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};\n\nexport const INITIAL_COUPONS`
    );

    console.log(`[WHM] Injected ${products.length} synchronized products and disabled demo product imagery.`);
  }
}

// Keep the existing Fumare storefront settings while matching the catalog source's
// current free-shipping threshold.
source = source.replace(/freeShippingThreshold:\s*99\b/, 'freeShippingThreshold: 89');
fs.writeFileSync(seedPath, source);
