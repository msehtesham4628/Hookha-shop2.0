// Neutral Fumare-branded fallback for missing catalog images.
// Production catalog images should come from the synced catalog.
export const DEFAULT_PRODUCT_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="#fafaf9"/>
  <circle cx="300" cy="280" r="190" fill="#f5f5f4" stroke="#e7e5e4" stroke-width="2"/>
  <path d="M270 105h60l-8 45h-44zM275 150h50v160h-50zM255 310h90l-12 25h-66zM255 335c0 100 20 145 45 145h0c25 0 45-45 45-145z" fill="#d6d3d1" stroke="#78716c" stroke-width="5"/>
  <text x="300" y="535" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" font-weight="800" letter-spacing="3" fill="#292524">FUMARE HOOKAH</text>
  <text x="300" y="560" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" letter-spacing="2" fill="#78716c">IMAGE UNAVAILABLE</text>
</svg>
`)}`;

/**
 * Normalizes catalog image URLs.
 * Source catalog images may be hosted by World Hookah Market, but that source
 * is never exposed as customer-facing branding. Images are proxied to avoid
 * browser hotlink/CORS problems.
 */
export function sanitizeImageUrl(url?: string): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return DEFAULT_PRODUCT_PLACEHOLDER;
  }
  if (url.startsWith('data:') || url.startsWith('/')) {
    return url;
  }

  const clean = url.replace(/-916x916(?=\.(?:jpg|jpeg|png|webp))/i, '');
  if (clean.includes('worldhookahmarket.com')) {
    const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
    const envUrl = (metaEnv?.VITE_API_BASE_URL || metaEnv?.VITE_API_URL) as string | undefined;
    const base = envUrl
      ? (envUrl.trim().replace(/\/+$/, '').endsWith('/api') ? envUrl.trim().replace(/\/+$/, '') : `${envUrl.trim().replace(/\/+$/, '')}/api`)
      : '/api';
    return `${base}/image-proxy?url=${encodeURIComponent(clean)}`;
  }
  return clean;
}
