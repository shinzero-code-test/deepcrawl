interface ExtractLinksOptions {
  includeExternal?: boolean;
  includeMedia?: boolean;
  tree?: boolean;
  cleaningProcessor?: 'cheerio-reader' | 'html-rewriter' | 'browser';
}

interface LinksResponse {
  requestId: string;
  success: boolean;
  targetUrl: string;
  timestamp: string;
  cached?: boolean;
  tree?: unknown;
  extractedLinks?: {
    internal?: string[];
    external?: string[];
    media?: string[];
  };
  error?: string;
}

export async function extractLinksTool(
  apiUrl: string,
  apiKey: string,
  url: string,
  options: ExtractLinksOptions = {},
): Promise<LinksResponse> {
  const body: Record<string, unknown> = { url };
  if (options.includeExternal) {
    body.includeExternal = true;
  }
  if (options.includeMedia) {
    body.includeMedia = true;
  }
  if (options.tree !== undefined) {
    body.tree = options.tree;
  }
  if (options.cleaningProcessor) {
    body.cleaningProcessor = options.cleaningProcessor;
  }

  const response = await globalThis.fetch(`${apiUrl}/links`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

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
    return response.json() as Promise<LinksResponse>;
  }

  const text = await response.text();
  return {
    requestId: '',
    success: true,
    targetUrl: url,
    timestamp: new Date().toISOString(),
    extractedLinks: {
      media: [],
    },
  };
}
