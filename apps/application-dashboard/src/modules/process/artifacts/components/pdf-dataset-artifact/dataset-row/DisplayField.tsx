import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/utils';
import TooltipV2 from '@/components/common/TooltipV2';
import { N_A_VALUE } from '@/modules/process/process.constant';
import { formatRowValue } from '@/modules/process/process.utils';
import { copyToClipBoard } from '@/utils/common';

interface DisplayFieldProps {
  value: string;
  isCompleted: boolean;
  isClicked: boolean;
  onClick: () => void;
  onDoubleClick?: () => void;
  isPdfDataset?: boolean;
  textClassName?: string;
}

const DisplayField = ({
  value,
  isCompleted,
  isClicked,
  onClick,
  onDoubleClick,
  isPdfDataset,
  textClassName,
}: DisplayFieldProps) => {
  const formattedValue = useMemo(() => formatRowValue(value), [value]);
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [isInCooldown, setIsInCooldown] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCopyingRef = useRef(false);

  // Cleanup timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(() => {
    // Block tooltip changes during copy to prevent flicker
    isCopyingRef.current = true;

    copyToClipBoard(formattedValue);
    setShowCopiedTooltip(true);
    setIsTooltipOpen(true);
    setIsInCooldown(true);

    // Reset copying flag after state updates are processed
    requestAnimationFrame(() => {
      isCopyingRef.current = false;
    });

    // Clear any existing timeout before setting a new one
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setShowCopiedTooltip(false);
      setIsTooltipOpen(false);
      // Keep cooldown active - will reset on mouse leave
    }, 1000);
    onClick();
  }, [formattedValue, onClick]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      // Block all changes during copy action to prevent flicker
      if (isCopyingRef.current) {
        return;
      }
      // Don't allow opening during cooldown or while showing copied state
      if (open && (showCopiedTooltip || isInCooldown)) {
        return;
      }
      setIsTooltipOpen(open);
    },
    [showCopiedTooltip, isInCooldown],
  );

  const handleMouseLeave = useCallback(() => {
    // Reset cooldown when mouse leaves - allows tooltip on re-entry
    setIsInCooldown(false);
  }, []);

  const tooltipContent = showCopiedTooltip ? (
    <span className='flex items-center gap-1'>
      <SvgSpriteLoader id='check' size={12} color='white' />
      Copied!
    </span>
  ) : (
    'Click to copy'
  );

  return (
    <TooltipV2
      tooltipBody={tooltipContent}
      tooltipClassName='f-11-450 rounded-[6px] bg-[#171717] px-2.5 py-1.5'
      delayDuration={500}
      open={isTooltipOpen}
      onOpenChange={handleOpenChange}
    >
      <div
        className={cn(
          'f-12-500 bg-GRAY_100 text-GRAY_1000 max-h-40 w-fit max-w-[560px] cursor-pointer overflow-y-scroll rounded-md border border-transparent px-1.5 py-1 break-words transition-colors duration-200 select-none [scrollbar-width:none]',
          {
            'bg-ORANGE_100 underline underline-offset-2': isCompleted,
            'border-BLUE_700': isClicked,
            'max-w-full': isPdfDataset,
            'text-GRAY_700': formattedValue === N_A_VALUE,
          },
        )}
        onClick={handleCopy}
        onDoubleClick={onDoubleClick}
        onMouseLeave={handleMouseLeave}
      >
        <span className={textClassName}>{formattedValue}</span>
      </div>
    </TooltipV2>
  );
};

export default DisplayField;
