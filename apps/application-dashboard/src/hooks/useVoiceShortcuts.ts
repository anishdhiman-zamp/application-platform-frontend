'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { UseVoiceChatReturn } from '@zamp-platform/ui/types';
import { VOICE_CHAT_STATE } from '@zamp-platform/ui/types';

/**
 * Timing thresholds (ms).
 * TAP_MAX — max duration of a single key press to count as a "tap".
 * DOUBLE_TAP_WINDOW — max gap between two taps to count as a double-tap.
 * HOLD_MIN — min hold duration before entering push-to-talk mode.
 */
const TAP_MAX = 300;
const DOUBLE_TAP_WINDOW = 400;
const HOLD_MIN = 250;

const IGNORE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

interface UseVoiceShortcutsOptions {
  voice: UseVoiceChatReturn;
  enabled: boolean;
}

/**
 * Keyboard shortcuts for voice chat:
 * - Double-press Shift (quickly): toggle voice session on/off
 * - Hold Shift (while voice active): push-to-talk (unmute while held, re-mute on release)
 *
 * Mic defaults to MUTED when a session starts. Only unmuted while Shift is held.
 * Ignores Shift combos (Shift+letter etc.) — only responds to solo Shift presses.
 */
export default function useVoiceShortcuts({ voice, enabled }: UseVoiceShortcutsOptions): void {
  const voiceRef = useRef(voice);

  voiceRef.current = voice;

  const lastTapTimeRef = useRef(0);
  const shiftDownTimeRef = useRef(0);
  const isHoldingRef = useRef(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const comboDetectedRef = useRef(false);

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  /**
   * After a session starts, mute the mic so push-to-talk is the default mode.
   * Polls briefly because the state transitions Connecting → Ready → Active
   * and mic enable happens asynchronously in the LiveKit room setup.
   */
  const muteAfterSessionStart = useCallback(() => {
    let attempts = 0;
    const maxAttempts = 20;
    const interval = 200;

    const poll = setInterval(() => {
      attempts++;
      const { state, isMicEnabled, toggleMic } = voiceRef.current;

      if (state === VOICE_CHAT_STATE.Active && isMicEnabled) {
        void toggleMic();
        clearInterval(poll);
      } else if (attempts >= maxAttempts || state === VOICE_CHAT_STATE.Error || state === VOICE_CHAT_STATE.Idle) {
        clearInterval(poll);
      }
    }, interval);
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      if (event.repeat) return;
      if (IGNORE_TAGS.has((event.target as HTMLElement)?.tagName?.toUpperCase())) return;

      // Only respond to the Shift key itself
      if (event.key !== 'Shift') {
        // Any non-Shift key while Shift is down means it's a combo (Shift+A etc.) — abort
        if (shiftDownTimeRef.current > 0) {
          comboDetectedRef.current = true;
          clearHoldTimer();
        }

        return;
      }

      shiftDownTimeRef.current = Date.now();
      comboDetectedRef.current = false;

      const { state } = voiceRef.current;
      const isVoiceActive = state === VOICE_CHAT_STATE.Active;

      // Start hold timer for push-to-talk (only when voice is active)
      if (isVoiceActive) {
        clearHoldTimer();
        holdTimerRef.current = setTimeout(() => {
          // Shift held long enough — enter push-to-talk
          isHoldingRef.current = true;

          if (!voiceRef.current.isMicEnabled) {
            void voiceRef.current.toggleMic();
          }
        }, HOLD_MIN);
      }
    },
    [enabled, clearHoldTimer],
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      if (event.key !== 'Shift') return;

      const downTime = shiftDownTimeRef.current;

      shiftDownTimeRef.current = 0;
      clearHoldTimer();

      // If we were in push-to-talk mode, re-mute on release
      if (isHoldingRef.current) {
        isHoldingRef.current = false;

        if (voiceRef.current.isMicEnabled) {
          void voiceRef.current.toggleMic();
        }

        return;
      }

      // If a combo was detected (Shift+letter etc.), ignore
      if (comboDetectedRef.current) {
        comboDetectedRef.current = false;

        return;
      }

      // Check if this was a quick tap
      const pressDuration = Date.now() - downTime;

      if (pressDuration > TAP_MAX) return;

      const now = Date.now();
      const timeSinceLastTap = now - lastTapTimeRef.current;

      if (timeSinceLastTap < DOUBLE_TAP_WINDOW) {
        // Double-tap detected — toggle voice session
        lastTapTimeRef.current = 0;
        const { state, start, stop } = voiceRef.current;

        if (state === VOICE_CHAT_STATE.Idle || state === VOICE_CHAT_STATE.Error) {
          void start();
          muteAfterSessionStart();
        } else {
          stop();
        }
      } else {
        // First tap — record timestamp
        lastTapTimeRef.current = now;
      }
    },
    [enabled, clearHoldTimer, muteAfterSessionStart],
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown, { passive: true });
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enabled, handleKeyDown, handleKeyUp]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearHoldTimer();
    };
  }, [clearHoldTimer]);
}
