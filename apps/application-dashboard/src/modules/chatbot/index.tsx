import { cloneElement, FC, isValidElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { LocationData } from '@zamp-platform/chat';
import Chatbot from 'modules/chatbot/Chatbot';
import { CHATBOT_LOCATION_PARAMS } from 'modules/chatbot/constants';
import FeedbackList from 'modules/chatbot/FeedbackList';
import { getFeedbackItems } from 'modules/chatbot/utils';
import { FEEDBACK_STATUS } from 'modules/feedback/feedback.constants';
import useIsFeedbackEnabled from 'modules/feedback/useIsFeedbackEnabled';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { RootState } from '@/store';
import { FeedbackItemType } from '@/types/api/feedbacks.types';

interface ChatbotProps {
  children: React.ReactNode;
  annotationLocation: LocationData;
  hideFeedbackCount?: boolean;
  onChatbotTrigger?: (openChatbot: () => void) => void;
  className?: string;
  onChatbotStateChange?: (isOpen: boolean) => void;
}

const ChatbotWrapper: FC<ChatbotProps> = ({
  children,
  annotationLocation,
  hideFeedbackCount = false,
  onChatbotTrigger,
  className,
  onChatbotStateChange,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const conversationIdFromParam = searchParams?.get(CHATBOT_LOCATION_PARAMS.CHATBOT_CONVERSATION_ID);
  const feedbackIdParam = searchParams?.get(CHATBOT_LOCATION_PARAMS.CHATBOT_FEEDBACK_ID);
  const feedbackItems = useSelector((state: RootState) => state?.feedbacks?.feedbackItems);
  const matchingFeedbackItems = useMemo(
    () => getFeedbackItems(feedbackItems, annotationLocation),
    [feedbackItems, annotationLocation],
  );

  const [currentFeedbackItem, setCurrentFeedbackItem] = useState<FeedbackItemType>();
  const [showChatbot, setShowChatbot] = useState(false);
  const [isNewConversation, setIsNewConversation] = useState(false);

  const isFeedbackEnabled = useIsFeedbackEnabled();

  const showFeedbackList = useMemo(
    () =>
      !hideFeedbackCount &&
      (matchingFeedbackItems.length > 1 ||
        (matchingFeedbackItems.length === 1 &&
          [FEEDBACK_STATUS.PROCESSING, FEEDBACK_STATUS.APPLIED].includes(
            matchingFeedbackItems[0]?.status as FEEDBACK_STATUS,
          ))),
    [matchingFeedbackItems, hideFeedbackCount],
  );

  const disableAddMoreFeedback = useMemo(
    () =>
      matchingFeedbackItems.find((item) =>
        [FEEDBACK_STATUS.OPEN, FEEDBACK_STATUS.QUEUED].includes(item?.status as FEEDBACK_STATUS),
      ) !== undefined,
    [matchingFeedbackItems],
  );

  const handleOpenChatbot = useCallback(
    (feedbackItem?: FeedbackItemType) => {
      if (feedbackItem) {
        setCurrentFeedbackItem(feedbackItem);
      } else {
        setIsNewConversation(true);
        setCurrentFeedbackItem(undefined);
      }
      setShowChatbot(true);
      onChatbotStateChange?.(true);
    },
    [onChatbotStateChange],
  );

  const handleRemoveChatbotParams = () => {
    // Remove all query params with chatbot prefix if any exist
    if (searchParams && pathname) {
      const hasChatbotParams = Array.from(searchParams.keys()).some((key) => key.startsWith('chatbot_'));

      if (hasChatbotParams) {
        const params = new URLSearchParams(searchParams.toString());

        Array.from(params.keys()).forEach((key) => {
          if (key.startsWith('chatbot_')) {
            params.delete(key);
          }
        });

        const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;

        router.replace(newUrl);
      }
    }
  };

  const handleCloseChatbot = () => {
    handleRemoveChatbotParams();
    setShowChatbot(false);
    onChatbotStateChange?.(false);
    if (showFeedbackList) {
      setCurrentFeedbackItem(undefined);
    }
  };

  useEffect(() => {
    if (currentFeedbackItem || hideFeedbackCount) return;
    if (
      matchingFeedbackItems.length === 1 &&
      [FEEDBACK_STATUS.OPEN, FEEDBACK_STATUS.QUEUED].includes(matchingFeedbackItems[0]?.status as FEEDBACK_STATUS)
    ) {
      setCurrentFeedbackItem(matchingFeedbackItems[0]);
    } else if (matchingFeedbackItems.length > 1) {
      const firstOpenFeedbackItem = matchingFeedbackItems.find((item) => item?.status === FEEDBACK_STATUS.OPEN);

      if (firstOpenFeedbackItem) {
        setCurrentFeedbackItem(firstOpenFeedbackItem);
      }
    }
  }, [matchingFeedbackItems, hideFeedbackCount]);

  // Expose the openChatbot function to parent components
  useEffect(() => {
    if (onChatbotTrigger && isFeedbackEnabled) {
      onChatbotTrigger(() => handleOpenChatbot());
    }
  }, [onChatbotTrigger, isFeedbackEnabled, handleOpenChatbot]);

  // Clone children and inject onClick handler
  const enhancedChildren = useMemo(() => {
    if (isValidElement(children)) {
      return cloneElement(children as React.ReactElement<any>, {
        onClick: () => handleOpenChatbot(),
      });
    }

    return children;
  }, [children, handleOpenChatbot]);

  useEffect(() => {
    if (!hideFeedbackCount) return;

    if (conversationIdFromParam && feedbackIdParam) {
      const feedbackItem = matchingFeedbackItems.find(
        (item) => item?.conversation_id === conversationIdFromParam && item?.id === feedbackIdParam,
      );

      setCurrentFeedbackItem(feedbackItem);
    }
  }, [conversationIdFromParam, feedbackIdParam, hideFeedbackCount, matchingFeedbackItems, setCurrentFeedbackItem]);

  return (
    <>
      {isFeedbackEnabled ? (
        <>
          {showFeedbackList && !showChatbot ? (
            <FeedbackList
              items={matchingFeedbackItems}
              processId={annotationLocation.data.process_id}
              onOpenChatbot={handleOpenChatbot}
              hideFeedbackCount={hideFeedbackCount}
              annotationLocation={annotationLocation}
              disableAddMoreFeedback={disableAddMoreFeedback}
              onCloseFeedbackList={handleRemoveChatbotParams}
              className={className}
            >
              {enhancedChildren}
            </FeedbackList>
          ) : (
            <Chatbot
              annotationLocation={annotationLocation}
              hideFeedbackCount={hideFeedbackCount}
              feedbackItem={currentFeedbackItem}
              showChatbot={showChatbot}
              feedbackItemsLength={matchingFeedbackItems.length}
              onCloseChatbot={handleCloseChatbot}
              isNewConversation={
                (isNewConversation || !showFeedbackList) && !(hideFeedbackCount && conversationIdFromParam)
              }
              setCurrentFeedbackItem={setCurrentFeedbackItem}
              className={className}
              onOpenChatbot={handleOpenChatbot}
            >
              {enhancedChildren}
            </Chatbot>
          )}
        </>
      ) : null}
    </>
  );
};

export default ChatbotWrapper;
