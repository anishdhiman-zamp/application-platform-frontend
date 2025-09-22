import { useMemo } from 'react';
import { MenuItem } from '@/types/common/components';

interface UseTabsOverflowOptions {
  tabs: MenuItem[];
  containerWidth: number;
  tabMinWidth?: number;
  additionalElementsWidth?: number;
}

interface UseTabsOverflowReturn {
  visibleTabs: MenuItem[];
  overflowTabs: MenuItem[];
  shouldShowOverflow: boolean;
}

export const useTabsOverflow = ({
  tabs,
  containerWidth,
  tabMinWidth = 120, // Estimated minimum tab width
  additionalElementsWidth = 200, // Space for "Add Sheet" button and other elements
}: UseTabsOverflowOptions): UseTabsOverflowReturn => {
  // Create a stable reference for tabs to prevent unnecessary re-renders
  const tabsStringified = JSON.stringify(tabs.map((tab) => ({ value: tab.value, label: tab.label })));
  const stableTabs = useMemo(() => tabs, [tabsStringified]);

  const calculations = useMemo(() => {
    if (containerWidth === 0 || stableTabs.length === 0) {
      return {
        visibleTabs: stableTabs,
        overflowTabs: [],
      };
    }

    // Calculate available space for tabs only
    const availableWidth = containerWidth - additionalElementsWidth;

    // Be more conservative - ensure there's enough space
    if (availableWidth <= 0) {
      return {
        visibleTabs: stableTabs.length > 0 ? [stableTabs[0]] : [],
        overflowTabs: stableTabs.slice(1),
      };
    }

    const maxVisibleTabs = Math.max(1, Math.floor(availableWidth / tabMinWidth));

    if (stableTabs.length <= maxVisibleTabs) {
      return {
        visibleTabs: stableTabs,
        overflowTabs: [],
      };
    } else {
      // Reserve space for "+n more" button (approximately 100px with margin)
      const overflowButtonWidth = 100;
      const adjustedAvailableWidth = availableWidth - overflowButtonWidth;
      const adjustedMaxTabs = Math.max(1, Math.floor(adjustedAvailableWidth / tabMinWidth));

      return {
        visibleTabs: stableTabs.slice(0, adjustedMaxTabs),
        overflowTabs: stableTabs.slice(adjustedMaxTabs),
      };
    }
  }, [stableTabs, containerWidth, tabMinWidth, additionalElementsWidth]);

  return {
    visibleTabs: calculations.visibleTabs,
    overflowTabs: calculations.overflowTabs,
    shouldShowOverflow: calculations.overflowTabs.length > 0,
  };
};
