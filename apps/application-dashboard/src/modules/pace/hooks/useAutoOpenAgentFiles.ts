'use client';

import { useEffect, useRef } from 'react';
import type { ChatMessage, StreamingState } from '@zamp-platform/chat';
import { collectOutputFiles } from '@/modules/pace/agent-files.utils';

interface UseAutoOpenAgentFilesParams {
  conversationId: string | null;
  messages: ChatMessage[];
  streamingState: StreamingState | null | undefined;
  onFileOpen: (path: string, name: string) => void;
}

/**
 * Auto-opens the right files panel and a tab in the file viewer the moment
 * the agent emits an OUTPUT_FILES block — both during the live SSE stream and
 * when a fresh assistant message lands in history. Files already present in
 * history at mount time (or at conversation switch) are seeded into the seen
 * set so reloading a past conversation does not retrigger auto-open.
 */
export const useAutoOpenAgentFiles = ({
  conversationId,
  messages,
  streamingState,
  onFileOpen,
}: UseAutoOpenAgentFilesParams): void => {
  const seenKeysRef = useRef<Set<string>>(new Set());
  const seededConversationIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (seededConversationIdRef.current === conversationId) return;

    const seen = new Set<string>();

    for (const message of messages) {
      const files = collectOutputFiles(message.message_content?.elements, conversationId);

      for (const file of files) seen.add(file.key);
    }

    seenKeysRef.current = seen;
    seededConversationIdRef.current = conversationId;
  }, [conversationId, messages]);

  useEffect(() => {
    if (seededConversationIdRef.current !== conversationId) return;

    const seen = seenKeysRef.current;

    for (const message of messages) {
      for (const file of collectOutputFiles(message.message_content?.elements, conversationId)) {
        if (seen.has(file.key)) continue;

        seen.add(file.key);
        onFileOpen(file.path, file.name);
      }
    }

    for (const file of collectOutputFiles(streamingState?.message_content?.elements, conversationId)) {
      if (seen.has(file.key)) continue;

      seen.add(file.key);
      onFileOpen(file.path, file.name);
    }
  }, [conversationId, messages, streamingState, onFileOpen]);
};
