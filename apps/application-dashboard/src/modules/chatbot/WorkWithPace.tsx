import { useCallback, useMemo, useRef } from 'react';
import { LocationType, ScopeType } from '@zamp-platform/chat';
import { Button } from '@zamp-platform/ui';
import PaceIcon from 'modules/knowledge-based/icons/PaceIcon';
import { useParams } from 'next/navigation';
import { FUNCTION_KEYS_ICON, KEYBOARD_KEYS } from '@/constants/shortcuts';
import useKeyDown from '@/hooks/useKeyDown';
import ChatbotWrapper from '@/modules/chatbot';

const WorkWithPace = () => {
  const params = useParams();
  const processId = params?.processId as string;
  const activityRunId = params?.activityId as string;
  const openChatbotRef = useRef<(() => void) | null>(null);

  const handleChatbotTrigger = useCallback((openChatbot: () => void) => {
    openChatbotRef.current = openChatbot;
  }, []);

  const handleOpenChatbot = () => {
    if (openChatbotRef.current) {
      openChatbotRef.current();
    }
  };

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

  if (!processId) {
    return null;
  }

  return (
    <ChatbotWrapper
      annotationLocation={annotationLocation}
      scope={activityRunId ? ScopeType.ACTIVITY_RUN : ScopeType.PROCESS}
      hideFeedbackCount
      onChatbotTrigger={handleChatbotTrigger}
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
