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
import {
  generateUnifiedSitemapXml,
  generateProductsSitemapXml,
  generateBrandsSitemapXml,
  generateCategoriesSitemapXml,
  generateMainPagesSitemapXml,
  generateSitemapIndexXml,
  invalidateSitemapCache
} from '../services/sitemap.service.js';

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

# XML Sitemaps for Google, Bing, Yandex & Baidu
Sitemap: ${SITE_DOMAIN}/sitemap.xml
Sitemap: ${SITE_DOMAIN}/sitemap-all.xml
Sitemap: ${SITE_DOMAIN}/sitemap-index.xml
Sitemap: ${SITE_DOMAIN}/sitemap-products.xml
Sitemap: ${SITE_DOMAIN}/sitemap-categories.xml
Sitemap: ${SITE_DOMAIN}/sitemap-brands.xml
Sitemap: ${SITE_DOMAIN}/sitemap-main.xml
`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  return res.send(robotsTxt);
});

// 2. GET /sitemap.xml & /sitemap-all.xml & /api/sitemap.xml
// Primary server-side route that generates an XML sitemap of all existing products, brands, and categories
const handleUnifiedSitemap = (req: any, res: any) => {
  // Support format=index if a crawler specifically requests sitemap index
  if (req.query.format === 'index' || req.query.type === 'index') {
    const xml = generateSitemapIndexXml(SITE_DOMAIN);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(xml);
  }

  const forceFresh = req.query.refresh === '1' || req.query.refresh === 'true';
  const { xml, count } = generateUnifiedSitemapXml(SITE_DOMAIN, forceFresh);

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.setHeader('X-Total-Urls', String(count));
  return res.send(xml);
};

router.get('/sitemap.xml', handleUnifiedSitemap);
router.get('/sitemap-all.xml', handleUnifiedSitemap);
router.get('/api/sitemap.xml', handleUnifiedSitemap);

// 3. GET /sitemap-index.xml (Sitemap Index)
router.get('/sitemap-index.xml', (req, res) => {
  const xml = generateSitemapIndexXml(SITE_DOMAIN);
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.send(xml);
});

// 4. GET /sitemap-main.xml (Main & Static Pages)
router.get('/sitemap-main.xml', (req, res) => {
  const forceFresh = req.query.refresh === '1' || req.query.refresh === 'true';
  const { xml, count } = generateMainPagesSitemapXml(SITE_DOMAIN, forceFresh);
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('X-Total-Urls', String(count));
  return res.send(xml);
});

// 5. GET /sitemap-products.xml (Every Product with Images & Multi-Region Alternates)
router.get('/sitemap-products.xml', (req, res) => {
  const forceFresh = req.query.refresh === '1' || req.query.refresh === 'true';
  const { xml, count } = generateProductsSitemapXml(SITE_DOMAIN, forceFresh);
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('X-Total-Urls', String(count));
  return res.send(xml);
});

// 6. GET /sitemap-categories.xml (Every Category: Clean & Shop routes)
router.get('/sitemap-categories.xml', (req, res) => {
  const forceFresh = req.query.refresh === '1' || req.query.refresh === 'true';
  const { xml, count } = generateCategoriesSitemapXml(SITE_DOMAIN, forceFresh);
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('X-Total-Urls', String(count));
  return res.send(xml);
});

// 7. GET /sitemap-brands.xml (Every Brand: Hub, Category-Nested & Shop routes)
router.get('/sitemap-brands.xml', (req, res) => {
  const forceFresh = req.query.refresh === '1' || req.query.refresh === 'true';
  const { xml, count } = generateBrandsSitemapXml(SITE_DOMAIN, forceFresh);
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('X-Total-Urls', String(count));
  return res.send(xml);
});

// 8. GET /api/seo/sitemap-stats (Inspect sitemap metrics and trigger fresh regeneration)
router.get('/api/seo/sitemap-stats', (req, res) => {
  if (req.query.refresh === '1' || req.query.refresh === 'true') {
    invalidateSitemapCache();
  }

  const { count: totalUrls } = generateUnifiedSitemapXml(SITE_DOMAIN, false);
  const activeProducts = db.products.filter(p => p.isActive !== false && !db.isProductDeleted(p.id));
  const activeCategories = db.categories.filter(c => c.isActive !== false && !db.isCategoryDeleted(c.id || c.slug));
  const activeBrands = db.brands.filter(b => b.isActive !== false && !db.isBrandDeleted(b.id || b.slug));

  return res.json({
    success: true,
    data: {
      siteDomain: SITE_DOMAIN,
      totalSitemapUrls: totalUrls,
      metrics: {
        activeProducts: activeProducts.length,
        activeCategories: activeCategories.length,
        activeBrands: activeBrands.length
      },
      sitemapEndpoints: {
        all: `${SITE_DOMAIN}/sitemap.xml`,
        unifiedDirect: `${SITE_DOMAIN}/sitemap-all.xml`,
        index: `${SITE_DOMAIN}/sitemap-index.xml`,
        products: `${SITE_DOMAIN}/sitemap-products.xml`,
        categories: `${SITE_DOMAIN}/sitemap-categories.xml`,
        brands: `${SITE_DOMAIN}/sitemap-brands.xml`,
        mainPages: `${SITE_DOMAIN}/sitemap-main.xml`
      }
    }
  });
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
