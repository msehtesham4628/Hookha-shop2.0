export interface BrandAvatar {
  name: string;
  slug: string;
  category: string;
  bgClass: string;
  textColor: string;
  borderClass?: string;
  badgeText: string;
  origin?: string;
  imageUrl?: string;
  logoUrl?: string;
  description?: string;
}

// Brand directory aligned with the brands currently exposed by World Hookah Market.
const make = (name: string, slug: string, category: string, badgeText = name.toUpperCase(), imageUrl?: string): BrandAvatar => ({
  name, slug, category, bgClass: 'bg-white', textColor: 'text-stone-900', borderClass: 'border border-stone-200', badgeText, imageUrl
});

export const CATEGORY_BRAND_MAP: Record<string, BrandAvatar[]> = {
  tobacco: [
    make('Nash', 'nash', 'tobacco'),
    make('MustHave', 'musthave', 'tobacco'),
    make('MustHave Tobacco', 'musthave-tobacco', 'tobacco'),
    make('BlackBurn', 'blackburn-tobacco', 'tobacco'),
    make('Black Burn', 'black-burn', 'tobacco'),
    make('Bonche', 'bonche', 'tobacco'),
    make('Deus', 'deus', 'tobacco'),
    make('SEVERNYI', 'severnyi', 'tobacco'),
    make('Satyr', 'satyr', 'tobacco'),
    make('Kraken', 'kraken', 'tobacco'),
    make('Sebero', 'sebero', 'tobacco'),
    make('Sebero Tobacco', 'sebero-tobacco', 'tobacco'),
    make('Banger', 'banger-tobacco', 'tobacco'),
    make('Sarma', 'sarma-tobacco', 'tobacco'),
    make('AL Fakher', 'al-fakher-shisha', 'tobacco'),
    make('Al Fakher', 'al-fakher', 'tobacco'),
    make('Adalya', 'adalya-tobacco', 'tobacco'),
    make('Element', 'element', 'tobacco'),
    make('Element Tobacco', 'element-tobacco', 'tobacco'),
    make('Starline', 'starline', 'tobacco'),
    make('DarkSide', 'darkside', 'tobacco'),
    make('DarkSide Tobacco', 'darkside-tobacco', 'tobacco'),
    make('Duft', 'duft', 'tobacco'),
    make('Azure', 'azure', 'tobacco'),
    make('Mazaya', 'mazaya', 'tobacco'),
    make('Sapphire Crown', 'sapphire-crown', 'tobacco'),
    make('Trofimoff’s', 'trofimoffs', 'tobacco'),
    make('Chabacco', 'chabacco', 'tobacco'),
    make('Afzal', 'afzal', 'tobacco'),
    make('Afzal Tobacco', 'afzal-tobacco', 'tobacco'),
    make('Eternal Smoke', 'eternal-smoke', 'tobacco'),
    make('Fumari', 'fumari', 'tobacco'),
    make('Fumari Tobacco', 'fumari-tobacco', 'tobacco'),
    make('Serbetli', 'serbetli', 'tobacco'),
    make('Serbetli Tobacco', 'serbetli-tobacco', 'tobacco'),
    make('Social Smoke', 'social-smoke', 'tobacco'),
    make('Starbuzz', 'starbuzz', 'tobacco'),
    make('Starbuzz Tobacco', 'starbuzz-tobacco', 'tobacco'),
    make('Tangiers', 'tangiers', 'tobacco'),
    make('Trifecta', 'trifecta', 'tobacco'),
    make('World Hookah Market', 'world-hookah-market', 'tobacco')
  ],
  hookahs: [
    make('Alpha Hookah', 'alpha-hookah', 'hookahs'),
    make('Matt Pear', 'mattpear', 'hookahs'),
    make('El Bomber Hookah', 'el-bomber', 'hookahs'),
    make('Geometry Hookah', 'geometry', 'hookahs'),
    make('Geometry Hookah', 'geometry-hookah', 'hookahs'),
    make('Union Hookah', 'union-hookah', 'hookahs'),
    make('Hoob', 'hoob', 'hookahs'),
    make('Hoob Hookah', 'hoob-hookah', 'hookahs'),
    make('Maklaud Hookah', 'maklaud-hookah', 'hookahs'),
    make('Hooligan Hookah', 'hooligan-hookah', 'hookahs'),
    make('Japona Hookah', 'japona-hookah', 'hookahs'),
    make('WOOKAH Hookah', 'wookah', 'hookahs'),
    make('Misha Hookah', 'misha-hookah', 'hookahs'),
    make('Amotion', 'amotion', 'hookahs'),
    make('Amotion Hookah', 'amotion-hookah', 'hookahs'),
    make('Conceptic Hookah', 'conceptic-hookah', 'hookahs'),
    make('Don Hookah', 'don-hookah', 'hookahs'),
    make('E-Hookah', 'e-hookah', 'hookahs'),
    make('Honey Sigh Hookah', 'honey-sigh-hookah', 'hookahs'),
    make('HookahTree', 'hookahtree', 'hookahs'),
    make('Moze Hookah', 'moze-hookah', 'hookahs'),
    make('RF Hookah', 'rf-hookah', 'hookahs'),
    make('Shi Carver Hookah', 'shi-carver-hookah', 'hookahs'),
    make('Steamulation Hookah', 'steamulation-hookah', 'hookahs'),
    make('Steamulation', 'steamulation', 'hookahs'),
    make('Tortuga Hookah', 'tortuga-hookah', 'hookahs'),
    make('VZ Hookah', 'vz-hookah', 'hookahs')
  ],
  bowls: [
    make('Oblako', 'oblako', 'bowls'),
    make('Oblako Bowls', 'oblako-bowls', 'bowls'),
    make('Alpha Bowls', 'alpha-bowls', 'bowls'),
    make('Cosmo Bowl', 'cosmo-bowl', 'bowls'),
    make('ST Bowls', 'st-bowls', 'bowls'),
    make('Element Bowls', 'element-bowls', 'bowls'),
    make('Kaloud Bowls', 'kaloud-bowls', 'bowls'),
    make('Smokelab Hookah Bowls', 'smokelab-hookah-bowls', 'bowls'),
    make('Kong Bowls', 'kong-bowls', 'bowls'),
    make('Kong', 'kong', 'bowls'),
    make('Geometry Bowl', 'geometry-bowl', 'bowls'),
    make('Conceptic Bowls', 'conceptic-bowls', 'bowls'),
    make('Don', 'don-bowls', 'bowls'),
    make('Harvik Hookah Bowls', 'harvik-hookah-bowls', 'bowls'),
    make('Big Maks Bowl', 'big-maks-bowl', 'bowls'),
    make('Japona Bowls', 'japona-bowls', 'bowls'),
    make('Joe Hookah Bowls', 'joe-hookah-bowls', 'bowls'),
    make('Kolos', 'kolos', 'bowls'),
    make('Kolos Hookah Bowls', 'kolos-hookah-bowls', 'bowls'),
    make('Moon', 'moon', 'bowls'),
    make('Moon Bowls', 'moon-bowls', 'bowls'),
    make('Sacramento Bowls', 'sacramento-bowls', 'bowls'),
    make('Telamon', 'telamon', 'bowls'),
    make('Tortuga Hookah Bowls', 'tortuga-hookah-bowls', 'bowls')
  ],
  bases: [
    make('Big Maks Base', 'big-maks-base', 'bases'),
    make('Crystal Base', 'crystal-base', 'bases'),
    make('Geometry Base', 'geometry-base', 'bases'),
    make('HookahTree Base', 'hookahtree-base', 'bases'),
    make('Steamulation Bases', 'steamulation-bases', 'bases'),
    make('Vessel Base', 'vessel-base', 'bases'),
    make('WOOKAH Bases', 'wookah-bases', 'bases'),
    make('Caesar Crystal', 'caesar-crystal', 'bases'),
    make('Craft Glass', 'craft-glass', 'bases')
  ],
  coal: [
    make('Burn', 'burn', 'coal'),
    make('Blackcoco', 'blackcoco', 'coal'),
    make('Coco Loco', 'coco-loco', 'coal'),
    make('One Nation', 'one-nation-coal', 'coal'),
    make('One Nation', 'one-nation', 'coal'),
    make('Oasis Charcoal', 'oasis-charcoal', 'coal'),
    make('Shaman Coal', 'shaman-coal', 'coal'),
    make('Crown Coal', 'crown-coal', 'coal')
  ],
  accessories: [
    make('Nash', 'nash', 'accessories'),
    make('Kaloud', 'kaloud', 'accessories'),
    make('Na Grani', 'na-grani', 'accessories'),
    make('Blade Hookah', 'blade-hookah', 'accessories'),
    make('Steamulation Accessories', 'steamulation-accessories', 'accessories'),
    make('Steamulation', 'steamulation', 'accessories'),
    make('Hookah Boards', 'hookah-boards', 'accessories'),
    make('Heat Management', 'heat-management', 'accessories'),
    make('Hookah Bag', 'hookah-bag', 'accessories'),
    make('Hookah Mouthpiece', 'hookah-mouthpiece', 'accessories'),
    make('Hookah Tongs', 'hookah-tongs', 'accessories'),
    make('Other', 'other-accessories', 'accessories')
  ],
  'e-hookah': [
    make('Kori', 'kori', 'e-hookah'),
    make('Ooka', 'ooka', 'e-hookah'),
    make('Aspire Proteus', 'aspire-proteus', 'e-hookah'),
    make('Kangerm', 'kangerm', 'e-hookah'),
    make('Starbuzz E-Hose', 'starbuzz-ehose', 'e-hookah')
  ],
  vapes: [
    make('Al Fakher Vapes', 'al-fakher-vapes', 'vapes'),
    make('Geek Bar', 'geek-bar', 'vapes'),
    make('Lost Mary', 'lost-mary', 'vapes'),
    make('Vaporesso', 'vaporesso', 'vapes'),
    make('GeekVape', 'geekvape', 'vapes'),
    make('Elf Bar', 'elf-bar', 'vapes'),
    make('Nasty Juice', 'nasty-juice', 'vapes'),
    make('SMOK', 'smok', 'vapes')
  ]
};

