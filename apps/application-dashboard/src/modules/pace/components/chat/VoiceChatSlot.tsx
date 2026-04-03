'use client';

import { FC, useCallback } from 'react';
import { Button } from '@zamp-platform/ui';
import { useVoiceChat } from '@zamp-platform/ui/hooks/useVoiceChat';
import { VOICE_CHAT_STATE } from '@zamp-platform/ui/types';
import { cn } from '@zamp-platform/ui/utils';
import { HeadphoneOff, Headphones, Loader2, X } from 'lucide-react';
import { useVoiceJoinMutation } from '@/apis/voiceAgents';

const toolbarBtnClass = 'hover:text-GRAY_1000 hover:bg-accent size-[26px] rounded-[6px] p-[2px] [&_svg]:size-3.5';

const VoiceChatSlot: FC = () => {
  const [triggerVoiceJoin] = useVoiceJoinMutation();
  const fetchVoiceJoin = useCallback(
    async (body: Parameters<typeof triggerVoiceJoin>[0]) => {
      const result = await triggerVoiceJoin(body);

      if ('error' in result) {
        const err = result.error;
        const detail = err && 'status' in err ? String(err.status) : (err as { message?: string })?.message;

        throw new Error(`Voice join failed${detail ? `: ${detail}` : ''}`);
      }

      return result.data;
    },
    [triggerVoiceJoin],
  );

  const { start, stop, toggleMic, isMicEnabled, state } = useVoiceChat({ fetchJoin: fetchVoiceJoin });

  const isVoiceActive = state === VOICE_CHAT_STATE.Active;
  const isVoiceConnecting = state === VOICE_CHAT_STATE.Connecting || state === VOICE_CHAT_STATE.Ready;
  const isVoiceStarted = isVoiceActive || isVoiceConnecting;

  if (isVoiceStarted) {
    return (
      <div className='border-GRAY_400 flex items-center rounded-[6px] border'>
        <Button
          variant='ghost'
          size='icon'
          className={cn(toolbarBtnClass, 'text-red-500 hover:text-red-600')}
          aria-label='End voice chat'
          onClick={stop}
        >
          <X />
        </Button>
        <div className='bg-GRAY_400 h-3.5 w-px' />
        <Button
          variant='ghost'
          size='icon'
          className={cn(
            toolbarBtnClass,
            isVoiceActive ? (isMicEnabled ? 'text-green-600' : 'text-GRAY_700') : 'text-blue-500',
          )}
          aria-label={isVoiceActive ? (isMicEnabled ? 'Mute microphone' : 'Unmute microphone') : 'Connecting'}
          onClick={isVoiceActive ? () => void toggleMic() : undefined}
          disabled={!isVoiceActive}
        >
          {isVoiceConnecting ? <Loader2 className='animate-spin' /> : isMicEnabled ? <Headphones /> : <HeadphoneOff />}
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant='ghost'
      size='icon'
      className={cn(toolbarBtnClass, state === VOICE_CHAT_STATE.Error ? 'text-red-500' : 'text-GRAY_700')}
      aria-label='Start voice chat'
      onClick={() => void start()}
    >
      <Headphones />
    </Button>
  );
};

export default VoiceChatSlot;
