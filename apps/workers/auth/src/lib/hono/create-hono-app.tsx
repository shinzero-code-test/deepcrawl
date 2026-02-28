import type { AppContext } from '@auth/lib/context';
import { authInstanceMiddleware } from '@auth/middlewares/auth';
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
    // .use('*', trimTrailingSlash())  // Disabled - may cause routing issues
    .use('*', serveEmojiFavicon('🛡️'))
    .use('*', authInstanceMiddleware);

  // Mount auth handler - explicit routes (no loops)
  app.get('/api/auth', (c) => c.var.betterAuth.handler(c.req.raw));
  app.post('/api/auth', (c) => c.var.betterAuth.handler(c.req.raw));
  app.get('/api/auth/0', (c) => c.var.betterAuth.handler(c.req.raw));
  app.post('/api/auth/0', (c) => c.var.betterAuth.handler(c.req.raw));
  app.get('/api/auth/0/csrf', (c) => c.var.betterAuth.handler(c.req.raw));
  app.post('/api/auth/0/csrf', (c) => c.var.betterAuth.handler(c.req.raw));
  app.get('/api/auth/1', (c) => c.var.betterAuth.handler(c.req.raw));
  app.post('/api/auth/1', (c) => c.var.betterAuth.handler(c.req.raw));
  app.get('/api/auth/1/csrf', (c) => c.var.betterAuth.handler(c.req.raw));
  app.post('/api/auth/1/csrf', (c) => c.var.betterAuth.handler(c.req.raw));
  app.get('/api/auth/signin', (c) => c.var.betterAuth.handler(c.req.raw));
  app.post('/api/auth/signin', (c) => c.var.betterAuth.handler(c.req.raw));
  app.get('/api/auth/signin/google', (c) =>
    c.var.betterAuth.handler(c.req.raw),
  );
  app.post('/api/auth/signin/google', (c) =>
    c.var.betterAuth.handler(c.req.raw),
  );
  app.get('/api/auth/sign-in', (c) => c.var.betterAuth.handler(c.req.raw));
  app.post('/api/auth/sign-in', (c) => c.var.betterAuth.handler(c.req.raw));
  app.get('/api/auth/sign-in/social', (c) =>
    c.var.betterAuth.handler(c.req.raw),
  );
  app.post('/api/auth/sign-in/social', (c) =>
    c.var.betterAuth.handler(c.req.raw),
  );
  app.get('/api/auth/sign-in/google', (c) =>
    c.var.betterAuth.handler(c.req.raw),
  );
  app.post('/api/auth/sign-in/google', (c) =>
    c.var.betterAuth.handler(c.req.raw),
  );
  app.get('/api/auth/callback', (c) => c.var.betterAuth.handler(c.req.raw));
  app.post('/api/auth/callback', (c) => c.var.betterAuth.handler(c.req.raw));
  app.get('/api/auth/callback/google', (c) =>
    c.var.betterAuth.handler(c.req.raw),
  );
  app.post('/api/auth/callback/google', (c) =>
    c.var.betterAuth.handler(c.req.raw),
  );
  app.get('/api/auth/session', (c) => c.var.betterAuth.handler(c.req.raw));
  app.post('/api/auth/session', (c) => c.var.betterAuth.handler(c.req.raw));
  app.get('/api/auth/get-session', (c) => c.var.betterAuth.handler(c.req.raw));
  app.post('/api/auth/get-session', (c) => c.var.betterAuth.handler(c.req.raw));
  app.get('/api/auth/csrf', (c) => c.var.betterAuth.handler(c.req.raw));
  app.post('/api/auth/csrf', (c) => c.var.betterAuth.handler(c.req.raw));
  app.get('/api/auth/admin', (c) => c.var.betterAuth.handler(c.req.raw));
  app.post('/api/auth/admin', (c) => c.var.betterAuth.handler(c.req.raw));
  app.get('/api/auth/error', (c) => c.var.betterAuth.handler(c.req.raw));
  app.post('/api/auth/error', (c) => c.var.betterAuth.handler(c.req.raw));
  app.get('/api/auth/verify', (c) => c.var.betterAuth.handler(c.req.raw));
  app.post('/api/auth/verify', (c) => c.var.betterAuth.handler(c.req.raw));
  app.get('/api/auth/verify-request', (c) =>
    c.var.betterAuth.handler(c.req.raw),
  );
  app.post('/api/auth/verify-request', (c) =>
    c.var.betterAuth.handler(c.req.raw),
  );
  app.get('/api/auth/forgot-password', (c) =>
    c.var.betterAuth.handler(c.req.raw),
  );
  app.post('/api/auth/forgot-password', (c) =>
    c.var.betterAuth.handler(c.req.raw),
  );
  app.get('/api/auth/reset-password', (c) =>
    c.var.betterAuth.handler(c.req.raw),
  );
  app.post('/api/auth/reset-password', (c) =>
    c.var.betterAuth.handler(c.req.raw),
  );
  app.get('/api/auth/link-email', (c) => c.var.betterAuth.handler(c.req.raw));
  app.post('/api/auth/link-email', (c) => c.var.betterAuth.handler(c.req.raw));
  app.get('/api/auth/change-email', (c) => c.var.betterAuth.handler(c.req.raw));
  app.post('/api/auth/change-email', (c) =>
    c.var.betterAuth.handler(c.req.raw),
  );
  app.get('/api/auth/delete-account', (c) =>
    c.var.betterAuth.handler(c.req.raw),
  );
  app.post('/api/auth/delete-account', (c) =>
    c.var.betterAuth.handler(c.req.raw),
  );
  app.get('/api/auth/user', (c) => c.var.betterAuth.handler(c.req.raw));
  app.post('/api/auth/user', (c) => c.var.betterAuth.handler(c.req.raw));
  app.get('/api/auth/client', (c) => c.var.betterAuth.handler(c.req.raw));
  app.post('/api/auth/client', (c) => c.var.betterAuth.handler(c.req.raw));
  app.get('/api/auth/client/hono', (c) => c.var.betterAuth.handler(c.req.raw));
  app.post('/api/auth/client/hono', (c) => c.var.betterAuth.handler(c.req.raw));

  app.onError(onError);
  app.notFound(notFound);

  return app;
}
