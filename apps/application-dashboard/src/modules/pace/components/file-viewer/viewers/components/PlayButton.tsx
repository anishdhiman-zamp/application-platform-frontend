'use client';

import { Button } from '@zamp-platform/ui';
import { Pause, Play } from 'lucide-react';
import type { defaultFnType } from '@/types/commonTypes';

interface PlayButtonProps {
  isPlaying: boolean;
  onClick: defaultFnType;
  disabled?: boolean;
}

const PlayButton = ({ isPlaying, onClick, disabled = false }: PlayButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant='ghost'
      disabled={disabled}
      className='text-GRAY_1000 hover:text-GRAY_1000 disabled:text-GRAY_600 flex h-6 w-6 shrink-0 items-center justify-center bg-transparent p-0 hover:bg-transparent disabled:cursor-not-allowed'
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
    </Button>
  );
};

export default PlayButton;
