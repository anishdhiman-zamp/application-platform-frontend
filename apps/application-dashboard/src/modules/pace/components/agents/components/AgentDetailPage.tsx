'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, ShimmerText, Skeleton } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ArrowLeft } from 'lucide-react';
import AddConnectionModal from 'modules/pace/components/agents/components/AddConnectionModal';
import AgentGreeting from 'modules/pace/components/agents/components/AgentGreeting';
import AgentInstructions from 'modules/pace/components/agents/components/AgentInstructions';
import AgentToolsAccess from 'modules/pace/components/agents/components/AgentToolsAccess';
import AgentTriggerList from 'modules/pace/components/agents/components/AgentTriggerList';
import BarrelCounter from 'modules/pace/components/agents/components/BarrelCounter';
import ShareAgentPopup from 'modules/pace/components/agents/components/ShareAgentPopup';
import {
  AGENT_DETAIL_TAB_CONFIG,
  getAddInstructionsMessage,
  getAddTriggerMessage,
  getAgentAvatar,
  getAgentAvatarByKey,
} from 'modules/pace/components/agents/constants/agents.constants';
import { AGENT_DETAIL_TAB, type AgentDetailTabType } from 'modules/pace/components/agents/types/agents.types';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
  useGetAgentInstructionsQuery,
  useGetAgentsListQuery,
  useGetAgentTriggersQuery,
  useUpdateAgentMutation,
} from '@/apis/agents';
import ImageKitImage from '@/components/ImageKitImage';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import AgentFolderList from '@/modules/pace/components/agents/components/AgentFolderList';
import { useAgentWithPolling } from '@/modules/pace/components/agents/hooks/useAgentWithPolling';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import TaskAccordionGroup from '@/modules/pace/components/tasks/components/TaskAccordionGroup';
import { useTriggerChatMessageFromButton } from '@/modules/pace/hooks/useTriggerChatMessageFromButton';
import { usePaceContext } from '@/modules/pace/pace.context';
import { CHAT_SIDEBAR_STATE, TAB_TYPE } from '@/modules/pace/pace.types';
import { preserveSidebarParam } from '@/modules/pace/pace.utils';
interface AgentDetailPageProps {
  agentId: string;
  agentName: string;
  agentDescription?: string;
  avatarKey?: string;
}

const VALID_TABS = new Set<string>(Object.values(AGENT_DETAIL_TAB));

