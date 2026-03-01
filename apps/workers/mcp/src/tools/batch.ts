interface BatchItem {
  id?: string;
  url: string;
  operation: {
    type: 'read' | 'links';
    options?: unknown;
  };
}

interface BatchOptions {
  items: BatchItem[];
  parallel?: boolean;
  maxConcurrency?: number;
}

interface BatchResponse {
  requestId: string;
  success: boolean;
  timestamp: string;
  results: {
    id?: string;
    url: string;
    success: boolean;
    data?: unknown;
    error?: string;
    durationMs: number;
  }[];
}

export async function batchProcessTool(
  apiUrl: string,
  apiKey: string,
  options: BatchOptions,
): Promise<BatchResponse> {
  const response = await globalThis.fetch(`${apiUrl}/batch`, {
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
      timestamp: new Date().toISOString(),
      results: [],
    };
  }

  return response.json() as Promise<BatchResponse>;
}
