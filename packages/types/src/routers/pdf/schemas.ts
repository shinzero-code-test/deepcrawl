import { z } from 'zod/v4';

export const PdfExtractOptionsSchema = z
  .object({
    url: z.string().url(),
    extractImages: z.boolean().default(false),
  })
  .strict();

export type PdfExtractOptions = z.infer<typeof PdfExtractOptionsSchema>;

export const PdfExtractSuccessResponseSchema = z
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
    text: z.string(),
    pageCount: z.number().int().optional(),
  })
  .strict();

export type PdfExtractSuccessResponse = z.infer<
  typeof PdfExtractSuccessResponseSchema
>;

export const PdfExtractErrorResponseSchema = z
  .object({
    success: z.literal(false),
    requestId: z.string().uuid().optional(),
    targetUrl: z.string().url(),
    timestamp: z.string().datetime(),
    error: z.string(),
  })
  .strict();

export type PdfExtractErrorResponse = z.infer<
  typeof PdfExtractErrorResponseSchema
>;

export const PdfExtractResponseSchema = z.discriminatedUnion('success', [
  PdfExtractSuccessResponseSchema,
  PdfExtractErrorResponseSchema,
]);

export type PdfExtractResponse = z.infer<typeof PdfExtractResponseSchema>;