// Distinct master list of all brands across all categories
export const ALL_BRAND_BADGES: BrandAvatar[] = (() => {
  const seen = new Set<string>();
  const list: BrandAvatar[] = [];
  for (const brands of Object.values(CATEGORY_BRAND_MAP)) {
    for (const b of brands) {
      if (!seen.has(b.slug)) {
        seen.add(b.slug);
        list.push(b);
      }
    }
  }
  return list;
})();

// In-memory dynamic brand cache synced with server /api/brands
export const DYNAMIC_BRANDS_MAP = new Map<string, BrandAvatar>();

export const registerDynamicBrands = (brands: any[]) => {
  if (!Array.isArray(brands)) return;
  for (const b of brands) {
    if (!b) continue;
    const slug = b.slug || b.id;
    if (!slug) continue;
    const clean = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const avatar: BrandAvatar = {
      name: b.name || b.slug,
      slug: b.slug,
      category: b.category || 'tobacco',
      bgClass: 'bg-white',
      textColor: 'text-stone-900',
      borderClass: 'border border-stone-200',
      badgeText: (b.name || b.slug).toUpperCase(),
      imageUrl: b.logoUrl || b.imageUrl,
      origin: b.origin,
      description: b.description
    };
    DYNAMIC_BRANDS_MAP.set(clean, avatar);
    const stripped = clean.replace(/-(tobacco|hookahs?|bowls?|bases?|coals?|accessories|vapes?)$/i, '');
    if (stripped && stripped !== clean) {
      DYNAMIC_BRANDS_MAP.set(stripped, avatar);
    }
  }
};

