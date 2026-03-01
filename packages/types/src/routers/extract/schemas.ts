import { z } from 'zod/v4';

export const ExtractOptionsSchema = z
  .object({
    url: z.string().url(),
    selectors: z.array(z.string()).min(1),
    cleaningProcessor: z
      .enum(['cheerio-reader', 'html-rewriter', 'browser'])
      .default('cheerio-reader'),
    timeout: z.number().int().min(5000).max(60000).default(30000).optional(),
  })
  .strict();

export type ExtractOptions = z.infer<typeof ExtractOptionsSchema>;

export const ExtractResultSchema = z.object({
  selector: z.string(),
  elements: z.array(
    z.object({
      tag: z.string().optional(),
      text: z.string().optional(),
      html: z.string().optional(),
      attributes: z.record(z.string(), z.string()).optional(),
    }),
  ),
  count: z.number().int(),
});

export const ExtractSuccessResponseSchema = z
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
    results: z.array(ExtractResultSchema),
  })
  .strict();

export type ExtractSuccessResponse = z.infer<
  typeof ExtractSuccessResponseSchema
>;

export const ExtractErrorResponseSchema = z
  .object({
    success: z.literal(false),
    requestId: z.string().uuid().optional(),
    targetUrl: z.string().url(),
    timestamp: z.string().datetime(),
    error: z.string(),
  })
  .strict();

export type ExtractErrorResponse = z.infer<typeof ExtractErrorResponseSchema>;

export const ExtractResponseSchema = z.discriminatedUnion('success', [
  ExtractSuccessResponseSchema,
  ExtractErrorResponseSchema,
]);

export type ExtractResponse = z.infer<typeof ExtractResponseSchema>;
