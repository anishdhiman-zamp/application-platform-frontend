'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { EVENT_TYPE } from '@zamp-platform/utils/event-bus';
import { Plus } from 'lucide-react';
import AgentActionBar from 'modules/pace/components/agents/components/AgentActionBar';
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
import { useEventBus } from '@/app/_providers/sse-provider';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import PageContainer from '@/components/layouts/PageContainer';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useDebounce } from '@/hooks';
import AgentCard from '@/modules/pace/components/agents/components/AgentCard';
import AgentEmptyState from '@/modules/pace/components/agents/empty-states/AgentEmptyState';
import AgentsEmptyState from '@/modules/pace/components/agents/empty-states/AgentsEmptyState';
import AgentCardSkeleton from '@/modules/pace/components/agents/skeletons/AgentCardSkeleton';
import AgentListingHeaderSkeleton from '@/modules/pace/components/agents/skeletons/AgentListingHeaderSkeleton';

const buildAgentDetailUrl = (
  agentId: string,
  name: string,
  description?: string | null,
  avatarKey?: string | null,
): string => {
  const params = new URLSearchParams();

  if (name) params.set('title', name);
  if (description) params.set('description', description);
  if (avatarKey) params.set('avatarKey', avatarKey);

  const query = params.toString();

  return `${ROUTES_PATH.CHAT_AGENTS}/${encodeURIComponent(agentId)}${query ? `?${query}` : ''}`;
};

const AgentListingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AgentListingTabType>(AGENT_LISTING_TAB.MY_AGENTS);

  const router = useRouter();
  const { sseEventBus } = useEventBus();
  const debouncedSearch = useDebounce(searchTerm, AGENT_SEARCH_DEBOUNCE_MS);

  const tabQueries = {
    [AGENT_LISTING_TAB.ALL]: useGetAgentsListQuery(
      { filter: AGENT_FILTER_VALUE[AGENT_LISTING_TAB.ALL] },
      { refetchOnMountOrArgChange: true },
    ),
    [AGENT_LISTING_TAB.MY_AGENTS]: useGetAgentsListQuery(
      { filter: AGENT_FILTER_VALUE[AGENT_LISTING_TAB.MY_AGENTS] },
      { refetchOnMountOrArgChange: true },
    ),
    [AGENT_LISTING_TAB.SHARED_WITH_ME]: useGetAgentsListQuery(
      { filter: AGENT_FILTER_VALUE[AGENT_LISTING_TAB.SHARED_WITH_ME] },
      { refetchOnMountOrArgChange: true },
    ),
  };

  const { data: activeData, isLoading, isError, refetch } = tabQueries[activeTab];
  const { data: allAgentsData, isLoading: isAllAgentsLoading } = tabQueries[AGENT_LISTING_TAB.ALL];

  const hasNoAgents = !isAllAgentsLoading && (allAgentsData?.agents?.length ?? 0) === 0;
  const isInitialLoading = isAllAgentsLoading || isLoading;

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
      router.push(buildAgentDetailUrl(agent.id, agent?.name ?? '', agent.description, agent.avatar));
    },
    [router],
  );

  const handleAgentCreated = useCallback(
    (agentId: string, agentName: string, agentDescription: string, avatarKey: string) => {
      router.push(buildAgentDetailUrl(agentId, agentName, agentDescription, avatarKey));
    },
    [router],
  );

  const subscribeToTaskEvents = useCallback(() => {
    const taskSub = sseEventBus.subscribe(EVENT_TYPE.TASK, () => refetch());
    const taskUpdateSub = sseEventBus.subscribe(EVENT_TYPE.TASK_UPDATE, () => refetch());

    return () => {
      taskSub.unsubscribe();
      taskUpdateSub.unsubscribe();
    };
  }, [sseEventBus, refetch]);

  // refetch when switching tabs
  useEffect(() => {
    refetch();
  }, [activeTab, refetch]);

  useEffect(() => subscribeToTaskEvents(), [subscribeToTaskEvents]);

  if (hasNoAgents) {
    return (
      <>
        <AgentEmptyState onNewAgent={handleOpenCreateModal} />
        <CreateAgentModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onAgentCreated={handleAgentCreated}
        />
      </>
    );
  }

  return (
    <>
      <PageContainer className='@container'>
        {isInitialLoading ? (
          <AgentListingHeaderSkeleton />
        ) : (
          <>
            <div className='mb-4 flex shrink-0 items-center justify-between'>
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
          </>
        )}

        <CommonWrapper
          isLoading={isInitialLoading}
          isError={isError}
          refetchFunction={refetch}
          isNoData={!isInitialLoading && filteredAgents.length === 0}
          noDataBanner={<AgentsEmptyState />}
          skeletonType={SkeletonTypes.CUSTOM}
          loader={
            <div className='grid grid-cols-1 gap-4 @sm:grid-cols-2 @3xl:grid-cols-3'>
              {Array.from({ length: 9 }).map((_, i) => (
                <AgentCardSkeleton key={i} />
              ))}
            </div>
          }
          height={500}
          disableAnimation
        >
          <div className='grid grid-cols-1 gap-4 @sm:grid-cols-2 @3xl:grid-cols-3'>
            {filteredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} onClick={handleAgentClick} />
            ))}
          </div>
        </CommonWrapper>
      </PageContainer>

      <CreateAgentModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onAgentCreated={handleAgentCreated}
      />
    </>
  );
};

export default AgentListingPage;
