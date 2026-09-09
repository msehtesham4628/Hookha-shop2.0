import app from '../src/server/app.js';
import { db } from '../src/server/db/store.js';
import { mongoService } from '../src/server/db/mongodb.js';

// Share one hydration promise across concurrent requests in the same Vercel
// function instance. This prevents request #2 from serving the pre-hydration
// in-memory catalog while request #1 is still loading MongoDB overrides.
let dbSyncPromise: Promise<void> | null = null;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function waitForInFlightMongoConnection() {
  for (let attempt = 0; attempt < 70; attempt++) {
    const status = mongoService.getStatus();
    if (!status.isConnecting) return;
    await sleep(100);
  }
}

async function ensureDatabaseSynced(): Promise<boolean> {
  if (!process.env.MONGODB_URI) return false;

  if (!dbSyncPromise) {
    dbSyncPromise = (async () => {
      await waitForInFlightMongoConnection();

      const summary = await mongoService.syncWithStore(db);
      const status = mongoService.getStatus();

      if (!status.isConnected) {
        throw new Error(status.lastError || 'MongoDB connection unavailable');
      }

      console.log('[Vercel Serverless] MongoDB startup hydration complete:', summary.summary);
    })().catch((err) => {
      console.warn('[Vercel Serverless] MongoDB initial sync notice:', err);
      dbSyncPromise = null;
      throw err;
    });
  }

  try {
    await dbSyncPromise;
    return true;
  } catch {
    return false;
  }
}

export default async function vercelApiHandler(req: any, res: any) {
  // db.ready loads the current split catalog before MongoDB hydration.
  await db.ready;

  // Keep the catalog that was shipped with this deployment. MongoDB may still
  // contain products from an older, larger catalog. We reconcile those stale
  // whm-* records after hydration while preserving admin/imported prod-* items.
  const currentCatalogIds = new Set(
    db.products.filter((p: any) => String(p.id).startsWith('whm-')).map((p: any) => p.id)
  );

  const mongoReady = await ensureDatabaseSynced();

  if (mongoReady && currentCatalogIds.size > 0) {
    const staleCatalogProducts = db.products.filter(
      (p: any) => String(p.id).startsWith('whm-') && !currentCatalogIds.has(p.id)
    );

    if (staleCatalogProducts.length > 0) {
      const staleIds = staleCatalogProducts.map((p: any) => p.id);
      console.log(`[Vercel Serverless] Removing ${staleIds.length} stale whm-* catalog products from MongoDB and memory.`);

      // deleteDocument supports MongoDB operators in the id field. The _id
      // alternative is harmless because these catalog records use string ids.
      await mongoService.deleteDocument('products', { id: { $in: staleIds } });
      db.products = db.products.filter((p: any) => !staleIds.includes(p.id));
    }
  }

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

  // Administrative APIs must never serve the unhydrated local seed when
  // MongoDB is configured but unavailable.
  if (normalizedRequestPath.startsWith('/api/admin') && !mongoReady) {
    return res.status(503).json({
      error: 'Database initialization unavailable',
      message: 'MongoDB hydration has not completed. Please retry the request.'
    });
  }

  return app(req, res);
}
