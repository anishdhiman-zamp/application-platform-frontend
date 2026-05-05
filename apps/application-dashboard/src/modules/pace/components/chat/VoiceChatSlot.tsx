'use client';

import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@zamp-platform/ui';
import { VOICE_CHAT_STATE } from '@zamp-platform/ui/types';
import { cn } from '@zamp-platform/ui/utils';
import { Headphones, Loader2, Mic, MicOff, X } from 'lucide-react';
import { useVoiceChatContext } from '@/contexts/VoiceChatContext';

const toolbarBtnClass = 'hover:text-GRAY_1000 hover:bg-accent size-8 rounded-[6px] p-[2px] [&_svg]:size-3.5';

const VoiceChatSlot = () => {
  const { start, stop, toggleMic, isMicEnabled, state } = useVoiceChatContext();

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
          {isVoiceConnecting ? <Loader2 className='animate-spin' /> : isMicEnabled ? <Mic /> : <MicOff />}
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className={cn(toolbarBtnClass, state === VOICE_CHAT_STATE.Error ? 'text-red-500' : 'text-GRAY_700')}
            aria-label='Start voice chat'
            onClick={() => void start()}
          >
            <Headphones />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Double-press Shift to toggle voice chat</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VoiceChatSlot;
