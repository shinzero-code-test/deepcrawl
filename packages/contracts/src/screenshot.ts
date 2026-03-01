import {
  ScreenshotOptionsSchema,
  ScreenshotResponseSchema,
} from '@deepcrawl/types/routers/screenshot/schemas';
import { oc } from '@orpc/contract';
import { errorSpec } from './errors';

const tags = ['Screenshot'];

const screenshotOC = oc.errors({
  RATE_LIMITED: errorSpec.RATE_LIMITED,
  SCREENSHOT_ERROR_RESPONSE: errorSpec.SCREENSHOT_ERROR_RESPONSE,
});

export const screenshotContract = screenshotOC
  .route({
    tags,
    path: '/',
    method: 'POST',
    summary: 'Capture a screenshot of a webpage',
    description: `Endpoint: POST \`/screenshot\`

Capture a screenshot of a webpage using browser rendering.
Returns a base64-encoded image in the response.`,
  })
  .input(ScreenshotOptionsSchema)
  .output(ScreenshotResponseSchema);
