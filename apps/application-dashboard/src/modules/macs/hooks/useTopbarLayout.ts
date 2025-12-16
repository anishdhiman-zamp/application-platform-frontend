import { useMemo } from 'react';
import { TopbarLayoutType } from 'modules/macs/types';
import { useMacsContext } from '@/modules/macs/context/MacsContext';

type TopbarLayout =
  | { type: TopbarLayoutType.ChatOnly }
  | { type: TopbarLayoutType.MacsOnly }
  | { type: TopbarLayoutType.Split; chatWidth: string; macsWidth: string };

export const useTopbarLayout = (): TopbarLayout => {
  const { hasTabs, isSectionPanelExpanded, isChatPanelExpanded } = useMacsContext();

  return useMemo(() => {
    // Chat panel expanded - show only chat topbar
    if (isChatPanelExpanded) {
      return { type: TopbarLayoutType.ChatOnly };
    }

    // Section panel expanded - show only macs topbar
    if (hasTabs && isSectionPanelExpanded) {
      return { type: TopbarLayoutType.MacsOnly };
    }

    // Both panels visible - show split topbars
    if (hasTabs) {
      return { type: TopbarLayoutType.Split, chatWidth: '40%', macsWidth: '60%' };
    }

    // Default - show only macs topbar
    return { type: TopbarLayoutType.MacsOnly };
  }, [hasTabs, isSectionPanelExpanded, isChatPanelExpanded]);
};
