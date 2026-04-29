'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Adaptive-speed typewriter that decouples receiving from rendering.
 * Accelerates when backlog grows to stay close to the incoming text head.
 * Drains remaining text at a fast animated pace after stream ends.
 * Returns fullText immediately (no animation) for history/refresh messages.
 *
 * @param fullText  - Accumulated text from the streaming store
 * @param baseSpeed - Base ms-per-char (default 33ms ≈ 30 chars/sec)
 * @param active    - Whether streaming is currently active
 */

export interface TypewriterResult {
  text: string;
  isAnimating: boolean;
}

/** Backlog (chars) above which adaptive acceleration kicks in. */
const CATCH_UP_THRESHOLD = 40;
/** Minimum ms-per-char the adaptive algorithm will use. */
const MIN_SPEED = 4;
/** ms-per-char used when draining remaining text after stream ends. */
const DRAIN_SPEED = 8;
/** Backlog (chars) above which we snap on stream end instead of draining — drops stale typewriter replays after a hidden-tab return. */
const SNAP_BACKLOG_THRESHOLD = 200;

export function useTypewriter(fullText: string, baseSpeed = 33, active = true): TypewriterResult {
  const wasEverActiveRef = useRef(active);
  const displayedRef = useRef(fullText.length);
  const fullTextRef = useRef(fullText);
  const rafRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const prevFullTextRef = useRef(fullText);
  const prevActiveRef = useRef(active);
  const activeRef = useRef(active);

  if (active) wasEverActiveRef.current = true;

  // Start at fullText.length so text already in the store (e.g. from a background stream) shows immediately.
  const [displayed, setDisplayed] = useState(fullText.length);

  fullTextRef.current = fullText;
  activeRef.current = active;

  // fullText shrinking means the store was reset for a new message.
  if (fullText.length < prevFullTextRef.current.length) {
    displayedRef.current = 0;
  }
  prevFullTextRef.current = fullText;

  // On stream end (active true → false) with a large backlog, the user was on a hidden tab while RAF was throttled —
  // draining at DRAIN_SPEED would replay text they already missed. Snap to the end instead.
  if (prevActiveRef.current && !active && fullText.length - displayedRef.current > SNAP_BACKLOG_THRESHOLD) {
    displayedRef.current = fullText.length;
    setDisplayed(fullText.length);
  }
  prevActiveRef.current = active;

  const tick = useCallback(
    (now: number) => {
      const target = fullTextRef.current.length;
      const current = displayedRef.current;

      if (current > target) {
        // fullText shrank — snap back to start.
        displayedRef.current = 0;
        lastFrameTimeRef.current = now;
        setDisplayed(0);
      } else if (current < target) {
        const elapsed = lastFrameTimeRef.current === 0 ? 0 : now - lastFrameTimeRef.current;
        lastFrameTimeRef.current = now;

        const backlog = target - current;
        let effectiveSpeed: number;

        if (!activeRef.current) {
          effectiveSpeed = DRAIN_SPEED;
        } else if (backlog > CATCH_UP_THRESHOLD) {
          // Lerp from baseSpeed down to MIN_SPEED as backlog grows past threshold.
          const excess = backlog - CATCH_UP_THRESHOLD;
          const t = Math.min(1, excess / 200);
          effectiveSpeed = baseSpeed - t * (baseSpeed - MIN_SPEED);
        } else {
          effectiveSpeed = baseSpeed;
        }

        const charsThisFrame = Math.max(1, Math.floor(elapsed / effectiveSpeed));
        const next = Math.min(current + charsThisFrame, target);
        displayedRef.current = next;
        setDisplayed(next);
      } else {
        lastFrameTimeRef.current = now;
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [baseSpeed],
  );

  useEffect(() => {
    if (!wasEverActiveRef.current) return;

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  if (!wasEverActiveRef.current) {
    return { text: fullText, isAnimating: false };
  }

  const isAnimating = displayed < fullText.length;

  // Snap to word boundary to avoid partial words that cause line-wrap reflow.
  // During fast streaming, characters appear rapidly; showing partial words
  // (e.g. "curi" → "curio" → "curious") causes text to jump between lines
  // as the word grows. Snapping back to the previous whitespace keeps layout
  // stable — whole words appear at once.
  let sliceEnd = displayed;
  if (isAnimating && sliceEnd < fullText.length && sliceEnd > 0) {
    // If we're in the middle of a word, backtrack to the last whitespace.
    if (fullText[sliceEnd] !== ' ' && fullText[sliceEnd] !== '\n') {
      const lastSpace = fullText.lastIndexOf(' ', sliceEnd);
      const lastNewline = fullText.lastIndexOf('\n', sliceEnd);
      const boundary = Math.max(lastSpace, lastNewline);
      if (boundary > 0) {
        sliceEnd = boundary;
      }
    }
  }

  return { text: fullText.slice(0, sliceEnd), isAnimating };
}
