import { rateLimitMiddleware } from '@/middlewares/rate-limit.orpc';
import { authed } from '@/orpc';
import { processScreenshotRequest } from './screenshot.processor';

export const screenshotPOSTHandler = authed
  .use(rateLimitMiddleware({ operation: 'screenshot' }))
  .screenshot.capture.handler(async ({ input, context: c }) => {
    return processScreenshotRequest(c, input);
  });
