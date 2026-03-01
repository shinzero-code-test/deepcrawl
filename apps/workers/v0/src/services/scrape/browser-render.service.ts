import puppeteer from '@cloudflare/puppeteer';
import { logError } from '@/utils/loggers';

export interface BrowserRenderOptions {
  url: string;
  waitUntil?: 'networkidle0' | 'networkidle2' | 'load' | 'domcontentloaded';
  timeout?: number;
}

export interface BrowserRenderResult {
  html: string;
  title: string;
}

export async function browserRender(
  browserBinding: any,
  options: BrowserRenderOptions,
): Promise<BrowserRenderResult> {
  const { url, waitUntil = 'networkidle0', timeout = 60000 } = options;

  let browser = null;
  try {
    browser = await puppeteer.launch(browserBinding);

    const page = await browser.newPage();

    const response = await page.goto(url, {
      waitUntil,
      timeout,
    });

    if (!(response && response.ok())) {
      throw new Error(
        `Failed to load page: ${response?.status() || 'unknown'}`,
      );
    }

    const html = await page.content();
    const title = await page.title();

    return { html, title };
  } catch (error) {
    logError('Browser rendering error:', error);
    throw new Error(
      `Browser rendering failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export async function browserRenderWithRetry(
  browserBinding: any,
  options: BrowserRenderOptions,
  maxRetries = 2,
): Promise<BrowserRenderResult> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await browserRender(browserBinding, options);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (attempt + 1)),
        );
      }
    }
  }

  throw lastError || new Error('Browser rendering failed after retries');
}
