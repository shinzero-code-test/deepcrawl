import type { z } from 'zod/v4';
import type {
  JsonFetchErrorResponseSchema,
  JsonFetchOptionsSchema,
  JsonFetchResponseSchema,
  JsonFetchSuccessResponseSchema,
} from './schemas';

export type JsonFetchOptions = z.infer<typeof JsonFetchOptionsSchema>;
export type JsonFetchResponse = z.infer<typeof JsonFetchResponseSchema>;
export type JsonFetchSuccessResponse = z.infer<
  typeof JsonFetchSuccessResponseSchema
>;
export type JsonFetchErrorResponse = z.infer<
  typeof JsonFetchErrorResponseSchema
>;
