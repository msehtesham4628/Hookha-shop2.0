import { Router } from 'express';
import { db } from '../db/store.js';
import {
  SITE_DOMAIN,
  SITE_NAME,
  MARKET_KEYWORDS,
  getOrganizationSchema,
  getWebSiteSchema,
  getFAQSchema,
  getProductSchema,
  getItemListSchema
} from '../../shared/seoConstants.js';

const router = Router();

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// 1. GET /robots.txt
router.get('/robots.txt', (req, res) => {
  const robotsTxt = `# Fumare Hookah Robots Directives for Global, USA & Russian Search Engines
# Optimizations for Googlebot, YandexBot, Bingbot, Baiduspider

User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard
Disallow: /admin
Disallow: /checkout
Disallow: /account
Disallow: /auth/

# USA Search Engines (Google & Bing)
User-agent: Googlebot
User-agent: Googlebot-Image
User-agent: Bingbot
Allow: /
Disallow: /api/
Disallow: /dashboard
Disallow: /admin
Disallow: /checkout
Disallow: /account

# Russian Search Engine Directives (Yandex)
User-agent: Yandex
User-agent: YandexBot
User-agent: YandexImages
Allow: /
Disallow: /api/
Disallow: /dashboard
Disallow: /admin
Disallow: /checkout
Disallow: /account
Clean-param: ref&source&utm_source&utm_medium&utm_campaign&utm_content&utm_term&gclid&fbclid&yclid /
Host: https://fumarehookah.com

# XML Sitemaps
Sitemap: ${SITE_DOMAIN}/sitemap.xml
Sitemap: ${SITE_DOMAIN}/sitemap-products.xml
Sitemap: ${SITE_DOMAIN}/sitemap-categories.xml
Sitemap: ${SITE_DOMAIN}/sitemap-brands.xml
Sitemap: ${SITE_DOMAIN}/sitemap-main.xml
`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  return res.send(robotsTxt);
});

// 2. GET /sitemap.xml (Sitemap Index)
router.get('/sitemap.xml', (req, res) => {
  const now = new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_DOMAIN}/sitemap-main.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_DOMAIN}/sitemap-categories.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_DOMAIN}/sitemap-products.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_DOMAIN}/sitemap-brands.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.send(xml);
});

