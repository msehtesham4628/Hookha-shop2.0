import app from '../src/server/app.js';
import { db } from '../src/server/db/store.js';
import { mongoService } from '../src/server/db/mongodb.js';

let isDbSyncInitiated = false;

export default async function vercelApiHandler(req: any, res: any) {
  // Trigger initial database synchronization with MongoDB in serverless environment
  if (!isDbSyncInitiated && process.env.MONGODB_URI) {
    isDbSyncInitiated = true;
    try {
      await mongoService.syncWithStore(db);
    } catch (err) {
      console.warn('[Vercel Serverless] MongoDB initial sync notice:', err);
    }
  }

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

