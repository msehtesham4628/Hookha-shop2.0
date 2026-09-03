import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.BACKEND_PORT || process.env.PORT || 5000);
const HOST = '0.0.0.0';

// Informational root endpoint for standalone API service
app.get('/', (req, res) => {
  res.json({
    name: 'Fumare Hookah REST API Server',
    status: 'online',
    version: '1.0.0',
    mode: 'standalone-backend',
    documentation: 'All API routes are served under /api/*',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      categories: '/api/categories',
      brands: '/api/brands',
      cart: '/api/cart',
      wishlist: '/api/wishlist',
      orders: '/api/orders',
      auth: '/api/auth',
      admin: '/api/admin'
    },
    timestamp: new Date().toISOString()
  });
});

const server = app.listen(PORT, HOST, () => {
  console.log(`[Backend API] Standalone server running at http://${HOST}:${PORT}`);
  console.log(`[Backend API] Health check endpoint: http://${HOST}:${PORT}/api/health`);
});

// Handle graceful shutdown
const handleShutdown = (signal: string) => {
  console.log(`[Backend API] Received ${signal}, shutting down gracefully...`);
  server.close(() => {
    console.log('[Backend API] Standalone server terminated.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default server;
