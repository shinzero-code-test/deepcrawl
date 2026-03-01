import { z } from 'zod/v4';

export const JsonFetchOptionsSchema = z
  .object({
    url: z.string().url(),
    method: z.enum(['GET', 'POST']).default('GET'),
    headers: z.record(z.string(), z.string()).optional(),
    body: z.string().optional(),
    schema: z.string().optional(),
  })
  .strict();

export type JsonFetchOptions = z.infer<typeof JsonFetchOptionsSchema>;

export const JsonFetchSuccessResponseSchema = z
  .object({
    success: z.literal(true),
    requestId: z.string().uuid(),
    targetUrl: z.string().url(),
    timestamp: z.string().datetime(),
    metrics: z
      .object({
        readableDuration: z.string(),
        durationMs: z.number().int(),
        startTimeMs: z.number().int(),
        endTimeMs: z.number().int(),
      })
      .optional(),
    data: z.unknown(),
  })
  .strict();

export type JsonFetchSuccessResponse = z.infer<
  typeof JsonFetchSuccessResponseSchema
>;

export const JsonFetchErrorResponseSchema = z
  .object({
    success: z.literal(false),
    requestId: z.string().uuid().optional(),
    targetUrl: z.string().url(),
    timestamp: z.string().datetime(),
    error: z.string(),
  })
  .strict();

export type JsonFetchErrorResponse = z.infer<
  typeof JsonFetchErrorResponseSchema
>;

export const JsonFetchResponseSchema = z.discriminatedUnion('success', [
  JsonFetchSuccessResponseSchema,
  JsonFetchErrorResponseSchema,
]);

export type JsonFetchResponse = z.infer<typeof JsonFetchResponseSchema>;
