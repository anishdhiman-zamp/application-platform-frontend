'use client';

import { type FC } from 'react';
import { Toggle } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Aperture } from 'lucide-react';

interface AutoLoopToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const AutoLoopToggle: FC<AutoLoopToggleProps> = ({ enabled, onChange, disabled, className }) => {
  return (
    <Toggle
      pressed={enabled}
      onPressedChange={onChange}
      disabled={disabled}
      aria-label='Toggle auto-loop'
      className={cn(disabled && 'cursor-not-allowed', className)}
    >
      <Aperture size={12} />
      Auto-loop
    </Toggle>
  );
};

export default AutoLoopToggle;
