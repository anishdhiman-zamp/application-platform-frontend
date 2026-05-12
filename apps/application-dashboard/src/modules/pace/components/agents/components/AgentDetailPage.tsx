'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AutoSizeTextarea, Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import AddConnectionModal from 'modules/pace/components/agents/components/AddConnectionModal';
import AgentInstructions from 'modules/pace/components/agents/components/AgentInstructions';
import AgentPanelHeader from 'modules/pace/components/agents/components/AgentPanelHeader';
import AgentToolsAccess from 'modules/pace/components/agents/components/AgentToolsAccess';
import AgentTriggerList from 'modules/pace/components/agents/components/AgentTriggerList';
import BarrelCounter from 'modules/pace/components/agents/components/BarrelCounter';
import {
  AGENT_DETAIL_TAB_CONFIG,
  getAddInstructionsMessage,
  getAddTriggerMessage,
  getAgentAvatar,
  getAgentAvatarByKey,
} from 'modules/pace/components/agents/constants/agents.constants';
import { AGENT_DETAIL_TAB, type AgentDetailTabType } from 'modules/pace/components/agents/types/agents.types';
import { motion } from 'motion/react';
import { useGetAgentsListQuery, useGetAgentTriggersQuery, useUpdateAgentMutation } from '@/apis/agents';
import ImageKitImage from '@/components/ImageKitImage';
import PageContainer from '@/components/layouts/PageContainer';
import AgentFolderList from '@/modules/pace/components/agents/components/AgentFolderList';
import { useAgentWithPolling } from '@/modules/pace/components/agents/hooks/useAgentWithPolling';
import TaskAccordionGroup from '@/modules/pace/components/tasks/components/TaskAccordionGroup';
import { useTriggerChatMessageFromButton } from '@/modules/pace/hooks/useTriggerChatMessageFromButton';
import { usePaceLayoutContext } from '@/modules/pace/pace.context';
import { CHAT_SIDEBAR_STATE } from '@/modules/pace/pace.types';

interface AgentDetailPageProps {
  agentId: string;
  agentName: string;
  agentDescription?: string;
  avatarKey?: string;
  onAgentMetadataChange?: (name: string, metadata: { description?: string; avatarKey?: string }) => void;
  showPanelHeader?: boolean;
  isPanelHeaderActive?: boolean;
  onPanelHeaderClose?: () => void;
}

const AGENT_DESCRIPTION_MAX_HEIGHT = 60;
const AGENT_TAB_PANEL_CLASS = 'mt-0 pt-4 data-[state=inactive]:hidden';

const normalizeAgentDescription = (description?: string | null) => {
  if (!description || description === 'None') return '';

  return description;
};

