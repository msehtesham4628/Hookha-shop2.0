import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const db = path.join(root, 'src/server/db');
const seedPath = path.join(db, 'seedData.ts');
const categoriesPath = path.join(db, 'scrapedCategories.json');
const brandsPath = path.join(db, 'scrapedBrands.json');

if (!fs.existsSync(seedPath)) process.exit(0);
if (!fs.existsSync(categoriesPath) || !fs.existsSync(brandsPath)) {
  console.log('[WHM] No synced catalog metadata found; keeping development seed catalog.');
  process.exit(0);
}

const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
const brands = JSON.parse(fs.readFileSync(brandsPath, 'utf8'));
let source = fs.readFileSync(seedPath, 'utf8');

const categoryLiteral = JSON.stringify(categories, null, 2);
const brandLiteral = JSON.stringify(brands, null, 2);

source = source.replace(
  /export const INITIAL_CATEGORIES: Category\[\] = \[[\s\S]*?\n\];\n\nexport const INITIAL_BRANDS/,
  `export const INITIAL_CATEGORIES: Category[] = ${categoryLiteral};\n\nexport const INITIAL_BRANDS`
);

source = source.replace(
  /export const INITIAL_BRANDS: Brand\[\] = \[[\s\S]*?\n\];\n\nexport const INITIAL_PRODUCTS/,
  `export const INITIAL_BRANDS: Brand[] = ${brandLiteral};\n\nexport const INITIAL_PRODUCTS`
);

// Keep storefront shipping threshold aligned with the live WHM homepage.
source = source.replace(/freeShippingThreshold:\s*99\b/, 'freeShippingThreshold: 89');
fs.writeFileSync(seedPath, source);
console.log(`[WHM] Build catalog injected: ${categories.length} categories, ${brands.length} brands.`);
