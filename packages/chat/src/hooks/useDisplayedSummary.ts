import { useCallback, useEffect, useRef, useState } from 'react';

const CHAR_INTERVAL_MS = 12;
const SUMMARY_DEBOUNCE_MS = 300;

interface UseDisplayedSummaryParams {
  taskId: string;
  isAgentActive: boolean;
  taskStatus?: string;
  streamingSummaryText?: string | null;
}

export function useDisplayedSummary({
  taskId,
  isAgentActive,
  taskStatus,
  streamingSummaryText,
}: UseDisplayedSummaryParams) {
  const prevIsAgentActiveRef = useRef(isAgentActive);
  const prevTaskStatusRef = useRef(taskStatus);
  const streamingSummaryTextRef = useRef(streamingSummaryText);
  streamingSummaryTextRef.current = streamingSummaryText;
  const targetTextRef = useRef('');
  const revealedCountRef = useRef(0);
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [displayedText, setDisplayedText] = useState('');

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
    [stopAnimation, startAnimation],
  );

  // Reset when taskId changes
  useEffect(() => {
    stopAnimation();
    targetTextRef.current = '';
    revealedCountRef.current = 0;
    setDisplayedText('');
  }, [taskId, stopAnimation]);

  // Clear summary when a new stream begins (isAgentActive: false → true),
  // but skip if we already have streaming text (reconnection after reload).
  useEffect(() => {
    if (isAgentActive && !prevIsAgentActiveRef.current && !streamingSummaryTextRef.current) {
      stopAnimation();
      targetTextRef.current = '';
      revealedCountRef.current = 0;
      setDisplayedText('');
    }
    prevIsAgentActiveRef.current = isAgentActive;
  }, [isAgentActive, stopAnimation]);

  // Clear cached summary when task transitions from IN_PROGRESS → COMPLETED
  useEffect(() => {
    if (taskStatus === 'COMPLETED' && prevTaskStatusRef.current === 'IN_PROGRESS') {
      stopAnimation();
      targetTextRef.current = '';
      revealedCountRef.current = 0;
      setDisplayedText('');
    }
    prevTaskStatusRef.current = taskStatus;
  }, [taskStatus, stopAnimation]);

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
  }, [streamingSummaryText, isAgentActive, setTargetText, stopAnimation]);

  useEffect(() => {
    handleStreamingSummaryChange();
  }, [handleStreamingSummaryChange]);

  if (isAgentActive) {
    return displayedText || '';
  }

  return displayedText;
}
