import { z } from 'zod/v4';

export const ScreenshotOptionsSchema = z
  .object({
    url: z.string().url(),
    format: z.enum(['png', 'jpeg', 'webp']).default('png'),
    width: z.number().int().min(100).max(4096).default(1280),
    height: z.number().int().min(100).max(4096).default(720),
    fullPage: z.boolean().default(false),
    quality: z.number().int().min(1).max(100).default(80).optional(),
    timeout: z.number().int().min(5000).max(60000).default(30000).optional(),
  })
  .strict();

export type ScreenshotOptions = z.infer<typeof ScreenshotOptionsSchema>;

export const ScreenshotSuccessResponseSchema = z
  .object({
    success: z.literal(true),
    requestId: z.string().uuid(),
    targetUrl: z.string().url(),
    timestamp: z.string().datetime(),
    cached: z.boolean().optional(),
    metrics: z
      .object({
        readableDuration: z.string(),
        durationMs: z.number().int(),
        startTimeMs: z.number().int(),
        endTimeMs: z.number().int(),
      })
      .optional(),
    image: z.object({
      format: z.enum(['png', 'jpeg', 'webp']),
      width: z.number().int(),
      height: z.number().int(),
      sizeBytes: z.number().int(),
      data: z.string(), // base64 encoded
    }),
  })
  .strict();

export type ScreenshotSuccessResponse = z.infer<
  typeof ScreenshotSuccessResponseSchema
>;

export const ScreenshotErrorResponseSchema = z
  .object({
    success: z.literal(false),
    requestId: z.string().uuid().optional(),
    targetUrl: z.string().url(),
    timestamp: z.string().datetime(),
    error: z.string(),
  })
  .strict();

export type ScreenshotErrorResponse = z.infer<
  typeof ScreenshotErrorResponseSchema
>;

export const ScreenshotResponseSchema = z.discriminatedUnion('success', [
  ScreenshotSuccessResponseSchema,
  ScreenshotErrorResponseSchema,
]);

export type ScreenshotResponse = z.infer<typeof ScreenshotResponseSchema>;
