'use client';

import { cn } from '@zamp-platform/ui/utils';
import * as React from 'react';
import { SvgSpriteLoader } from '../assets/SvgSpriteLoader';
import { Button } from './button';
import { SelectIcon } from './select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

export interface SelectButtonOption {
  label?: string;
  value: string;
  icon?: SelectIcon;
  tooltipBody?: React.ReactNode;
}

export interface SelectButtonProps {
  options: SelectButtonOption[];
  value?: string;
  onValueChange?: (value: string) => void; // eslint-disable-line no-unused-vars
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
    const [sliderStyle, setSliderStyle] = React.useState<React.CSSProperties>({});

    // Create refs for each option
    const buttonRefs = React.useMemo(() => options.map(() => React.createRef<HTMLButtonElement>()), [options]);

    const handleSelect = React.useCallback(
      (optionValue: string) => {
        if (!disabled) {
          onValueChange?.(optionValue);
        }
      },
      [onValueChange, disabled],
    );

    React.useLayoutEffect(() => {
      const selectedIndex = options.findIndex((option) => option.value === value);
      if (selectedIndex >= 0 && buttonRefs[selectedIndex]?.current) {
        const selectedButton = buttonRefs[selectedIndex].current;

        // Use offsetLeft relative to the container for more accurate positioning
        const offsetLeft = selectedButton.offsetLeft;
        const width = selectedButton.offsetWidth;
        const height = selectedButton.offsetHeight;

        setSliderStyle({
          transform: `translateX(${offsetLeft}px)`,
          width: `${width}px`,
          height: `${height}px`,
          opacity: 1,
        });
      } else {
        setSliderStyle({
          opacity: 0,
        });
      }
    }, [value, options, buttonRefs]);

    return (
      <div ref={ref} className={cn('relative inline-flex items-center justify-center gap-1 rounded-md', className)}>
        {/* Sliding background */}
        <div
          className='pointer-events-none absolute top-0 left-0 rounded-md border border-gray-400 bg-white opacity-0 shadow-sm transition-all duration-300 ease-in-out'
          style={sliderStyle}
          data-testid='select-button-slider'
        />
        <TooltipProvider>
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <Tooltip key={option.value}>
                <TooltipTrigger asChild>
                  <Button
                    ref={buttonRefs[index]}
                    key={option.value}
                    variant='ghost'
                    size={size}
                    disabled={disabled}
                    className={cn(
                      'relative z-10 border-transparent bg-transparent transition-colors duration-300 ease-in-out hover:bg-transparent',
                      isSelected ? 'text-gray-1000 hover:text-gray-1000' : 'text-gray-700 hover:text-gray-900',
                      buttonClassName,
                    )}
                    onClick={() => handleSelect(option.value)}
                    data-testid={`${option.value}-select-button`}
                  >
                    <div className='flex items-center gap-2'>
                      {option.icon && (
                        <span
                          className={cn(
                            'flex items-center justify-center transition-colors duration-300 ease-in-out',
                            isSelected ? 'text-gray-1000 border-gray-1000' : 'border-gray-900 text-gray-900',
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
