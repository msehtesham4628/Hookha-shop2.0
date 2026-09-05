import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const db = path.join(root, 'src/server/db');
const productsPath = path.join(db, 'scrapedProducts.json');
const brandsPath = path.join(db, 'scrapedBrands.json');
const homePath = path.join(root, 'src/client/pages/HomePage.tsx');

if (!fs.existsSync(homePath)) process.exit(0);

function slug(value = '') {
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function esc(value = '') {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

let products = [];
let brands = [];
try {
  if (fs.existsSync(productsPath)) {
    const raw = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    if (Array.isArray(raw)) products = raw;
  }
} catch (error) {
  console.warn('[BrandImages] Could not read scrapedProducts.json:', error.message);
}
try {
  if (fs.existsSync(brandsPath)) {
    const raw = JSON.parse(fs.readFileSync(brandsPath, 'utf8'));
    if (Array.isArray(raw)) brands = raw;
  }
} catch (error) {
  console.warn('[BrandImages] Could not read scrapedBrands.json:', error.message);
}

const imageFor = (names) => {
  const wanted = names.map(slug);
  const brand = brands.find((b) => wanted.includes(slug(b?.name)) || wanted.includes(slug(b?.slug)));
  if (brand?.logoUrl || brand?.bannerUrl) return brand.logoUrl || brand.bannerUrl;
  const product = products.find((p) => {
    const b = slug(p?.brand || '');
    const bs = slug(p?.brandSlug || '');
    return wanted.some((w) => b === w || bs === w || b.includes(w) || w.includes(b));
  });
  return product?.images?.find((i) => i?.url)?.url || '';
};

let home = fs.readFileSync(homePath, 'utf8');

if (!home.includes('imageUrl?: string;')) {
  home = home.replace(/  badgeText\?: string;\n}/, '  badgeText?: string;\n  imageUrl?: string;\n}');
}

const eBrands = [
  ['Enso', 'enso', 'bg-stone-950', 'text-cyan-400', 'ENSO', ['enso']],
  ['HeyBar', 'heybar', 'bg-orange-950', 'text-orange-300', 'HEYBAR', ['heybar']],
  ['Kori', 'kori', 'bg-emerald-900', 'text-emerald-100', 'KORI', ['kori']],
  ['XKAH', 'xkah', 'bg-slate-900', 'text-slate-100', 'XKAH', ['xkah']]
];
const vBrands = [
  ['Adalya', 'adalya', 'bg-rose-900', 'text-rose-100', 'ADALYA', ['adalya']],
  ['Flamingo', 'flamingo', 'bg-pink-700', 'text-white', 'FLAMINGO', ['flamingo']],
  ['Kori Hola', 'kori-hola', 'bg-blue-900', 'text-blue-100', 'KORI HOLA', ['kori-hola', 'kori hola']],
  ['ZColors', 'zcolors', 'bg-purple-900', 'text-purple-100', 'ZCOLORS', ['zcolors', 'zcolors by zlab']]
];

function makeArray(items) {
  return `[\n${items.map(([name, s, bg, text, badge, aliases]) => {
    const imageUrl = imageFor(aliases);
    return `    { name: '${esc(name)}', slug: '${esc(s)}', bgClass: '${bg}', textColor: '${text}', badgeText: '${badge}', imageUrl: '${esc(imageUrl)}' },`;
  }).join('\n')}\n  ]`;
}

home = home.replace(/  const ehookahBrands: BrandAvatar\[\] = \[[\s\S]*?\n  \];/, `  const ehookahBrands: BrandAvatar[] = ${makeArray(eBrands)};`);
home = home.replace(/  const vapeBrands: BrandAvatar\[\] = \[[\s\S]*?\n  \];/, `  const vapeBrands: BrandAvatar[] = ${makeArray(vBrands)};`);

const oldBadge = `<span className="font-black text-[11px] sm:text-xs tracking-tight text-center px-1 leading-none">{brand.badgeText}</span>`;
const newBadge = `{brand.imageUrl ? <img src={brand.imageUrl} alt={brand.name} className="w-full h-full rounded-full object-contain bg-white p-2" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : <span className="font-black text-[11px] sm:text-xs tracking-tight text-center px-1 leading-none">{brand.badgeText}</span>}`;
if (home.includes(oldBadge) && !home.includes('brand.imageUrl ? <img')) {
  home = home.replaceAll(oldBadge, newBadge);
}

fs.writeFileSync(homePath, home);
console.log('[BrandImages] Homepage E-Hookah/Vape brand image URLs patched from synced catalog.');
