import { type BaseEventPayload, EVENT_TYPE } from '@zamp-platform/utils/event-bus/event-bus.types';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useEventBus } from '@/app/_providers/sse-provider';
import type { MapAny } from '@/types/commonTypes';

const CHAR_INTERVAL_MS = 12;

// Module-level cache so summary text accumulated by one component instance
// (e.g. TaskBlock in the sidebar) is immediately available when another instance
// mounts mid-stream (e.g. TaskContentInner after navigation).
const summaryTextCache = new Map<string, string>();

interface UseDisplayedSummaryParams {
  taskId: string;
  sourceId: string;
  isAgentActive: boolean;
  summaryContent?: string | null;
  taskStatus: string | undefined;
}

export function useDisplayedSummary({ taskId, sourceId, isAgentActive, summaryContent }: UseDisplayedSummaryParams) {
  const { sseEventBus } = useEventBus();
  const prevIsAgentActiveRef = useRef(isAgentActive);
  // Full target text that we animate towards
  const targetTextRef = useRef(summaryTextCache.get(taskId) ?? '');
  // How many characters we've revealed so far
  const revealedCountRef = useRef(targetTextRef.current.length);
  // RAF / interval ID for the typing animation
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Seed initial state from cache so mid-stream navigation shows accumulated content
  const [displayedText, setDisplayedText] = useState(() => summaryTextCache.get(taskId) ?? '');

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
      // Update module-level cache so other instances can seed from it
      summaryTextCache.set(taskId, text);

      if (resetAnimation) {
        stopAnimation();
        revealedCountRef.current = 0;
        setDisplayedText('');
      }
      targetTextRef.current = text;
      startAnimation();
    },
    [taskId, stopAnimation, startAnimation],
  );

  const handleTaskSummaryEvent = useCallback(
    (data: BaseEventPayload) => {
      if (data.source_id !== sourceId) return;

      const payload = data.payload as MapAny;
      if (!payload || payload?.type !== 'content_block') return;

      if (payload?.streaming_id !== taskId) return;

      const text = payload?.text as string;
      if (typeof text !== 'string') return;

      // Each content_block replaces the previous summary — animate the new text
      setTargetText(text, true);
    },
    [sourceId, taskId, setTargetText],
  );

  // Reset state when taskId changes
  useEffect(() => {
    const cached = summaryTextCache.get(taskId) ?? '';
    stopAnimation();
    targetTextRef.current = cached;
    revealedCountRef.current = cached.length;
    setDisplayedText(cached);
  }, [taskId, stopAnimation]);

  // Clear stale summary when a new stream begins (isAgentActive: false → true)
  useEffect(() => {
    if (isAgentActive && !prevIsAgentActiveRef.current) {
      stopAnimation();
      summaryTextCache.delete(taskId);
      targetTextRef.current = '';
      revealedCountRef.current = 0;
      setDisplayedText('');
    }
    prevIsAgentActiveRef.current = isAgentActive;
  }, [isAgentActive, taskId, stopAnimation]);

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

  return summaryContent ? summaryContent : displayedText || '';
}
