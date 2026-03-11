'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Singleton state for history patching
const historyPatchState = {
  listeners: new Set<() => void>(),
  originalPushState: null as typeof history.pushState | null,
  originalReplaceState: null as typeof history.replaceState | null,
};

const patchHistory = () => {
  if (historyPatchState.originalPushState) return; // Already patched

  historyPatchState.originalPushState = history.pushState.bind(history);
  historyPatchState.originalReplaceState = history.replaceState.bind(history);

  history.pushState = (...args) => {
    historyPatchState.originalPushState!(...args);
    historyPatchState.listeners.forEach((fn) => fn());
  };

  history.replaceState = (...args) => {
    historyPatchState.originalReplaceState!(...args);
    historyPatchState.listeners.forEach((fn) => fn());
  };
};

const unpatchHistory = () => {
  if (historyPatchState.listeners.size > 0) return; // Still has listeners
  if (!historyPatchState.originalPushState) return;

  history.pushState = historyPatchState.originalPushState;
  history.replaceState = historyPatchState.originalReplaceState!;
  historyPatchState.originalPushState = null;
  historyPatchState.originalReplaceState = null;
};

/**
 * Sets up listeners for URL changes (popstate, pushState, replaceState).
 * Uses singleton pattern to avoid nested patching issues.
 */
const useUrlChangeListener = (onUrlChange: () => void) => {
  const onUrlChangeRef = useRef(onUrlChange);

  useEffect(() => {
    onUrlChangeRef.current = onUrlChange;
  });

  useEffect(() => {
    const handleUrlChange = () => {
      queueMicrotask(() => onUrlChangeRef.current());
    };

    window.addEventListener('popstate', handleUrlChange);
    historyPatchState.listeners.add(handleUrlChange);
    patchHistory();

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      historyPatchState.listeners.delete(handleUrlChange);
      unpatchHistory();
    };
  }, []);
};

/**
 * A hook that returns all URLSearchParams and stays in sync with URL changes
 * (including pushState/replaceState and browser back/forward).
 *
 * Unlike Next.js's useSearchParams(), this hook immediately reflects
 * URL changes made via window.history.pushState/replaceState.
 */
export const useSyncedSearchParams = (): URLSearchParams | null => {
  const getSearchParams = useCallback(() => {
    if (typeof window === 'undefined') return null;

    return new URLSearchParams(window.location.search);
  }, []);

  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(getSearchParams);

  useUrlChangeListener(() => {
    setSearchParams(getSearchParams());
  });

  useEffect(() => {
    const current = getSearchParams();

    if (current?.toString() !== searchParams?.toString()) {
      setSearchParams(current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getSearchParams]);

  return searchParams;
};

/**
 * A hook that reads a single search param directly from window.location.search
 * and stays in sync with URL changes (including pushState/replaceState).
 *
 * Use this when you only need one specific param.
 * Use `useSyncedSearchParams` when you need to read multiple params.
 */
export const useSyncedUrlParam = (paramName: string): string | null => {
  const getParamValue = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const params = new URLSearchParams(window.location.search);

    return params.get(paramName);
  }, [paramName]);

  const [value, setValue] = useState<string | null>(getParamValue);

  useUrlChangeListener(() => {
    setValue(getParamValue());
  });

  useEffect(() => {
    const currentValue = getParamValue();

    if (currentValue !== value) {
      setValue(currentValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getParamValue]);

  return value;
};

/**
 * A hook that tracks the current pathname and stays in sync with URL changes
 * (including pushState/replaceState and browser back/forward).
 */
export const useSyncedPathname = (): string => {
  const getPathname = useCallback(() => {
    if (typeof window === 'undefined') return '';

    return window.location.pathname;
  }, []);

  const [pathname, setPathname] = useState<string>(getPathname);

  useUrlChangeListener(() => {
    setPathname(getPathname());
  });

  return pathname;
};