// Helper to look up a brand by slug (case-insensitive, hyphen-tolerant)
export const getBrandBySlug = (slug: string): BrandAvatar | undefined => {
  if (!slug) return undefined;
  const clean = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (DYNAMIC_BRANDS_MAP.has(clean)) return DYNAMIC_BRANDS_MAP.get(clean);
  const stripped = clean.replace(/-(tobacco|hookahs?|bowls?|bases?|coals?|accessories|vapes?)$/i, '');
  if (DYNAMIC_BRANDS_MAP.has(stripped)) return DYNAMIC_BRANDS_MAP.get(stripped);

  return ALL_BRAND_BADGES.find(b => {
    const bSlug = b.slug.toLowerCase().trim();
    const bStripped = bSlug.replace(/-(tobacco|hookahs?|bowls?|bases?|coals?|accessories|vapes?)$/i, '');
    return (
      bSlug === clean ||
      bStripped === clean ||
      bSlug === stripped ||
      bStripped === stripped ||
      bSlug.replace(/-/g, '') === clean.replace(/-/g, '')
    );
  });
};

// Helper to check if a slug is a known brand
export const isBrandSlug = (slug?: string | null): boolean => {
  if (!slug) return false;
  const clean = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (DYNAMIC_BRANDS_MAP.has(clean)) return true;
  const stripped = clean.replace(/-(tobacco|hookahs?|bowls?|bases?|coals?|accessories|vapes?)$/i, '');
  if (DYNAMIC_BRANDS_MAP.has(stripped)) return true;

  return ALL_BRAND_BADGES.some(b => {
    const bSlug = b.slug.toLowerCase().trim();
    const bStripped = bSlug.replace(/-(tobacco|hookahs?|bowls?|bases?|coals?|accessories|vapes?)$/i, '');
    return (
      bSlug === clean ||
      bStripped === clean ||
      bSlug === stripped ||
      bStripped === stripped ||
      bSlug.replace(/-/g, '') === clean.replace(/-/g, '')
    );
  });
};

// Helper to get brands for a specific category
export const getBrandsForCategory = (categorySlug: string): BrandAvatar[] => {
  if (!categorySlug) return ALL_BRAND_BADGES;
  const clean = categorySlug.toLowerCase().trim();
  const canonical = clean === 'coal' || clean === 'coals' || clean === 'charcoal' ? 'coal'
    : clean === 'hookah' || clean === 'hookahs' ? 'hookahs'
    : clean === 'tobacco' || clean === 'shisha' ? 'tobacco'
    : clean === 'bowl' || clean === 'bowls' ? 'bowls'
    : clean === 'base' || clean === 'bases' || clean === 'vases' ? 'bases'
    : clean === 'accessories' || clean === 'accessory' ? 'accessories'
    : clean === 'e-hookah' || clean === 'ehookah' ? 'e-hookah'
    : clean === 'vape' || clean === 'vapes' ? 'vapes'
    : clean;
  return CATEGORY_BRAND_MAP[canonical] || [];
};
