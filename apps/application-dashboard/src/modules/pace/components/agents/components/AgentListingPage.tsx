'use client';

import { useCallback, useMemo, useState } from 'react';
import { Button, ScrollContainer } from '@zamp-platform/ui';
import { Plus } from 'lucide-react';
import AgentActionBar from 'modules/pace/components/agents/components/AgentActionBar';
import AgentCard from 'modules/pace/components/agents/components/AgentCard';
import AgentCardSkeleton from 'modules/pace/components/agents/components/AgentCardSkeleton';
import CreateAgentModal from 'modules/pace/components/agents/components/CreateAgentModal';
import { AGENT_SEARCH_DEBOUNCE_MS } from 'modules/pace/components/agents/constants/agents.constants';
import {
  AGENT_FILTER_VALUE,
  AGENT_LISTING_TAB,
  type AgentListingTabType,
  type AgentType,
} from 'modules/pace/components/agents/types/agents.types';
import { useRouter } from 'next/navigation';
import { useGetAgentsListQuery } from '@/apis/agents';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { useDebounce } from '@/hooks';
import { buildTabRoute } from '@/modules/pace/components/dynamic-tabs/tab-type-registry';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import { usePaceContext } from '@/modules/pace/pace.context';
import { TAB_TYPE } from '@/modules/pace/pace.types';
import { preserveSidebarParam } from '@/modules/pace/pace.utils';

const AgentListingPage = () => {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AgentListingTabType>(AGENT_LISTING_TAB.MY_AGENTS);

  const { setActiveAgentInfo } = usePaceContext();
  const { openTab } = useDynamicTabs({ type: TAB_TYPE.AGENT });
  const debouncedSearch = useDebounce(searchTerm, AGENT_SEARCH_DEBOUNCE_MS);

  const tabQueries = {
    [AGENT_LISTING_TAB.ALL]: useGetAgentsListQuery({ filter: AGENT_FILTER_VALUE[AGENT_LISTING_TAB.ALL] }),
    [AGENT_LISTING_TAB.MY_AGENTS]: useGetAgentsListQuery({ filter: AGENT_FILTER_VALUE[AGENT_LISTING_TAB.MY_AGENTS] }),
    [AGENT_LISTING_TAB.SHARED_WITH_ME]: useGetAgentsListQuery({
      filter: AGENT_FILTER_VALUE[AGENT_LISTING_TAB.SHARED_WITH_ME],
    }),
  };

  const { data: activeData, isLoading, isError, refetch } = tabQueries[activeTab];

  const filteredAgents = useMemo(() => {
    if (!activeData?.agents) return [];

    if (!debouncedSearch) return activeData.agents;

    const search = debouncedSearch.toLowerCase();

    return activeData.agents.filter(
      (agent) => agent?.name?.toLowerCase().includes(search) || agent?.description?.toLowerCase().includes(search),
    );
  }, [activeData?.agents, debouncedSearch]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleTabChange = (tab: AgentListingTabType) => {
    setActiveTab(tab);
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleAgentClick = useCallback(
    (agent: AgentType) => {
      setActiveAgentInfo(null);

      const tabPath = buildTabRoute(agent.id, TAB_TYPE.AGENT);
      const pathWithTitle = `${tabPath}?title=${encodeURIComponent(agent?.name ?? '')}`;

      const metadata: Record<string, string> = {};

      if (agent.description) metadata.description = agent.description;
      if (agent.avatar) metadata.avatarKey = agent.avatar;

      const tabMetadata = Object.keys(metadata).length > 0 ? metadata : undefined;

      openTab(agent.id, agent?.name ?? '', tabMetadata);
      router.push(preserveSidebarParam(pathWithTitle));
    },
    [openTab, router, setActiveAgentInfo],
  );

  const handleAgentCreated = useCallback(
    (agentId: string, agentName: string, agentDescription: string, avatarKey: string) => {
      const tabPath = buildTabRoute(agentId, TAB_TYPE.AGENT);
      const params = new URLSearchParams({ title: agentName });

      if (agentDescription) {
        params.set('description', agentDescription);
      }

      const pathWithParams = `${tabPath}?${params.toString()}`;

      const metadata: Record<string, string> = {};

      if (agentDescription) metadata.description = agentDescription;
      if (avatarKey) metadata.avatarKey = avatarKey;

      openTab(agentId, agentName, Object.keys(metadata).length > 0 ? metadata : undefined);
      router.push(preserveSidebarParam(pathWithParams));
    },
    [openTab, router],
  );

  return (
    <div className='flex h-full flex-col overflow-hidden'>
      <div className='mx-auto w-full max-w-200'>
        <div className='bg-BG_WHITE flex shrink-0 items-center justify-between pt-6 pr-3 pb-3 pl-4'>
          <h1 className='text-GRAY_1000 f-20-500'>Agents</h1>
          <Button size='small' className='gap-1 rounded-md px-3 py-1.5' onClick={handleOpenCreateModal}>
            <Plus size={14} />
            <span className='f-12-500'>New Agent</span>
          </Button>
        </div>

        <AgentActionBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>

      <ScrollContainer className='flex-1'>
        <div className='mx-auto w-full max-w-200 px-4 pt-1 pb-4'>
          <CommonWrapper
            isLoading={isLoading}
            isError={isError}
            refetchFunction={refetch}
            isNoData={!isLoading && filteredAgents.length === 0}
            noDataBanner={
              <div className='text-GRAY_700 flex h-[calc(100vh-250px)] items-center justify-center text-sm'>
                No agents found
              </div>
            }
            skeletonType={SkeletonTypes.CUSTOM}
            loader={
              <div className='grid grid-cols-3 gap-4'>
                {Array.from({ length: 9 }).map((_, i) => (
                  <AgentCardSkeleton key={i} />
                ))}
              </div>
            }
            height={500}
            disableAnimation
          >
            <div className='grid grid-cols-3 gap-4'>
              {filteredAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} onClick={handleAgentClick} />
              ))}
            </div>
          </CommonWrapper>
        </div>
      </ScrollContainer>

      <CreateAgentModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onAgentCreated={handleAgentCreated}
      />
    </div>
  );
};

export default AgentListingPage;
