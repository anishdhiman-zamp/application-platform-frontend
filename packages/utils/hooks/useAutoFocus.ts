'use client';

import { useCallback, useEffect, useRef } from 'react';

interface UseAutoFocusOptions {
  /**
   * Whether the element should be focused.
   * Focus will be applied when this changes from false to true.
   * @default true
   */
  enabled?: boolean;
  /**
   * Delay in milliseconds before focusing the element.
   * Useful when the element needs time to become visible/enabled.
   * @default 0
   */
  delay?: number;
  /**
   * Whether to select all text in the input when focused.
   * Only works for input and textarea elements.
   * @default false
   */
  selectOnFocus?: boolean;
}

/**
 * A hook that provides controlled auto-focus behavior for input elements.
 *
 * Unlike the native `autoFocus` attribute which only works on initial mount,
 * this hook can focus elements based on dynamic conditions (e.g., after loading completes).
 *
 * @example
 * ```tsx
 * const { setRef } = useAutoFocus({ enabled: !isLoading });
 *
 * return <Input ref={setRef} disabled={isLoading} />;
 * ```
 *
 * @example
 * // With delay and text selection
 * const { setRef } = useAutoFocus({
 *   enabled: isModalOpen,
 *   delay: 100,
 *   selectOnFocus: true,
 * });
 * ```
 */
export function useAutoFocus<T extends HTMLElement = HTMLElement>({
  enabled = true,
  delay = 0,
  selectOnFocus = false,
}: UseAutoFocusOptions = {}) {
  const elementRef = useRef<T | null>(null);
  const hasFocusedRef = useRef(false);

  const setRef = useCallback((node: T | null) => {
    elementRef.current = node;
  }, []);

  useEffect(() => {
    if (!enabled || hasFocusedRef.current || !elementRef.current) {
      return;
    }

    const focusElement = () => {
      if (elementRef.current) {
        elementRef.current.focus();
        hasFocusedRef.current = true;

        if (
          selectOnFocus &&
          (elementRef.current instanceof HTMLInputElement || elementRef.current instanceof HTMLTextAreaElement)
        ) {
          elementRef.current.select();
        }
      }
    };

    if (delay > 0) {
      const timeoutId = setTimeout(focusElement, delay);
      return () => clearTimeout(timeoutId);
    }

    focusElement();
  }, [enabled, delay, selectOnFocus]);

  // Reset the focused state when enabled changes to false
  useEffect(() => {
    if (!enabled) {
      hasFocusedRef.current = false;
    }
  }, [enabled]);

  return { setRef, elementRef };
}
