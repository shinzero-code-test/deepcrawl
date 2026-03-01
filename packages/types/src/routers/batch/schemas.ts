import { z } from 'zod/v4';
import { ExtractLinksOptionsSchema } from '../links/schemas';
import { ReadOptionsSchema } from '../read/schemas';

export const BatchOperationSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('read'),
    options: ReadOptionsSchema.optional(),
  }),
  z.object({
    type: z.literal('links'),
    options: ExtractLinksOptionsSchema.optional(),
  }),
]);

export const BatchItemSchema = z.object({
  id: z.string().optional(),
  url: z.string().url(),
  operation: BatchOperationSchema,
});

export const BatchOptionsSchema = z
  .object({
    items: z.array(BatchItemSchema).min(1).max(50),
    parallel: z.boolean().default(true),
    maxConcurrency: z.number().int().min(1).max(10).default(5),
  })
  .strict();

export type BatchOptions = z.infer<typeof BatchOptionsSchema>;

export const BatchResultSchema = z.object({
  id: z.string().optional(),
  url: z.string().url(),
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  durationMs: z.number().int(),
});

export const BatchSuccessResponseSchema = z
  .object({
    success: z.literal(true),
    requestId: z.string().uuid(),
    timestamp: z.string().datetime(),
    metrics: z
      .object({
        readableDuration: z.string(),
        durationMs: z.number().int(),
        startTimeMs: z.number().int(),
        endTimeMs: z.number().int(),
        totalItems: z.number().int(),
        successfulItems: z.number().int(),
        failedItems: z.number().int(),
      })
      .optional(),
    results: z.array(BatchResultSchema),
  })
  .strict();

export type BatchSuccessResponse = z.infer<typeof BatchSuccessResponseSchema>;

export const BatchErrorResponseSchema = z
  .object({
    success: z.literal(false),
    requestId: z.string().uuid().optional(),
    timestamp: z.string().datetime(),
    error: z.string(),
  })
  .strict();

export type BatchErrorResponse = z.infer<typeof BatchErrorResponseSchema>;

export const BatchResponseSchema = z.discriminatedUnion('success', [
  BatchSuccessResponseSchema,
  BatchErrorResponseSchema,
]);

export type BatchResponse = z.infer<typeof BatchResponseSchema>;
