'use client';
import { FC, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  AnnotationType,
  ButtonBlockType,
  ConnectedChatInput,
  LocationType,
  MessageContainer,
  ResourceType,
  ScopeType,
  SenderType,
  useChat,
} from '@zamp-platform/chat';
import { cn } from '@zamp-platform/ui/utils';
import { CirclePlus, EllipsisVertical } from 'lucide-react';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { RootState } from '@/store';
import { ProcessStatus } from '@/types/api/processApi.types';
import { MapAny } from '@/types/commonTypes';

interface KnowledgeBaseChatProps {
  status?: ProcessStatus;
  processId: string;
  conversationId?: string;
  isLoadingFilterConversations?: boolean;
  defaultMessage?: string;
  onNewConversation?: () => void;
  setConversationId?: (conversationId: string) => void;
  isDisabled?: boolean;
}

const KnowledgeBaseChat: FC<KnowledgeBaseChatProps> = ({
  status,
  processId,
  conversationId,
  isLoadingFilterConversations = false,
  defaultMessage,
  onNewConversation,
  setConversationId,
  isDisabled,
}) => {
  const currentUserName = useSelector((state: RootState) => state?.user?.user?.user_name);
  const organizationId = useSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id ?? '');
  const [header, setHeader] = useState('');
  const [isNewConversation, setIsNewConversation] = useState(false);
  const [chatInputKey, setChatInputKey] = useState(0);

  const chat = useChat({
    resourceId: processId,
    resourceType: ResourceType.PROCESS,
    conversationId: conversationId,
    setHeader: setHeader,
  });

  // Reset isNewConversation when switching to a different conversation
  useEffect(() => {
    if (conversationId) {
      setIsNewConversation(false);
    }
  }, [conversationId]);

  const isAnalysing = useMemo(() => {
    return chat?.messages[chat?.messages?.length - 1]?.sender_type === SenderType.USER;
  }, [chat?.messages?.length]);

  const handleAction = (blockConfig: ButtonBlockType, payload: MapAny) => {
    // TODO: Implement action handling
    console.log('blockConfig', blockConfig, payload);
  };

  const handleNewConversation = () => {
    if (isDisabled) return;

    chat.clearMessages();
    onNewConversation?.();
    setConversationId?.('');
    setHeader('');
    setIsNewConversation(true);
    setChatInputKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (chat?.conversationId) {
      setConversationId?.(chat?.conversationId);
    }
  }, [chat?.conversationId]);

  return (
    <div className='flex h-full w-full flex-col'>
      <div
        className={cn(
          'border-GRAY_400 hidden w-full items-center gap-3 border-b px-3.5 py-3',
          status === ProcessStatus.DRAFT ? 'hidden' : 'flex',
        )}
      >
        {header ? (
          <div className='f-14-500 text-GRAY_1000 flex-grow'>{header}</div>
        ) : (
          <div className='f-12-550 text-GRAY_700 flex-grow'>Ask or give feedback</div>
        )}
        <EllipsisVertical size={12} className='text-GRAY_700 hidden cursor-pointer' />
        <CirclePlus
          size={12}
          className={cn('text-GRAY_700 cursor-pointer', {
            'cursor-not-allowed opacity-50': isDisabled,
          })}
          onClick={handleNewConversation}
        />
      </div>
      <MessageContainer messages={chat?.messages || []} handleAction={handleAction} isAnalysing={isAnalysing} />
      {(chat.isLoadingConversationHistory || isLoadingFilterConversations) && (
        <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} className='rounded-tl-xl' />
      )}

      <div className='border-GRAY_400 w-full border-t p-3'>
        <div className='flex flex-shrink-0'>
          <ConnectedChatInput
            key={chatInputKey}
            chat={chat}
            placeholder='Ask anything or give feedback...'
            annotationLocation={{
              type: LocationType.SOP,
              data: {
                process_id: processId,
              },
            }}
            conversationId={chat?.conversationId || ''}
            isDisabled={isAnalysing || isLoadingFilterConversations || isDisabled}
            scopeId={processId}
            annotationType={status === ProcessStatus.DRAFT ? AnnotationType.PROCESS_SOP : undefined}
            scope={ScopeType.PROCESS}
            autoFocus={true}
            currentUserName={currentUserName || ''}
            resourceId={processId}
            organizationId={organizationId}
            setHeader={setHeader}
            defaultMessage={isNewConversation ? undefined : defaultMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseChat;
