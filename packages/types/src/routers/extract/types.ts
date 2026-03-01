import type { z } from 'zod/v4';
import {
  type ExtractErrorResponseSchema,
  type ExtractOptionsSchema,
  type ExtractResponseSchema,
  ExtractResultSchema,
  type ExtractSuccessResponseSchema,
} from './schemas';

/**
 * Configuration options for extract operations.
 * Extracts specific DOM elements using CSS selectors.
 *
 * @property {string} url - Target URL to extract from
 * @property {string[]} selectors - Array of CSS selectors to extract
 * @property {'cheerio-reader'|'html-rewriter'|'browser'} [cleaningProcessor] - The cleaning processor to use
 * @property {number} [timeout] - Request timeout in ms (default: 30000)
 *
 * @example
 * ```typescript
 * const options: ExtractOptions = {
 *   url: 'https://example.com',
 *   selectors: ['h1', '.content p', '#footer'],
 *   cleaningProcessor: 'browser'
 * };
 * ```
 */
export type ExtractOptions = z.infer<typeof ExtractOptionsSchema>;

/**
 * Base type for all extract operation responses.
 */
export type ExtractResponse = z.infer<typeof ExtractResponseSchema>;

/**
 * Successful extract response.
 */
export type ExtractSuccessResponse = z.infer<
  typeof ExtractSuccessResponseSchema
>;

/**
 * Error extract response.
 */
export type ExtractErrorResponse = z.infer<typeof ExtractErrorResponseSchema>;
