import type { ExtractOptions, ExtractResponse } from '@deepcrawl/types';
import * as cheerio from 'cheerio';
import type { ORPCContext } from '@/lib/context';
import { browserRenderWithRetry } from '@/services/scrape/browser-render.service';
import { logError } from '@/utils/loggers';

interface ExtractedElement {
  tag?: string;
  text?: string;
  html?: string;
  attributes?: Record<string, string>;
}

interface ExtractResult {
  selector: string;
  elements: ExtractedElement[];
  count: number;
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }
  return response.text();
}

function extractWithCheerio(
  html: string,
  selectors: string[],
): ExtractResult[] {
  const $ = cheerio.load(html);
  return selectors.map((selector) => {
    const extractedElements: ExtractedElement[] = [];

    $(selector).each((_, el) => {
      const $el = $(el);
      const attributes: Record<string, string> = {};
      const elAttributes = $el.attr() || {};
      for (const [key, value] of Object.entries(elAttributes)) {
        attributes[key] = value;
      }

      extractedElements.push({
        tag: (el as any).name?.toLowerCase(),
        text: $el.text().trim() || undefined,
        html: $el.html() || undefined,
        attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
      });
    });

    return {
      selector,
      elements: extractedElements,
      count: extractedElements.length,
    };
  });
}

async function extractWithBrowser(
  browserBinding: any,
  url: string,
  selectors: string[],
): Promise<ExtractResult[]> {
  const browserResult = await browserRenderWithRetry(browserBinding, {
    url,
    waitUntil: 'networkidle0',
    timeout: 30000,
  });

  return extractWithCheerio(browserResult.html, selectors);
}

export async function processExtractRequest(
  c: ORPCContext,
  options: ExtractOptions,
): Promise<ExtractResponse> {
  const { url, selectors, cleaningProcessor = 'cheerio-reader' } = options;
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const browserBinding = (c.env as any).DEEPCRAWL_BROWSER;
    let results: ExtractResult[];

    if (cleaningProcessor === 'browser' && browserBinding) {
      results = await extractWithBrowser(browserBinding, url, selectors);
    } else {
      const html = await fetchHtml(url);
      results = extractWithCheerio(html, selectors);
    }

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
      results,
    };
  } catch (error) {
    logError('Extract error:', error);

    return {
      success: false,
      requestId,
      targetUrl: url,
      timestamp: new Date().toISOString(),
      error: `Extract failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
