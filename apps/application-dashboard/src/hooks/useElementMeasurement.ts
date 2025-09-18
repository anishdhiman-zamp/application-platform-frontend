import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

interface ElementMeasurement {
  width: number;
  height: number;
}

interface UseElementMeasurementReturn {
  ref: RefObject<HTMLDivElement | null>;
  dimensions: ElementMeasurement;
  measureElement: () => void;
}

export const useElementMeasurement = (): UseElementMeasurementReturn => {
  const ref = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<ElementMeasurement>({ width: 0, height: 0 });

  const measureElement = useCallback(() => {
    if (ref.current) {
      const { width, height } = ref.current.getBoundingClientRect();

      setDimensions({ width, height });
    }
  }, []);

  useEffect(() => {
    // Initial measurement
    if (ref.current) {
      measureElement();
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;

        setDimensions({ width, height });
      }
    });

    // Delayed observation to ensure element is rendered
    const timeout = setTimeout(() => {
      if (ref.current) {
        resizeObserver.observe(ref.current);
        measureElement(); // Measure again after timeout
      }
    }, 100);

    return () => {
      clearTimeout(timeout);
      resizeObserver.disconnect();
    };
  }, [measureElement]);

  return { ref, dimensions, measureElement };
};
