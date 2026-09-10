import fs from 'fs';

// MongoDB is the runtime source of truth. The six checked-in split catalogs are
// retained as source/import material, but must not be parsed on every Vercel
// cold start. Parsing thousands of products before auth was contributing to
// slow/504 requests and could temporarily resurrect stale catalog data.
const originalReadFileSync = fs.readFileSync.bind(fs);
(fs as any).readFileSync = (filePath: any, ...args: any[]) => {
  const normalized = String(filePath || '').replace(/\\/g, '/');
  if (/(?:^|\/)src\/server\/db\/products-[1-6]\.json$/i.test(normalized) ||
      /(?:^|\/)src\/server\/db\/scrapedProducts\.json$/i.test(normalized)) {
    return typeof args[0] === 'string' || (args[0] && typeof args[0] === 'object' && args[0].encoding)
      ? ''
      : Buffer.from('');
  }
  return originalReadFileSync(filePath, ...args);
};

let appPromise: Promise<any> | null = null;
let dbPromise: Promise<any> | null = null;
let mongoPromise: Promise<any> | null = null;
let adminDbSyncPromise: Promise<boolean> | null = null;

async function loadRuntime() {
  if (!appPromise || !dbPromise || !mongoPromise) {
    const runtime = await Promise.all([
      import('../src/server/app.js'),
      import('../src/server/db/store.js'),
      import('../src/server/db/mongodb.js')
    ]);
    appPromise = Promise.resolve(runtime[0].default);
    dbPromise = Promise.resolve(runtime[1].db);
    mongoPromise = Promise.resolve(runtime[2].mongoService);
  }
  return Promise.all([appPromise, dbPromise, mongoPromise]);
}

async function ensureAdminDatabaseReady(): Promise<boolean> {
  const [, db, mongoService] = await loadRuntime();
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
    })().catch((err: any) => {
      console.warn('[Vercel Serverless] Admin MongoDB hydration notice:', err);
      adminDbSyncPromise = null;
      return false;
    });
  }

  return adminDbSyncPromise;
}

export default async function vercelApiHandler(req: any, res: any) {
  const [app] = await loadRuntime();

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

  if (normalizedRequestPath.startsWith('/api/admin')) {
    // Deduplicate hydration within a warm serverless instance. Give MongoDB
    // enough time to complete TLS/server selection and full store hydration
    // before falling back to the local cache. The previous 1500ms budget was
    // shorter than the observed MongoDB handshake/query latency and caused
    // stale local state to be served even when MongoDB was healthy.
    const hydration = ensureAdminDatabaseReady();
    const mongoReady = await Promise.race([
      hydration,
      new Promise<boolean>(resolve => setTimeout(() => resolve(false), 10000))
    ]);

    if (!mongoReady) {
      res.setHeader('X-MongoDB-Mode', 'local-cache');
      console.warn('[Vercel Serverless] MongoDB hydration exceeded gateway budget; serving resilient local cache.');
      void hydration.catch(() => undefined);
    } else {
      res.setHeader('X-MongoDB-Mode', 'mongodb');
    }
  }

  return app(req, res);
}
