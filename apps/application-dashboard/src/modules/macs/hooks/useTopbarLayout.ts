import { useMemo } from 'react';
import { useMacsContext } from '@/modules/macs/context/MacsContext';
import { TopbarLayoutType, ViewMode } from '@/modules/macs/types';

type TopbarLayout =
  | { type: TopbarLayoutType.Stacked }
  | { type: TopbarLayoutType.MacsOnly }
  | { type: TopbarLayoutType.Split; chatWidth: string; macsWidth: string };

export const useTopbarLayout = (): TopbarLayout => {
  const { viewMode } = useMacsContext();

  return useMemo(() => {
    switch (viewMode) {
      case ViewMode.SectionExpanded:
        return { type: TopbarLayoutType.MacsOnly };
      case ViewMode.Split:
        return { type: TopbarLayoutType.Split, chatWidth: '40%', macsWidth: '60%' };
      case ViewMode.Default:
      default:
        return { type: TopbarLayoutType.Stacked };
    }
  }, [viewMode]);
};
