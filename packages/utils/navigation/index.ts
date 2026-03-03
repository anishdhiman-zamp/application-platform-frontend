export type NavigationStrategy = 'previous' | 'next' | 'browser-like';

export const NAVIGATION_STRATEGY = {
  PREVIOUS: 'previous',
  NEXT: 'next',
  BROWSER_LIKE: 'browser-like',
} as const;

interface GetNextNavigationTargetOptions<T> {
  items: T[];
  closingItem: T;
  isEqual: (a: T, b: T) => boolean;
  /**
   * - 'previous': Always navigate to previous item (or first if at index 0)
   * - 'next': Always navigate to next item (or last if at end)
   * - 'browser-like': Navigate to next for first/middle items, previous for last item
   */
  strategy?: NavigationStrategy;
}

interface NavigationTargetResult<T> {
  target: T | null;
  remainingItems: T[];
  hasRemainingItems: boolean;
}

/**
 * Determines the next item to navigate to after closing/removing an item from a list.
 */
export const getNextNavigationTarget = <T>({
  items,
  closingItem,
  isEqual,
  strategy = 'browser-like',
}: GetNextNavigationTargetOptions<T>): NavigationTargetResult<T> => {
  const closingIndex = items.findIndex((item) => isEqual(item, closingItem));

  if (closingIndex === -1) {
    return { target: null, remainingItems: items, hasRemainingItems: items.length > 0 };
  }

  const remainingItems = items.filter((item) => !isEqual(item, closingItem));

  if (remainingItems.length === 0) {
    return { target: null, remainingItems, hasRemainingItems: false };
  }

  let targetIndex: number;

  switch (strategy) {
    case 'previous':
      targetIndex = Math.max(0, closingIndex - 1);
      break;

    case 'next':
      targetIndex = Math.min(closingIndex, remainingItems.length - 1);
      break;

    case 'browser-like':
    default:
      if (closingIndex === items.length - 1) {
        targetIndex = closingIndex - 1;
      } else {
        targetIndex = closingIndex;
      }
      break;
  }

  targetIndex = Math.max(0, Math.min(targetIndex, remainingItems.length - 1));

  return {
    target: remainingItems[targetIndex],
    remainingItems,
    hasRemainingItems: true,
  };
};
