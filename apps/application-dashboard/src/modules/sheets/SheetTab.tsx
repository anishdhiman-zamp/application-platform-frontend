import { FC, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Button, Input, Popover, PopoverContent, PopoverTrigger, toast } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/utils';
import { useParams } from 'next/navigation';
import { MenuItem } from 'types/common/components';
import { useUpdateSheetByPageIdMutation } from '@/apis/pages';
import { COLORS } from '@/constants/colors';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { preventAutoFocus } from '@/utils/common';

interface SheetTabProps {
  tab: MenuItem;
  currentSheetId: string;
  handleTabSelect: (tab: MenuItem) => void;
  isDragging?: boolean;
}

const SheetTab: FC<SheetTabProps> = ({ tab, currentSheetId, handleTabSelect, isDragging = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sheetName, setSheetName] = useState<string>();
  const [finalName, setFinalName] = useState<string>();
  const [containerWidth, setContainerWidth] = useState(0);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasMovedRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const params = useParams();
  const [updateSheetByPageId] = useUpdateSheetByPageIdMutation();

  const handleInputBlur = () => {
    const trimmedName = sheetName?.trim();

    if (trimmedName === tab?.label || !trimmedName) {
      return;
    }

    setFinalName(trimmedName);

    updateSheetByPageId({
      pageId: params?.pageId as string,
      sheetId: tab?.value as string,
      body: {
        name: trimmedName,
      },
    })
      .unwrap()
      .then(() => {
        toast.success('Sheet name updated successfully');
      })
      .catch(() => {
        toast.error('Failed to update sheet name');
        setSheetName(tab?.label);
        setFinalName(tab?.label);
      });
  };

  const handleMenuOpen = (open: boolean) => {
    setIsMenuOpen(open);
    if (open) {
      setSheetName(tab?.label);
    }
  };

  const startLongPress = useCallback(() => {
    setIsLongPressing(true);
    hasMovedRef.current = false;
    document.body.classList.add('long-press-mode');
  }, []);

  const cancelLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsLongPressing(false);
    document.body.classList.remove('long-press-mode');
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      startPosRef.current = { x: e.clientX, y: e.clientY };
      hasMovedRef.current = false;
      longPressTimerRef.current = setTimeout(() => {
        startLongPress();
      }, 500);
    },
    [startLongPress],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (startPosRef.current && longPressTimerRef.current) {
        const deltaX = Math.abs(e.clientX - startPosRef.current.x);
        const deltaY = Math.abs(e.clientY - startPosRef.current.y);

        if (deltaX > 5 || deltaY > 5) {
          hasMovedRef.current = true;
          cancelLongPress();
        }
      }
    },
    [cancelLongPress],
  );

  const handleMouseLeave = useCallback(() => {
    cancelLongPress();
  }, [cancelLongPress]);

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === KEYBOARD_KEYS.ENTER) {
      e.preventDefault();
      e.stopPropagation();
      handleMenuOpen(false);
      handleInputBlur();
    }
  };

  const handleTabClick = (e: React.MouseEvent) => {
    if (isLongPressing || isDragging) {
      e.preventDefault();
      e.stopPropagation();

      return;
    }
    handleTabSelect(tab);
  };

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
      setFinalName(tab?.label);
    }
  }, [tab?.label]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'hover:bg-secondary/80 inline-flex items-center gap-1 rounded-lg border border-gray-400 transition-all duration-200',
        { 'bg-BG_GRAY_2 border-GRAY_500': currentSheetId === tab?.value },
        { 'z-10 scale-105 shadow-lg': isLongPressing },
        { 'pointer-events-none opacity-50': isDragging },
      )}
      onMouseDown={handleMouseDown}
      onMouseUp={cancelLongPress}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        userSelect: isLongPressing ? 'none' : 'auto',
      }}
    >
      <Button
        size='medium'
        variant='secondary'
        className={cn('overflow-hidden border-none px-4 py-2 text-ellipsis whitespace-nowrap')}
        onClick={handleTabClick}
      >
        {finalName || tab?.label}
      </Button>
      <Popover open={isMenuOpen} onOpenChange={handleMenuOpen}>
        <PopoverTrigger
          className={cn('cursor-pointer pr-1.5', (isLongPressing || isDragging) && 'pointer-events-none')}
        >
          <SvgSpriteLoader id='dots-vertical' size={14} color={isMenuOpen ? COLORS.GRAY_800 : COLORS.GRAY_500} />
        </PopoverTrigger>
        <PopoverContent
          align='end'
          sideOffset={16}
          className='p-0'
          style={{ width: containerWidth }}
          onCloseAutoFocus={preventAutoFocus}
        >
          <Input
            size='small'
            placeholder='Sheet'
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            icon={<SvgSpriteLoader id='edit-03' size={16} color={COLORS.GRAY_500} />}
            autoFocus
            onBlur={handleInputBlur}
            onKeyDown={handleEditKeyDown}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SheetTab;
