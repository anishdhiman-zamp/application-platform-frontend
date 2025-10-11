'use client';

import { useCallback, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const lastExecTimeRef = useRef<number>(0);

  return useCallback(
    (...args: Parameters<T>) => {
      const currentTime = Date.now();

      if (currentTime - lastExecTimeRef.current > delay) {
        func(...args);
        lastExecTimeRef.current = currentTime;
      } else {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
        }
        timeoutIdRef.current = setTimeout(
          () => {
            func(...args);
            lastExecTimeRef.current = Date.now();
            timeoutIdRef.current = null;
          },
          delay - (currentTime - lastExecTimeRef.current),
        );
      }
    },
    [func, delay],
  );
}
