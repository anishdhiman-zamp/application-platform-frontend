'use client';

import { type FC } from 'react';
import { Toggle, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@zamp-platform/ui';
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
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
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
        </TooltipTrigger>
        <TooltipContent>Explain your expectation, Zamp runs on autopilot until the expectation is met</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AutoLoopToggle;
