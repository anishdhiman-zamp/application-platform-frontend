'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import posthogJs from 'posthog-js';
import { ENVIRONMENT } from '@/constants/common.constants';

/**
 * Hook that tracks user activity and fires heartbeat events to PostHog.
 * Only runs in production environment.
 * Fires heartbeat at progressive intervals (5s → 10s → 30s → 60s) if:
 * - Tab is focused (visible)
 * - User was active in the last 2 minutes (mouse/keyboard/click activity)
 */
export const usePostHogHeartbeat = () => {
  const pathname = usePathname();
  const lastActivityTimeRef = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTabVisibleRef = useRef<boolean>(true);
  const beatCountRef = useRef<number>(0);

  useEffect(() => {
    // Only run in production
    if (ENVIRONMENT !== 'production') {
      return;
    }

    // Check if PostHog is initialized
    if (typeof window === 'undefined' || !(posthogJs as any).__loaded) {
      return;
    }

    const ACTIVITY_WINDOW_MS = 2 * 60 * 1000; // 2 minutes
    // Progressive heartbeat intervals: 5s → 10s → 30s → 60s (then stays at 60s)
    const HEARTBEAT_INTERVALS = [5000, 10000, 30000, 60000];
    const FINAL_INTERVAL = 60000; // 60 seconds for all subsequent beats

    // Track user activity
    const updateActivity = () => {
      lastActivityTimeRef.current = Date.now();
    };

    // Activity event listeners
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    activityEvents.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // Track tab visibility
    const handleVisibilityChange = () => {
      isTabVisibleRef.current = document.visibilityState === 'visible';
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    isTabVisibleRef.current = document.visibilityState === 'visible';

    // Heartbeat function with progressive backoff
    const scheduleNextHeartbeat = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityTimeRef.current;

      // Only send heartbeat if tab is visible and user was active in last 2 minutes
      if (isTabVisibleRef.current && timeSinceLastActivity < ACTIVITY_WINDOW_MS) {
        try {
          posthogJs.capture('heartbeat', {
            page_path: pathname || window.location.pathname,
          });
        } catch (error) {
          // Silently fail - don't break the app if PostHog has issues
          console.error('Error sending PostHog heartbeat:', error);
        }
      }

      // Determine next interval based on beat count
      const currentBeat = beatCountRef.current;
      let nextInterval: number;

      if (currentBeat < HEARTBEAT_INTERVALS.length) {
        // Use progressive intervals for first few beats
        nextInterval = HEARTBEAT_INTERVALS[currentBeat];
      } else {
        // Stay at 60s for all subsequent beats
        nextInterval = FINAL_INTERVAL;
      }

      // Increment beat counter
      beatCountRef.current += 1;

      // Schedule next heartbeat
      timeoutRef.current = setTimeout(scheduleNextHeartbeat, nextInterval);
    };

    // Start first heartbeat
    beatCountRef.current = 0;
    timeoutRef.current = setTimeout(scheduleNextHeartbeat, HEARTBEAT_INTERVALS[0]);

    // Cleanup
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname]);
};

export default usePostHogHeartbeat;
