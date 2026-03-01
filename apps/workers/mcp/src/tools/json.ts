interface JsonFetchOptions {
  url: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: string;
}

interface JsonFetchResponse {
  requestId: string;
  success: boolean;
  targetUrl: string;
  timestamp: string;
  data?: unknown;
  error?: string;
}

export async function jsonFetchTool(
  apiUrl: string,
  apiKey: string,
  options: JsonFetchOptions,
): Promise<JsonFetchResponse> {
  const response = await globalThis.fetch(`${apiUrl}/json`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    return {
      requestId: '',
      success: false,
      targetUrl: options.url,
      timestamp: new Date().toISOString(),
      error: `HTTP ${response.status}: ${response.statusText}`,
    };
  }

  return response.json() as Promise<JsonFetchResponse>;
}
