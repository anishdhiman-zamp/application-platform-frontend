'use client';

import { captureException } from '@sentry/browser';
import { useCallback, useEffect, useRef, useState } from 'react';

import { openSSEConnection } from '../registry/openSSEConnection';

export interface UseConversationSSEConfig {
  conversationId: string | null;
  organizationId?: string;
  enabled: boolean;
  isNewConversation?: boolean;
  streamingMessageId?: string | null;
  onEvent: (event: Record<string, unknown> & { type: string }, eventId?: string) => void;
  onError?: (error: unknown) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export interface UseConversationSSEReturn {
  isConnected: boolean;
  isConnecting: boolean;
  close: () => void;
}

/** Thin hook wrapper around openSSEConnection for direct hook-based usage. */
export function useConversationSSE({
  conversationId,
  organizationId,
  enabled,
  isNewConversation = false,
  streamingMessageId,
  onEvent,
  onError,
  onOpen,
  onClose,
}: UseConversationSSEConfig): UseConversationSSEReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Params and callbacks in refs so they don't re-trigger the effect.
  const paramsRef = useRef({ organizationId, isNewConversation, streamingMessageId });
  paramsRef.current = { organizationId, isNewConversation, streamingMessageId };

  const onEventRef = useRef(onEvent);
  const onErrorRef = useRef(onError);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);
  onEventRef.current = onEvent;
  onErrorRef.current = onError;
  onOpenRef.current = onOpen;
  onCloseRef.current = onClose;

  const cleanup = useCallback(() => {}, []);

  useEffect(() => {
    if (!enabled || !conversationId) return;

    const { organizationId: orgId, isNewConversation: isNew, streamingMessageId: msgId } = paramsRef.current;
    const controller = new AbortController();
    setIsConnecting(true);

    openSSEConnection(
      conversationId,
      orgId,
      isNew,
      msgId,
      controller.signal,
      (event, eventId) => onEventRef.current(event, eventId),
      () => {
        setIsConnected(true);
        setIsConnecting(false);
        onOpenRef.current?.();
      },
      (error) => {
        setIsConnected(false);
        setIsConnecting(false);
        if (error !== undefined) {
          captureException(error instanceof Error ? error : new Error(String(error)));
          onErrorRef.current?.(error);
        }
        onCloseRef.current?.();
      },
    );

    return () => {
      controller.abort();
      cleanup();
      setIsConnected(false);
      setIsConnecting(false);
    };
  }, [enabled, conversationId, cleanup]);

  return { isConnected, isConnecting, close: cleanup };
}
