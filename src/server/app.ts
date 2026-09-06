import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import orderRoutes from './routes/order.routes.js';
import miscRoutes from './routes/misc.routes.js';
import adminRoutes from './routes/admin.routes.js';
import seoRoutes from './routes/seo.routes.js';
import { createSeoMiddleware } from './middleware/seoCrawlerMiddleware.js';

export const app = express();

// Security & standard middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false
}));

const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) 
  : true;

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-guest-id', 'Accept']
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Health & Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Fumare Hookah API Server',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/translate', async (req, res) => {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  const { texts, target } = req.body as { texts?: unknown; target?: unknown };

  if (!Array.isArray(texts) || texts.length === 0 || texts.length > 128 || typeof target !== 'string') {
    return res.status(400).json({ success: false, error: { code: 'INVALID_TRANSLATION_REQUEST', message: 'Provide 1-128 texts and a target language.' } });
  }
  if (texts.some(text => typeof text !== 'string' || text.length > 5000) || !/^[a-z]{2,3}(?:-[A-Z]{2})?$/i.test(target)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_TRANSLATION_REQUEST', message: 'Invalid text or target language.' } });
  }
  if (!apiKey) {
    return res.status(503).json({ success: false, error: { code: 'TRANSLATION_NOT_CONFIGURED', message: 'Google Translation is not configured.' } });
  }

  try {
    const upstream = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: texts, source: 'en', target: target.toLowerCase(), format: 'text' })
    });
    const payload = await upstream.json() as { data?: { translations?: Array<{ translatedText?: string }> }; error?: { message?: string } };
    if (!upstream.ok || !payload.data?.translations) {
      return res.status(502).json({ success: false, error: { code: 'TRANSLATION_PROVIDER_ERROR', message: payload.error?.message || 'Translation provider request failed.' } });
    }
    return res.json({ success: true, data: payload.data.translations.map(item => item.translatedText || '') });
  } catch {
    return res.status(502).json({ success: false, error: { code: 'TRANSLATION_PROVIDER_ERROR', message: 'Translation provider is unavailable.' } });
  }
});

// High-performance image proxy to avoid upstream 403 Forbidden hotlink blocks
app.get('/api/image-proxy', async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl || (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))) {
    return res.status(400).send('Invalid URL');
  }
  try {
    const parsed = new URL(imageUrl);
    const upstreamRes = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': `${parsed.origin}/`,
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });
    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).send('Upstream image error');
    }
    const contentType = upstreamRes.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    const buffer = await upstreamRes.arrayBuffer();
    return res.send(Buffer.from(buffer));
  } catch {
    return res.status(502).send('Failed to fetch image');
  }
});

// SEO Routes: sitemaps, robots.txt, opensearch, and SEO inspection
app.use('/', seoRoutes);

// SEO Crawler Prerendering Middleware for Search Engine Crawlers (Googlebot, Yandex, Bingbot)
app.use(createSeoMiddleware());

// Mount API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', orderRoutes); // Checkout & payments aliased
app.use('/api/admin', adminRoutes);
app.use('/api', miscRoutes); // categories, brands, wholesale, newsletter, reviews, settings

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `API endpoint '${req.method} ${req.baseUrl}' does not exist.`
    }
  });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred on the server.'
    }
  });
});

export default app;
