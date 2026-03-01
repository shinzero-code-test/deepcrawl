import type { z } from 'zod/v4';
import type {
  ScreenshotErrorResponseSchema,
  ScreenshotOptionsSchema,
  ScreenshotResponseSchema,
  ScreenshotSuccessResponseSchema,
} from './schemas';

/**
 * Configuration options for screenshot operations.
 * Uses browser rendering to capture page screenshots.
 *
 * @property {string} url - Target URL to capture
 * @property {'png' | 'jpeg' | 'webp'} [format] - Image format (default: png)
 * @property {number} [width] - Viewport width in pixels (default: 1280)
 * @property {number} [height] - Viewport height in pixels (default: 720)
 * @property {boolean} [fullPage] - Capture full scrollable page (default: false)
 * @property {number} [quality] - JPEG/WebP quality 1-100 (default: 80)
 * @property {number} [timeout] - Request timeout in ms (default: 30000)
 *
 * @example
 * ```typescript
 * const options: ScreenshotOptions = {
 *   url: 'https://example.com',
 *   format: 'png',
 *   width: 1920,
 *   height: 1080,
 *   fullPage: true
 * };
 * ```
 */
export type ScreenshotOptions = z.infer<typeof ScreenshotOptionsSchema>;

/**
 * Base type for all screenshot operation responses.
 */
export type ScreenshotResponse = z.infer<typeof ScreenshotResponseSchema>;

/**
 * Successful screenshot response.
 */
export type ScreenshotSuccessResponse = z.infer<
  typeof ScreenshotSuccessResponseSchema
>;

/**
 * Error screenshot response.
 */
export type ScreenshotErrorResponse = z.infer<
  typeof ScreenshotErrorResponseSchema
>;
