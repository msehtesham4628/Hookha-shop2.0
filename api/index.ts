import app from '../src/server/app.js';
import { db } from '../src/server/db/store.js';
import { mongoService } from '../src/server/db/mongodb.js';

// Share one hydration promise across concurrent requests in the same Vercel
// function instance. This prevents request #2 from serving the pre-hydration
// in-memory catalog while request #1 is still loading MongoDB overrides.
let dbSyncPromise: Promise<void> | null = null;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function waitForInFlightMongoConnection() {
  // Store initialization may start MongoDB in the background. mongoService's
  // connect() returns false while another connection is in progress, so wait
  // for that connection to settle before attempting the authoritative sync.
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

      // syncWithStore connects if necessary and then restores persisted
      // deletions, overrides, custom categories/brands, users, orders, etc.
      const summary = await mongoService.syncWithStore(db);
      const status = mongoService.getStatus();

      if (!status.isConnected) {
        throw new Error(status.lastError || 'MongoDB connection unavailable');
      }

      console.log('[Vercel Serverless] MongoDB startup hydration complete:', summary.summary);
    })().catch((err) => {
      console.warn('[Vercel Serverless] MongoDB initial sync notice:', err);
      // Do not permanently mark this function instance as ready after a
      // transient database failure. A later request can retry initialization.
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
  // Always initialize the local store first.
  await db.ready;

  // Then explicitly wait for MongoDB hydration. This is the cold-start guard
  // that prevents persisted deletes/updates from being overwritten by the
  // local split catalog before Express handles the request.
  const mongoReady = await ensureDatabaseSynced();

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
  // MongoDB is configured but unavailable. Public storefront requests retain
  // the existing resilient-cache behavior during a temporary outage.
  if (normalizedRequestPath.startsWith('/api/admin') && !mongoReady) {
    return res.status(503).json({
      error: 'Database initialization unavailable',
      message: 'MongoDB hydration has not completed. Please retry the request.'
    });
  }

  return app(req, res);
}
