import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createMcpHandler, WorkerTransport } from 'agents/mcp';
import { z } from 'zod';
import { extractLinksTool } from './tools/links';
import { listLogsTool } from './tools/logs';
import { getMarkdownTool, readUrlTool } from './tools/read';

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
    },
    async ({ url, includeExternal, includeMedia, tree }) => {
      const result = await extractLinksTool(apiUrl, apiKey, url, {
        includeExternal,
        includeMedia,
        tree,
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
