import type { PdfExtractOptions, PdfExtractResponse } from '@deepcrawl/types';
import type { ORPCContext } from '@/lib/context';

export async function processPdfRequest(
  c: ORPCContext,
  options: PdfExtractOptions,
): Promise<PdfExtractResponse> {
  const { url, extractImages = false } = options;
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
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
    if (!(contentType.includes('pdf') || url.endsWith('.pdf'))) {
      return {
        success: false,
        requestId,
        targetUrl: url,
        timestamp: new Date().toISOString(),
        error: `Expected PDF content but got ${contentType}`,
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const text = extractTextFromPdf(uint8Array);
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
      text,
      pageCount: 1,
    };
  } catch (error) {
    return {
      success: false,
      requestId,
      targetUrl: url,
      timestamp: new Date().toISOString(),
      error: `Failed to extract PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

function extractTextFromPdf(data: Uint8Array): string {
  const text: string[] = [];
  const len = data.length;
  let currentText = '';

  for (let i = 0; i < len - 1; i++) {
    if (data[i] === 0x54 && data[i + 1] === 0x6a) {
      currentText = '';
      continue;
    }

    if (data[i] === 0x00 && data[i + 1] === 0x00) {
      if (currentText.trim()) {
        text.push(currentText.trim());
      }
      currentText = '';
    } else if (data[i] >= 0x20 && data[i] < 0x7f) {
      currentText += String.fromCharCode(data[i]);
    }
  }

  if (currentText.trim()) {
    text.push(currentText.trim());
  }

  return text.join('\n').slice(0, 50000);
}
