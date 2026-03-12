import { FC, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Button, CSS_VARS, Input, Popover, PopoverContent, PopoverTrigger, toast } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/utils';
import DeleteSheetDialog from 'modules/sheets/DeleteSheetDialog';
import { useParams } from 'next/navigation';
import { MenuItem } from 'types/common/components';
import { useUpdateSheetByPageIdMutation } from '@/apis/pages';
import PermissionGuard from '@/components/hoc/PermissionGuard';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { PAGE_ACCESS_PRIVILEGES, ResourceType } from '@/modules/shareResource/shareResource.types';
import { defaultFnType } from '@/types/commonTypes';
import { preventAutoFocus } from '@/utils/common';

interface SheetTabProps {
  tab: MenuItem;
  currentSheetId: string;
  handleTabSelect: (tab: MenuItem, isFromOverflow?: boolean) => void;
  isDragging?: boolean;
  allSheets?: MenuItem[];
  onCreateSheet: defaultFnType;
}

const SheetTab: FC<SheetTabProps> = ({
  tab,
  currentSheetId,
  handleTabSelect,
  isDragging = false,
  allSheets = [],
  onCreateSheet,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasMovedRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const params = useParams();
  const [updateSheetByPageId] = useUpdateSheetByPageIdMutation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sheetName, setSheetName] = useState<string>();
  const [finalName, setFinalName] = useState<string>();
  const [containerWidth, setContainerWidth] = useState(0);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const handleDeleteSheet = () => {
    setIsDeleteDialogOpen(true);
    setIsMenuOpen(false);
  };

  const navigateToFallback = () => {
    const remainingSheets = allSheets.filter((sheet) => sheet.value !== tab.value);

    if (remainingSheets.length > 0) {
      const firstSheet = remainingSheets[0];

      handleTabSelect(firstSheet);

      return;
    }
    onCreateSheet();
  };

  const handleDeleteSuccess = () => {
    if (currentSheetId === tab.value) {
      navigateToFallback();
    }
  };

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
        data-testid={`${tab?.value}-sheet-tab`}
      >
        {finalName || tab?.label}
      </Button>
      <Popover open={isMenuOpen} onOpenChange={handleMenuOpen}>
        <PopoverTrigger
          className={cn('cursor-pointer pr-1.5', (isLongPressing || isDragging) && 'pointer-events-none')}
          data-testid={`${tab?.value}-sheet-tab-popover-trigger`}
        >
          <PermissionGuard
            resourceType={ResourceType.PAGE}
            resourceId={params?.pageId as string}
            privilege={PAGE_ACCESS_PRIVILEGES.ADMIN}
          >
            <SvgSpriteLoader id='dots-vertical' size={14} color={isMenuOpen ? CSS_VARS.GRAY_800 : CSS_VARS.GRAY_500} />
          </PermissionGuard>
        </PopoverTrigger>
        <PopoverContent
          align='end'
          sideOffset={16}
          className='space-y-2'
          style={{ width: containerWidth }}
          onCloseAutoFocus={preventAutoFocus}
        >
          <Input
            size='small'
            placeholder='Sheet'
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            icon={<SvgSpriteLoader id='edit-03' size={16} color={CSS_VARS.GRAY_500} />}
            autoFocus
            onBlur={handleInputBlur}
            onKeyDown={handleEditKeyDown}
            data-testid={`${tab?.value}-sheet-tab-input`}
          />

          <Button
            variant='ghost'
            size='medium'
            className='flex w-full items-center justify-start gap-1.5 text-red-700 hover:text-red-700'
            onClick={handleDeleteSheet}
            data-testid={`${tab?.value}-sheet-tab-delete-sheet-btn`}
          >
            <SvgSpriteLoader id='trash-04' size={12} />
            <span>Delete sheet</span>
          </Button>
        </PopoverContent>
      </Popover>
      <DeleteSheetDialog
        pageId={params?.pageId as string}
        sheetId={tab?.value as string}
        sheetName={tab?.label as string}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default SheetTab;
