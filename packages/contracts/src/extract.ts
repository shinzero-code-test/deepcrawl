import {
  ExtractOptionsSchema,
  ExtractResponseSchema,
} from '@deepcrawl/types/routers/extract/schemas';
import { oc } from '@orpc/contract';
import { errorSpec } from './errors';

const tags = ['Extract'];

const extractOC = oc.errors({
  RATE_LIMITED: errorSpec.RATE_LIMITED,
  EXTRACT_ERROR_RESPONSE: errorSpec.EXTRACT_ERROR_RESPONSE,
});

export const extractContract = extractOC
  .route({
    tags,
    path: '/',
    method: 'POST',
    summary: 'Extract elements from a webpage using CSS selectors',
    description: `Endpoint: POST \`/extract\`

Extract specific DOM elements from a webpage using CSS selectors.
Returns the extracted elements with their text, HTML, and attributes.`,
  })
  .input(ExtractOptionsSchema)
  .output(ExtractResponseSchema);
