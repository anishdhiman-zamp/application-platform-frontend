import { FC, useCallback, useMemo, useRef, useState } from 'react';
import { LocationType, ScopeType } from '@zamp-platform/chat';
import { Button } from '@zamp-platform/ui';
import PaceIcon from 'modules/knowledge-based/icons/PaceIcon';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { FUNCTION_KEYS_ICON, KEYBOARD_KEYS } from '@/constants/shortcuts';
import useKeyDown from '@/hooks/useKeyDown';
import ChatbotWrapper from '@/modules/chatbot';

interface WorkWithPaceProps {
  isProcessLive?: boolean;
}

const WorkWithPace: FC<WorkWithPaceProps> = ({ isProcessLive = false }) => {
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const processId = params?.processId as string;
  const activityRunId = params?.activityId as string;
  const openChatbotRef = useRef<(() => void) | null>(null);
  const [chatbotKey, setChatbotKey] = useState(0);

  const isSopCreation =
    !pathname?.includes(ROUTES_PATH.KNOWLEDGE_BASE_V2) && !pathname?.includes(ROUTES_PATH.CREATE_KNOWLEDGE_BASE);

  const handleChatbotTrigger = useCallback((openChatbot: () => void) => {
    openChatbotRef.current = openChatbot;
  }, []);

  const handleOpenChatbot = () => {
    if (openChatbotRef.current) {
      openChatbotRef.current();
    }
  };

  const handleChatbotStateChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        const hasChatbotParams = Array.from(searchParams?.keys() || []).some((key) => key.startsWith('chatbot_'));

        if (!hasChatbotParams) {
          setChatbotKey((prev) => prev + 1);
        }
      }
    },
    [searchParams],
  );

  useKeyDown(handleOpenChatbot, [KEYBOARD_KEYS.META, KEYBOARD_KEYS.K]);

  const annotationLocation = useMemo(() => {
    if (activityRunId)
      return {
        type: LocationType.ACTIVITY_RUN as const,
        data: {
          process_id: processId,
          activity_run_id: activityRunId,
        },
      };

    return {
      type: LocationType.PROCESS as const,
      data: {
        process_id: processId,
      },
    };
  }, [activityRunId, processId]);

  if (!processId || !isSopCreation || !isProcessLive) {
    return null;
  }

  return (
    <ChatbotWrapper
      key={chatbotKey}
      annotationLocation={annotationLocation}
      scope={activityRunId ? ScopeType.ACTIVITY_RUN : ScopeType.PROCESS}
      hideFeedbackCount
      onChatbotTrigger={handleChatbotTrigger}
      onChatbotStateChange={handleChatbotStateChange}
      clearInputOnClose
    >
      <Button
        variant='outline'
        size='icon'
        className='bg-accent text-accent-foreground flex h-7 w-[200px] items-center justify-between px-2 py-1.5 [&_svg]:size-3'
      >
        <div className='flex items-center gap-1.5 text-gray-700'>
          <PaceIcon />
          <span className='f-12-400'>Work with Pace</span>
        </div>
        <div className='f-10-500 flex items-center gap-1 text-gray-900'>
          <span className='shadow-keyboard-keys-shadow flex h-4 w-4 items-center justify-center rounded-sm border'>
            {FUNCTION_KEYS_ICON.META_KEY}
          </span>
          <span className='shadow-keyboard-keys-shadow flex h-4 w-4 items-center justify-center rounded-sm border'>
            K
          </span>
        </div>
      </Button>
    </ChatbotWrapper>
  );
};

export default WorkWithPace;
