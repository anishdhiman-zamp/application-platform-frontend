import { useCallback, useEffect, useRef, useState } from 'react';

const CHAR_INTERVAL_MS = 12;
// Short debounce so rapid SSE replays (e.g. on refresh) collapse into one update
// and only the final summary gets animated.
const SUMMARY_DEBOUNCE_MS = 80;

// Module-level cache so summary text accumulated by one component instance
// (e.g. TaskBlock in the sidebar) is immediately available when another instance
// mounts mid-stream (e.g. TaskContentInner after navigation).
const summaryTextCache = new Map<string, string>();

interface UseDisplayedSummaryParams {
  taskId: string;
  isAgentActive: boolean;
  summaryContent?: string | null;
  streamingSummaryText?: string | null;
}

export function useDisplayedSummary({
  taskId,
  isAgentActive,
  summaryContent,
  streamingSummaryText,
}: UseDisplayedSummaryParams) {
  const prevIsAgentActiveRef = useRef(isAgentActive);
  // Full target text that we animate towards
  const targetTextRef = useRef(summaryTextCache.get(taskId) ?? '');
  // How many characters we've revealed so far
  const revealedCountRef = useRef(targetTextRef.current.length);
  // RAF / interval ID for the typing animation
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Debounce timer for incoming streaming summary text
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    (text: string) => {
      // Update module-level cache so other instances can seed from it
      summaryTextCache.set(taskId, text);

      const isExtension = targetTextRef.current.length > 0 && text.startsWith(targetTextRef.current);

      if (isExtension) {
        // Cumulative streaming: new text extends the current target.
        // Keep revealed count and displayed text as-is; the animation
        // will pick up and reveal only the newly appended characters.
        targetTextRef.current = text;
        startAnimation();
        return;
      }

      // Completely new summary — animate from scratch.
      stopAnimation();
      revealedCountRef.current = 0;
      setDisplayedText('');
      targetTextRef.current = text;
      startAnimation();
    },
    [taskId, stopAnimation, startAnimation],
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
  useEffect(
    () => () => {
      stopAnimation();
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
      }
    },
    [stopAnimation],
  );

  // React to new summary text arriving from the provider (per-task or per-conversation SSE).
  // Debounced so that rapid replays on refresh collapse — only the last summary animates.
  useEffect(() => {
    if (typeof streamingSummaryText !== 'string' || streamingSummaryText === targetTextRef.current) {
      return;
    }

    // If new text extends the current target, apply immediately (live streaming).
    const isExtension = targetTextRef.current.length > 0 && streamingSummaryText.startsWith(targetTextRef.current);
    if (isExtension) {
      setTargetText(streamingSummaryText);
      return;
    }

    // Non-extension: debounce so only the final replayed summary is animated.
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      setTargetText(streamingSummaryText);
    }, SUMMARY_DEBOUNCE_MS);
  }, [streamingSummaryText, setTargetText]);

  if (isAgentActive) {
    return displayedText || '';
  }

  return summaryContent ? summaryContent : displayedText || '';
}
