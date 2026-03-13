import { useEffect, useRef, useState } from 'react';

const CHARS_PER_FRAME = 2;
const FRAME_INTERVAL_MS = 16;

/**
 * Smoothly reveals text character-by-character during streaming.
 *
 * When `isStreaming` is true, the hook maintains a "displayed" string that
 * trails behind the full `text` and catches up at a constant rate
 * (CHARS_PER_FRAME characters every FRAME_INTERVAL_MS ms). This produces
 * a smooth typewriter effect regardless of how chunky the SSE deltas are.
 *
 * When streaming ends the animation continues until the displayed length
 * catches up to the full text, avoiding a sudden jump of remaining content.
 */
export function useStreamingText(text: string, isStreaming: boolean): string {
  const [displayedLength, setDisplayedLength] = useState(() => (isStreaming ? 0 : text.length));
  const targetLengthRef = useRef(text.length);
  const streamingRef = useRef(isStreaming);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  targetLengthRef.current = text.length;
  streamingRef.current = isStreaming;

  useEffect(() => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      setDisplayedLength((prev) => {
        const target = targetLengthRef.current;
        if (prev >= target) {
          if (!streamingRef.current && intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return prev;
        }
        return Math.min(prev + CHARS_PER_FRAME, target);
      });
    }, FRAME_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isStreaming, text.length]);

  if (!isStreaming && displayedLength >= text.length) return text;

  return text.slice(0, displayedLength);
}
