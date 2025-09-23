import {
  cloneElement,
  FC,
  isValidElement,
  type ReactElement,
  ReactNode,
  type RefAttributes,
  useEffect,
  useRef,
  useState,
} from 'react';
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
  showOnlyWhenTruncated?: boolean;
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
  showOnlyWhenTruncated = false,
}) => {
  const triggerRef = useRef<HTMLElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const shouldShowTooltip = !disabled && !isDisabledBody && tooltipBody && isOverflowing;

  const enhancedChildren =
    showOnlyWhenTruncated && isValidElement(children)
      ? cloneElement(children as ReactElement<RefAttributes<HTMLElement>>, { ref: triggerRef })
      : children;

  useEffect(() => {
    if (!showOnlyWhenTruncated) {
      setIsOverflowing(true);

      return;
    }

    const checkOverflow = () => {
      const element = triggerRef.current;

      if (element) {
        const hasHorizontalOverflow = element.scrollWidth > element.clientWidth;
        const hasVerticalOverflow = element.scrollHeight > element.clientHeight;

        setIsOverflowing(hasHorizontalOverflow || hasVerticalOverflow);
      }
    };

    checkOverflow();

    const resizeObserver = new ResizeObserver(checkOverflow);

    if (triggerRef.current) {
      resizeObserver.observe(triggerRef.current);
    }

    window.addEventListener('resize', checkOverflow);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', checkOverflow);
    };
  }, [showOnlyWhenTruncated]);

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
          ref={!asChildTrigger && showOnlyWhenTruncated ? (triggerRef as React.Ref<HTMLButtonElement>) : undefined}
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
