import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { BlockRenderer, ButtonBlockType, DisplayLayerActionType, ResourceType, useChat } from '@zamp-platform/chat';
import { Button, Popover, PopoverContent, PopoverPortal, PopoverTrigger, ShimmerText } from '@zamp-platform/ui';
import { MessageSquare } from 'lucide-react';
import useActionHub from 'modules/chatbot/actionHub';
import ChatHeader from 'modules/chatbot/ChatHeader';
import { ChatInput } from 'modules/chatbot/ChatInput';
import PaceAvatar from 'modules/chatbot/PaceAvatar';
import SenderDetails from 'modules/chatbot/SenderDetails';
import StopProcessingFeedback from 'modules/chatbot/StopProcessingFeedback';
import { doesUrlMatchLocation } from 'modules/chatbot/utils';
import { useSearchParams } from 'next/navigation';
import ZampLogoWebpLoader from '@/components/common/loader/ZampLogoWebpLoader';
import { RootState } from '@/store';
import { FeedbackItemType, LocationData } from '@/types/api/feedbacks.types';
import { MapAny } from '@/types/commonTypes';
import { cn, getUserNameFromEmail } from '@/utils/common';

interface ChatbotProps {
  children: React.ReactNode;
  annotationLocation: LocationData;
  hideFeedbackCount?: boolean;
  feedbackItem?: FeedbackItemType;
  showChatbot?: boolean;
  feedbackItemsLength?: number;
  onCloseChatbot?: () => void;
  isNewConversation?: boolean;
  setCurrentFeedbackItem: (feedbackItem?: FeedbackItemType) => void;
  className?: string;
  onOpenChatbot?: () => void;
}

const Chatbot = ({
  children,
  annotationLocation,
  hideFeedbackCount = false,
  feedbackItem,
  showChatbot,
  feedbackItemsLength = 0,
  onCloseChatbot,
  isNewConversation = false,
  setCurrentFeedbackItem,
  className,
  onOpenChatbot,
}: ChatbotProps) => {
  const currentUserEmail = useSelector((state: RootState) => state?.user?.user?.user_email);
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(showChatbot);
  const [header, setHeader] = useState('');

  const [stopProcessingConfig, setStopProcessingConfig] = useState<{
    blockConfig: ButtonBlockType;
    payload: MapAny;
  }>();
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { runAction } = useActionHub(setIsLoading);

  const chat = useChat({
    onNewMessage: () => {
      setIsLoading(false);
    },
    resourceId: annotationLocation.data.process_id,
    resourceType: ResourceType.PROCESS,
    conversationId: feedbackItem?.conversation_id,
    setHeader,
  });

  // Handle chatbot open/close state changes
  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (!open) {
        onCloseChatbot?.();
      } else onOpenChatbot?.();
    },
    [onCloseChatbot],
  );

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  const handleAction = (blockConfig: ButtonBlockType, payload: MapAny) => {
    const updatedPayload = {
      ...payload,
      resourceId: annotationLocation.data.process_id,
      resourceType: ResourceType.PROCESS,
      senderName: getUserNameFromEmail(currentUserEmail || '') || '',
    };

    if (blockConfig.action?.display_layer_action === DisplayLayerActionType.SEND_BUTTON_TEXT_WITH_STOP_PROCESSING) {
      setStopProcessingConfig({ blockConfig, payload: updatedPayload });
      setIsOpen(false);

      return;
    }
    runAction(blockConfig, updatedPayload, chat);
  };

  const handleStopProcessing = () => {
    if (stopProcessingConfig) {
      setIsOpen(true);
      runAction(stopProcessingConfig.blockConfig, stopProcessingConfig.payload, chat);
      setStopProcessingConfig(undefined);
    }
  };

  const handleDeleteFeedbackSuccess = () => {
    setIsOpen(false);
    setCurrentFeedbackItem(undefined);
    setHeader('');
    chat.clearMessages();
  };

  const handleOpenChangeForStopProcessing = (open: boolean) => {
    if (!open) {
      setStopProcessingConfig(undefined);
      setIsOpen(true);
    }
  };

  // Check URL params on mount to determine if chatbot should be open
  useEffect(() => {
    if (searchParams && doesUrlMatchLocation(searchParams, annotationLocation)) {
      setIsOpen(true);
    }
  }, [searchParams, annotationLocation]);

  // Sync isOpen state with showChatbot prop changes
  useEffect(() => {
    if (showChatbot !== undefined) {
      setIsOpen(showChatbot);
    }
  }, [showChatbot]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chat.messages.length > 0) {
      scrollToBottom('smooth');
    }
  }, [chat.messages.length]);

  // Scroll to last message when popover opens with existing messages
  useEffect(() => {
    if (isOpen && chat.messages.length > 0) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        scrollToBottom('smooth');
      }, 100);
    }
  }, [isOpen]);

  return (
    <>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger className={className}>
          {(feedbackItem || feedbackItemsLength > 0) && !hideFeedbackCount ? (
            <Button
              variant='outline'
              size='icon'
              className='bg-accent text-accent-foreground f-11-500 flex h-5 items-center gap-1 [&_svg]:size-3'
            >
              <MessageSquare />
              <span>{feedbackItemsLength || 1}</span>
            </Button>
          ) : (
            children
          )}
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverContent className='w-[380px] space-y-1.5 border-none bg-transparent p-0 shadow-none'>
            <div className='shadow-chatbot-shadow bg-chatbot-gradient flex max-h-[400px] flex-col rounded-[22px] border border-gray-500 p-1.5'>
              {chat.isLoadingConversationHistory && !isNewConversation ? (
                <ZampLogoWebpLoader />
              ) : (
                <>
                  {header && (
                    <ChatHeader
                      title={header}
                      feedbackItem={feedbackItem}
                      onDeleteSuccess={handleDeleteFeedbackSuccess}
                    />
                  )}
                  <div
                    className={cn('flex min-h-0 flex-1 flex-col rounded-b-[16px] border-x border-b bg-white', {
                      'border-none': !header,
                    })}
                  >
                    {chat.messages.length > 0 && (
                      <div
                        ref={messagesContainerRef}
                        className='min-h-0 flex-1 space-y-6 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden'
                      >
                        {chat?.messages?.map((message) => (
                          <div key={message.timestamp} className='space-y-2'>
                            <SenderDetails message={message} />
                            <BlockRenderer
                              message={{ block: message?.message_content?.elements ?? [] }}
                              onAction={handleAction}
                              className='border-none shadow-none'
                              key={message?.timestamp}
                              conversationId={message?.conversation_id}
                              messageId={message?.id}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    {isLoading && (
                      <div className='flex w-full items-center gap-1.5 p-4 text-gray-700'>
                        <PaceAvatar />
                        <ShimmerText text='Analysing...' autoAnimate={true} />
                      </div>
                    )}
                    <div className='flex flex-shrink-0'>
                      <ChatInput
                        chat={chat}
                        annotationLocation={annotationLocation}
                        setIsLoading={setIsLoading}
                        conversationId={feedbackItem?.conversation_id}
                        setHeader={setHeader}
                        isDisabled={isLoading}
                        header={header}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
      <StopProcessingFeedback
        isOpen={!!stopProcessingConfig}
        onOpenChange={handleOpenChangeForStopProcessing}
        onStopProcessing={handleStopProcessing}
      />
    </>
  );
};

export default Chatbot;
