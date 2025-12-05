import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  BlockRenderer,
  ButtonBlockType,
  DisplayLayerActionType,
  LocationData,
  ResourceType,
  ScopeType,
  SenderType,
  useChat,
} from '@zamp-platform/chat';
import { Button, Popover, PopoverContent, PopoverPortal, PopoverTrigger, ShimmerText } from '@zamp-platform/ui';
import { MessageSquare } from 'lucide-react';
import useActionHub from 'modules/chatbot/actionHub';
import ChatHeader from 'modules/chatbot/ChatHeader';
import { ChatInput } from 'modules/chatbot/ChatInput';
import { CHATBOT_LOCATION_PARAMS } from 'modules/chatbot/constants';
import PaceAvatar from 'modules/chatbot/PaceAvatar';
import SenderDetails from 'modules/chatbot/SenderDetails';
import StopProcessingFeedback from 'modules/chatbot/StopProcessingFeedback';
import { doesUrlMatchLocation, generateChatbotInstanceId } from 'modules/chatbot/utils';
import { FEEDBACK_STATUS, FEEDBACK_STATUS_MESSAGES } from 'modules/feedback/feedback.constants';
import { useSearchParams } from 'next/navigation';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { RootState } from '@/store';
import { FeedbackItemType } from '@/types/api/feedbacks.types';
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
  scope?: ScopeType;
  clearInputOnClose?: boolean;
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
  scope = ScopeType.ACTIVITY_RUN,
  clearInputOnClose = false,
}: ChatbotProps & { scope?: ScopeType }) => {
  const currentUserEmail = useSelector((state: RootState) => state?.user?.user?.user_email);
  const feedbackState = useSelector((state: RootState) => state?.feedbacks);
  const { feedbackItems = [] } = feedbackState;
  const searchParams = useSearchParams();
  const conversationIdFromParam = searchParams?.get(CHATBOT_LOCATION_PARAMS.CHATBOT_CONVERSATION_ID);
  const [isOpen, setIsOpen] = useState(showChatbot);
  const [header, setHeader] = useState('');
  const [inputValue, setInputValue] = useState('');
  const urlBasedOpenHandled = useRef(false);

  const [stopProcessingConfig, setStopProcessingConfig] = useState<{
    blockConfig: ButtonBlockType;
    payload: MapAny;
  }>();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [popoverSide, setPopoverSide] = useState<'top' | 'bottom'>('bottom');

  const chatbotInstanceId = useMemo(() => generateChatbotInstanceId(annotationLocation), [annotationLocation]);
  const isUrlMatching = useMemo(
    () => searchParams && doesUrlMatchLocation(searchParams, annotationLocation),
    [searchParams, annotationLocation],
  );

  const { runAction } = useActionHub();

  const chat = useChat({
    resourceId: annotationLocation.data.process_id,
    resourceType: ResourceType.PROCESS,
    conversationId: (hideFeedbackCount && isUrlMatching && conversationIdFromParam) || feedbackItem?.conversation_id,
    setHeader,
    refetchConversationHistory: hideFeedbackCount,
  });

  const isAnalysing = chat?.messages[chat?.messages?.length - 1]?.sender_type === SenderType.USER;

  const handleDeleteFeedbackSuccess = useCallback(() => {
    setIsOpen(false);
    setCurrentFeedbackItem(undefined);
    setHeader('');
    onCloseChatbot?.();
    chat.clearMessages();
    chat.setConversationId(null);
  }, [setCurrentFeedbackItem, onCloseChatbot, chat]);

  // Handle chatbot open/close state changes
  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (!open) {
        onCloseChatbot?.();
        if (hideFeedbackCount) handleDeleteFeedbackSuccess();
        if (clearInputOnClose) {
          setInputValue('');
        }
      } else onOpenChatbot?.();
    },
    [onCloseChatbot, onOpenChatbot, hideFeedbackCount, handleDeleteFeedbackSuccess, clearInputOnClose],
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

  const handleOpenChangeForStopProcessing = (open: boolean) => {
    if (!open) {
      setStopProcessingConfig(undefined);
      setIsOpen(true);
    }
  };

  const renderFeedbackStatusMessageOrInput = () => {
    if (feedbackItem?.status && [FEEDBACK_STATUS.APPLIED, FEEDBACK_STATUS.PROCESSING].includes(feedbackItem.status)) {
      return (
        <div className='f-13-450 bg-BG_GRAY_2 rounded-b-2xl p-3 text-gray-900'>
          {FEEDBACK_STATUS_MESSAGES[feedbackItem.status]}
        </div>
      );
    }

    return (
      <div className='flex flex-shrink-0'>
        <ChatInput
          chat={chat}
          annotationLocation={annotationLocation}
          conversationId={feedbackItem?.conversation_id || chat.conversationId || ''}
          setHeader={setHeader}
          isDisabled={isAnalysing}
          header={header}
          scope={scope}
          externalInputValue={inputValue}
          setExternalInputValue={setInputValue}
        />
      </div>
    );
  };

  // Check URL params to determine if chatbot should be open (takes precedence over prop)
  useEffect(() => {
    if (isUrlMatching) {
      // URL params match - always keep open, regardless of prop
      if (!urlBasedOpenHandled.current) {
        urlBasedOpenHandled.current = true;
      }
      setIsOpen(true);
    } else {
      // URL params don't match - sync with prop
      if (urlBasedOpenHandled.current) {
        urlBasedOpenHandled.current = false;
      }
      if (showChatbot !== undefined) {
        setIsOpen(showChatbot);
      }
    }
  }, [isUrlMatching, showChatbot]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chat?.messages?.length > 0) {
      scrollToBottom('smooth');
    }
  }, [chat?.messages?.length]);

  // Calculate optimal popover position based on available space
  useEffect(() => {
    if (isOpen) {
      // Use a small delay to ensure the trigger element is rendered
      const timeoutId = setTimeout(() => {
        const triggerElement = document.querySelector(`[data-testid="${chatbotInstanceId}"]`) as HTMLElement;

        if (triggerElement) {
          const rect = triggerElement.getBoundingClientRect();
          const viewportHeight = window.innerHeight;

          // Calculate available space in top and bottom directions
          const spaceTop = rect.top;
          const spaceBottom = viewportHeight - rect.bottom;

          setPopoverSide(spaceTop > spaceBottom ? 'top' : 'bottom');
        }
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  // Scroll to last message when popover opens with existing messages
  useEffect(() => {
    if (isOpen && chat?.messages?.length > 0) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        scrollToBottom('smooth');
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const isFeedbackItemExists = feedbackItems.find((item: FeedbackItemType) => item?.id === feedbackItem?.id);

    if (feedbackItem && !isFeedbackItemExists) {
      handleDeleteFeedbackSuccess();
    }
  }, [feedbackItems, feedbackItem]);

  return (
    <>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild data-testid={chatbotInstanceId}>
          {(feedbackItem || feedbackItemsLength > 0) && !hideFeedbackCount ? (
            <Button
              variant='outline'
              size='icon'
              className={cn(
                'bg-accent text-accent-foreground f-11-500 flex h-5 items-center gap-1 [&_svg]:size-3',
                isOpen && 'opacity-100',
              )}
              data-comment-button
            >
              <MessageSquare />
              <span>{feedbackItemsLength || 1}</span>
            </Button>
          ) : (
            <span className={className} data-testid={chatbotInstanceId}>
              {children}
            </span>
          )}
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverContent
            side={popoverSide}
            sideOffset={8}
            className={cn(
              'shadow-chatbot-shadow w-[380px] space-y-1.5 rounded-[22px] border border-gray-500 bg-transparent p-0 backdrop-blur-lg',
              {
                'rounded-[20px]': !header,
              },
            )}
          >
            <div
              className={cn('bg-chatbot-gradient flex max-h-[400px] flex-col rounded-[22px] p-1.5', {
                'rounded-[20px]': !header,
              })}
            >
              {(chat.isLoadingConversationHistory && !isNewConversation) ||
              (hideFeedbackCount && isUrlMatching && conversationIdFromParam && chat?.messages?.length === 0) ? (
                <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} className='rounded-tl-xl' />
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
                    className={cn(
                      'shadow-table-filter-menu flex min-h-0 flex-1 flex-col rounded-b-[16px] border-x border-b bg-white',
                      {
                        'border-none': !header,
                      },
                    )}
                  >
                    {chat?.messages?.length > 0 && (
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
                        {isAnalysing && (
                          <div className='flex w-full items-center gap-1.5 text-gray-700'>
                            <PaceAvatar />
                            <ShimmerText text='Analysing...' autoAnimate={true} />
                          </div>
                        )}
                      </div>
                    )}
                    {renderFeedbackStatusMessageOrInput()}
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
