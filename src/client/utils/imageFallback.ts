// Fallback luxury hookah artifact vector SVG
export const DEFAULT_PRODUCT_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <rect width="600" height="600" fill="#fafaf9"/>
  <circle cx="300" cy="290" r="210" fill="#f5f5f4" stroke="#e7e5e4" stroke-width="1.5"/>
  <g transform="translate(300, 305) scale(0.95)" stroke="#78350f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Clay / Glazed Phunnel Bowl -->
    <path d="M-22,-175 L22,-175 L17,-150 L-17,-150 Z" fill="#92400e" stroke="#78350f" stroke-width="2.5"/>
    <ellipse cx="0" cy="-175" rx="22" ry="5" fill="#b45309" stroke="#78350f"/>
    <!-- Heat Management Device / Lotus -->
    <rect x="-15" y="-192" width="30" height="15" rx="3" fill="#d97706" fill-opacity="0.8" stroke="#b45309" stroke-width="2"/>
    <!-- Stainless Steel Tray -->
    <path d="M-65,-135 C-20,-130 20,-130 65,-135 L54,-127 C18,-123 -18,-123 -54,-127 Z" fill="#e5e7eb" stroke="#4b5563" stroke-width="2.5"/>
    <!-- Surgical Steel Column / Stem -->
    <line x1="0" y1="-127" x2="0" y2="40" stroke="#4b5563" stroke-width="8"/>
    <line x1="-2" y1="-127" x2="-2" y2="40" stroke="#9ca3af" stroke-width="2"/>
    <!-- Sleeve Accents -->
    <rect x="-8" y="-95" width="16" height="35" rx="3" fill="#78350f" stroke="#451a03" stroke-width="2"/>
    <circle cx="0" cy="-40" r="8" fill="#d97706" stroke="#b45309" stroke-width="2"/>
    <!-- Base Heart / Chamber -->
    <path d="M-20,40 L20,40 L24,52 L-24,52 Z" fill="#374151" stroke="#1f2937" stroke-width="2.5"/>
    <!-- Purge valve & Port -->
    <line x1="-16" y1="46" x2="-32" y2="38" stroke="#4b5563" stroke-width="4.5"/>
    <line x1="16" y1="46" x2="32" y2="38" stroke="#4b5563" stroke-width="4.5"/>
    <!-- Bohemian Crystal Vase -->
    <path d="M-18,52 C-18,72 -64,115 -64,152 C-64,185 -36,192 0,192 C36,192 64,185 64,152 C64,115 18,52 18,52 Z" fill="#f0f9ff" fill-opacity="0.75" stroke="#0284c7" stroke-width="3"/>
    <ellipse cx="0" cy="175" rx="38" ry="10" fill="#bae6fd" fill-opacity="0.6" stroke="none"/>
    <!-- Silicone Hose Line -->
    <path d="M32,40 C85,55 110,135 85,168 C72,180 52,165 56,145" stroke="#292524" stroke-width="4.5"/>
  </g>
  <text x="300" y="538" text-anchor="middle" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="14" font-weight="700" letter-spacing="4" fill="#78350f">FUMARE HOOKAH</text>
  <text x="300" y="558" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="600" letter-spacing="2" fill="#a8a29e">LUXURY SHISHA ARTIFACT</text>
</svg>
`)}`;

/**
 * Normalizes an image URL:
 * - strips broken WordPress -916x916 thumbnail dimensions to load the genuine full-resolution asset
 * - proxies hotlink-protected worldhookahmarket images through server
 * - provides clean fallback
 */
export function sanitizeImageUrl(url?: string): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return DEFAULT_PRODUCT_PLACEHOLDER;
  }
  if (url.startsWith('data:') || url.startsWith('/')) {
    return url;
  }
  // Remove broken WP -916x916 sizing tag
  const clean = url.replace(/-916x916(?=\.(?:jpg|jpeg|png|webp))/i, '');
  if (clean.includes('worldhookahmarket.com')) {
    return `/api/image-proxy?url=${encodeURIComponent(clean)}`;
  }
  return clean;
}
