import { FC, useState } from 'react';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { cn } from '@zamp-platform/ui/utils';
import { useRouter } from 'next/navigation';
import TooltipV2 from '@/components/common/TooltipV2';
import { WIDGET_TYPES, WidgetInstanceType } from '@/types/api/widgets.types';
import { ResponsiveGridLayoutType, SIDE_OPTIONS } from '@/types/commonTypes';
import { preventAutoFocus } from '@/utils/common';

interface WidgetOptionsProps {
  setIsDeleteDialogOpen: (open: boolean) => void;
  widgetDetails: Extract<
    WidgetInstanceType,
    {
      widget_type:
        | WIDGET_TYPES.BAR_CHART
        | WIDGET_TYPES.LINE_CHART
        | WIDGET_TYPES.PIE_CHART
        | WIDGET_TYPES.DONUT_CHART
        | WIDGET_TYPES.KPI;
    }
  >;
  currentWidgetLayout?: ResponsiveGridLayoutType;
}

const WidgetOptions: FC<WidgetOptionsProps> = ({ setIsDeleteDialogOpen, widgetDetails, currentWidgetLayout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartTime, setDragStartTime] = useState(0);

  const router = useRouter();

  const handleMouseDown = () => {
    setDragStartTime(Date.now());
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    const dragDuration = Date.now() - dragStartTime;

    // Only consider it a drag if it lasted more than 150ms
    if (dragDuration > 150) {
      setIsDragging(true);
      // Reset after a short delay
      setTimeout(() => {
        setIsDragging(false);
      }, 200);
    } else {
      setIsDragging(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only prevent if we were actually dragging for a significant time
    if (isDragging && Date.now() - dragStartTime > 150) {
      e.preventDefault();
      e.stopPropagation();

      return;
    }
  };

  const handleEditClick = () => {
    setIsOpen(false);
    router.push(
      `?sheetId=${widgetDetails?.sheet_id}&isWidget=true&data=${btoa(JSON.stringify(widgetDetails))}&size=${
        currentWidgetLayout?.w === 8 ? 'half' : 'full'
      }`,
    );
  };

  const handleDeleteClick = () => {
    setIsOpen(false);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className='absolute top-4.5 -left-[11px] z-1000'>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger className={cn('cursor-pointer')}>
          <TooltipV2
            tooltipBody={
              <div>
                <div>
                  <strong>Click</strong> to open menu
                </div>
                <div>
                  <strong>Drag</strong> to move
                </div>
              </div>
            }
            side={SIDE_OPTIONS.BOTTOM}
            asChildTrigger
          >
            <div
              className={cn(
                'widget-options-handle flex h-[38px] w-fit cursor-pointer items-center overflow-hidden rounded-full border border-gray-200 bg-[#fafafa] px-[2px] py-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100',
                {
                  'opacity-100': isOpen,
                  'cursor-grabbing': isDragging,
                },
              )}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onClick={handleClick}
            >
              <SvgSpriteLoader id='dots-vertical' width={16} height={16} iconCategory={ICON_SPRITE_TYPES.GENERAL} />
            </div>
          </TooltipV2>
        </PopoverTrigger>
        <PopoverContent onCloseAutoFocus={preventAutoFocus} align='start'>
          <div className='flex flex-col'>
            <Button
              variant='ghost'
              onClick={handleEditClick}
              size='medium'
              className='flex w-full items-center justify-start gap-1.5'
            >
              <SvgSpriteLoader id='settings-04' size={12} />
              <span>Edit</span>
            </Button>
            <Button
              variant='ghost'
              onClick={handleDeleteClick}
              size='medium'
              className='flex w-full items-center justify-start gap-1.5 text-red-700 hover:text-red-700'
            >
              <SvgSpriteLoader id='trash-04' size={12} />
              <span>Delete</span>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default WidgetOptions;
