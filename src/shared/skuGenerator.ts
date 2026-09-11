/**
 * Common brand abbreviation mappings for high-end shisha & hookah brands.
 */
const BRAND_CODE_MAP: Record<string, string> = {
  'ALPHA HOOKAH': 'AH',
  'ALPHABOWL': 'AB',
  'MATTPEAR': 'MP',
  'MATT PEAR': 'MP',
  'BLACKBURN': 'BB',
  'BLACKBURN TOBACCO': 'BB',
  'BLACK BURN': 'BB',
  'DARKSIDE': 'DS',
  'DARK SIDE': 'DS',
  'MUSTHAVE': 'MH',
  'MUST HAVE': 'MH',
  'STEAMULATION': 'STM',
  'WOOKAH': 'WK',
  'TANGIERS': 'TAN',
  'OBLAKO': 'OBL',
  'KONG': 'KNG',
  'WERKBUND': 'WB',
  'KALOUD': 'KLD',
  'ELEMENT': 'ELM',
  'FUMARE': 'FM',
  'FUMARE RESERVE': 'FM',
  'SULTAN': 'SH',
  'SULTAN HOOKAH': 'SH',
  'STARBUZZ': 'SB',
  'AL FAKHER': 'AF',
  'NAKHLA': 'NKH',
  'FUMARI': 'FMR',
  'HOOB': 'HB',
  'MAKLAUD': 'MK',
  'MIG': 'MIG',
  'DOOSHA': 'DSH',
  'NA GRANI': 'NG',
  'VZ HOOKAH': 'VZ',
  'MEXANIKA': 'MEX',
  'UNION HOOKAH': 'UH',
  'BOMBA': 'BMB'
};

/**
 * Derives a 2 to 4 letter uppercase code from a brand name.
 */
export function getBrandCode(brand: string): string {
  const trimmed = (brand || '').trim();
  if (!trimmed) return 'FM';

  const upper = trimmed.toUpperCase();
  if (BRAND_CODE_MAP[upper]) {
    return BRAND_CODE_MAP[upper];
  }

  // Check partial key matches
  for (const [key, code] of Object.entries(BRAND_CODE_MAP)) {
    if (upper.includes(key) || key.includes(upper)) {
      return code;
    }
  }

  // Split into words
  const words = trimmed.split(/[\s\-_/]+/).filter(Boolean);

  if (words.length >= 2) {
    // E.g. "Royal Smoke" -> "RS", "Ocean Hookah Classic" -> "OHC"
    const initials = words.slice(0, 3).map(w => w.replace(/[^A-Za-z0-9]/g, '')[0] || '').join('').toUpperCase();
    if (initials.length >= 2) return initials;
  }

  const singleWord = words[0] || trimmed;
  // Check PascalCase / camelCase: e.g. "MattPear" -> ["Matt", "Pear"] -> "MP"
  const camelTokens = singleWord.match(/[A-Z][a-z0-9]*/g);
  if (camelTokens && camelTokens.length >= 2) {
    return camelTokens.slice(0, 3).map(t => t[0]).join('').toUpperCase();
  }

  // Extract alphanumeric letters
  const alphanumeric = singleWord.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (alphanumeric.length <= 3) {
    return alphanumeric || 'FM';
  }

  // First 3 characters
  return alphanumeric.slice(0, 3);
}

/**
 * Derives a clean, readable model slug from product title (e.g. "Model X" -> "MODELX").
 */
export function getModelSlug(name: string, brand?: string): string {
  let cleanName = (name || '').trim();
  if (!cleanName) return 'ITEM';

  // If brand is present in the beginning of the product title, strip it to prevent duplicate codes
  if (brand && brand.trim()) {
    const brandTrimmed = brand.trim();
    const brandRegex = new RegExp(`^${brandTrimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\-_:]*`, 'i');
    cleanName = cleanName.replace(brandRegex, '').trim();

    // Also check brand words (e.g. "Alpha Hookah" -> strip "Alpha" if it starts the title)
    const firstBrandWord = brandTrimmed.split(/\s+/)[0];
    if (firstBrandWord && firstBrandWord.length > 3) {
      const firstWordRegex = new RegExp(`^${firstBrandWord}[\\s\\-_:]*`, 'i');
      cleanName = cleanName.replace(firstWordRegex, '').trim();
    }
  }

  // Strip generic leading prefixes like "The ", "#"
  cleanName = cleanName.replace(/^(the|hookah|shisha)\s+/i, '').trim();

  // Normalize separators, remove brackets, weights, and non-alphanumeric punctuation
  const tokens = cleanName
    .replace(/[–—\-_/\\()\[\]{}|#+&*,.:;'"!?]/g, ' ')
    .replace(/[^A-Za-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) {
    return 'ITEM';
  }

  // If 1 token: e.g. "Beat" -> "BEAT"
  if (tokens.length === 1) {
    return tokens[0].slice(0, 8).toUpperCase();
  }

  // If 2 tokens: e.g. "Model X" -> "MODELX"
  if (tokens.length === 2) {
    const joined = (tokens[0] + tokens[1]).toUpperCase();
    if (joined.length <= 10) {
      return joined;
    }
    return `${tokens[0].slice(0, 5)}-${tokens[1].slice(0, 4)}`.toUpperCase();
  }

  // If 3+ tokens:
  // Check if first two tokens are short like "Model X" or "Cane Mint"
  const firstTwoJoined = (tokens[0] + tokens[1]).toUpperCase();
  if (firstTwoJoined.length <= 8) {
    return firstTwoJoined;
  }

  // Otherwise create a structured slug from prominent tokens: e.g. "ANANAS-SHK"
  const part1 = tokens[0].slice(0, 6).toUpperCase();
  const part2 = tokens[1].slice(0, 4).toUpperCase();
  return `${part1}-${part2}`;
}

export interface SkuProductItem {
  id?: string;
  sku?: string;
}

/**
 * Generates a unique, slug-based SKU (e.g., AH-MODELX-001) based on product name and brand.
 * Automatically checks existing catalog products to guarantee uniqueness by incrementing sequence.
 */
export function generateUniqueSku(
  name: string,
  brand: string,
  existingProducts: SkuProductItem[] = [],
  currentProductId?: string
): string {
  const brandCode = getBrandCode(brand);
  const modelSlug = getModelSlug(name, brand);
  const basePrefix = `${brandCode}-${modelSlug}`.toUpperCase();

  // Collect all existing SKUs, ignoring the product currently being edited
  const existingSkuSet = new Set(
    existingProducts
      .filter(p => !currentProductId || p.id !== currentProductId)
      .map(p => (p.sku || '').trim().toUpperCase())
      .filter(Boolean)
  );

  let sequence = 1;
  let candidate = `${basePrefix}-${String(sequence).padStart(3, '0')}`;

  // Find next non-colliding sequence
  while (existingSkuSet.has(candidate)) {
    sequence++;
    candidate = `${basePrefix}-${String(sequence).padStart(3, '0')}`;
  }

  return candidate;
}
