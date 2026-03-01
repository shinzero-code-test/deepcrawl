interface ExtractOptions {
  url: string;
  selectors: string[];
  cleaningProcessor?: 'cheerio-reader' | 'html-rewriter' | 'browser';
}

interface ExtractResponse {
  requestId: string;
  success: boolean;
  targetUrl: string;
  timestamp: string;
  results?: {
    selector: string;
    elements: {
      tag?: string;
      text?: string;
      html?: string;
      attributes?: Record<string, string>;
    }[];
    count: number;
  }[];
  error?: string;
}

export async function extractTool(
  apiUrl: string,
  apiKey: string,
  options: ExtractOptions,
): Promise<ExtractResponse> {
  const response = await globalThis.fetch(`${apiUrl}/extract`, {
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

  return response.json() as Promise<ExtractResponse>;
}
