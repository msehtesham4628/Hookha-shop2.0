export interface BrandAvatar {
  name: string;
  slug: string;
  category: string;
  bgClass: string;
  textColor: string;
  borderClass?: string;
  badgeText: string;
  origin?: string;
}

// Brand directory aligned with the brands currently exposed by World Hookah Market.
// Logos are intentionally not fabricated here; product/category imagery comes from the synced WHM catalog.
const make = (name: string, slug: string, category: string, badgeText = name.toUpperCase()): BrandAvatar => ({
  name, slug, category, bgClass: 'bg-white', textColor: 'text-stone-900', borderClass: 'border border-stone-200', badgeText
});

export const CATEGORY_BRAND_MAP: Record<string, BrandAvatar[]> = {
  tobacco: [
    make('MustHave', 'musthave-tobacco', 'tobacco'),
    make('BlackBurn', 'blackburn-tobacco', 'tobacco'),
    make('Bonche', 'bonche', 'tobacco'),
    make('Deus', 'deus', 'tobacco'),
    make('SEVERNYI', 'severnyi', 'tobacco'),
    make('Satyr', 'satyr', 'tobacco'),
    make('Kraken', 'kraken', 'tobacco'),
    make('Sebero', 'sebero-tobacco', 'tobacco'),
    make('Banger', 'banger-tobacco', 'tobacco'),
    make('Sarma', 'sarma-tobacco', 'tobacco'),
    make('AL Fakher', 'al-fakher-shisha', 'tobacco'),
    make('Adalya', 'adalya-tobacco', 'tobacco'),
    make('Element', 'element-tobacco', 'tobacco'),
    make('Starline', 'starline', 'tobacco'),
    make('DarkSide', 'darkside-tobacco', 'tobacco'),
    make('Sapphire Crown', 'sapphire-crown', 'tobacco'),
    make('Trofimoff’s', 'trofimoffs', 'tobacco'),
    make('Chabacco', 'chabacco', 'tobacco'),
    make('Afzal', 'afzal-tobacco', 'tobacco'),
    make('Eternal Smoke', 'eternal-smoke', 'tobacco'),
    make('Fumari', 'fumari-tobacco', 'tobacco'),
    make('Serbetli', 'serbetli-tobacco', 'tobacco'),
    make('Social Smoke', 'social-smoke', 'tobacco'),
    make('Starbuzz', 'starbuzz-tobacco', 'tobacco'),
    make('Tangiers', 'tangiers', 'tobacco'),
    make('Trifecta', 'trifecta', 'tobacco')
  ],
  hookahs: [
    make('Alpha Hookah', 'alpha-hookah', 'hookahs'),
    make('Matt Pear', 'mattpear', 'hookahs'),
    make('El Bomber Hookah', 'el-bomber', 'hookahs'),
    make('Geometry Hookah', 'geometry-hookah', 'hookahs'),
    make('Union Hookah', 'union-hookah', 'hookahs'),
    make('Hoob Hookah', 'hoob-hookah', 'hookahs'),
    make('Maklaud Hookah', 'maklaud-hookah', 'hookahs'),
    make('Hooligan Hookah', 'hooligan-hookah', 'hookahs'),
    make('Japona Hookah', 'japona-hookah', 'hookahs'),
    make('WOOKAH Hookah', 'wookah', 'hookahs'),
    make('Misha Hookah', 'misha-hookah', 'hookahs'),
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
    make('Tortuga Hookah', 'tortuga-hookah', 'hookahs'),
    make('VZ Hookah', 'vz-hookah', 'hookahs')
  ],
  bowls: [
    make('Alpha Bowls', 'alpha-bowls', 'bowls'),
    make('Cosmo Bowl', 'cosmo-bowl', 'bowls'),
    make('Oblako Bowls', 'oblako-bowls', 'bowls'),
    make('ST Bowls', 'st-bowls', 'bowls'),
    make('Element Bowls', 'element-bowls', 'bowls'),
    make('Kaloud Bowls', 'kaloud-bowls', 'bowls'),
    make('Smokelab Hookah Bowls', 'smokelab-hookah-bowls', 'bowls'),
    make('Kong Bowls', 'kong-bowls', 'bowls'),
    make('Geometry Bowl', 'geometry-bowl', 'bowls'),
    make('Conceptic Bowls', 'conceptic-bowls', 'bowls'),
    make('Don', 'don-bowls', 'bowls'),
    make('Harvik Hookah Bowls', 'harvik-hookah-bowls', 'bowls'),
    make('Big Maks Bowl', 'big-maks-bowl', 'bowls'),
    make('Japona Bowls', 'japona-bowls', 'bowls'),
    make('Joe Hookah Bowls', 'joe-hookah-bowls', 'bowls'),
    make('Kolos Hookah Bowls', 'kolos-hookah-bowls', 'bowls'),
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
    make('WOOKAH Bases', 'wookah-bases', 'bases')
  ],
  coal: [],
  accessories: [
    make('Steamulation Accessories', 'steamulation-accessories', 'accessories'),
    make('Hookah Boards', 'hookah-boards', 'accessories'),
    make('Heat Management', 'heat-management', 'accessories'),
    make('Hookah Bag', 'hookah-bag', 'accessories'),
    make('Hookah Mouthpiece', 'hookah-mouthpiece', 'accessories'),
    make('Hookah Tongs', 'hookah-tongs', 'accessories'),
    make('Other', 'other-accessories', 'accessories')
  ],
  'e-hookah': [],
  vapes: []
};

export const ALL_BRAND_BADGES: BrandAvatar[] = [
  ...CATEGORY_BRAND_MAP.tobacco.slice(0, 6),
  ...CATEGORY_BRAND_MAP.hookahs.slice(0, 6),
  ...CATEGORY_BRAND_MAP.bowls.slice(0, 6),
  ...CATEGORY_BRAND_MAP.bases.slice(0, 5),
  ...CATEGORY_BRAND_MAP.accessories.slice(0, 5)
];
