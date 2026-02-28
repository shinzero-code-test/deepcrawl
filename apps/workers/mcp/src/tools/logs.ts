interface ListLogsOptions {
  limit?: number;
  startDate?: string;
  endDate?: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  path: string;
  method: string;
  status: number;
  duration: number;
}

interface ListLogsResponse {
  logs: LogEntry[];
  total: number;
  error?: string;
}

export async function listLogsTool(
  apiUrl: string,
  apiKey: string,
  options: ListLogsOptions = {},
): Promise<ListLogsResponse> {
  try {
    const response = await globalThis.fetch(`${apiUrl}/logs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let parsedError = '';
      try {
        const parsed = JSON.parse(errorText);
        parsedError = parsed.message || parsed.error || errorText;
      } catch {
        parsedError = errorText;
      }
      return {
        logs: [],
        total: 0,
        error: parsedError || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json() as Promise<ListLogsResponse>;
    }

    const text = await response.text();
    return {
      logs: [],
      total: 0,
      error: `Unexpected response: ${text.substring(0, 100)}`,
    };
  } catch (err) {
    return {
      logs: [],
      total: 0,
      error: `Error: ${err instanceof Error ? err.message : 'Unknown error - logs endpoint may not be available'}`,
    };
  }
}
