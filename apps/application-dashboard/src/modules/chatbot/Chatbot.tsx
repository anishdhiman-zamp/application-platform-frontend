import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { captureException } from '@sentry/nextjs';
import {
  ButtonBlockType,
  ConnectedChatInput,
  DisplayLayerActionType,
  LocationData,
  Message,
  ResourceType,
  ScopeType,
  SenderType,
  SpeechToTextProvider,
  useChat,
  useChatAdapters,
} from '@zamp-platform/chat';
import { Button, Popover, PopoverContent, PopoverPortal, PopoverTrigger, ShimmerText, toast } from '@zamp-platform/ui';
import { MessageSquare } from 'lucide-react';
import useActionHub from 'modules/chatbot/actionHub';
import ChatHeader from 'modules/chatbot/ChatHeader';
import { CHATBOT_LOCATION_PARAMS } from 'modules/chatbot/constants';
import PaceAvatar from 'modules/chatbot/PaceAvatar';
import StopProcessingFeedback from 'modules/chatbot/StopProcessingFeedback';
import { doesUrlMatchLocation, generateChatbotInstanceId } from 'modules/chatbot/utils';
import { FileMimeType } from 'modules/data/components/importDataset/importData.constants';
import { FEEDBACK_STATUS, FEEDBACK_STATUS_MESSAGES } from 'modules/feedback/feedback.constants';
import { useParams, useSearchParams } from 'next/navigation';
import Avatar from '@/components/common/avatar';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { COLORS } from '@/constants/colors';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { RootState } from '@/store';
import { FeedbackItemType } from '@/types/api/feedbacks.types';
import { INPUT_FILE_FORMATS } from '@/types/common/mime';
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
  const currentUserName = useSelector((state: RootState) => state?.user?.user?.user_name);
  const organizationId = useSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id ?? '');
  const feedbackState = useSelector((state: RootState) => state?.feedbacks);
  const { mergedFeedbackItems = [] } = feedbackState;
  const searchParams = useSearchParams();
  const params = useParams();
  const processId = params?.processId as string;
  const activityRunId = params?.activityId as string;
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

  const { chatInputAdapter, transcriptionAdapter } = useChatAdapters({
    getCurrentUserName: () => currentUserName || '',
    getProcessId: () => processId,
    getActivityRunId: () => activityRunId,
    getOrganizationId: () => organizationId,
    getMimeType: (fileType: string) => FileMimeType[fileType] ?? fileType,
    onError: (error) => {
      captureException(error);
      toast.error('An error occurred');
    },
    onSuccess: (message) => {
      toast.success(message);
    },
  });

  const acceptedFileTypes = `${INPUT_FILE_FORMATS.TXT},${INPUT_FILE_FORMATS.PDF},${INPUT_FILE_FORMATS.DOCX},${INPUT_FILE_FORMATS.JPEG},${INPUT_FILE_FORMATS.JPG},${INPUT_FILE_FORMATS.PNG},${INPUT_FILE_FORMATS.BMP}`;

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
        <ConnectedChatInput
          chat={chat}
          annotationLocation={annotationLocation}
          conversationId={feedbackItem?.conversation_id || chat.conversationId || ''}
          setHeader={setHeader}
          isDisabled={isAnalysing}
          header={header}
          scope={scope}
          externalInputValue={inputValue}
          setExternalInputValue={setInputValue}
          autoFocus={isOpen}
          chatInputAdapter={chatInputAdapter}
          transcriptionAdapter={transcriptionAdapter}
          speechToTextProvider={SpeechToTextProvider.ELEVENLABS}
          acceptedFileTypes={acceptedFileTypes}
          onMicrophoneError={() =>
            toast.error('Microphone unavailable. Please check browser permissions and try again.')
          }
          onRecordingError={() => toast.error('Failed to stop recording. Please try again.')}
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
    const isFeedbackItemExists = mergedFeedbackItems.find((item: FeedbackItemType) => item?.id === feedbackItem?.id);

    if (feedbackItem && !isFeedbackItemExists) {
      handleDeleteFeedbackSuccess();
    }
  }, [mergedFeedbackItems, feedbackItem]);

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
                          <Message
                            key={message.timestamp}
                            message={message}
                            onAction={handleAction}
                            assistantName='Pace'
                            assistantAvatar={<PaceAvatar />}
                            userAvatar={(senderName) => (
                              <Avatar
                                name={senderName}
                                backgroundColor={COLORS.YELLOW_300}
                                className='f-10-500 text-gray-1000 flex h-4 min-h-4 w-4 min-w-4 items-center justify-center rounded-md'
                              />
                            )}
                          />
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
