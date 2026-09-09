import app from '../src/server/app.js';
import { db } from '../src/server/db/store.js';
import { mongoService } from '../src/server/db/mongodb.js';

// MongoDB hydration is deliberately NOT awaited for every request.
// The store initializes its local seed/catalog synchronously and starts cloud
// hydration in the background. Waiting for a full Mongo sync on login/product
// requests can exceed Vercel's function timeout because syncWithStore also
// refreshes many collections and indexes.
let adminDbSyncPromise: Promise<boolean> | null = null;

async function ensureAdminDatabaseReady(): Promise<boolean> {
  if (!process.env.MONGODB_URI) return false;

  if (!adminDbSyncPromise) {
    adminDbSyncPromise = (async () => {
      const connected = await mongoService.connect();
      if (!connected) return false;

      const summary = await mongoService.syncWithStore(db);
      const status = mongoService.getStatus();
      if (!status.isConnected) return false;

      console.log('[Vercel Serverless] Admin MongoDB hydration complete:', summary.summary);
      return true;
    })().catch((err) => {
      console.warn('[Vercel Serverless] Admin MongoDB hydration notice:', err);
      adminDbSyncPromise = null;
      return false;
    });
  }

  return adminDbSyncPromise;
}

export default async function vercelApiHandler(req: any, res: any) {
  // IMPORTANT: do not await db.ready here. DatabaseStore seeds users and the
  // local catalog before its MongoDB hydration await point. Public/auth routes
  // must remain available even when Atlas is slow or temporarily unavailable.
  // Admin APIs below explicitly wait for MongoDB when persistence is required.

  // Handle URL reconstruction from Vercel rewrites or direct API requests.
  const queryPath = typeof req.query?.path === 'string' ? req.query.path : '';
  let normalizedRequestPath = '';

  if (queryPath) {
    const normalizedPath = queryPath.startsWith('/') ? queryPath : `/${queryPath}`;
    normalizedRequestPath = `/api${normalizedPath}`;
    const requestUrl = new URL(req.url || '/', 'http://vercel.local');
    requestUrl.searchParams.delete('path');
    req.url = `${normalizedRequestPath}${requestUrl.search || ''}`;
  } else if (req.url && (req.url === '/api/index' || req.url.startsWith('/api/index?'))) {
    const requestUrl = new URL(req.url, 'http://vercel.local');
    const param = requestUrl.searchParams.get('path');
    if (param) {
      requestUrl.searchParams.delete('path');
      const normalizedPath = param.startsWith('/') ? param : `/${param}`;
      normalizedRequestPath = `/api${normalizedPath}`;
      req.url = `${normalizedRequestPath}${requestUrl.search || ''}`;
    } else {
      normalizedRequestPath = '/api/health';
      req.url = `/api/health${requestUrl.search || ''}`;
    }
  } else if (req.url && !req.url.startsWith('/api')) {
    const normalized = req.url.startsWith('/') ? req.url : `/${req.url}`;
    normalizedRequestPath = `/api${normalized}`;
    req.url = normalizedRequestPath;
  } else {
    normalizedRequestPath = req.url?.split('?')[0] || '';
  }

  // Only administrative requests are gated on MongoDB hydration. Login,
  // registration, Google auth, products, cart and other public APIs must not
  // inherit a multi-second Atlas connection/synchronization timeout.
  if (normalizedRequestPath.startsWith('/api/admin')) {
    const mongoReady = await ensureAdminDatabaseReady();
    if (!mongoReady) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'MongoDB is unavailable. Please retry the administrative request.'
        }
      });
    }
  }

  return app(req, res);
}
