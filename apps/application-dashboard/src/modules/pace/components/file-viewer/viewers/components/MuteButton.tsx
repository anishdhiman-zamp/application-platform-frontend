'use client';

import { Button } from '@zamp-platform/ui';
import { Volume2, VolumeX } from 'lucide-react';
import type { defaultFnType } from '@/types/commonTypes';

interface MuteButtonProps {
  isMuted: boolean;
  onClick: defaultFnType;
  disabled?: boolean;
}

const MuteButton = ({ isMuted, onClick, disabled = false }: MuteButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant='ghost'
      disabled={disabled}
      className='text-GRAY_1000 hover:text-GRAY_1000 disabled:text-GRAY_600 flex h-6 w-6 shrink-0 items-center justify-center bg-transparent p-0 hover:bg-transparent disabled:cursor-not-allowed'
      aria-label={isMuted ? 'Unmute' : 'Mute'}
    >
      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
    </Button>
  );
};

export default MuteButton;
