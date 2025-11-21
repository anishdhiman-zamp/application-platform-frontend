import { useCallback, useEffect, useRef } from 'react';
import { LocationType } from '@zamp-platform/chat';
import { Button } from '@zamp-platform/ui';
import PaceIcon from 'modules/knowledge-based/icons/PaceIcon';
import { useParams } from 'next/navigation';
import { FUNCTION_KEYS_ICON, KEYBOARD_KEYS } from '@/constants/shortcuts';
import ChatbotWrapper from '@/modules/chatbot';

const WorkWithPace = () => {
  const params = useParams();
  const processId = params?.processId as string;
  const activityRunId = params?.activityId as string;
  const openChatbotRef = useRef<(() => void) | null>(null);

  const handleChatbotTrigger = useCallback((openChatbot: () => void) => {
    openChatbotRef.current = openChatbot;
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Command/Meta + P
      if ((event.metaKey || event.ctrlKey) && event.code === KEYBOARD_KEYS.P) {
        // Prevent the default browser print dialog
        event.preventDefault();
        event.stopPropagation();

        if (openChatbotRef.current) {
          openChatbotRef.current();
        }
      }
    };

    // Use capture phase to ensure we intercept the event before other handlers
    window.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, []);

  if (!processId || !activityRunId) {
    return null;
  }

  return (
    <ChatbotWrapper
      annotationLocation={{
        type: LocationType.ACTIVITY_RUN,
        data: {
          process_id: processId,
          activity_run_id: activityRunId,
        },
      }}
      hideFeedbackCount
      onChatbotTrigger={handleChatbotTrigger}
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
            P
          </span>
        </div>
      </Button>
    </ChatbotWrapper>
  );
};

export default WorkWithPace;
