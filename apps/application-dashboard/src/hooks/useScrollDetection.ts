import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';

interface UseScrollDetectionOptions {
  /** Scroll threshold in pixels before isScrolled becomes true. Default: 0 */
  threshold?: number;
}

interface UseScrollDetectionReturn<T extends HTMLElement> {
  ref: RefObject<T | null>;
  isScrolled: boolean;
}

export const useScrollDetection = <T extends HTMLElement = HTMLDivElement>(
  options: UseScrollDetectionOptions = {},
): UseScrollDetectionReturn<T> => {
  const { threshold = 0 } = options;
  const ref = useRef<T>(null);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  const handleScroll = useCallback(() => {
    if (ref.current) {
      setIsScrolled(ref.current.scrollTop > threshold);
    }
  }, [threshold]);

  useEffect(() => {
    const scrollContainer = ref.current;

    if (!scrollContainer) return;

    scrollContainer.addEventListener('scroll', handleScroll);

    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return { ref, isScrolled };
};
