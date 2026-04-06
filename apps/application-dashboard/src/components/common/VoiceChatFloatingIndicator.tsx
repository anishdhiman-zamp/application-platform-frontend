'use client';

import { FC, useCallback } from 'react';
import { VOICE_CHAT_STATE } from '@zamp-platform/ui/types';
import { cn } from '@zamp-platform/ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { HeadphoneOff, Headphones, Loader2, Mic, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useVoiceChatContext } from '@/contexts/VoiceChatContext';

/**
 * Floating pill that shows active voice-chat status globally.
 * On non-chat pages, clicking the label navigates to /chat.
 * Always visible when a voice session is in progress.
 */
const VoiceChatFloatingIndicator: FC = () => {
  const { state, stop, toggleMic, isMicEnabled } = useVoiceChatContext();
  const pathname = usePathname();
  const router = useRouter();

  const isOnChatPage = pathname?.startsWith(ROUTES_PATH.CHAT) ?? false;
  const isActive = state === VOICE_CHAT_STATE.Active;
  const isConnecting = state === VOICE_CHAT_STATE.Connecting || state === VOICE_CHAT_STATE.Ready;
  const isVisible = isActive || isConnecting;

  const handleLabelClick = useCallback(() => {
    if (!isOnChatPage) {
      router.push(ROUTES_PATH.CHAT);
    }
  }, [router, isOnChatPage]);

  const handleStop = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      stop();
    },
    [stop],
  );

  const handleToggleMic = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      void toggleMic();
    },
    [toggleMic],
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className='fixed right-6 bottom-6 z-50'
        >
          <div
            className={cn(
              'border-GRAY_400 bg-BG_GRAY_1 flex items-center gap-2 rounded-full border px-3 py-2 shadow-lg',
              'transition-shadow hover:shadow-xl',
            )}
          >
            <div
              role={isOnChatPage ? undefined : 'button'}
              tabIndex={isOnChatPage ? undefined : 0}
              onClick={handleLabelClick}
              className={cn('flex items-center gap-2', !isOnChatPage && 'cursor-pointer')}
            >
              {isConnecting ? (
                <Loader2 className='size-4 animate-spin text-blue-500' />
              ) : (
                <span className='relative flex size-4 items-center justify-center'>
                  <span className='absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-40' />
                  <Headphones className='relative size-4 text-green-600' />
                </span>
              )}

              <span className='text-GRAY_1000 text-xs font-medium'>
                {isConnecting ? 'Connecting...' : isMicEnabled ? 'Speaking...' : 'Voice active'}
              </span>
            </div>

            <div className='bg-GRAY_400 mx-0.5 h-4 w-px' />

            {isActive && (
              <button
                onClick={handleToggleMic}
                className={cn(
                  'rounded-full p-0.5 transition-colors',
                  isMicEnabled ? 'bg-green-100 text-green-600' : 'hover:bg-accent text-GRAY_700',
                )}
                aria-label={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
              >
                {isMicEnabled ? <Mic className='size-3.5' /> : <HeadphoneOff className='size-3.5' />}
              </button>
            )}

            <button
              onClick={handleStop}
              className='hover:bg-accent rounded-full p-0.5 transition-colors'
              aria-label='End voice chat'
            >
              <X className='size-3.5 text-red-500' />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VoiceChatFloatingIndicator;
