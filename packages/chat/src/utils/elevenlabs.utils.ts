const GENERIC_ERROR_MESSAGES = ['error', 'an error occurred', 'unknown error', 'undefined', ''];

const WEBSOCKET_CLOSE_REASONS: Record<number, string> = {
  1000: 'Connection closed normally',
  1001: 'Connection closed - endpoint going away',
  1002: 'Connection closed due to protocol error',
  1003: 'Connection closed - unsupported data type',
  1006: 'Connection lost unexpectedly. Please check your network and try again.',
  1007: 'Connection closed - invalid data received',
  1008: 'Connection closed - policy violation',
  1009: 'Connection closed - message too large',
  1011: 'Connection closed - server error',
  1015: 'Connection closed - TLS handshake failed',
};

function isUsefulMessage(message: string | undefined): boolean {
  if (!message) return false;
  return !GENERIC_ERROR_MESSAGES.includes(message.trim().toLowerCase());
}

function getWebSocketCloseReason(code: number): string {
  return WEBSOCKET_CLOSE_REASONS[code] || `Connection closed with code ${code}`;
}

function extractMessageFromEvent(event: Event & { code?: number; reason?: string }): string | null {
  if (event.type === 'error') return null;

  if ('code' in event && 'reason' in event) {
    return event.reason || getWebSocketCloseReason(event.code as number);
  }

  return null;
}

/**
 * Normalizes various error types into a proper Error object with a meaningful message.
 * Handles: Error instances, WebSocket events, CloseEvents, and string errors.
 */
export function normalizeError(error: unknown, defaultMessage: string): Error {
  if (error instanceof Error && isUsefulMessage(error.message)) {
    return error;
  }

  if (error && typeof error === 'object' && 'type' in error) {
    const message = extractMessageFromEvent(error as Event & { code?: number; reason?: string });
    if (message) return new Error(message);
  }

  if (typeof error === 'string' && isUsefulMessage(error)) {
    return new Error(error);
  }

  return new Error(defaultMessage);
}
