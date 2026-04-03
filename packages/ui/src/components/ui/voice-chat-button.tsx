'use client';

import { cn } from '@zamp-platform/ui/utils';
import { Headphones, Loader2, Mic, MicOff, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, type MouseEvent } from 'react';

import { useVoiceChat } from '../../hooks/useVoiceChat';
import type { UseVoiceChatReturn } from '../../types/voice-chat';
import { VOICE_CHAT_STATE } from '../../types/voice-chat';
import { Button } from './button';

export interface VoiceChatButtonProps {
  systemPrompt?: string;
  className?: string;
  voiceChat?: UseVoiceChatReturn;
  mini?: boolean;
}

function VoiceChatButtonView({
  systemPrompt,
  className,
  voiceChat,
  mini = false,
}: Omit<VoiceChatButtonProps, 'voiceChat'> & { voiceChat: UseVoiceChatReturn }) {
  const { state, start, stop, toggleMic, isMicEnabled } = voiceChat;

  const handlePrimaryClick = useCallback(async () => {
    if (state === VOICE_CHAT_STATE.Connecting || state === VOICE_CHAT_STATE.Ready) {
      return;
    }
    if (state === VOICE_CHAT_STATE.Active) {
      stop();
      return;
    }
    if (state === VOICE_CHAT_STATE.Idle || state === VOICE_CHAT_STATE.Error) {
      await start({ systemPrompt });
    }
  }, [start, state, stop, systemPrompt]);

  const handleToggleMic = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      void toggleMic();
    },
    [toggleMic],
  );

  const iconWrap = mini ? 'h-9 w-9 min-h-9 min-w-9' : 'h-11 w-11 min-h-11 min-w-11';

  const borderStyles =
    state === VOICE_CHAT_STATE.Connecting
      ? 'border-2 border-blue-500'
      : state === VOICE_CHAT_STATE.Active
        ? 'border-2 border-green-600'
        : state === VOICE_CHAT_STATE.Error
          ? 'border-2 border-red-600'
          : 'border border-GRAY_400';

  const isPulse = state === VOICE_CHAT_STATE.Active;

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <motion.div
        animate={isPulse ? { scale: [1, 1.03, 1] } : { scale: 1 }}
        transition={isPulse ? { repeat: Infinity, duration: 1.6, ease: 'easeInOut' } : undefined}
        className={cn('rounded-full', borderStyles)}
      >
        <Button
          type='button'
          variant='ghost'
          size='small'
          className={cn('rounded-full', iconWrap)}
          onClick={handlePrimaryClick}
          aria-label={
            state === VOICE_CHAT_STATE.Active
              ? 'End voice chat'
              : state === VOICE_CHAT_STATE.Connecting || state === VOICE_CHAT_STATE.Ready
                ? 'Connecting voice chat'
                : 'Start voice chat'
          }
        >
          {state === VOICE_CHAT_STATE.Connecting || state === VOICE_CHAT_STATE.Ready ? (
            <Loader2 className='size-5 animate-spin text-blue-600' aria-hidden />
          ) : state === VOICE_CHAT_STATE.Active ? (
            <X className='size-5 text-green-700' aria-hidden />
          ) : (
            <Headphones
              className={cn('size-5', state === VOICE_CHAT_STATE.Error ? 'text-red-600' : 'text-GRAY_1000')}
              aria-hidden
            />
          )}
        </Button>
      </motion.div>

      {state === VOICE_CHAT_STATE.Active && (
        <Button
          type='button'
          variant='outline'
          size='small'
          className={mini ? 'h-8 px-2' : 'h-9 px-3'}
          onClick={handleToggleMic}
          aria-label={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isMicEnabled ? <Mic className='size-4' aria-hidden /> : <MicOff className='size-4' aria-hidden />}
        </Button>
      )}
    </div>
  );
}

/**
 * NOTE: Uses direct `fetch` with `credentials: 'include'` for the voice join request,
 * not the app's RTK Query base query. Ensure cookie-based auth covers the voice join
 * endpoint, or always pass a `voiceChat` prop that uses the app's auth layer.
 */
function VoiceChatButtonWithHook(props: Omit<VoiceChatButtonProps, 'voiceChat'>) {
  const voice = useVoiceChat({ defaultSystemPrompt: props.systemPrompt });
  return <VoiceChatButtonView {...props} voiceChat={voice} />;
}

export function VoiceChatButton({ voiceChat, ...rest }: VoiceChatButtonProps) {
  if (voiceChat) {
    return <VoiceChatButtonView {...rest} voiceChat={voiceChat} />;
  }
  return <VoiceChatButtonWithHook {...rest} />;
}
