import app from '../src/server/app.js';
import { db } from '../src/server/db/store.js';
import { mongoService } from '../src/server/db/mongodb.js';

// Share one hydration promise across concurrent requests in the same Vercel
// function instance. A boolean allowed request #2 to run while request #1 was
// still hydrating MongoDB, which could expose the pre-hydration in-memory seed.
let dbSyncPromise: Promise<void> | null = null;

async function ensureDatabaseSynced() {
  if (!process.env.MONGODB_URI) return;
  if (!dbSyncPromise) {
    dbSyncPromise = mongoService.syncWithStore(db)
      .then((summary) => {
        console.log('[Vercel Serverless] MongoDB startup hydration complete:', summary.summary);
      })
      .catch((err) => {
        console.warn('[Vercel Serverless] MongoDB initial sync notice:', err);
        // Allow a later invocation in the same warm instance to retry after a
        // transient MongoDB/network failure.
        dbSyncPromise = null;
      });
  }
  await dbSyncPromise;
}

export default async function vercelApiHandler(req: any, res: any) {
  // Wait for the single shared MongoDB hydration operation before serving the
  // first request. This prevents cold-start requests from seeing stale seeded
  // users/products before MongoDB tombstones and overrides are applied.
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
