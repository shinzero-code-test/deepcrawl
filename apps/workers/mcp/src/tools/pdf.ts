interface PdfExtractOptions {
  url: string;
  extractImages?: boolean;
}

interface PdfExtractResponse {
  requestId: string;
  success: boolean;
  targetUrl: string;
  timestamp: string;
  text?: string;
  pageCount?: number;
  error?: string;
}

export async function pdfExtractTool(
  apiUrl: string,
  apiKey: string,
  options: PdfExtractOptions,
): Promise<PdfExtractResponse> {
  const response = await globalThis.fetch(`${apiUrl}/pdf`, {
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

  return response.json() as Promise<PdfExtractResponse>;
}
