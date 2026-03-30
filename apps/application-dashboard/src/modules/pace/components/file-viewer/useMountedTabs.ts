import { useCallback, useMemo, useRef } from 'react';
import type { DynamicTab } from '@/modules/pace/pace.types';

const MAX_MOUNTED_TABS = 5;

/**
 * Tracks which tabs should be mounted using a "mount-on-first-activate" strategy.
 *
 * Tabs are only mounted once they've been activated at least once, up to
 * MAX_MOUNTED_TABS. This prevents mounting all tabs eagerly on page load
 * while keeping previously-viewed tabs alive (no unmount/remount churn).
 *
 * Once a tab is mounted it stays mounted until evicted by exceeding the cap,
 * which only happens when new tabs are activated beyond the limit.
 */
export function useMountedTabs(tabs: DynamicTab[], activeTabKey: string | null) {
  const activatedRef = useRef<string[]>([]);

  const validTabKeys = useMemo(() => new Set(tabs.map((t) => t.stableKey)), [tabs]);

  // Promote active tab to front of the activated list
  if (activeTabKey) {
    const list = activatedRef.current;
    const idx = list.indexOf(activeTabKey);

    if (idx === -1) {
      activatedRef.current = [activeTabKey, ...list];
    } else if (idx > 0) {
      activatedRef.current = [activeTabKey, ...list.slice(0, idx), ...list.slice(idx + 1)];
    }
  }

  // Prune closed tabs and apply cap
  const mounted = useMemo(() => {
    const pruned = activatedRef.current.filter((k) => validTabKeys.has(k));

    activatedRef.current = pruned;

    return new Set(pruned.slice(0, MAX_MOUNTED_TABS));
  }, [activeTabKey, validTabKeys]); // eslint-disable-line react-hooks/exhaustive-deps

  const isMounted = useCallback((stableKey: string) => mounted.has(stableKey), [mounted]);

  return { isMounted };
}
