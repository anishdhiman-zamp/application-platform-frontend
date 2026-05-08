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
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useGetAgentsListQuery } from '@/apis/agents';
import { useEventBus } from '@/app/_providers/sse-provider';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useDebounce } from '@/hooks';
import AgentCard from '@/modules/pace/components/agents/components/AgentCard';
import AgentDetailPage from '@/modules/pace/components/agents/components/AgentDetailPage';
import AgentPanelHeader from '@/modules/pace/components/agents/components/AgentPanelHeader';
import AgentEmptyState from '@/modules/pace/components/agents/empty-states/AgentEmptyState';
import AgentsEmptyState from '@/modules/pace/components/agents/empty-states/AgentsEmptyState';
import AgentCardSkeleton from '@/modules/pace/components/agents/skeletons/AgentCardSkeleton';
import AgentListingHeaderSkeleton from '@/modules/pace/components/agents/skeletons/AgentListingHeaderSkeleton';
import { buildAgentListingPanelRoute } from '@/modules/pace/components/agents/utils/agents.utils';
import {
  buildAgentPanelClosePath,
  buildPathWithParams,
} from '@/modules/pace/components/page-side-panel/page-side-panel.utils';
import PageSidePanel from '@/modules/pace/components/page-side-panel/PageSidePanel';
import { TAB_QUERY_PARAM } from '@/modules/pace/pace.types';

const AGENT_CARD_GRID_CLASS =
  'grid grid-cols-[350px] gap-4 @3xl:grid-cols-[repeat(2,350px)] @5xl:grid-cols-[repeat(3,350px)]';
const AGENT_CARD_GRID_WIDTH_CLASS = 'w-full max-w-[350px] @3xl:max-w-[716px] @5xl:max-w-[1082px]';

const AgentListingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AgentListingTabType>(AGENT_LISTING_TAB.MY_AGENTS);

  const router = useRouter();
  const pathname = usePathname() ?? ROUTES_PATH.CHAT_AGENTS;
  const searchParams = useSearchParams();
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
  const selectedAgentId = searchParams?.get(TAB_QUERY_PARAM.AGENT) ?? '';
  const selectedAgent = useMemo(() => {
    if (!selectedAgentId) return undefined;

    return [...(activeData?.agents ?? []), ...(allAgentsData?.agents ?? [])].find(
      (agent) => agent.id === selectedAgentId,
    );
  }, [activeData?.agents, allAgentsData?.agents, selectedAgentId]);
  const selectedAgentName = searchParams?.get('title') ?? selectedAgent?.name ?? selectedAgentId;
  const selectedAgentDescription = searchParams?.get('description') ?? selectedAgent?.description ?? '';
  const selectedAgentAvatarKey = searchParams?.get('avatarKey') ?? selectedAgent?.avatar ?? '';

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
      router.push(buildAgentListingPanelRoute(agent.id, agent?.name ?? '', agent.description, agent.avatar));
    },
    [router],
  );

  const handleAgentCreated = useCallback(
    (agentId: string, agentName: string, agentDescription: string, avatarKey: string) => {
      setIsCreateModalOpen(false);
      router.push(buildAgentListingPanelRoute(agentId, agentName, agentDescription, avatarKey));
    },
    [router],
  );

  const handleCloseAgentPanel = useCallback(() => {
    router.push(buildAgentPanelClosePath(pathname, searchParams));
  }, [pathname, router, searchParams]);

  const handleAgentMetadataChange = useCallback(
    (name: string, metadata: { description?: string; avatarKey?: string }) => {
      if (!selectedAgentId) return;

      const params = new URLSearchParams(searchParams?.toString());

      params.set(TAB_QUERY_PARAM.AGENT, selectedAgentId);
      if (name) params.set('title', name);
      if (metadata.description) params.set('description', metadata.description);
      else params.delete('description');
      if (metadata.avatarKey) params.set('avatarKey', metadata.avatarKey);
      else params.delete('avatarKey');

      const nextPath = buildPathWithParams(pathname, params);
      const currentPath = buildPathWithParams(pathname, new URLSearchParams(searchParams?.toString()));

      if (nextPath !== currentPath) {
        router.replace(nextPath);
      }
    },
    [pathname, router, searchParams, selectedAgentId],
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

  const agentDetailPanel = (
    <PageSidePanel
      open={Boolean(selectedAgentId)}
      ariaLabel='Agent details'
      onClose={handleCloseAgentPanel}
      widthStorageId='agents'
      header={
        <AgentPanelHeader
          isActive={Boolean(selectedAgentId)}
          agentId={selectedAgentId}
          agentName={selectedAgentName}
          agentDescription={selectedAgentDescription}
          avatarKey={selectedAgentAvatarKey}
          onClose={handleCloseAgentPanel}
        />
      }
    >
      {selectedAgentId && (
        <AgentDetailPage
          agentId={selectedAgentId}
          agentName={selectedAgentName}
          agentDescription={selectedAgentDescription}
          avatarKey={selectedAgentAvatarKey}
          onAgentMetadataChange={handleAgentMetadataChange}
        />
      )}
    </PageSidePanel>
  );

  if (hasNoAgents) {
    return (
      <div className='relative h-full min-h-0 w-full overflow-hidden'>
        <div className='bg-BG_WHITE flex h-full min-h-0 w-full flex-col overflow-hidden'>
          <div className='border-GRAY_400 flex h-[54px] shrink-0 items-center border-b px-4'>
            <h1 className='f-14-550 text-GRAY_1000 min-w-0 truncate'>Agents</h1>
          </div>
          <div className='min-h-0 flex-1 overflow-hidden'>
            <AgentEmptyState onNewAgent={handleOpenCreateModal} />
          </div>
        </div>
        <CreateAgentModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onAgentCreated={handleAgentCreated}
        />
        {agentDetailPanel}
      </div>
    );
  }

  return (
    <div className='relative h-full min-h-0 w-full overflow-hidden'>
      <div className='bg-BG_WHITE flex h-full min-h-0 w-full flex-col overflow-hidden'>
        <div className='border-GRAY_400 @container flex h-[54px] shrink-0 items-center border-b px-4'>
          <div className={`${AGENT_CARD_GRID_WIDTH_CLASS} flex min-w-0 items-center justify-between gap-3`}>
            <h1 className='f-14-550 text-GRAY_1000 min-w-0 truncate'>Agents</h1>
            <Button
              size='small'
              className='h-8 shrink-0 gap-1 rounded-md px-2.5 py-1.5 min-[480px]:px-3'
              onClick={handleOpenCreateModal}
              aria-label='New Agent'
            >
              <Plus size={14} />
              <span className='f-12-500 hidden whitespace-nowrap min-[480px]:inline'>New Agent</span>
            </Button>
          </div>
        </div>
        {isInitialLoading ? (
          <AgentListingHeaderSkeleton />
        ) : (
          <AgentActionBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        )}

        <CommonWrapper
          isLoading={isInitialLoading}
          isError={isError}
          refetchFunction={refetch}
          isNoData={!isInitialLoading && filteredAgents.length === 0}
          noDataBanner={<AgentsEmptyState />}
          skeletonType={SkeletonTypes.CUSTOM}
          loader={
            <div className={AGENT_CARD_GRID_CLASS}>
              {Array.from({ length: 15 }).map((_, i) => (
                <AgentCardSkeleton key={i} />
              ))}
            </div>
          }
          height={500}
          className='@container min-h-0 flex-1 overflow-y-auto p-[16px] [scrollbar-width:thin]'
          disableAnimation
        >
          <div className={AGENT_CARD_GRID_CLASS}>
            {filteredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} onClick={handleAgentClick} />
            ))}
          </div>
        </CommonWrapper>
      </div>

      <CreateAgentModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onAgentCreated={handleAgentCreated}
      />
      {agentDetailPanel}
    </div>
  );
};

export default AgentListingPage;
