'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { getProcessRouteById, ROUTES_PATH } from '@/constants/routeConfig';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { usePagesAndProcesses } from '@/contexts/PagesAndProcessesContext';
import { useAppDispatch } from '@/hooks/toolkit';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import useKeyDown from '@/hooks/useKeyDown';
import { useLogout } from '@/hooks/useLogout';
import { toggleSidebar } from '@/store/slices/layout-configs';

const NUMBER_KEY_MAP: Record<string, number> = {
  Digit1: 1,
  Digit2: 2,
  Digit3: 3,
  Digit4: 4,
  Digit5: 5,
  Digit6: 6,
  Digit7: 7,
  Digit8: 8,
  Digit9: 9,
  Digit0: 0,
  Numpad1: 1,
  Numpad2: 2,
  Numpad3: 3,
  Numpad4: 4,
  Numpad5: 5,
  Numpad6: 6,
  Numpad7: 7,
  Numpad8: 8,
  Numpad9: 9,
  Numpad0: 0,
};

// All keys we need to monitor
const MONITOR_KEYS = [
  KEYBOARD_KEYS.SLASH,
  KEYBOARD_KEYS.D,
  KEYBOARD_KEYS.L,
  KEYBOARD_KEYS.P,
  // Number keys
  'Digit1',
  'Digit2',
  'Digit3',
  'Digit4',
  'Digit5',
  'Digit6',
  'Digit7',
  'Digit8',
  'Digit9',
  'Digit0',
  'Numpad1',
  'Numpad2',
  'Numpad3',
  'Numpad4',
  'Numpad5',
  'Numpad6',
  'Numpad7',
  'Numpad8',
  'Numpad9',
  'Numpad0',
];

/**
 * Global keyboard shortcuts handler
 *
 * Shortcuts:
 * - `/` (Slash): Toggle sidebar collapse
 * - `Option + D`: Navigate to datasets page
 * - `Option + P`: Navigate to people page
 * - `Cmd + Shift + L`: Logout
 * - `P` + number (1-9): Navigate to process at that index (hold P and press numbers)
 */
const useGlobalShortcuts = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { processes } = usePagesAndProcesses();
  const { logout, isLoggingOut } = useLogout();
  const { evaluate, ldClient } = useFeatureFlags();
  const [isZampInternalEnabled, setIsZampInternalEnabled] = useState(false);
  // Use refs to avoid stale closure issues (updated directly, no useEffect needed)
  const processesRef = useRef(processes);
  const routerRef = useRef(router);
  const dispatchRef = useRef(dispatch);
  const logoutRef = useRef(logout);
  const isLoggingOutRef = useRef(isLoggingOut);

  // Keep refs updated directly during render
  processesRef.current = processes;
  routerRef.current = router;
  dispatchRef.current = dispatch;
  logoutRef.current = logout;
  isLoggingOutRef.current = isLoggingOut;

  // Track P key held state for P+number sequence
  const pKeyHeldRef = useRef(false);

  const handleShortcuts = useCallback(
    (event: KeyboardEvent) => {
      if (!isZampInternalEnabled) {
        return;
      }

      const { code, altKey, ctrlKey, metaKey, shiftKey } = event;

      // Cmd + Shift + L: Logout
      if (metaKey && shiftKey && code === KEYBOARD_KEYS.L) {
        event.preventDefault();
        if (!isLoggingOutRef.current) {
          logoutRef.current();
        }

        return;
      }

      if (altKey) {
        event.preventDefault();
        switch (code) {
          case KEYBOARD_KEYS.D:
            routerRef.current.push(ROUTES_PATH.DATA);
            break;
          case KEYBOARD_KEYS.P:
            routerRef.current.push(ROUTES_PATH.PEOPLE);
            break;
        }

        return;
      }

      // Slash: Toggle sidebar (only when no modifier keys)
      if (code === KEYBOARD_KEYS.SLASH && !altKey && !ctrlKey && !metaKey) {
        event.preventDefault();
        dispatchRef.current(toggleSidebar());

        return;
      }

      // P key pressed - mark as held
      if (code === KEYBOARD_KEYS.P && !altKey && !ctrlKey && !metaKey) {
        pKeyHeldRef.current = true;

        return;
      }

      // Check if this is a number key while P is held
      if (pKeyHeldRef.current && code in NUMBER_KEY_MAP) {
        event.preventDefault();
        const numberIndex = NUMBER_KEY_MAP[code];
        const currentProcesses = processesRef.current;

        // Navigate to process at index (1-based, so index 1 = first process)
        const isValidIndex =
          currentProcesses && currentProcesses.length > 0 && numberIndex >= 1 && numberIndex <= currentProcesses.length;

        if (isValidIndex) {
          const targetProcess = currentProcesses[numberIndex - 1];

          if (targetProcess?.id) {
            routerRef.current.push(getProcessRouteById(targetProcess.id));
          }
        }
      }
    },
    [isZampInternalEnabled],
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      // Reset P held state when P is released
      if (event.code === KEYBOARD_KEYS.P) {
        pKeyHeldRef.current = false;
      }
    },
    [isZampInternalEnabled],
  );

  useEffect(() => {
    if (ldClient) {
      evaluate(FEATURE_FLAGS.ZAMP_INTERNAL)
        .then((res: boolean) => {
          setIsZampInternalEnabled(res);
        })
        .catch(() => {
          setIsZampInternalEnabled(false);
        });
    }
  }, [evaluate, ldClient]);

  // Use the useKeyDown hook with keyup handler for P release tracking
  useKeyDown(handleShortcuts, MONITOR_KEYS, undefined, true, undefined, handleKeyUp);
};

export default useGlobalShortcuts;
