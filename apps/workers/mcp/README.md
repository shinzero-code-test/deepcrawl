# DeepCrawl MCP Server

MCP (Model Context Protocol) server for DeepCrawl. Allows AI assistants like Claude, ChatGPT, and Cursor to directly call DeepCrawl's web scraping tools.

## Endpoint

```
https://deepcrawl-mcp.shinzero.workers.dev/mcp
```

## Tools

| Tool | Description |
|------|-------------|
| `read_url` | Read HTML content from a URL |
| `get_markdown` | Extract clean markdown from a URL |
| `extract_links` | Extract all links from a webpage |
| `list_logs` | View API activity logs |

## Usage with MCP Clients

### Claude Desktop / Cursor

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "deepcrawl": {
      "command": "npx",
      "args": ["mcp-remote", "https://deepcrawl-mcp.shinzero.workers.dev/mcp"]
    }
  }
}
```

### ChatGPT

Add to your GPT settings:

```json
{
  "mcpServers": {
    "deepcrawl": {
      "url": "https://deepcrawl-mcp.shinzero.workers.dev/mcp"
    }
  }
}
```

## Development

```bash
# Install dependencies
pnpm install

# Run locally
npx wrangler dev

# Deploy
npx wrangler deploy
```

## Environment Variables

- `DEEPCRAWL_API_URL` - URL of the DeepCrawl v0 worker (default: https://deepcrawl-worker-v0.shinzero.workers.dev)
- `DEEPCRAWL_API_KEY` - DeepCrawl API key (secret)

## Architecture

The MCP server uses:
- `@modelcontextprotocol/sdk` for MCP protocol
- `agents` package for Cloudflare Workers integration
- Streamable HTTP transport

## Notes

- The server is publicly accessible (no auth required from clients)
- API key is configured server-side via Cloudflare Secrets
- Uses `global_fetch_strictly_public` compatibility flag to allow fetching from other Cloudflare Workers