// 3. GET /sitemap-main.xml (Main & Static Pages)
router.get('/sitemap-main.xml', (req, res) => {
  const now = new Date().toISOString();
  const staticRoutes = [
    { path: '', changefreq: 'daily', priority: '1.0' },
    { path: 'shop', changefreq: 'daily', priority: '0.95' },
    { path: 'wholesale', changefreq: 'weekly', priority: '0.85' },
    { path: 'about', changefreq: 'monthly', priority: '0.70' },
    { path: 'contact', changefreq: 'monthly', priority: '0.70' }
  ];

  const urlsXml = staticRoutes
    .map(route => {
      const fullUrl = route.path ? `${SITE_DOMAIN}/${route.path}` : `${SITE_DOMAIN}/`;
      const ruUrl = route.path ? `${SITE_DOMAIN}/${route.path}?lang=ru` : `${SITE_DOMAIN}/?lang=ru`;
      return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en-US" href="${fullUrl}" xmlns:xhtml="http://www.w3.org/1999/xhtml" />
    <xhtml:link rel="alternate" hreflang="ru-RU" href="${ruUrl}" xmlns:xhtml="http://www.w3.org/1999/xhtml" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${fullUrl}" xmlns:xhtml="http://www.w3.org/1999/xhtml" />
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlsXml}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.send(xml);
});

// 4. GET /sitemap-products.xml (Every Product with Images & Multi-Region Alternates)
router.get('/sitemap-products.xml', (req, res) => {
  const activeProducts = db.products.filter(p => p.isActive);
  
  const urlsXml = activeProducts
    .map(product => {
      const fullUrl = `${SITE_DOMAIN}/product/${product.slug}`;
      const ruUrl = `${SITE_DOMAIN}/product/${product.slug}?lang=ru`;
      const lastMod = product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString();
      const primaryImage = product.images?.[0]?.url;

      let imageXml = '';
      if (primaryImage) {
        imageXml = `
    <image:image xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
      <image:loc>${escapeXml(primaryImage)}</image:loc>
      <image:title>${escapeXml(product.name)}</image:title>
      <image:caption>${escapeXml(product.shortDescription || `${product.name} - official distributor item at Fumare Hookah`)}</image:caption>
    </image:image>`;
      }

      return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.90</priority>
    <xhtml:link rel="alternate" hreflang="en-US" href="${fullUrl}" xmlns:xhtml="http://www.w3.org/1999/xhtml" />
    <xhtml:link rel="alternate" hreflang="ru-RU" href="${ruUrl}" xmlns:xhtml="http://www.w3.org/1999/xhtml" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${fullUrl}" xmlns:xhtml="http://www.w3.org/1999/xhtml" />${imageXml}
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlsXml}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.send(xml);
});

// 5. GET /sitemap-categories.xml (Every Category)
router.get('/sitemap-categories.xml', (req, res) => {
  const activeCategories = db.categories.filter(c => c.isActive);
  const now = new Date().toISOString();

  const urlsXml = activeCategories
    .map(category => {
      const fullUrl = `${SITE_DOMAIN}/shop?category=${category.slug}`;
      const ruUrl = `${SITE_DOMAIN}/shop?category=${category.slug}&amp;lang=ru`;
      return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
    <xhtml:link rel="alternate" hreflang="en-US" href="${fullUrl}" xmlns:xhtml="http://www.w3.org/1999/xhtml" />
    <xhtml:link rel="alternate" hreflang="ru-RU" href="${ruUrl}" xmlns:xhtml="http://www.w3.org/1999/xhtml" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${fullUrl}" xmlns:xhtml="http://www.w3.org/1999/xhtml" />
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlsXml}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.send(xml);
});

// 6. GET /sitemap-brands.xml (Every Brand)
router.get('/sitemap-brands.xml', (req, res) => {
  const activeBrands = db.brands.filter(b => b.isActive);
  const now = new Date().toISOString();

  const urlsXml = activeBrands
    .map(brand => {
      const fullUrl = `${SITE_DOMAIN}/shop?brand=${brand.slug}`;
      const ruUrl = `${SITE_DOMAIN}/shop?brand=${brand.slug}&amp;lang=ru`;
      return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
    <xhtml:link rel="alternate" hreflang="en-US" href="${fullUrl}" xmlns:xhtml="http://www.w3.org/1999/xhtml" />
    <xhtml:link rel="alternate" hreflang="ru-RU" href="${ruUrl}" xmlns:xhtml="http://www.w3.org/1999/xhtml" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${fullUrl}" xmlns:xhtml="http://www.w3.org/1999/xhtml" />
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlsXml}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.send(xml);
});

// 7. GET /opensearch.xml (Browser & Search Engine OpenSearch Integration)
router.get('/opensearch.xml', (req, res) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>${SITE_NAME}</ShortName>
  <Description>Search premier Russian hookahs, shisha tobacco, bowls &amp; accessories on Fumare Hookah</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Image width="16" height="16" type="image/x-icon">${SITE_DOMAIN}/favicon.ico</Image>
  <Url type="text/html" template="${SITE_DOMAIN}/shop?q={searchTerms}" />
</OpenSearchDescription>`;

  res.setHeader('Content-Type', 'application/opensearchdescription+xml; charset=utf-8');
  return res.send(xml);
});

// 8. GET /api/seo/metadata (Inspect or scrape SEO data dynamically)
router.get('/api/seo/metadata', (req, res) => {
  const urlPath = (req.query.path as string) || '/';
  const cleanPath = urlPath.split('?')[0];

  if (cleanPath.startsWith('/product/')) {
    const slug = cleanPath.replace('/product/', '');
    const product = db.products.find(p => p.slug === slug || p.id === slug);
    if (product) {
      return res.json({
        success: true,
        data: {
          title: `${product.name} | Buy Online USA & Russia | ${SITE_NAME}`,
          ruTitle: `Купить ${product.name} оригинальный кальян/табак | ${SITE_NAME}`,
          description: product.description.slice(0, 200),
          ruDescription: `Заказать оригинальный ${product.name} от официального дистрибьютора с экспресс доставкой по США и РФ.`,
          canonicalUrl: `${SITE_DOMAIN}/product/${product.slug}`,
          jsonLd: getProductSchema(product)
        }
      });
    }
  }

  return res.json({
    success: true,
    data: {
      title: `${SITE_NAME} - Premier Hookahs, Shisha Tobacco, Bowls & Accessories`,
      description: 'Official master distributor for Alpha Hookah, MustHave, DarkSide, Oblako, Kong, MattPear & luxury shisha tobacco.',
      canonicalUrl: `${SITE_DOMAIN}${cleanPath}`,
      jsonLd: [getWebSiteSchema(), getOrganizationSchema(), getFAQSchema()]
    }
  });
});

export default router;
