'use client';

import { type FC } from 'react';
import { Toggle, TooltipV2 } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Plus } from 'lucide-react';

interface AutoLoopToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const AutoLoopToggle: FC<AutoLoopToggleProps> = ({ enabled, onChange, disabled, className }) => {
  return (
    <TooltipV2
      tooltipBody="Set your expectation. Zamp runs until it's met."
      tooltipClassName='f-12-300 px-3 py-1.5 rounded-md whitespace-nowrap z-999 bg-black text-white'
      asChildTrigger
      delayDuration={300}
    >
      <Toggle
        pressed={enabled}
        onPressedChange={onChange}
        disabled={disabled}
        aria-label='Toggle autopilot'
        className={cn(
          '!border-GRAY_200 hover:!border-GRAY_300 data-[state=on]:!border-GRAY_300',
          disabled && 'cursor-not-allowed',
          className,
        )}
      >
        Autopilot
        {!enabled && <Plus size={12} />}
      </Toggle>
    </TooltipV2>
  );
};

export default AutoLoopToggle;
