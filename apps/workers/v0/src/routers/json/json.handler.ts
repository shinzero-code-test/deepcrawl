import { rateLimitMiddleware } from '@/middlewares/rate-limit.orpc';
import { authed } from '@/orpc';
import { processJsonRequest } from './json.processor';

export const jsonPOSTHandler = authed
  .use(rateLimitMiddleware({ operation: 'json' }))
  .json.fetch.handler(async ({ input, context: c }) => {
    return processJsonRequest(c, input);
  });
