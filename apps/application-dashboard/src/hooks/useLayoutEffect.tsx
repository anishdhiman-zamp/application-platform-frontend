/*  ------------------------------  */
/*  tiny hook → useWidgetLoadTime   */
/*  ------------------------------  */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export const useWidgetLoadTime = (
  depsKey: string, // any string that uniquely changes when a “fresh” load starts
  isFetching?: boolean,
  isLoading?: boolean,
  hasData?: boolean,
) => {
  const startMark = useRef<number | null>(null);
  const [ms, setMs] = useState<number | null>(null);

  /** kick-off timer whenever depsKey changes */
  useLayoutEffect(() => {
    startMark.current = performance.now();
    setMs(null);
  }, [depsKey]);

  /** stop timer the *first* time everything is ready */
  useEffect(() => {
    if (!startMark.current || isFetching || isLoading || ms !== null || !hasData) return;

    // wait one paint so the canvas is actually on screen
    requestAnimationFrame(() => {
      const end = performance.now();
      const delta = end - startMark.current!;

      setMs(delta);
      performance.measure(`widget-${depsKey}`, {
        start: startMark.current!,
        end,
      });
      /* 👉 sendMetric('widget_load', { id: depsKey, ms: delta }); */
      console.info(`[Widget ${depsKey}] fully loaded in ${delta.toFixed(1)} ms`);
    });
  }, [isFetching, isLoading, hasData, ms, depsKey]);

  return ms; // handy if you want to show it in the UI
};