const AgentDetailPage = ({
  agentId,
  agentName,
  agentDescription = '',
  avatarKey = '',
  onAgentMetadataChange,
  showPanelHeader = false,
  isPanelHeaderActive = false,
  onPanelHeaderClose,
}: AgentDetailPageProps) => {
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: agentData, isLoading: isLoadingAgent, isError: isAgentError } = useAgentWithPolling(agentId);

  const agentExists = Boolean(agentData);
  const { data: triggersData } = useGetAgentTriggersQuery({ agentId }, { skip: !agentExists });
  const { data: agentsListData } = useGetAgentsListQuery({}, { skip: !agentExists });
  const agentListEntry = agentsListData?.agents?.find((a) => a.id === agentId);
  const triggerCount = triggersData?.triggers?.length ?? 0;

  const initialName = agentData?.name ?? agentListEntry?.name ?? agentName ?? '';
  const initialDescription =
    normalizeAgentDescription(agentData?.description) ||
    normalizeAgentDescription(agentListEntry?.description) ||
    normalizeAgentDescription(agentDescription);

  const [updateAgent] = useUpdateAgentMutation();

  const [editName, setEditName] = useState(initialName);
  const [editDescription, setEditDescription] = useState(initialDescription);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [isAddConnectionModalOpen, setIsAddConnectionModalOpen] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<AgentDetailTabType>(AGENT_DETAIL_TAB.INSTRUCTIONS);

  const skipFetch = !agentExists;
  const isInstructionsTabActive = activeDetailTab === AGENT_DETAIL_TAB.INSTRUCTIONS;
  const isTasksTabActive = activeDetailTab === AGENT_DETAIL_TAB.TASKS;
  const isTriggersTabActive = activeDetailTab === AGENT_DETAIL_TAB.TRIGGERS;
  const isFilesTabActive = activeDetailTab === AGENT_DETAIL_TAB.FILES;
  const isToolsAccessTabActive = activeDetailTab === AGENT_DETAIL_TAB.TOOLS_AND_ACCESS;
  const displayName = editName || agentName || '';
  const resolvedAvatarKey = agentData?.avatar || avatarKey;
  const avatar =
    (resolvedAvatarKey && getAgentAvatarByKey(resolvedAvatarKey)) || getAgentAvatar(agentData?.name || agentName || '');

  const { triggerChatMessage } = useTriggerChatMessageFromButton({
    agentId,
    agentName: displayName,
    agentAvatar: resolvedAvatarKey || undefined,
  });

  const syncAgentData = useCallback(() => {
    if (!agentData) return;

    // Skip sync while user has a pending edit (debounce timer active)
    if (debounceTimerRef.current) return;

    const nextDescription =
      normalizeAgentDescription(agentData.description) ||
      normalizeAgentDescription(agentListEntry?.description) ||
      normalizeAgentDescription(agentDescription);
    const nextName = agentData.name || agentName || '';
    const nextAvatarKey = agentData.avatar ?? avatarKey;

    setEditName((currentName) => (currentName === nextName ? currentName : nextName));
    setEditDescription((currentDescription) =>
      currentDescription === nextDescription ? currentDescription : nextDescription,
    );

    const hasMetadataChanged =
      nextName !== agentName ||
      nextDescription !== normalizeAgentDescription(agentDescription) ||
      (nextAvatarKey || '') !== (avatarKey || '');

    if (hasMetadataChanged) {
      onAgentMetadataChange?.(nextName, {
        description: nextDescription,
        avatarKey: nextAvatarKey,
      });
    }
  }, [
    agentData?.avatar,
    agentData?.description,
    agentData?.id,
    agentData?.name,
    agentListEntry?.description,
    agentDescription,
    agentName,
    avatarKey,
    onAgentMetadataChange,
  ]);

  const debouncedUpdate = useCallback(
    (fields: { name?: string; description?: string }) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      debounceTimerRef.current = setTimeout(async () => {
        debounceTimerRef.current = null;

        try {
          await updateAgent({ agentId, ...fields }).unwrap();

          const tabName = fields.name || editName;
          const tabDescription = fields.description ?? editDescription;

          onAgentMetadataChange?.(tabName, { description: tabDescription, avatarKey: resolvedAvatarKey });
        } catch {
          // Revert to last known good values on failure
          setEditName(agentData?.name || agentName || editName);
          setEditDescription(
            normalizeAgentDescription(agentData?.description) ||
              normalizeAgentDescription(agentListEntry?.description) ||
              normalizeAgentDescription(agentDescription),
          );
        }
      }, 800);
    },
    [
      agentId,
      editName,
      editDescription,
      resolvedAvatarKey,
      agentData?.name,
      agentData?.description,
      agentListEntry?.description,
      agentDescription,
      agentName,
      updateAgent,
      onAgentMetadataChange,
    ],
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

  const { chatSidebarState, setChatSidebarState } = usePaceLayoutContext();

  const handleOpenSidebar = useCallback(() => {
    if (chatSidebarState === CHAT_SIDEBAR_STATE.COLLAPSED) {
      setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
    }
  }, [chatSidebarState, setChatSidebarState]);

  const handleAddNewTrigger = useCallback(() => {
    triggerChatMessage(getAddTriggerMessage(displayName));
  }, [triggerChatMessage, displayName]);

  const handleAddInstructions = useCallback(() => {
    triggerChatMessage(getAddInstructionsMessage(displayName));
  }, [triggerChatMessage, displayName]);

  const handleAddNewConnection = useCallback(() => {
    setIsAddConnectionModalOpen(true);
  }, []);

  const handleDetailTabChange = (tab: string) => {
    setActiveDetailTab(tab as AgentDetailTabType);
  };

  // Sync local state + tab metadata when agent data arrives from API
  useEffect(() => {
    syncAgentData();
  }, [syncAgentData]);

  useEffect(() => {
    setActiveDetailTab(AGENT_DETAIL_TAB.INSTRUCTIONS);
  }, [agentId]);

  if (isAgentError) {
    return (
      <div className='flex h-full flex-col'>
        <div className='flex flex-1 flex-col items-center justify-center gap-2'>
          <h2 className='text-GRAY_1000 f-20-550'>Agent not found</h2>
          <p className='text-GRAY_700 f-14-450'>This agent may have been deleted or you don&apos;t have access.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showPanelHeader && onPanelHeaderClose && (
        <AgentPanelHeader
          isActive={isPanelHeaderActive}
          agentId={agentId}
          agentName={editName}
          agentDescription={editDescription}
          avatarKey={resolvedAvatarKey || undefined}
          isAgentNameLoading={isLoadingAgent && !editName}
          onAgentNameChange={handleNameChange}
          onClose={onPanelHeaderClose}
        />
      )}
      <PageContainer className={`max-w-[656px] px-6 ${showPanelHeader ? 'pt-6' : 'pt-12'}`}>
        {!showPanelHeader && (
          <>
            <div className='mb-6 flex shrink-0 items-start gap-3'>
              <motion.div
                className='flex size-8 shrink-0 cursor-pointer items-center justify-center'
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
                  width={32}
                  height={32}
                  className='size-full object-contain'
                />
              </motion.div>
            </div>

            {isLoadingAgent && !editName ? (
              <Skeleton className='mb-2 h-8 w-60' />
            ) : (
              <input
                value={editName}
                onChange={(e) => handleNameChange(e.target.value)}
                aria-label='Agent name'
                className='text-GRAY_1000 f-20-550 placeholder:text-GRAY_500 mb-2 w-full shrink-0 border-none bg-transparent outline-none'
                placeholder='Agent name'
              />
            )}
          </>
        )}
        {isLoadingAgent && !editDescription ? (
          <Skeleton className='mb-6 h-5 w-80' />
        ) : (
          <AutoSizeTextarea
            value={editDescription}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            aria-label='Agent description'
            minRows={1}
            maxHeight={AGENT_DESCRIPTION_MAX_HEIGHT}
            className='text-GRAY_700 f-14-450 placeholder:text-GRAY_500 mb-4 min-h-0 w-full shrink-0 border-none bg-transparent px-0 py-0 leading-5 shadow-none outline-none focus-visible:outline-none'
            placeholder='Add a description...'
          />
        )}

        <Tabs value={activeDetailTab} onValueChange={handleDetailTabChange} className='min-h-0 w-full'>
          <TabsList className='border-GRAY_400 mb-5 h-10 w-full max-w-full justify-start gap-5 overflow-x-auto rounded-none border-b bg-transparent p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
            {AGENT_DETAIL_TAB_CONFIG.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                aria-label={
                  tab.id === AGENT_DETAIL_TAB.TRIGGERS && triggerCount > 0 ? `${tab.label} ${triggerCount}` : tab.label
                }
                className={cn(
                  'f-13-500 text-GRAY_700 hover:text-GRAY_1000 relative h-10 cursor-pointer gap-1.5 rounded-none border-none bg-transparent px-1.5 py-0 shadow-none ring-0 transition-colors hover:bg-transparent',
                  'after:absolute after:right-1.5 after:bottom-0 after:left-1.5 after:h-0.5 after:bg-transparent after:content-[""]',
                  'data-[state=active]:text-GRAY_1000 data-[state=active]:after:bg-GRAY_1000 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:ring-0',
                )}
              >
                <span className='whitespace-nowrap'>{tab.label}</span>
                {tab.id === AGENT_DETAIL_TAB.TRIGGERS && triggerCount > 0 && <BarrelCounter value={triggerCount} />}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={AGENT_DETAIL_TAB.INSTRUCTIONS} forceMount className={AGENT_TAB_PANEL_CLASS}>
            <AgentInstructions
              agentId={agentId}
              agentAvatarSrc={avatar.src}
              isActive={isInstructionsTabActive}
              skipFetch={skipFetch}
              onAddInstructions={handleAddInstructions}
            />
          </TabsContent>

          <TabsContent value={AGENT_DETAIL_TAB.TASKS} forceMount className={AGENT_TAB_PANEL_CLASS}>
            <TaskAccordionGroup agentId={agentId} isActive={isTasksTabActive} skipFetch={skipFetch} />
          </TabsContent>

          <TabsContent value={AGENT_DETAIL_TAB.TRIGGERS} forceMount className={AGENT_TAB_PANEL_CLASS}>
            <AgentTriggerList
              agentId={agentId}
              agentAvatarSrc={avatar.src}
              isActive={isTriggersTabActive}
              skipFetch={skipFetch}
              onAddTrigger={handleAddNewTrigger}
            />
          </TabsContent>

          <TabsContent value={AGENT_DETAIL_TAB.FILES} forceMount className={AGENT_TAB_PANEL_CLASS}>
            <AgentFolderList
              agentId={agentId}
              agentAvatarSrc={avatar.src}
              isActive={isFilesTabActive}
              skipFetch={skipFetch}
            />
          </TabsContent>

          <TabsContent value={AGENT_DETAIL_TAB.TOOLS_AND_ACCESS} forceMount className={AGENT_TAB_PANEL_CLASS}>
            <AgentToolsAccess
              agentId={agentId}
              agentAvatarSrc={avatar.src}
              isActive={isToolsAccessTabActive}
              skipFetch={skipFetch}
              onAddConnection={handleAddNewConnection}
            />
          </TabsContent>
        </Tabs>
      </PageContainer>

      <AddConnectionModal
        open={isAddConnectionModalOpen}
        onOpenChange={setIsAddConnectionModalOpen}
        agentId={agentId}
      />
    </>
  );
};

export default AgentDetailPage;
