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

export const CATEGORY_BRAND_MAP: Record<string, BrandAvatar[]> = {
  tobacco: [
    { name: 'MustHave Tobacco', slug: 'musthave-tobacco', category: 'tobacco', bgClass: 'bg-stone-900', textColor: 'text-amber-400', badgeText: 'MUSTHAVE', origin: 'RU' },
    { name: 'DarkSide Tobacco', slug: 'darkside-tobacco', category: 'tobacco', bgClass: 'bg-stone-950', textColor: 'text-stone-100', badgeText: 'DARKSIDE', origin: 'RU' },
    { name: 'BlackBurn Tobacco', slug: 'blackburn-tobacco', category: 'tobacco', bgClass: 'bg-red-950', textColor: 'text-red-400', badgeText: 'BLACKBURN', origin: 'RU' },
    { name: 'Bonche Tobacco', slug: 'bonche-tobacco', category: 'tobacco', bgClass: 'bg-stone-800', textColor: 'text-amber-200', badgeText: 'BONCHE', origin: 'RU' },
    { name: 'Tangiers Tobacco', slug: 'tangiers-tobacco', category: 'tobacco', bgClass: 'bg-amber-950', textColor: 'text-amber-300', badgeText: 'TANGIERS', origin: 'US' },
    { name: 'Chabacco Hookah', slug: 'chabacco', category: 'tobacco', bgClass: 'bg-stone-900', textColor: 'text-emerald-400', badgeText: 'CHABACCO', origin: 'RU' },
    { name: 'Spectrum Tobacco', slug: 'spectrum-tobacco', category: 'tobacco', bgClass: 'bg-purple-950', textColor: 'text-purple-300', badgeText: 'SPECTRUM', origin: 'RU' },
    { name: 'Overdose Tobacco', slug: 'overdose-tobacco', category: 'tobacco', bgClass: 'bg-stone-900', textColor: 'text-rose-500', badgeText: 'OVERDOSE', origin: 'RU' },
    { name: 'Sapphire Crown', slug: 'sapphire-crown', category: 'tobacco', bgClass: 'bg-blue-950', textColor: 'text-blue-300', badgeText: 'SAPPHIRE', origin: 'RU' },
    { name: 'Sebero Tobacco', slug: 'sebero-tobacco', category: 'tobacco', bgClass: 'bg-emerald-950', textColor: 'text-emerald-300', badgeText: 'SEBERO', origin: 'RU' },
    { name: 'Starbuzz Tobacco', slug: 'starbuzz-tobacco', category: 'tobacco', bgClass: 'bg-red-900', textColor: 'text-white', badgeText: 'STARBUZZ', origin: 'US' },
    { name: 'Al Fakher Shisha', slug: 'al-fakher-shisha', category: 'tobacco', bgClass: 'bg-red-600', textColor: 'text-white', badgeText: 'AL FAKHER', origin: 'UAE' },
    { name: 'Fumari Tobacco', slug: 'fumari-tobacco', category: 'tobacco', bgClass: 'bg-teal-900', textColor: 'text-teal-200', badgeText: 'FUMARI', origin: 'US' },
    { name: 'Adalya Tobacco', slug: 'adalya-tobacco', category: 'tobacco', bgClass: 'bg-red-900', textColor: 'text-white', badgeText: 'ADALYA', origin: 'TR' },
    { name: 'Serbetli tobacco', slug: 'serbetli-tobacco', category: 'tobacco', bgClass: 'bg-rose-50', textColor: 'text-rose-800', borderClass: 'border border-rose-200', badgeText: 'Serbetli', origin: 'TR' },
    { name: 'Banger Hookah Tobacco', slug: 'banger-tobacco', category: 'tobacco', bgClass: 'bg-amber-900', textColor: 'text-amber-100', badgeText: 'BANGER', origin: 'RU' },
    { name: 'Element Tobacco', slug: 'element-tobacco', category: 'tobacco', bgClass: 'bg-cyan-900', textColor: 'text-cyan-100', badgeText: 'ELEMENT', origin: 'RU' }
  ],
  hookahs: [
    { name: 'Alpha Hookah', slug: 'alpha-hookah', category: 'hookahs', bgClass: 'bg-white', textColor: 'text-stone-900', borderClass: 'border border-stone-300 shadow-xs', badgeText: 'ALPHA', origin: 'RU' },
    { name: 'El Bomber Hookah', slug: 'el-bomber', category: 'hookahs', bgClass: 'bg-stone-900', textColor: 'text-red-500', badgeText: 'EL BOMBER', origin: 'RU' },
    { name: 'MattPear Hookah', slug: 'mattpear', category: 'hookahs', bgClass: 'bg-emerald-900', textColor: 'text-emerald-100', badgeText: 'MATTPEAR', origin: 'RU' },
    { name: 'Maklaud Hookah', slug: 'maklaud-hookah', category: 'hookahs', bgClass: 'bg-stone-950', textColor: 'text-amber-400', badgeText: 'MAKLAUD', origin: 'RU' },
    { name: 'WOOKAH Hookah', slug: 'wookah', category: 'hookahs', bgClass: 'bg-amber-900', textColor: 'text-amber-100', badgeText: 'WOOKAH', origin: 'PL' },
    { name: 'Japona Hookah', slug: 'japona-hookah', category: 'hookahs', bgClass: 'bg-stone-800', textColor: 'text-stone-100', badgeText: 'JAPONA', origin: 'RU' },
    { name: 'Steamulation Hookah', slug: 'steamulation-hookah', category: 'hookahs', bgClass: 'bg-slate-100', textColor: 'text-slate-900', borderClass: 'border border-slate-300', badgeText: 'STEAM', origin: 'DE' }
  ],
  bowls: [
    { name: 'Oblako bowls', slug: 'oblako-bowls', category: 'bowls', bgClass: 'bg-sky-50', textColor: 'text-sky-800', borderClass: 'border border-sky-300', badgeText: 'OBLAKO', origin: 'RU' },
    { name: 'Kong Bowls', slug: 'kong-bowls', category: 'bowls', bgClass: 'bg-orange-950', textColor: 'text-orange-400', badgeText: 'KONG', origin: 'RU' },
    { name: 'Alpaca Bowls', slug: 'alpaca-bowls', category: 'bowls', bgClass: 'bg-stone-800', textColor: 'text-stone-100', badgeText: 'ALPACA', origin: 'US' },
    { name: 'Solaris Bowls', slug: 'solaris-bowls', category: 'bowls', bgClass: 'bg-indigo-900', textColor: 'text-indigo-200', badgeText: 'SOLARIS', origin: 'UA' },
    { name: 'Target Bowls', slug: 'target-bowls', category: 'bowls', bgClass: 'bg-rose-950', textColor: 'text-rose-300', badgeText: 'TARGET', origin: 'RU' }
  ],
  bases: [
    { name: 'Caesar Crystal', slug: 'caesar-crystal', category: 'bases', bgClass: 'bg-blue-950', textColor: 'text-blue-200', badgeText: 'CAESAR', origin: 'CZ' },
    { name: 'Craft Glass', slug: 'craft-glass', category: 'bases', bgClass: 'bg-stone-800', textColor: 'text-amber-300', badgeText: 'CRAFT', origin: 'RU' },
    { name: 'WOOKAH Crystal', slug: 'wookah', category: 'bases', bgClass: 'bg-amber-900', textColor: 'text-amber-100', badgeText: 'WOOKAH', origin: 'PL' }
  ],
  coal: [
    { name: 'Coco Loco', slug: 'coco-loco', category: 'coal', bgClass: 'bg-stone-900', textColor: 'text-amber-400', badgeText: 'COCO LOCO', origin: 'ID' },
    { name: 'One Nation', slug: 'one-nation', category: 'coal', bgClass: 'bg-red-950', textColor: 'text-red-200', badgeText: '1 NATION', origin: 'DE' },
    { name: 'Oasis Charcoal', slug: 'oasis-charcoal', category: 'coal', bgClass: 'bg-emerald-900', textColor: 'text-emerald-100', badgeText: 'OASIS', origin: 'ID' }
  ],
  accessories: [
    { name: 'Kaloud', slug: 'kaloud', category: 'accessories', bgClass: 'bg-white', textColor: 'text-stone-950', borderClass: 'border border-stone-300', badgeText: 'KALOUD', origin: 'US' },
    { name: 'Na Grani HMD', slug: 'na-grani', category: 'accessories', bgClass: 'bg-stone-900', textColor: 'text-stone-200', badgeText: 'NA GRANI', origin: 'RU' },
    { name: 'Blade Hookah', slug: 'blade-hookah', category: 'accessories', bgClass: 'bg-purple-950', textColor: 'text-purple-200', badgeText: 'BLADE', origin: 'RU' },
    { name: 'Alpha Tongs', slug: 'alpha-hookah', category: 'accessories', bgClass: 'bg-stone-800', textColor: 'text-amber-400', badgeText: 'ALPHA', origin: 'RU' }
  ],
  'e-hookah': [
    { name: 'Ooka', slug: 'ooka', category: 'e-hookah', bgClass: 'bg-stone-950', textColor: 'text-cyan-400', badgeText: 'OOKA', origin: 'UAE' },
    { name: 'Aspire Proteus', slug: 'aspire-proteus', category: 'e-hookah', bgClass: 'bg-orange-950', textColor: 'text-orange-300', badgeText: 'ASPIRE', origin: 'CN' },
    { name: 'Kangerm', slug: 'kangerm', category: 'e-hookah', bgClass: 'bg-stone-900', textColor: 'text-blue-400', badgeText: 'KANGERM', origin: 'GL' },
    { name: 'Starbuzz', slug: 'starbuzz', category: 'e-hookah', bgClass: 'bg-red-900', textColor: 'text-white', badgeText: 'STARBUZZ', origin: 'US' },
    { name: 'Enso', slug: 'enso', category: 'e-hookah', bgClass: 'bg-zinc-900', textColor: 'text-teal-300', badgeText: 'ENSO', origin: 'US' },
    { name: 'Kori', slug: 'kori', category: 'e-hookah', bgClass: 'bg-indigo-950', textColor: 'text-indigo-300', badgeText: 'KORI', origin: 'GL' }
  ],
  vapes: [
    { name: 'Al Fakher Vapes', slug: 'al-fakher-vapes', category: 'vapes', bgClass: 'bg-red-600', textColor: 'text-white', badgeText: 'AL FAKHER', origin: 'UAE' },
    { name: 'Geek Bar', slug: 'geek-bar', category: 'vapes', bgClass: 'bg-indigo-900', textColor: 'text-cyan-300', badgeText: 'GEEK BAR', origin: 'CN' },
    { name: 'Lost Mary', slug: 'lost-mary', category: 'vapes', bgClass: 'bg-rose-900', textColor: 'text-rose-100', badgeText: 'LOST MARY', origin: 'CN' },
    { name: 'Vaporesso', slug: 'vaporesso', category: 'vapes', bgClass: 'bg-blue-900', textColor: 'text-blue-100', badgeText: 'VAPORESSO', origin: 'CN' },
    { name: 'GeekVape', slug: 'geekvape', category: 'vapes', bgClass: 'bg-amber-600', textColor: 'text-white', badgeText: 'GEEKVAPE', origin: 'CN' },
    { name: 'Elf Bar', slug: 'elf-bar', category: 'vapes', bgClass: 'bg-purple-900', textColor: 'text-purple-100', badgeText: 'ELF BAR', origin: 'CN' },
    { name: 'Nasty Juice', slug: 'nasty-juice', category: 'vapes', bgClass: 'bg-emerald-950', textColor: 'text-emerald-300', badgeText: 'NASTY', origin: 'MY' },
    { name: 'SMOK', slug: 'smok', category: 'vapes', bgClass: 'bg-stone-900', textColor: 'text-red-500', badgeText: 'SMOK', origin: 'CN' }
  ],
  'wholesale-supplies': [
    { name: 'MustHave 1KG', slug: 'musthave-tobacco', category: 'wholesale-supplies', bgClass: 'bg-stone-900', textColor: 'text-amber-400', badgeText: 'MUSTHAVE 1KG', origin: 'RU' },
    { name: 'Coco Loco 20KG', slug: 'coco-loco', category: 'wholesale-supplies', bgClass: 'bg-stone-900', textColor: 'text-amber-400', badgeText: 'COCO 20KG', origin: 'ID' },
    { name: 'DarkSide 1KG', slug: 'darkside-tobacco', category: 'wholesale-supplies', bgClass: 'bg-stone-950', textColor: 'text-stone-100', badgeText: 'DARKSIDE 1KG', origin: 'RU' },
    { name: 'Crown Coal 20KG', slug: 'one-nation', category: 'wholesale-supplies', bgClass: 'bg-red-950', textColor: 'text-red-200', badgeText: 'CROWN 20KG', origin: 'DE' }
  ]
};

export const ALL_BRAND_BADGES: BrandAvatar[] = [
  ...CATEGORY_BRAND_MAP.tobacco.slice(0, 6),
  ...CATEGORY_BRAND_MAP.hookahs.slice(0, 5),
  ...CATEGORY_BRAND_MAP.bowls.slice(0, 4),
  ...CATEGORY_BRAND_MAP.coal.slice(0, 3),
  ...CATEGORY_BRAND_MAP.accessories.slice(0, 3)
];
