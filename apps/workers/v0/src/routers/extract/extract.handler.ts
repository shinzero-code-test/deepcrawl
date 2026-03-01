import { rateLimitMiddleware } from '@/middlewares/rate-limit.orpc';
import { authed } from '@/orpc';
import { processExtractRequest } from './extract.processor';

export const extractPOSTHandler = authed
  .use(rateLimitMiddleware({ operation: 'extract' }))
  .extract.elements.handler(async ({ input, context: c }) => {
    return processExtractRequest(c, input);
  });