const AgentDetailPage = ({ agentId, agentName, agentDescription = '', avatarKey = '' }: AgentDetailPageProps) => {
  const router = useRouter();
  const { isEnabled: isAgentsFe } = useFeatureFlag(FEATURE_FLAGS.AGENTS_FE);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { updateTab, getTabById } = useDynamicTabs({ type: TAB_TYPE.AGENT });
  const storedTab = getTabById(agentId);
  const storedActiveTab = storedTab?.metadata?.activeTab as string | undefined;

  // Read tab from URL params first, then stored metadata, default to instructions
  const initialTab = (() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');

      if (tabParam && VALID_TABS.has(tabParam)) return tabParam as AgentDetailTabType;
    }

    if (storedActiveTab && VALID_TABS.has(storedActiveTab)) return storedActiveTab as AgentDetailTabType;

    return AGENT_DETAIL_TAB.INSTRUCTIONS;
  })();

  const [activeDetailTab, setActiveDetailTab] = useState<AgentDetailTabType>(initialTab);

  const handleTabChange = useCallback(
    (tab: AgentDetailTabType) => {
      tabSwitchRef.current = true;
      setActiveDetailTab(tab);

      // Persist in URL
      const params = new URLSearchParams(window.location.search);

      params.set('tab', tab);
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);

      // Persist in tab metadata
      const currentTab = getTabById(agentId);

      if (currentTab) {
        updateTab(agentId, agentId, currentTab.name, { ...currentTab.metadata, activeTab: tab });
      }
    },
    [agentId, getTabById, updateTab],
  );

  const { data: agentData, isLoading: isLoadingAgent, isError: isAgentError } = useAgentWithPolling(agentId);

  const agentExists = Boolean(agentData);
  const { data: triggersData } = useGetAgentTriggersQuery({ agentId }, { skip: !agentExists });
  const { data: agentsListData } = useGetAgentsListQuery({}, { skip: !agentExists });
  const agentListEntry = agentsListData?.agents?.find((a) => a.id === agentId);
  const triggerCount = triggersData?.triggers?.length ?? 0;

  const initialName = agentData?.name || agentListEntry?.name || agentName || '';
  const initialDescription = agentData?.description || agentListEntry?.description || agentDescription;

  const [updateAgent] = useUpdateAgentMutation();

  const [editName, setEditName] = useState(initialName);
  const [editDescription, setEditDescription] = useState(initialDescription);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [instructionsShimmering, setInstructionsShimmering] = useState(false);
  const [isAddConnectionModalOpen, setIsAddConnectionModalOpen] = useState(false);
  const prevInstructionsFetchingRef = useRef(false);
  const shimmerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tabSwitchRef = useRef(false);

  const skipFetch = !agentExists;

  const displayName = editName || agentName || '';
  const resolvedAvatarKey = agentData?.avatar || avatarKey;
  const avatar =
    (resolvedAvatarKey && getAgentAvatarByKey(resolvedAvatarKey)) || getAgentAvatar(agentData?.name || agentName || '');

  const { isFetching: isInstructionsFetching, isLoading: isInstructionsLoading } = useGetAgentInstructionsQuery(
    { agentId },
    { skip: skipFetch },
  );

  const { triggerChatMessage } = useTriggerChatMessageFromButton({
    agentId,
    agentName: displayName,
    agentAvatar: resolvedAvatarKey || undefined,
  });

  const triggerShimmer = useCallback(() => {
    setInstructionsShimmering(true);
    if (shimmerTimerRef.current) clearTimeout(shimmerTimerRef.current);
    shimmerTimerRef.current = setTimeout(() => setInstructionsShimmering(false), 3000);
  }, []);

  const handleInstructionsRefetch = useCallback(() => {
    if (!prevInstructionsFetchingRef.current && isInstructionsFetching && !isInstructionsLoading) {
      if (!tabSwitchRef.current) {
        triggerShimmer();
      }
    }
    tabSwitchRef.current = false;
    prevInstructionsFetchingRef.current = isInstructionsFetching;
  }, [isInstructionsFetching, isInstructionsLoading, triggerShimmer]);

  const syncAgentData = useCallback(() => {
    if (!agentData) return;

    // Skip sync while user has a pending edit (debounce timer active)
    if (debounceTimerRef.current) return;

    if (agentData?.name) setEditName(agentData?.name);
    if (agentData?.description) setEditDescription(agentData?.description);

    if (agentData?.avatar) {
      updateTab(agentId, agentId, agentData?.name || editName, {
        description: agentData?.description || editDescription,
        avatarKey: agentData?.avatar,
      });
    }
  }, [agentData, agentId, editName, editDescription, updateTab]);

  const debouncedUpdate = useCallback(
    (fields: { name?: string; description?: string }) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      debounceTimerRef.current = setTimeout(async () => {
        debounceTimerRef.current = null;

        try {
          await updateAgent({ agentId, ...fields }).unwrap();

          const tabName = fields.name || editName;
          const tabDescription = fields.description ?? editDescription;

          updateTab(agentId, agentId, tabName, { description: tabDescription, avatarKey: resolvedAvatarKey });
        } catch {
          // Revert to last known good values on failure
          if (agentData?.name) setEditName(agentData?.name);
          if (agentData?.description) setEditDescription(agentData?.description);
        }
      }, 800);
    },
    [agentId, editName, editDescription, resolvedAvatarKey, updateAgent, updateTab],
  );

  const handleNameChange = useCallback(
    (value: string) => {
      setEditName(value);
      if (value.trim()) debouncedUpdate({ name: value.trim() });
    },
    [debouncedUpdate],
  );

  const handleDescriptionChange = useCallback(
    (value: string) => {
      setEditDescription(value);
      debouncedUpdate({ description: value });
    },
    [debouncedUpdate],
  );

  const { chatSidebarState, setChatSidebarState } = usePaceContext();

  const handleOpenSidebar = useCallback(() => {
    if (chatSidebarState === CHAT_SIDEBAR_STATE.COLLAPSED) {
      setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
    }
  }, [chatSidebarState, setChatSidebarState]);

  const handleChatWithAgent = useCallback(() => {
    triggerChatMessage(`I want to collaborate with ${displayName}`);
  }, [triggerChatMessage, displayName]);

  const handleBackToAgents = useCallback(() => {
    router.push(preserveSidebarParam(ROUTES_PATH.CHAT_AGENTS));
  }, [router]);

  const handleAddNewTrigger = useCallback(() => {
    triggerChatMessage(getAddTriggerMessage(displayName));
  }, [triggerChatMessage, displayName]);

  const handleAddInstructions = useCallback(() => {
    triggerChatMessage(getAddInstructionsMessage(displayName));
  }, [triggerChatMessage, displayName]);

  const handleAddNewConnection = useCallback(() => {
    setIsAddConnectionModalOpen(true);
  }, []);

  const handleInstructionsUpdating = useCallback(() => {
    triggerShimmer();
  }, [triggerShimmer]);

  useEffect(() => {
    handleInstructionsRefetch();
  }, [handleInstructionsRefetch]);

  useEffect(() => {
    return () => {
      if (shimmerTimerRef.current) clearTimeout(shimmerTimerRef.current);
    };
  }, []);

  // Sync local state + tab metadata when agent data arrives from API
  useEffect(() => {
    syncAgentData();
  }, [syncAgentData]);

  const tabContentMap: Record<AgentDetailTabType, React.ReactNode> = useMemo(
    () => ({
      [AGENT_DETAIL_TAB.TASKS]: (
        <TaskAccordionGroup
          agentId={agentId}
          isActive={activeDetailTab === AGENT_DETAIL_TAB.TASKS}
          skipFetch={skipFetch}
        />
      ),
      [AGENT_DETAIL_TAB.TRIGGERS]: (
        <AgentTriggerList
          agentId={agentId}
          agentAvatarSrc={avatar.src}
          isActive={activeDetailTab === AGENT_DETAIL_TAB.TRIGGERS}
          skipFetch={skipFetch}
          onAddTrigger={handleAddNewTrigger}
        />
      ),
      [AGENT_DETAIL_TAB.INSTRUCTIONS]: (
        <AgentInstructions
          agentId={agentId}
          agentAvatarSrc={avatar.src}
          isActive={activeDetailTab === AGENT_DETAIL_TAB.INSTRUCTIONS}
          skipFetch={skipFetch}
          onUpdating={handleInstructionsUpdating}
          onAddInstructions={handleAddInstructions}
        />
      ),
      [AGENT_DETAIL_TAB.FILES]: (
        <AgentFolderList
          agentId={agentId}
          agentAvatarSrc={avatar.src}
          isActive={activeDetailTab === AGENT_DETAIL_TAB.FILES}
          skipFetch={skipFetch}
        />
      ),
      [AGENT_DETAIL_TAB.TOOLS_AND_ACCESS]: (
        <AgentToolsAccess
          agentId={agentId}
          agentAvatarSrc={avatar.src}
          isActive={activeDetailTab === AGENT_DETAIL_TAB.TOOLS_AND_ACCESS}
          skipFetch={skipFetch}
          onAddConnection={handleAddNewConnection}
        />
      ),
    }),
    [
      agentId,
      activeDetailTab,
      skipFetch,
      handleInstructionsUpdating,
      handleAddNewTrigger,
      handleAddInstructions,
      handleAddNewConnection,
    ],
  );

  if (isAgentError) {
    return (
      <div className='flex h-full flex-col overflow-hidden'>
        <div className='flex shrink-0 items-center px-4 pt-3'>
          <Button
            variant='ghost'
            size='small'
            onClick={handleBackToAgents}
            className='text-GRAY_700 hover:text-GRAY_1000 gap-1 px-1 text-sm'
          >
            <ArrowLeft size={14} />
            <span>Back to all agents</span>
          </Button>
        </div>
        <div className='flex flex-1 flex-col items-center justify-center gap-2'>
          <h2 className='text-GRAY_1000 f-20-550'>Agent not found</h2>
          <p className='text-GRAY_700 f-14-450'>This agent may have been deleted or you don&apos;t have access.</p>
          <Button variant='outline' size='small' className='mt-2' onClick={handleBackToAgents}>
            Go to agents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-full flex-col overflow-hidden'>
      <div className='flex shrink-0 items-center justify-between px-4 pt-3'>
        <Button
          variant='ghost'
          size='small'
          onClick={handleBackToAgents}
          className='text-GRAY_700 hover:text-GRAY_1000 gap-1 px-1 text-sm'
        >
          <ArrowLeft size={14} />
          <span>Back to all agents</span>
        </Button>
      </div>

      <div className='mx-auto flex w-full max-w-200 flex-1 flex-col overflow-hidden px-4 pt-8'>
        <div className='mb-6 flex shrink-0 items-start gap-3'>
          <motion.div
            className='flex size-10 shrink-0 cursor-pointer items-center justify-center'
            onClick={handleOpenSidebar}
            onMouseEnter={() => setIsAvatarHovered(true)}
            onMouseLeave={() => setIsAvatarHovered(false)}
            animate={isAvatarHovered ? { scale: 1.1, rotate: [0, -10, 10, -5, 5, 0] } : { scale: 1, rotate: 0 }}
            transition={{
              rotate: { duration: 0.5, ease: 'easeInOut' },
              scale: { type: 'spring', stiffness: 400, damping: 10 },
            }}
          >
            <ImageKitImage
              src={avatar.src}
              alt={avatar.alt}
              width={36}
              height={36}
              className='size-full object-contain'
            />
          </motion.div>
          <AgentGreeting
            onChat={handleChatWithAgent}
            onAddTrigger={handleAddNewTrigger}
            isAvatarHovered={isAvatarHovered}
          />
          {isAgentsFe && <ShareAgentPopup agentId={agentId} />}
        </div>

        {isLoadingAgent && !editName ? (
          <Skeleton className='mb-2 h-8 w-60' />
        ) : (
          <input
            value={editName}
            onChange={(e) => handleNameChange(e.target.value)}
            className='text-GRAY_1000 f-26-550 placeholder:text-GRAY_500 mb-2 w-full shrink-0 border-none bg-transparent outline-none'
            placeholder='Agent name'
          />
        )}
        {isLoadingAgent && !editDescription ? (
          <Skeleton className='mb-6 h-5 w-80' />
        ) : (
          <input
            value={editDescription}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            className='text-GRAY_700 f-14-450 placeholder:text-GRAY_500 mb-6 w-full shrink-0 border-none bg-transparent outline-none'
            placeholder='Add a description...'
          />
        )}

        <div className='mb-3.5 flex shrink-0 items-center gap-1.5'>
          {AGENT_DETAIL_TAB_CONFIG.map((tab) => (
            <Button
              key={tab.id}
              variant='ghost'
              size='small'
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'f-12-500 cursor-pointer rounded-md px-2.5 py-1.5',
                activeDetailTab === tab.id
                  ? 'bg-GRAY_100 text-GRAY_1000'
                  : 'text-GRAY_900 hover:bg-GRAY_100 hover:text-GRAY_1000',
              )}
            >
              {tab.id === AGENT_DETAIL_TAB.INSTRUCTIONS && instructionsShimmering ? (
                <ShimmerText
                  text={tab.label}
                  autoAnimate
                  animationDuration={1500}
                  baseTextClassName='f-12-500 leading-[12px]'
                  shimmerTextClassName='f-12-500 leading-[12px]'
                />
              ) : (
                tab.label
              )}
              {tab.id === AGENT_DETAIL_TAB.TRIGGERS && triggerCount > 0 && (
                <BarrelCounter value={triggerCount} className='ml-1.5' />
              )}
            </Button>
          ))}
        </div>

        {Object.entries(tabContentMap).map(([tabId, content]) => (
          <div
            key={tabId}
            className={cn('mb-4 min-h-0 flex-col', activeDetailTab === tabId ? 'flex flex-1' : 'hidden')}
          >
            {content}
          </div>
        ))}
      </div>

      <AddConnectionModal
        open={isAddConnectionModalOpen}
        onOpenChange={setIsAddConnectionModalOpen}
        agentId={agentId}
      />
    </div>
  );
};

export default AgentDetailPage;
