import { type BaseEventPayload, EVENT_TYPE } from '@zamp-platform/utils/event-bus/event-bus.types';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useEventBus } from '@/app/_providers/sse-provider';
import type { MapAny } from '@/types/commonTypes';

import { useLazyGetTaskMessagesQuery } from '../api';
import type { ConversationSummary } from '../types/chat.types';
import { ResourceType, SummaryStatus } from '../types/chat.types';

const CHAR_INTERVAL_MS = 12;

interface UseDisplayedSummaryParams {
  taskId: string;
  sourceId: string;
  isAgentActive: boolean;
  hasSummary: string | boolean | undefined;
  summaryContent: string | undefined;
  taskStatus: string | undefined;
}

export function useDisplayedSummary({
  taskId,
  sourceId,
  isAgentActive,
  hasSummary,
  summaryContent,
  taskStatus,
}: UseDisplayedSummaryParams) {
  const { sseEventBus } = useEventBus();
  const [displayedText, setDisplayedText] = useState('');
  const initialFetchDoneRef = useRef(false);

  // Full target text that we animate towards
  const targetTextRef = useRef('');
  // How many characters we've revealed so far
  const revealedCountRef = useRef(0);
  // RAF / interval ID for the typing animation
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [fetchTaskMessages] = useLazyGetTaskMessagesQuery();

  const stopAnimation = useCallback(() => {
    if (animationRef.current !== null) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const startAnimation = useCallback(() => {
    // Already running
    if (animationRef.current !== null) return;

    animationRef.current = setInterval(() => {
      if (revealedCountRef.current >= targetTextRef.current.length) {
        // Caught up — pause until new content arrives
        stopAnimation();
        return;
      }
      revealedCountRef.current += 1;
      setDisplayedText(targetTextRef.current.slice(0, revealedCountRef.current));
    }, CHAR_INTERVAL_MS);
  }, [stopAnimation]);

  const setTargetText = useCallback(
    (text: string, resetAnimation: boolean) => {
      if (resetAnimation) {
        stopAnimation();
        revealedCountRef.current = 0;
        setDisplayedText('');
      }
      targetTextRef.current = text;
      startAnimation();
    },
    [stopAnimation, startAnimation],
  );

  const handleTaskSummaryEvent = useCallback(
    (data: BaseEventPayload) => {
      if (data.source_id !== sourceId) return;

      const payload = data.payload as MapAny;
      if (!payload || payload.type !== 'content_block') return;

      const text = payload.text as string;
      if (typeof text !== 'string') return;

      // Each content_block replaces the previous summary — animate the new text
      setTargetText(text, true);
    },
    [sourceId, setTargetText],
  );

  // Fetch initial summary content on mount when task is IN_PROGRESS
  useEffect(() => {
    if (initialFetchDoneRef.current || !taskId || !sourceId || taskStatus !== 'IN_PROGRESS') return;
    initialFetchDoneRef.current = true;

    fetchTaskMessages({
      conversationId: taskId,
      resourceId: sourceId,
      resourceType: ResourceType.ORGANIZATION,
    })
      .unwrap()
      .then((data) => {
        const summary = data?.conversation?.summary as ConversationSummary | null | undefined;
        if (summary?.status === SummaryStatus.IN_PROGRESS && summary.content) {
          // Show fetched content immediately, no animation for old content
          targetTextRef.current = summary.content;
          revealedCountRef.current = summary.content.length;
          setDisplayedText(summary.content);
        }
      })
      .catch(() => {
        // Silently ignore fetch errors - streaming will pick up
      });
  }, [taskId, sourceId, taskStatus, fetchTaskMessages]);

  // Reset state when taskId changes
  useEffect(() => {
    stopAnimation();
    setDisplayedText('');
    targetTextRef.current = '';
    revealedCountRef.current = 0;
    initialFetchDoneRef.current = false;
  }, [taskId, stopAnimation]);

  // Cleanup on unmount
  useEffect(() => stopAnimation, [stopAnimation]);

  // Subscribe to task_summary SSE events
  useEffect(() => {
    const subscription = sseEventBus.subscribe<BaseEventPayload>(EVENT_TYPE.TASK_SUMMARY, handleTaskSummaryEvent);
    return () => subscription.unsubscribe();
  }, [sseEventBus, handleTaskSummaryEvent]);

  if (isAgentActive) {
    return displayedText || '';
  }

  return hasSummary ? summaryContent : displayedText || '';
}
