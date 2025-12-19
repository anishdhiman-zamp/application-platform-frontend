'use client';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  ButtonBlockType,
  ConnectedChatInput,
  LocationType,
  MessageContainer,
  ResourceType,
  ScopeType,
  SenderType,
  useChat,
} from '@zamp-platform/chat';
import { CirclePlus, EllipsisVertical } from 'lucide-react';
import { useParams } from 'next/navigation';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { RootState } from '@/store';
import { MapAny } from '@/types/commonTypes';

const KnowledgeBaseChat = () => {
  const currentUserName = useSelector((state: RootState) => state?.user?.user?.user_name);
  const organizationId = useSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id ?? '');
  const params = useParams();
  const processId = params?.processId as string;

  const chat = useChat({
    resourceId: processId,
    resourceType: ResourceType.PROCESS,
  });

  const isAnalysing = useMemo(() => {
    return chat?.messages[chat?.messages?.length - 1]?.sender_type === SenderType.USER;
  }, [chat?.messages?.length]);

  const handleAction = (blockConfig: ButtonBlockType, payload: MapAny) => {
    // TODO: Implement action handling
  };

  return (
    <div className='flex h-full w-full flex-col'>
      <div className='border-GRAY_400 flex hidden w-full items-center gap-3 border-b px-3.5 py-3'>
        <div className='f-14-500 text-GRAY_1000 flex-grow'>Generated feedback title</div>
        <EllipsisVertical size={12} className='text-GRAY_700 cursor-pointer' />
        <CirclePlus size={12} className='text-GRAY_700 cursor-pointer' />
      </div>
      <MessageContainer messages={chat?.messages || []} handleAction={handleAction} isAnalysing={isAnalysing} />
      {chat.isLoadingConversationHistory && (
        <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} className='rounded-tl-xl' />
      )}

      <div className='border-GRAY_400 w-full border-t p-3'>
        <div className='flex flex-shrink-0'>
          <ConnectedChatInput
            chat={chat}
            placeholder='Ask anything or give feedback...'
            annotationLocation={{
              type: LocationType.PROCESS,
              data: {
                process_id: processId,
              },
            }}
            conversationId={chat?.conversationId || ''}
            isDisabled={isAnalysing}
            scopeId={processId}
            scope={ScopeType.PROCESS}
            autoFocus={true}
            currentUserName={currentUserName || ''}
            resourceId={processId}
            organizationId={organizationId}
          />
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseChat;
