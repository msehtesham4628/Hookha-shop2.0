import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const db = path.join(root, 'src/server/db');
const seedPath = path.join(db, 'seedData.ts');
const categoriesPath = path.join(db, 'scrapedCategories.json');
const brandsPath = path.join(db, 'scrapedBrands.json');
const productsPath = path.join(db, 'scrapedProducts.json');
const homePagePath = path.join(root, 'src/client/pages/HomePage.tsx');

if (!fs.existsSync(seedPath)) process.exit(0);

let source = fs.readFileSync(seedPath, 'utf8');

// Inject synchronized categories and brands when available.
let syncedBrands = [];
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
  syncedBrands = brands;

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

// Build-time frontend parity: use the synchronized E-Hookah/Vape brands and their
// real catalog images instead of the old hard-coded text-only demo badges.
if (fs.existsSync(homePagePath) && syncedBrands.length) {
  let home = fs.readFileSync(homePagePath, 'utf8');
  const brandFor = (patterns) => syncedBrands.find((b) => patterns.some((p) => p.test(String(b.name))) || patterns.some((p) => p.test(String(b.slug)))) || null;
  const makeHomeBrands = (items, defaults) => items.length ? items.map((b, i) => ({
    name: b.name,
    slug: b.slug,
    bgClass: defaults[i]?.bgClass || 'bg-white',
    textColor: defaults[i]?.textColor || 'text-stone-900',
    badgeText: b.name.toUpperCase().slice(0, 18),
    imageUrl: b.logoUrl || b.bannerUrl || ''
  })) : defaults;

  const ehookah = syncedBrands.filter((b) => /^(enso|heybar|kori|xkah)$/i.test(String(b.name).trim()) || /^(enso|heybar|kori|xkah)$/.test(String(b.slug).toLowerCase()));
  const vapes = syncedBrands.filter((b) => /^(adalya|flamingo|kori hola|zcolors)$/i.test(String(b.name).trim()) || /^(adalya|flamingo|kori-hola|zcolors)$/.test(String(b.slug).toLowerCase()));
  const eDefaults = [
    { name: 'Enso', slug: 'enso', bgClass: 'bg-stone-950', textColor: 'text-cyan-400', badgeText: 'ENSO' },
    { name: 'HeyBar', slug: 'heybar', bgClass: 'bg-orange-950', textColor: 'text-orange-300', badgeText: 'HEYBAR' },
    { name: 'Kori', slug: 'kori', bgClass: 'bg-emerald-900', textColor: 'text-emerald-100', badgeText: 'KORI' },
    { name: 'XKAH', slug: 'xkah', bgClass: 'bg-slate-900', textColor: 'text-slate-100', badgeText: 'XKAH' }
  ];
  const vDefaults = [
    { name: 'Adalya', slug: 'adalya', bgClass: 'bg-rose-900', textColor: 'text-rose-100', badgeText: 'ADALYA' },
    { name: 'Flamingo', slug: 'flamingo', bgClass: 'bg-pink-700', textColor: 'text-white', badgeText: 'FLAMINGO' },
    { name: 'Kori Hola', slug: 'kori-hola', bgClass: 'bg-blue-900', textColor: 'text-blue-100', badgeText: 'KORI HOLA' },
    { name: 'ZColors', slug: 'zcolors', bgClass: 'bg-purple-900', textColor: 'text-purple-100', badgeText: 'ZCOLORS' }
  ];

  home = home.replace(/  const ehookahBrands: BrandAvatar\[\] = \[[^;]*?\];/, `  const ehookahBrands: BrandAvatar[] = ${JSON.stringify(makeHomeBrands(ehookah, eDefaults), null, 2).replace(/"([^\"]+)":/g, '$1:').replace(/"([^\"]*)"/g, "'$1'")};`);
  home = home.replace(/  const vapeBrands: BrandAvatar\[\] = \[[^;]*?\];/, `  const vapeBrands: BrandAvatar[] = ${JSON.stringify(makeHomeBrands(vapes, vDefaults), null, 2).replace(/"([^\"]+)":/g, '$1:').replace(/"([^\"]*)"/g, "'$1'")};`);
  home = home.replace(/  badgeText\?: string;\n}/, `  badgeText?: string;\n  imageUrl?: string;\n}`);
  if (!home.includes('brand.imageUrl ?')) {
    home = home.replace(/<span className="font-black text-\[11px\] sm:text-xs tracking-tight text-center px-1 leading-none">\s*\{brand\.badgeText\}\s*<\/span>/g, `{brand.imageUrl ? <img src={brand.imageUrl} alt={brand.name} className="w-full h-full rounded-full object-contain bg-white p-2" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : <span className="font-black text-[11px] sm:text-xs tracking-tight text-center px-1 leading-none">{brand.badgeText}</span>}`);
  }
  fs.writeFileSync(homePagePath, home);
  console.log('[WHM] Patched homepage E-Hookah/Vape brands and image rendering.');
}

source = source.replace(/freeShippingThreshold:\s*99\b/, 'freeShippingThreshold: 89');
fs.writeFileSync(seedPath, source);
