import React from 'react';
import { Button } from '@zamp-platform/ui';
import Image from 'next/image';
import { PAUSED, PLAYING } from '@/constants/icons';
import type { defaultFnType } from '@/types/commonTypes';

interface PlayButtonProps {
  isPlaying: boolean;
  onClick: defaultFnType;
  disabled?: boolean;
}

const PlayButton: React.FC<PlayButtonProps> = ({ isPlaying, onClick, disabled = false }) => {
  return (
    <Button
      onClick={onClick}
      variant='ghost'
      disabled={disabled}
      className='flex h-4 w-3.5 items-center justify-center bg-transparent p-0 hover:bg-transparent'
    >
      <Image src={isPlaying ? PLAYING : PAUSED} alt='play' width={12} height={14} priority />
    </Button>
  );
};

export default PlayButton;
