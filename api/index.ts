import app from '../src/server/app.js';

export default function vercelApiHandler(req: any, res: any) {
	const queryPath = typeof req.query?.path === 'string' ? req.query.path : '';
	if (queryPath) {
		const requestUrl = new URL(req.url || '/', 'http://vercel.local');
		requestUrl.searchParams.delete('path');
		const normalizedPath = queryPath.startsWith('/') ? queryPath : `/${queryPath}`;
		req.url = `/api${normalizedPath}${requestUrl.search}`;
	}

	return app(req, res);
}
