import { useMemo } from 'react';
import { useMacsContext } from '@/modules/macs/context/MacsContext';

interface PanelSizes {
  chat: number;
  section: number;
}

export const usePanelSizes = (): PanelSizes => {
  const { hasTabs, isSectionPanelExpanded, isChatPanelExpanded } = useMacsContext();

  return useMemo(() => {
    // Chat panel expanded - chat takes full width
    if (isChatPanelExpanded) {
      return { chat: 100, section: 0 };
    }

    // Section panel expanded - section takes full width
    if (hasTabs && isSectionPanelExpanded) {
      return { chat: 0, section: 100 };
    }

    // Both panels visible - split view
    if (hasTabs) {
      return { chat: 40, section: 60 };
    }

    // Default - chat takes full width
    return { chat: 100, section: 0 };
  }, [hasTabs, isSectionPanelExpanded, isChatPanelExpanded]);
};
