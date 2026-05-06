'use client';

import AgentDetailPage from 'modules/pace/components/agents/components/AgentDetailPage';
import { useMountedTabs } from 'modules/pace/components/file-viewer/useMountedTabs';
import { usePathname } from 'next/navigation';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { ROUTES_PATH } from '@/constants/routeConfig';
import TabWrapper from '@/modules/pace/components/dynamic-tabs/TabWrapper';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import { TAB_TYPE } from '@/modules/pace/pace.types';

const AgentTabsContainer = () => {
  const { tabs, activeTab, isHydrated, closeAllTabs, updateTab } = useDynamicTabs({ type: TAB_TYPE.AGENT });
  const pathname = usePathname();

  const { isMounted } = useMountedTabs(tabs, activeTab?.stableKey ?? null);
  const isAgentsSurface = pathname === ROUTES_PATH.CHAT_AGENTS;

  if (!isHydrated || !tabs?.length) {
    return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />;
  }

  return (
    <div className='relative h-full w-full'>
      {tabs?.map((tab) => {
        const isActive = activeTab?.stableKey === tab?.stableKey;

        if (!isMounted(tab.stableKey)) return null;

        const description = (tab.metadata?.description as string | undefined) ?? '';
        const avatarKey = (tab.metadata?.avatarKey as string | undefined) ?? '';

        return (
          <TabWrapper key={tab?.stableKey} isActive={isActive}>
            <AgentDetailPage
              key={tab.id}
              agentId={tab.id}
              agentName={tab.name}
              agentDescription={description}
              avatarKey={avatarKey}
              onAgentMetadataChange={(name, metadata) => updateTab(tab.id, tab.id, name, metadata)}
              showPanelHeader={isAgentsSurface}
              isPanelHeaderActive={isActive}
              onPanelHeaderClose={closeAllTabs}
            />
          </TabWrapper>
        );
      })}
    </div>
  );
};

export default AgentTabsContainer;
