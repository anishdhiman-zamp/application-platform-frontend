'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AutoSizeTextarea, Skeleton } from '@zamp-platform/ui';
import AddConnectionModal from 'modules/pace/components/agents/components/AddConnectionModal';
import AgentInstructions from 'modules/pace/components/agents/components/AgentInstructions';
import AgentPanelHeader from 'modules/pace/components/agents/components/AgentPanelHeader';
import AgentToolsAccess from 'modules/pace/components/agents/components/AgentToolsAccess';
import AgentTriggerList from 'modules/pace/components/agents/components/AgentTriggerList';
import BarrelCounter from 'modules/pace/components/agents/components/BarrelCounter';
import {
  getAddInstructionsMessage,
  getAddTriggerMessage,
  getAgentAvatar,
  getAgentAvatarByKey,
} from 'modules/pace/components/agents/constants/agents.constants';
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

interface AgentDetailSectionProps {
  title: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}

const AgentDetailSection = ({ title, trailing, children }: AgentDetailSectionProps) => (
  <section className='mb-7 flex flex-col'>
    <div className='mb-3 flex min-h-6 items-center gap-2 px-2.5'>
      <h2 className='text-GRAY_1000 f-14-550 min-w-0 truncate'>{title}</h2>
      {trailing}
    </div>
    {children}
  </section>
);

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

  const skipFetch = !agentExists;

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
    const nextName = agentData.name || agentName || editName;

    setEditName(nextName);
    setEditDescription(nextDescription);

    onAgentMetadataChange?.(nextName, {
      description: nextDescription,
      avatarKey: agentData.avatar ?? resolvedAvatarKey,
    });
  }, [
    agentData,
    agentListEntry?.description,
    agentDescription,
    agentName,
    editName,
    resolvedAvatarKey,
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

  // Sync local state + tab metadata when agent data arrives from API
  useEffect(() => {
    syncAgentData();
  }, [syncAgentData]);

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
          isAgentNameLoading={isLoadingAgent && !editName}
          onAgentNameChange={handleNameChange}
          onClose={onPanelHeaderClose}
        />
      )}
      <PageContainer className={`max-w-[656px] px-6 sm:px-12 ${showPanelHeader ? 'pt-6' : 'pt-12'}`}>
        {!showPanelHeader && (
          <>
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
            </div>

            {isLoadingAgent && !editName ? (
              <Skeleton className='mb-2 h-8 w-60' />
            ) : (
              <input
                value={editName}
                onChange={(e) => handleNameChange(e.target.value)}
                aria-label='Agent name'
                className='text-GRAY_1000 f-24-550 placeholder:text-GRAY_500 mb-2 w-full shrink-0 border-none bg-transparent outline-none'
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
            className='text-GRAY_700 f-14-450 placeholder:text-GRAY_500 mb-6 min-h-0 w-full shrink-0 border-none bg-transparent px-0 py-0 leading-5 shadow-none outline-none focus-visible:outline-none'
            placeholder='Add a description...'
          />
        )}

        <div className='flex flex-col'>
          <AgentDetailSection title='Instructions'>
            <AgentInstructions
              agentId={agentId}
              agentAvatarSrc={avatar.src}
              skipFetch={skipFetch}
              onAddInstructions={handleAddInstructions}
            />
          </AgentDetailSection>

          <AgentDetailSection title='Tasks'>
            <TaskAccordionGroup agentId={agentId} skipFetch={skipFetch} />
          </AgentDetailSection>

          <AgentDetailSection
            title='Triggers'
            trailing={triggerCount > 0 ? <BarrelCounter value={triggerCount} /> : undefined}
          >
            <AgentTriggerList
              agentId={agentId}
              agentAvatarSrc={avatar.src}
              skipFetch={skipFetch}
              onAddTrigger={handleAddNewTrigger}
            />
          </AgentDetailSection>

          <AgentDetailSection title='Files'>
            <AgentFolderList agentId={agentId} agentAvatarSrc={avatar.src} skipFetch={skipFetch} />
          </AgentDetailSection>

          <AgentDetailSection title='Tools & Access'>
            <AgentToolsAccess
              agentId={agentId}
              agentAvatarSrc={avatar.src}
              skipFetch={skipFetch}
              onAddConnection={handleAddNewConnection}
            />
          </AgentDetailSection>
        </div>
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
