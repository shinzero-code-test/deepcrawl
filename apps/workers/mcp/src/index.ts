import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createMcpHandler, WorkerTransport } from 'agents/mcp';
import { z } from 'zod';
import { batchProcessTool } from './tools/batch';
import { extractTool } from './tools/extract';
import { jsonFetchTool } from './tools/json';
import { extractLinksTool } from './tools/links';
import { listLogsTool } from './tools/logs';
import { pdfExtractTool } from './tools/pdf';
import { getMarkdownTool, readUrlTool } from './tools/read';
import { screenshotTool } from './tools/screenshot';

function createServer(apiUrl: string, apiKey: string) {
  const server = new McpServer({
    name: 'deepcrawl',
    version: '1.0.0',
  });

  server.tool(
    'read_url',
    'Read content from a URL and return structured data including HTML, markdown, and metadata',
    {
      url: z.string().url(),
      markdown: z.boolean().optional(),
      rawHtml: z.boolean().optional(),
    },
    async ({ url, markdown, rawHtml }) => {
      const result = await readUrlTool(apiUrl, apiKey, url, {
        markdown,
        rawHtml,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    'get_markdown',
    'Get clean markdown content from a URL',
    {
      url: z.string().url(),
      cleanHTML: z.boolean().optional(),
    },
    async ({ url, cleanHTML }) => {
      const result = await getMarkdownTool(apiUrl, apiKey, url, {
        cleanHTML,
      });
      return {
        content: [{ type: 'text', text: result }],
      };
    },
  );

  server.tool(
    'extract_links',
    'Extract all links from a webpage including internal, external, and media links',
    {
      url: z.string().url(),
      includeExternal: z.boolean().optional(),
      includeMedia: z.boolean().optional(),
      tree: z.boolean().optional(),
      cleaningProcessor: z
        .enum(['cheerio-reader', 'html-rewriter', 'browser'])
        .optional(),
    },
    async ({ url, includeExternal, includeMedia, tree, cleaningProcessor }) => {
      const result = await extractLinksTool(apiUrl, apiKey, url, {
        includeExternal,
        includeMedia,
        tree,
        cleaningProcessor,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    'list_logs',
    'List recent API activity logs',
    {
      limit: z.number().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    },
    async ({ limit, startDate, endDate }) => {
      const result = await listLogsTool(apiUrl, apiKey, {
        limit,
        startDate,
        endDate,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    'take_screenshot',
    'Capture a screenshot of a webpage and return a base64-encoded image',
    {
      url: z.string().url(),
      format: z.enum(['png', 'jpeg', 'webp']).optional(),
      width: z.number().int().min(100).max(4096).optional(),
      height: z.number().int().min(100).max(4096).optional(),
      fullPage: z.boolean().optional(),
      quality: z.number().int().min(1).max(100).optional(),
    },
    async ({ url, format, width, height, fullPage, quality }) => {
      const result = await screenshotTool(apiUrl, apiKey, {
        url,
        format,
        width,
        height,
        fullPage,
        quality,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    'extract_elements',
    'Extract specific DOM elements from a webpage using CSS selectors',
    {
      url: z.string().url(),
      selectors: z.array(z.string()).min(1),
      cleaningProcessor: z
        .enum(['cheerio-reader', 'html-rewriter', 'browser'])
        .optional(),
    },
    async ({ url, selectors, cleaningProcessor }) => {
      const result = await extractTool(apiUrl, apiKey, {
        url,
        selectors,
        cleaningProcessor,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    'json_fetch',
    'Fetch a URL and parse the response as JSON',
    {
      url: z.string().url(),
      method: z.enum(['GET', 'POST']).optional(),
      headers: z.record(z.string()).optional(),
      body: z.string().optional(),
    },
    async ({ url, method, headers, body }) => {
      const result = await jsonFetchTool(apiUrl, apiKey, {
        url,
        method,
        headers,
        body,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    'extract_pdf',
    'Extract text content from a PDF URL',
    {
      url: z.string().url(),
    },
    async ({ url }) => {
      const result = await pdfExtractTool(apiUrl, apiKey, { url });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    'batch_process',
    'Process multiple URLs in a batch with configurable options',
    {
      items: z
        .array(
          z.object({
            url: z.string().url(),
            operation: z.object({
              type: z.enum(['read', 'links']),
              options: z.unknown().optional(),
            }),
          }),
        )
        .min(1)
        .max(50),
      parallel: z.boolean().optional(),
      maxConcurrency: z.number().int().min(1).max(10).optional(),
    },
    async ({ items, parallel, maxConcurrency }) => {
      const result = await batchProcessTool(apiUrl, apiKey, {
        items,
        parallel,
        maxConcurrency,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  return server;
}

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname !== '/mcp') {
      return new Response('Not found', { status: 404 });
    }

    // Fix: Add required Accept header if missing
    const acceptHeader = request.headers.get('accept') || '';
    let modifiedRequest = request;

    if (
      !(
        acceptHeader.includes('application/json') &&
        acceptHeader.includes('text/event-stream')
      )
    ) {
      modifiedRequest = new Request(request, {
        headers: {
          ...Object.fromEntries(request.headers),
          accept: 'application/json, text/event-stream',
        },
      });
    }

    const server = createServer(
      env['DEEPCRAWL_API_URL'],
      env['DEEPCRAWL_API_KEY'],
    );

    const transport = new WorkerTransport({
      enableJsonResponse: true,
      corsOptions: {
        origin: '*',
      },
    });

    return createMcpHandler(server, { transport })(modifiedRequest, env, ctx);
  },
};
