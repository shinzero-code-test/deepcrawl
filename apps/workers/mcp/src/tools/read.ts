interface ReadUrlOptions {
  markdown?: boolean;
  rawHtml?: boolean;
}

interface ReadUrlResponse {
  requestId: string;
  success: boolean;
  targetUrl: string;
  timestamp: string;
  cached?: boolean;
  markdown?: string;
  rawHtml?: string;
  title?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

export async function readUrlTool(
  apiUrl: string,
  apiKey: string,
  url: string,
  options: ReadUrlOptions = {},
): Promise<ReadUrlResponse> {
  const params = new URLSearchParams({ url });
  if (options.markdown) {
    params.set('markdown', 'true');
  }
  if (options.rawHtml) {
    params.set('rawHtml', 'true');
  }

  const response = await globalThis.fetch(
    `${apiUrl}/read?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  );

  if (!response.ok) {
    return {
      requestId: '',
      success: false,
      targetUrl: url,
      timestamp: new Date().toISOString(),
      error: `HTTP ${response.status}: ${response.statusText}`,
    };
  }

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json() as Promise<ReadUrlResponse>;
  }

  const rawHtml = await response.text();
  return {
    requestId: '',
    success: true,
    targetUrl: url,
    timestamp: new Date().toISOString(),
    rawHtml,
  };
}

export async function getMarkdownTool(
  apiUrl: string,
  apiKey: string,
  url: string,
  options: { cleanHTML?: boolean } = {},
): Promise<string> {
  const params = new URLSearchParams({ url, markdown: 'true' });
  if (options.cleanHTML) {
    params.set('cleanHTML', 'true');
  }

  const response = await globalThis.fetch(
    `${apiUrl}/read?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to get markdown: HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const data: ReadUrlResponse = await response.json();
    return data.markdown || data.rawHtml || '';
  }

  // Return raw response (HTML/markdown) if not JSON
  return await response.text();
}
