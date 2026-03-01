import puppeteer from '@cloudflare/puppeteer';
import type { ScreenshotOptions, ScreenshotResponse } from '@deepcrawl/types';
import type { ORPCContext } from '@/lib/context';
import { logError } from '@/utils/loggers';

export async function processScreenshotRequest(
  c: ORPCContext,
  options: ScreenshotOptions,
): Promise<ScreenshotResponse> {
  const { url, format, width, height, fullPage, quality, timeout } = options;
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  let browser = null;

  try {
    const browserBinding = (c.env as any).DEEPCRAWL_BROWSER;

    if (!browserBinding) {
      return {
        success: false,
        requestId,
        targetUrl: url,
        timestamp: new Date().toISOString(),
        error:
          'Browser rendering is not available. Please configure DEEPCRAWL_BROWSER binding.',
      };
    }

    browser = await puppeteer.launch(browserBinding);

    const page = await browser.newPage();
    await page.setViewport({ width, height });

    const response = await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: timeout || 30000,
    });

    if (!(response && response.ok())) {
      return {
        success: false,
        requestId,
        targetUrl: url,
        timestamp: new Date().toISOString(),
        error: `Failed to load page: ${response?.status() || 'unknown'}`,
      };
    }

    const screenshotOptions: {
      type: 'png' | 'jpeg' | 'webp';
      fullPage: boolean;
      quality?: number;
      encoding: 'base64';
    } = {
      type: format,
      fullPage,
      encoding: 'base64',
    };

    if (format === 'jpeg' || format === 'webp') {
      screenshotOptions.quality = quality || 80;
    }

    const screenshotBase64 = await page.screenshot(screenshotOptions);
    const buffer = Buffer.from(screenshotBase64, 'base64');

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
      image: {
        format,
        width,
        height,
        sizeBytes: buffer.length,
        data: screenshotBase64,
      },
    };
  } catch (error) {
    logError('Screenshot error:', error);

    return {
      success: false,
      requestId,
      targetUrl: url,
      timestamp: new Date().toISOString(),
      error: `Screenshot failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
