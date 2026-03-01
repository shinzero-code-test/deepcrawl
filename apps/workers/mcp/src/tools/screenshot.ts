interface ScreenshotOptions {
  url: string;
  format?: 'png' | 'jpeg' | 'webp';
  width?: number;
  height?: number;
  fullPage?: boolean;
  quality?: number;
}

interface ScreenshotResponse {
  requestId: string;
  success: boolean;
  targetUrl: string;
  timestamp: string;
  image?: {
    format: string;
    width: number;
    height: number;
    sizeBytes: number;
    data: string;
  };
  error?: string;
}

export async function screenshotTool(
  apiUrl: string,
  apiKey: string,
  options: ScreenshotOptions,
): Promise<ScreenshotResponse> {
  const response = await globalThis.fetch(`${apiUrl}/screenshot`, {
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

  return response.json() as Promise<ScreenshotResponse>;
}
