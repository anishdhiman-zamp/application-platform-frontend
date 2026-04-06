'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChatActionsProvider,
  ConnectedChatInput,
  CreateConversationPayloadTypeV2,
  DropOverlay,
  ResourceType,
  ScopeType,
  useChat,
  useFileDragDrop,
} from '@zamp-platform/chat';
import { Button, Dialog, DialogContent } from '@zamp-platform/ui';
import { X } from 'lucide-react';
import {
  AGENT_DEFAULT_DESCRIPTION,
  type AgentAvatarConfig,
  getAgentAvatar,
  getRandomAgentName,
  PrefixMessage,
} from 'modules/pace/components/agents/constants/agents.constants';
import ImageKitImage from '@/components/ImageKitImage';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { useAppSelector } from '@/hooks/toolkit';
import { usePaceContext } from '@/modules/pace/pace.context';
import { CHAT_SIDEBAR_STATE } from '@/modules/pace/pace.types';
import type { RootState } from '@/store';

interface CreateAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentCreated: (agentId: string, agentName: string, agentDescription: string, avatarKey: string) => void;
}

const CreateAgentModal = ({ open, onOpenChange, onAgentCreated }: CreateAgentModalProps) => {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const fileDropHandlerRef = useRef<((files: FileList) => void) | null>(null);

  const [agentName, setAgentName] = useState('');
  const agentDescription = AGENT_DEFAULT_DESCRIPTION;
  const [agentAvatar, setAgentAvatar] = useState<AgentAvatarConfig>(() => getAgentAvatar(''));

  const username = useAppSelector((state: RootState) => state.user.user?.username) ?? '';
  const currentUserName = useAppSelector((state: RootState) => state.user.user?.user_name) ?? '';
  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';

  const { setChatSidebarState, startNewChat, setPendingConversationPayload, setActiveAgentInfo } = usePaceContext();

  const chat = useChat({
    resourceId: organizationId,
    resourceType: ResourceType.ORGANIZATION,
    enableStreaming: true,
  });

  const interceptedChat = useMemo(
    () => ({
      ...chat,
      createConversationV2: async (payload: CreateConversationPayloadTypeV2) => {
        const tempId = crypto.randomUUID();
        const rawText = payload.message_content?.text || '';
        const messageText = rawText ? `${PrefixMessage.OPTIMISTIC_AGENT_CREATION} ${rawText}` : '';
        const fileRefs = payload.message_content?.file_references;

        startNewChat();

        setPendingConversationPayload({
          message: messageText,
          fileReferences: fileRefs?.map((ref) => ({ path: ref.path, name: ref.name })),
          llmModel: payload.llm_model,
          metadata: {
            agent_id: tempId,
            name: agentName,
            description: agentDescription,
            avatar: agentAvatar.key,
          },
        });

        setActiveAgentInfo({ id: tempId, name: agentName });
        onAgentCreated(tempId, agentName, agentDescription, agentAvatar.key);
        setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
        onOpenChange(false);

        return { conversation_id: 'pending', status_message: '', title: agentName };
      },
    }),
    [
      chat,
      agentName,
      agentAvatar,
      startNewChat,
      setPendingConversationPayload,
      setActiveAgentInfo,
      setChatSidebarState,
      onAgentCreated,
      onOpenChange,
    ],
  );

  const { isDragOver, dropZoneProps } = useFileDragDrop({
    onFileDrop: (files) => fileDropHandlerRef.current?.(files),
    disabled: chat.isStreaming || chat.isCreatingConversationV2,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === KEYBOARD_KEYS.ENTER) {
      e.preventDefault();
      nameInputRef.current?.blur();
    }
  };

  useEffect(() => {
    if (open) {
      const name = getRandomAgentName();

      setAgentAvatar(getAgentAvatar(name));
      const timerId = setTimeout(() => nameInputRef.current?.select(), 100);

      return () => clearTimeout(timerId);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='max-w-[480px] gap-0 overflow-hidden rounded-3xl p-0 shadow-lg'
        showCloseButton={false}
        title='Create new agent'
        description='Create a new AI agent'
      >
        <ChatActionsProvider>
          <div className='relative flex flex-col p-6' {...dropZoneProps}>
            <DropOverlay isVisible={isDragOver} />
            <div className='mb-4 flex items-start justify-between'>
              <div className='flex size-10 items-center justify-center'>
                <ImageKitImage
                  src={agentAvatar.src}
                  alt={agentAvatar.alt}
                  width={40}
                  height={40}
                  className='size-full object-contain'
                />
              </div>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => onOpenChange(false)}
                className='text-GRAY_700 hover:text-GRAY_1000 -mt-1 -mr-1 size-7'
              >
                <X size={18} />
              </Button>
            </div>

            <input
              ref={nameInputRef}
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              onKeyDown={handleKeyDown}
              className='text-GRAY_1000 placeholder:text-GRAY_500 mb-3 w-full border-none bg-transparent text-[22px] leading-normal font-[550] outline-none'
              placeholder='Agent Thanos'
            />

            <span className='text-GRAY_700 placeholder:text-GRAY_500 f-14-450 mb-4 w-full border-none bg-transparent leading-normal outline-none'>
              {AGENT_DEFAULT_DESCRIPTION}
            </span>

            <div className='w-full'>
              <ConnectedChatInput
                chat={interceptedChat}
                resourceType={ResourceType.ORGANIZATION}
                resourceId={organizationId}
                scope={ScopeType.ORGANIZATION}
                scopeId={organizationId}
                username={username}
                currentUserName={currentUserName}
                placeholder='Instruct me'
                conversationId={chat.conversationId ?? ''}
                minTextareaHeight={18}
                maxTextareaHeight={120}
                className='border-GRAY_300 rounded-xl border'
                fileDropHandlerRef={fileDropHandlerRef}
              />
            </div>
          </div>
        </ChatActionsProvider>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAgentModal;
