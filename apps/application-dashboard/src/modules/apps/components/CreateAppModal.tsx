'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { Globe, X } from 'lucide-react';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { useAppSelector } from '@/hooks/toolkit';
import { getRandomPrompt } from '@/modules/apps/utils/appUtils';
import { usePaceContext } from '@/modules/pace/pace.context';
import { CHAT_SIDEBAR_STATE } from '@/modules/pace/pace.types';
import type { RootState } from '@/store';

interface CreateAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateAppModal = ({ open, onOpenChange }: CreateAppModalProps) => {
  // State
  const nameInputRef = useRef<HTMLInputElement>(null);
  const fileDropHandlerRef = useRef<((files: FileList) => void) | null>(null);

  const [appName, setAppName] = useState('');
  const [randomPrompt, setRandomPrompt] = useState(() => getRandomPrompt());

  // Derived State / Context
  const username = useAppSelector((state: RootState) => state.user.user?.username) ?? '';
  const currentUserName = useAppSelector((state: RootState) => state.user.user?.user_name) ?? '';
  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';

  const { setChatSidebarState, startNewChat, setChatMessageIntent } = usePaceContext();

  // Hooks
  const chat = useChat({
    resourceId: organizationId,
    resourceType: ResourceType.ORGANIZATION,
    enableStreaming: true,
  });

  const interceptedChat = useMemo(
    () => ({
      ...chat,
      createConversationV2: async (payload: CreateConversationPayloadTypeV2) => {
        const rawText = payload.message_content?.text || randomPrompt;
        const resolvedName = appName.trim() || 'My App';
        const messageText = `Create a new app called "${resolvedName}". ${rawText}`;
        const fileRefs = payload.message_content?.file_references;

        startNewChat();

        setChatMessageIntent({
          message: messageText,
          fileReferences: fileRefs?.map((ref) => ({ path: ref.path, name: ref.name })),
          llmModel: payload.llm_model,
        });

        setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
        onOpenChange(false);

        return { conversation_id: 'pending', status_message: '', title: resolvedName };
      },
    }),
    [chat, appName, randomPrompt, startNewChat, setChatMessageIntent, setChatSidebarState, onOpenChange],
  );

  const { isDragOver, dropZoneProps } = useFileDragDrop({
    onFileDrop: (files) => fileDropHandlerRef.current?.(files),
    disabled: chat.isStreaming || chat.isCreatingConversationV2,
  });

  // Handlers
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === KEYBOARD_KEYS.ENTER) {
      e.preventDefault();
      nameInputRef.current?.blur();
    }
  };

  const handleModalOpen = useCallback(() => {
    setAppName('');
    setRandomPrompt(getRandomPrompt());
    const timerId = setTimeout(() => nameInputRef.current?.select(), 100);

    return () => clearTimeout(timerId);
  }, []);

  useEffect(() => {
    if (open) {
      return handleModalOpen();
    }
  }, [open, handleModalOpen]);

  // Render
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='max-w-[480px] gap-0 overflow-hidden rounded-3xl p-0 shadow-lg'
        showCloseButton={false}
        title='Create new app'
        description='Create a new web application'
      >
        <ChatActionsProvider>
          <div className='relative flex flex-col p-6' {...dropZoneProps}>
            <DropOverlay isVisible={isDragOver} />
            <div className='mb-4 flex items-start justify-between'>
              <div className='bg-BG_GRAY_2 flex size-10 items-center justify-center rounded-xl'>
                <Globe size={20} className='text-GRAY_700' strokeWidth={1.5} />
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
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              onKeyDown={handleKeyDown}
              className='text-GRAY_1000 placeholder:text-GRAY_500 mb-3 w-full border-none bg-transparent text-[22px] leading-normal font-[550] outline-none'
              placeholder='My App'
            />

            <span className='text-GRAY_700 f-14-450 mb-4 w-full leading-normal'>
              Describe what you want to build and the agent will create and deploy it for you.
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
                placeholder={randomPrompt}
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

export default CreateAppModal;
