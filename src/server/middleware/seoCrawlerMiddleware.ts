import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { db } from '../db/store.js';
import {
  SITE_DOMAIN,
  SITE_NAME,
  MARKET_KEYWORDS,
  getOrganizationSchema,
  getWebSiteSchema,
  getFAQSchema,
  getProductSchema,
  getItemListSchema,
  generateProductMeta
} from '../../shared/seoConstants.js';

export function createSeoMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only intercept HTML GET requests for storefront routes
    if (req.method !== 'GET') return next();
    
    // Ignore API, image-proxy, static assets, sitemaps, robots
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/@') ||
      req.path.startsWith('/src') ||
      req.path.startsWith('/node_modules') ||
      req.path.endsWith('.js') ||
      req.path.endsWith('.css') ||
      req.path.endsWith('.ico') ||
      req.path.endsWith('.png') ||
      req.path.endsWith('.jpg') ||
      req.path.endsWith('.jpeg') ||
      req.path.endsWith('.svg') ||
      req.path.endsWith('.webp') ||
      req.path.endsWith('.xml') ||
      req.path.endsWith('.txt') ||
      req.path.endsWith('.json')
    ) {
      return next();
    }

    // Check Accept header: only intercept if client expects HTML
    const accept = req.headers.accept || '';
    if (!accept.includes('text/html') && !accept.includes('*/*')) {
      return next();
    }

    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    const isRussianQuery = req.query.lang === 'ru' || (req.headers['accept-language'] || '').toLowerCase().includes('ru');
    const isBot = /googlebot|yandex|bingbot|baiduspider|slurp|twitterbot|facebookexternalhit|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkshare|w3c_validator|telegrambot/i.test(userAgent);

    // In development mode, only intercept known crawler bots so Vite can transform index.html for browser users
    if (process.env.NODE_ENV !== 'production' && !isBot) {
      return next();
    }

    const fullUrl = `${SITE_DOMAIN}${req.originalUrl}`;
    const cleanPath = req.path;

    let pageTitle = `${SITE_NAME} - Premier Hookahs, Shisha Tobacco, Bowls & Accessories | USA & Russia`;
    let pageDesc = 'Official master distributor for Alpha Hookah, MustHave, DarkSide, Oblako, Kong, MattPear & luxury shisha tobacco in USA & Russia. Express worldwide shipping.';
    let pageKeywords = MARKET_KEYWORDS.global.join(', ');
    let pageImage = `${SITE_DOMAIN}/logo.png`;
    let pageType = 'website';
    let schemas: any[] = [getWebSiteSchema(), getOrganizationSchema()];

    // 1. PRODUCT DETAIL PAGE (/product/:slug)
    if (cleanPath.startsWith('/product/')) {
      const slug = cleanPath.replace('/product/', '');
      const product = db.products.find(p => p.slug === slug || p.id === slug);
      if (product) {
        const meta = generateProductMeta(product);
        pageTitle = isRussianQuery ? meta.ruTitle : meta.title;
        pageDesc = isRussianQuery ? meta.ruDescription : meta.description;

        const categoryKeywords = MARKET_KEYWORDS.categories[product.categorySlug as keyof typeof MARKET_KEYWORDS.categories];
        const localizedKeywords = isRussianQuery && categoryKeywords ? categoryKeywords.ru : (categoryKeywords?.en || []);
        pageKeywords = Array.from(new Set([...meta.keywords, ...localizedKeywords, ...MARKET_KEYWORDS.global])).join(', ');

        if (product.images && product.images.length > 0) {
          pageImage = product.images[0].url;
        }
        pageType = 'product';
        schemas = [getProductSchema(product), getOrganizationSchema()];
      }
    } 
    // 2. SHOP / CATEGORY / BRAND PAGE (/shop)
    else if (cleanPath === '/shop') {
      const categoryParam = (req.query.category as string) || '';
      const brandParam = (req.query.brand as string) || '';
      const searchParam = (req.query.q || req.query.search) as string;

      if (categoryParam) {
        const category = db.categories.find(c => c.slug === categoryParam);
        const catName = category?.name || categoryParam;
        pageTitle = isRussianQuery
          ? `${catName} купить | Оригинальные кальяны и табак в США и РФ | ${SITE_NAME}`
          : `${catName} | Buy Online | Alpha Hookah, MustHave, DarkSide | ${SITE_NAME}`;
        pageDesc = isRussianQuery
          ? `Большой выбор в категории ${catName}. Официальные бренды из России, Германии и США с экспресс-доставкой. ${SITE_NAME}.`
          : `Explore premier ${catName} collection featuring Alpha Hookah, MustHave, DarkSide, Oblako and Kong. Fast USA & international delivery from ${SITE_NAME}.`;
        
        const catKeyObj = MARKET_KEYWORDS.categories[categoryParam as keyof typeof MARKET_KEYWORDS.categories];
        if (catKeyObj) {
          pageKeywords = (isRussianQuery ? catKeyObj.ru : catKeyObj.en).join(', ');
        }
        schemas = [getWebSiteSchema(), getFAQSchema()];
      } else if (brandParam) {
        const brand = db.brands.find(b => b.slug === brandParam);
        const brandName = brand?.name || brandParam;
        pageTitle = isRussianQuery
          ? `${brandName} официальный магазин | Купить с доставкой по США и РФ | ${SITE_NAME}`
          : `${brandName} Official Store | Buy Genuine Online USA & Russia | ${SITE_NAME}`;
        pageDesc = `Shop official ${brandName} products at ${SITE_NAME}. Direct factory master distribution, certified authentic, fast shipping.`;
        schemas = [getWebSiteSchema(), getFAQSchema()];
      } else if (searchParam) {
        pageTitle = `Search Results for "${searchParam}" | ${SITE_NAME}`;
        pageDesc = `Find authentic hookahs, shisha tobacco, bowls, and accessories matching "${searchParam}" at ${SITE_NAME}.`;
      }
    }
    // 3. WHOLESALE B2B (/wholesale)
    else if (cleanPath === '/wholesale') {
      pageTitle = isRussianQuery
        ? `Оптовые поставки кальянов и табака для лаунжей и шопов | ${SITE_NAME}`
        : `Hookah Lounge Wholesale & B2B Master Distributor USA & Russia | ${SITE_NAME}`;
      pageDesc = isRussianQuery
        ? `Оптовые цены на табак 1кг, угли в коробках 20кг, кальяны Alpha Hookah, MattPear и чаши для кальянных заведений по США и РФ.`
        : `Wholesale hookah lounge distributor. Master cases for 1kg shisha tins, 20kg coconut coals, Alpha Hookah and Kong bowls at tier-1 distributor prices.`;
      pageKeywords = MARKET_KEYWORDS.categories['wholesale-supplies'].en.join(', ');
      schemas = [getOrganizationSchema(), getFAQSchema()];
    }
    // 4. ABOUT (/about)
    else if (cleanPath === '/about') {
      pageTitle = `About ${SITE_NAME} | Official Master Distributor USA & Russia`;
      pageDesc = `Learn about ${SITE_NAME}, the premier bridge uniting Russian craftsmanship and global hookah enthusiasts with authentic Alpha Hookah, MustHave, DarkSide, and Oblako.`;
      schemas = [getOrganizationSchema()];
    }
    // 5. CONTACT (/contact)
    else if (cleanPath === '/contact') {
      pageTitle = `Contact Us & Concierge Support | ${SITE_NAME}`;
      pageDesc = `Contact Fumare Hookah customer concierge and international wholesale team in Miami, FL. Phone: +1-800-785-8260, Email: support@fumarehookah.com.`;
      schemas = [getOrganizationSchema()];
    }
    // 6. HOMEPAGE (/)
    else if (cleanPath === '/' || cleanPath === '') {
      pageTitle = isRussianQuery
        ? `${SITE_NAME} - Официальный магазин кальянов и табака | Доставка в США и РФ`
        : `${SITE_NAME} - Premier Hookahs, Shisha Tobacco, Bowls & Accessories`;
      pageDesc = 'The leading online store and master distributor for Alpha Hookah, MustHave, DarkSide, Oblako, Kong, MattPear, Wookah, Kaloud & premium shisha tobacco in USA & Russia.';
      schemas = [getWebSiteSchema(), getOrganizationSchema(), getFAQSchema()];
    }

    // Read index.html template and inject the metadata
    try {
      const indexPath = process.env.NODE_ENV === 'production'
        ? path.join(process.cwd(), 'dist', 'index.html')
        : path.join(process.cwd(), 'index.html');

      if (!fs.existsSync(indexPath)) {
        return next();
      }

      let html = fs.readFileSync(indexPath, 'utf-8');

      // Replace or insert Title
      html = html.replace(/<title>.*?<\/title>/i, `<title>${pageTitle}</title>`);

      // Replace or insert Meta Description
      if (html.includes('<meta name="description"')) {
        html = html.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${pageDesc}" />`);
      } else {
        html = html.replace('</head>', `  <meta name="description" content="${pageDesc}" />\n</head>`);
      }

      // Construct injected tags
      const canonicalTag = `<link rel="canonical" href="${fullUrl}" />`;
      const hreflangEn = `<link rel="alternate" hreflang="en-US" href="${fullUrl}" />`;
      const hreflangRu = `<link rel="alternate" hreflang="ru-RU" href="${fullUrl}${fullUrl.includes('?') ? '&' : '?'}lang=ru" />`;
      const hreflangDefault = `<link rel="alternate" hreflang="x-default" href="${fullUrl}" />`;

      const ogTags = `
    <meta property="og:title" content="${pageTitle}" />
    <meta property="og:description" content="${pageDesc}" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:type" content="${pageType}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:locale" content="${isRussianQuery ? 'ru_RU' : 'en_US'}" />
    <meta property="og:locale:alternate" content="${isRussianQuery ? 'en_US' : 'ru_RU'}" />
    <meta property="og:image" content="${pageImage}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${pageTitle}" />
    <meta name="twitter:description" content="${pageDesc}" />
    <meta name="twitter:image" content="${pageImage}" />
    <meta name="keywords" content="${pageKeywords}" />
    <meta name="geo.region" content="US;RU" />
    <meta name="geo.placename" content="United States; Russia" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
    <meta name="yandex" content="index, follow" />
    ${canonicalTag}
    ${hreflangEn}
    ${hreflangRu}
    ${hreflangDefault}
    <script type="application/ld+json" id="server-seo-jsonld">${JSON.stringify(schemas.length === 1 ? schemas[0] : schemas)}</script>`;

      // Insert before </head>
      html = html.replace('</head>', `${ogTags}\n</head>`);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(html);
    } catch (err) {
      console.error('[SEO Middleware Error]', err);
      return next();
    }
  };
}
