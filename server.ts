import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import authRoutes from './src/server/routes/auth.routes.js';
import productRoutes from './src/server/routes/product.routes.js';
import cartRoutes from './src/server/routes/cart.routes.js';
import wishlistRoutes from './src/server/routes/wishlist.routes.js';
import orderRoutes from './src/server/routes/order.routes.js';
import miscRoutes from './src/server/routes/misc.routes.js';
import adminRoutes from './src/server/routes/admin.routes.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security & standard middleware
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));

  app.use(cors({
    origin: true,
    credentials: true
  }));

  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Health & Info
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Sultan Hookah Co. API Server',
      timestamp: new Date().toISOString()
    });
  });

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

  // Vite middleware for development / static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Sultan Hookah Co.] Full-Stack Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal startup error:', err);
});
