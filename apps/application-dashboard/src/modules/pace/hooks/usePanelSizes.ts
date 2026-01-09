import { useMemo } from 'react';
import { useMacsContext } from '@/modules/pace/context/MacsContext';
import { ViewMode } from '@/modules/pace/types';

interface PanelSizes {
  chat: number;
  section: number;
}

export const usePanelSizes = (): PanelSizes => {
  const { viewMode } = useMacsContext();

  return useMemo(() => {
    switch (viewMode) {
      case ViewMode.SectionExpanded:
        return { chat: 0, section: 100 };
      case ViewMode.Split:
        return { chat: 40, section: 60 };
      case ViewMode.Default:
      default:
        return { chat: 100, section: 0 };
    }
  }, [viewMode]);
};
