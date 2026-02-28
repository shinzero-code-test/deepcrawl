import type { AppContext } from '@auth/lib/context';
import {
  authContextMiddleware,
  authInstanceMiddleware,
} from '@auth/middlewares/auth';
import { deepCrawlCors } from '@auth/middlewares/cors';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';
import { trimTrailingSlash } from 'hono/trailing-slash';
import { notFound, onError, serveEmojiFavicon } from 'stoker/middlewares';

export default function createHonoApp() {
  const app = new Hono<AppContext>();

  // Apply custom CORS middleware first (must be before routes)
  app.use('*', deepCrawlCors);

  // Apply other middleware in order
  app
    .use('*', logger())
    .use('*', requestId())
    .use('*', prettyJSON())
    .use('*', secureHeaders())
    .use('*', trimTrailingSlash())
    .use('*', serveEmojiFavicon('🛡️'))
    .use('*', authInstanceMiddleware);

  // Mount auth handler - register specific paths
  const authPaths = [
    '',
    '0',
    '0/csrf',
    '1',
    '1/csrf',
    'signin',
    'signin/google',
    'callback',
    'callback/google',
    'session',
    'csrf',
    'admin',
    'error',
    'verify',
    'verify-request',
    'forgot-password',
    'reset-password',
    'link-email',
    'change-email',
    'delete-account',
    'user',
  ];

  for (const path of authPaths) {
    const fullPath = '/api/auth' + (path ? '/' + path : '');
    app.get(fullPath, async (c) => {
      try {
        return await c.var.betterAuth.handler(c.req.raw);
      } catch (e) {
        console.error('Auth error:', e);
        return c.json({ error: String(e) }, 500);
      }
    });
    app.post(fullPath, async (c) => {
      try {
        return await c.var.betterAuth.handler(c.req.raw);
      } catch (e) {
        console.error('Auth error:', e);
        return c.json({ error: String(e) }, 500);
      }
    });
  }

  app.onError(onError);
  app.notFound(notFound);

  return app;
}
