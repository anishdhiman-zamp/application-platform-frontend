export const SSE_SOURCE_TYPE = {
  CONVERSATION: 'conversation',
  TASK: 'task',
} as const;

export type SSESourceType = (typeof SSE_SOURCE_TYPE)[keyof typeof SSE_SOURCE_TYPE];

export const SSE_CONNECTION_TIMEOUT_MS = 10_000;
export const SSE_MAX_RETRIES = 10;
export const SSE_MAX_BACKOFF_MS = 30_000;
