import app from '../src/server/app.js';
import { db } from '../src/server/db/store.js';
import { mongoService } from '../src/server/db/mongodb.js';

// Share one hydration promise across concurrent requests in the same Vercel
// function instance. A boolean allowed request #2 to run while request #1 was
// still hydrating MongoDB, which could expose the pre-hydration in-memory seed.
let dbSyncPromise: Promise<void> | null = null;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function waitForInFlightMongoConnection() {
  // The store can start MongoDB hydration during module initialization. If the
  // request arrives while that connection is still in progress, mongoService's
  // old connect() behavior returned false immediately. That made the request
  // continue with the local split catalog instead of waiting for persisted
  // MongoDB overrides/tombstones. Wait for that in-flight connection to settle.
  for (let attempt = 0; attempt < 70; attempt++) {
    const status = mongoService.getStatus();
    if (!status.isConnecting) return;
    await sleep(100);
  }
}

async function ensureDatabaseSynced() {
  if (!process.env.MONGODB_URI) return;

  if (!dbSyncPromise) {
    dbSyncPromise = (async () => {
      await waitForInFlightMongoConnection();

      // If the connection already completed, syncWithStore performs the actual
      // cloud -> memory hydration. If it failed, it will retry the connection.
      const summary = await mongoService.syncWithStore(db);
      const status = mongoService.getStatus();

      if (!status.isConnected) {
        throw new Error(status.lastError || 'MongoDB connection unavailable');
      }

      console.log('[Vercel Serverless] MongoDB startup hydration complete:', summary.summary);
    })().catch((err) => {
      console.warn('[Vercel Serverless] MongoDB initial sync notice:', err);
      // Allow a later invocation in the same warm instance to retry after a
      // transient MongoDB/network failure.
      dbSyncPromise = null;
      throw err;
    });
  }

  try {
    await dbSyncPromise;
  } catch {
    // Preserve the existing resilient-cache behavior. A database outage should
    // not turn the storefront into a 500, but a successful MongoDB connection
    // is required before persisted admin state is considered hydrated.
  }
}

export default async function vercelApiHandler(req: any, res: any) {
  // Wait for the store's normal initialization first.
  await db.ready;

  // Then perform an explicit MongoDB readiness/hydration gate. This is the
  // critical cold-start protection: if store initialization kicked off MongoDB
  // in the background, the first request now waits for that connection to
  // finish and for persisted deletes/updates to be applied before Express can
  // serve the request.
  await ensureDatabaseSynced();

  // Handle URL reconstruction from Vercel rewrites or direct API requests
  const queryPath = typeof req.query?.path === 'string' ? req.query.path : '';
  if (queryPath) {
    const requestUrl = new URL(req.url || '/', 'http://vercel.local');
    requestUrl.searchParams.delete('path');
    const normalizedPath = queryPath.startsWith('/') ? queryPath : `/${queryPath}`;
    const search = requestUrl.search || '';
    req.url = `/api${normalizedPath}${search}`;
  } else if (req.url && (req.url === '/api/index' || req.url.startsWith('/api/index?'))) {
    const requestUrl = new URL(req.url, 'http://vercel.local');
    const param = requestUrl.searchParams.get('path');
    if (param) {
      requestUrl.searchParams.delete('path');
      const normalizedPath = param.startsWith('/') ? param : `/${param}`;
      const search = requestUrl.search || '';
      req.url = `/api${normalizedPath}${search}`;
    } else {
      req.url = `/api/health${requestUrl.search || ''}`;
    }
  } else if (req.url && !req.url.startsWith('/api')) {
    const normalized = req.url.startsWith('/') ? req.url : `/${req.url}`;
    req.url = `/api${normalized}`;
  }

  return app(req, res);
}
