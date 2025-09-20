import { cloneElement, FC, isValidElement, ReactNode, type RefAttributes, useEffect, useRef, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@zamp-platform/ui';
import { SIDE_OPTIONS } from '@/types/commonTypes';

type TooltipV2Props = {
  children: ReactNode;
  tooltipBody: ReactNode;
  side?: SIDE_OPTIONS;
  className?: string;
  tooltipClassName?: string;
  asChildTrigger?: boolean;
  disabled?: boolean;
  scrollableBody?: boolean;
  isDisabledBody?: boolean;
  showOnlyWhenTruncated?: boolean; // New prop to enable truncation detection
};

const TooltipV2: FC<TooltipV2Props> = ({
  children,
  tooltipBody,
  side = SIDE_OPTIONS.TOP,
  className,
  tooltipClassName,
  asChildTrigger = false,
  disabled = false,
  scrollableBody = false,
  isDisabledBody = false,
  showOnlyWhenTruncated = false, // Default to false for backward compatibility
}) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // Determine if tooltip should be shown
  const shouldShowTooltip = !disabled && !isDisabledBody && tooltipBody && isOverflowing;

  // If we need to attach a ref for overflow detection
  const enhancedChildren =
    showOnlyWhenTruncated && isValidElement(children)
      ? cloneElement(children as React.ReactElement<RefAttributes<HTMLElement>>, { ref: triggerRef })
      : children;

  useEffect(() => {
    if (!showOnlyWhenTruncated) {
      setIsOverflowing(true);

      return;
    }

    const checkOverflow = () => {
      const element = triggerRef.current;

      if (element) {
        // Check for horizontal overflow (text truncation)
        const hasHorizontalOverflow = element.scrollWidth > element.clientWidth;
        // Check for vertical overflow (if needed)
        const hasVerticalOverflow = element.scrollHeight > element.clientHeight;

        setIsOverflowing(hasHorizontalOverflow || hasVerticalOverflow);
      }
    };

    // Initial check to see if the element is overflowing
    checkOverflow();

    // ResizeObserver to watch for element size changes
    const resizeObserver = new ResizeObserver(checkOverflow);

    if (triggerRef.current) {
      resizeObserver.observe(triggerRef.current);
    }

    // Check on window resize
    window.addEventListener('resize', checkOverflow);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', checkOverflow);
    };
  }, [children, showOnlyWhenTruncated]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollableBody) {
      e.stopPropagation();
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger
          className={className}
          asChild={asChildTrigger}
          disabled={disabled || !shouldShowTooltip}
          ref={!asChildTrigger && showOnlyWhenTruncated ? triggerRef : undefined}
        >
          {enhancedChildren}
        </TooltipTrigger>
        {shouldShowTooltip && (
          <TooltipContent className={tooltipClassName} side={side} sideOffset={10} onWheel={handleWheel}>
            {tooltipBody}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipV2;
