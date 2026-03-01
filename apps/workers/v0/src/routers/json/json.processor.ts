import type { JsonFetchOptions, JsonFetchResponse } from '@deepcrawl/types';
import type { ORPCContext } from '@/lib/context';

export async function processJsonRequest(
  c: ORPCContext,
  options: JsonFetchOptions,
): Promise<JsonFetchResponse> {
  const { url, method = 'GET', headers = {}, body } = options;
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...headers,
      },
      body: method === 'POST' ? body : undefined,
    });

    if (!response.ok) {
      return {
        success: false,
        requestId,
        targetUrl: url,
        timestamp: new Date().toISOString(),
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return {
        success: false,
        requestId,
        targetUrl: url,
        timestamp: new Date().toISOString(),
        error: `Expected JSON response but got ${contentType}`,
      };
    }

    const data = await response.json();
    const endTime = Date.now();

    return {
      success: true,
      requestId,
      targetUrl: url,
      timestamp: new Date().toISOString(),
      metrics: {
        readableDuration: `${(endTime - startTime) / 1000}s`,
        durationMs: endTime - startTime,
        startTimeMs: startTime,
        endTimeMs: endTime,
      },
      data,
    };
  } catch (error) {
    return {
      success: false,
      requestId,
      targetUrl: url,
      timestamp: new Date().toISOString(),
      error: `Failed to fetch JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
