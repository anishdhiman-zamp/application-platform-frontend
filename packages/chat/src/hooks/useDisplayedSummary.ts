import { useCallback, useEffect, useRef, useState } from 'react';

const CHAR_INTERVAL_MS = 12;
const SUMMARY_DEBOUNCE_MS = 300;

// Module-level cache so summary text is shared across component instances (e.g. TaskBlock ↔ TaskContentInner)
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
  const targetTextRef = useRef(summaryTextCache.get(taskId) ?? '');
  const revealedCountRef = useRef(targetTextRef.current.length);
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [displayedText, setDisplayedText] = useState(() => summaryTextCache.get(taskId) ?? '');

  const stopAnimation = useCallback(() => {
    if (animationRef.current !== null) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const startAnimation = useCallback(() => {
    if (animationRef.current !== null) return;

    animationRef.current = setInterval(() => {
      if (revealedCountRef.current >= targetTextRef.current.length) {
        stopAnimation();
        return;
      }
      revealedCountRef.current += 1;
      setDisplayedText(targetTextRef.current.slice(0, revealedCountRef.current));
    }, CHAR_INTERVAL_MS);
  }, [stopAnimation]);

  const setTargetText = useCallback(
    (text: string) => {
      summaryTextCache.set(taskId, text);

      const isExtension = targetTextRef.current.length > 0 && text.startsWith(targetTextRef.current);

      if (isExtension) {
        targetTextRef.current = text;
        startAnimation();
        return;
      }

      stopAnimation();
      revealedCountRef.current = 0;
      setDisplayedText('');
      targetTextRef.current = text;
      startAnimation();
    },
    [taskId, stopAnimation, startAnimation],
  );

  useEffect(() => {
    const cached = summaryTextCache.get(taskId) ?? '';
    stopAnimation();
    targetTextRef.current = cached;
    revealedCountRef.current = cached.length;
    setDisplayedText(cached);
  }, [taskId, stopAnimation]);

  // Clear summary when a new stream begins (isAgentActive: false → true)
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

  useEffect(
    () => () => {
      stopAnimation();
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
      }
    },
    [stopAnimation],
  );

  // When inactive (replay / completed task), show text immediately to avoid flash/snap.
  // When active (live streaming), debounce non-extension updates so rapid replays collapse.
  const handleStreamingSummaryChange = useCallback(() => {
    if (typeof streamingSummaryText !== 'string' || streamingSummaryText === targetTextRef.current) {
      return;
    }

    if (!isAgentActive) {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      stopAnimation();
      summaryTextCache.set(taskId, streamingSummaryText);
      targetTextRef.current = streamingSummaryText;
      revealedCountRef.current = streamingSummaryText.length;
      setDisplayedText(streamingSummaryText);
      return;
    }

    const isExtension = targetTextRef.current.length > 0 && streamingSummaryText.startsWith(targetTextRef.current);
    if (isExtension) {
      setTargetText(streamingSummaryText);
      return;
    }

    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      setTargetText(streamingSummaryText);
    }, SUMMARY_DEBOUNCE_MS);
  }, [streamingSummaryText, isAgentActive, setTargetText, taskId, stopAnimation]);

  useEffect(() => {
    handleStreamingSummaryChange();
  }, [handleStreamingSummaryChange]);

  if (isAgentActive) {
    return displayedText || '';
  }

  return summaryContent ? summaryContent : displayedText || '';
}
