'use client';

import * as React from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { Button } from './button';
import { SvgSpriteLoader } from '../assets/SvgSpriteLoader';
import { SelectIcon } from './select';
import { Tooltip, TooltipTrigger, TooltipProvider, TooltipContent } from './tooltip';

export interface SelectButtonOption {
  label?: string;
  value: string;
  icon?: SelectIcon;
  tooltipBody?: React.ReactNode;
}

export interface SelectButtonProps {
  options: SelectButtonOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  size?: 'default' | 'large' | 'medium' | 'small' | 'xsmall' | 'xxsmall' | 'icon';
  buttonClassName?: string;
}

const RenderIcon = ({ icon, className }: { icon: SelectIcon; className?: string }) => {
  if (icon?.type === 'sprite') {
    return <SvgSpriteLoader lazyLoading={true} id={icon.id ?? ''} className={className} />;
  }
  return icon?.component;
};

const SelectButton = React.forwardRef<HTMLDivElement, SelectButtonProps>(
  ({ options, value, onValueChange, className, disabled, size = 'medium', buttonClassName }, ref) => {
    const handleSelect = React.useCallback(
      (optionValue: string) => {
        if (!disabled) {
          onValueChange?.(optionValue);
        }
      },
      [onValueChange, disabled],
    );

    return (
      <div ref={ref} className={cn('relative inline-flex items-center justify-center gap-1 rounded-md p-1', className)}>
        {/* Sliding background indicator */}
        <div
          className={cn(
            'absolute inset-0.5 rounded-md border border-gray-200 bg-white shadow-sm transition-all ease-in-out',
            'transform-gpu',
          )}
          style={{
            left: `${options.findIndex((opt) => opt.value === value) * (100 / options.length)}%`,
            width: `${100 / options.length}%`,
          }}
        />

        <TooltipProvider delayDuration={100}>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <Tooltip key={option.value}>
                <TooltipTrigger asChild>
                  <Button
                    key={option.value}
                    variant='ghost'
                    size={size}
                    disabled={disabled}
                    className={cn('relative z-10 transition-all ease-in-out', 'hover:bg-gray-50', buttonClassName)}
                    onClick={() => handleSelect(option.value)}
                  >
                    <div className='flex items-center gap-2'>
                      {option.icon && (
                        <span
                          className={cn(
                            'flex items-center justify-center border-gray-900 transition-colors ease-in-out',
                            {
                              'text-gray-1000 border-gray-1000': isSelected,
                            },
                          )}
                        >
                          <RenderIcon icon={option.icon} />
                        </span>
                      )}
                      {option.label && <span className='truncate'>{option.label}</span>}
                    </div>
                  </Button>
                </TooltipTrigger>
                {option?.tooltipBody && <TooltipContent side='bottom'>{option.tooltipBody}</TooltipContent>}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    );
  },
);

SelectButton.displayName = 'SelectButton';

export { SelectButton };
