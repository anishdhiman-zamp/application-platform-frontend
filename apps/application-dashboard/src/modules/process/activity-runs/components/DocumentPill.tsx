import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { ICellRendererParams } from 'ag-grid-community';
import DocumentPreviewDialog from 'modules/process/activity-runs/components/DocumentPreviewDialog';
import { MapAny, SIDE_OPTIONS } from 'types/commonTypes';
import TooltipV2 from '@/components/common/TooltipV2';
import { COLORS } from '@/constants/colors';

interface DocumentPillProps extends ICellRendererParams {
  value: string | string[];
  data: MapAny;
}

const DocumentPill = ({ value, data }: DocumentPillProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!value) return <span className='f-13-450 text-GRAY_500'>N/A</span>;

  const values = Array.isArray(value) ? value : [value];
  const firstItem = values[0];
  const remainingItems = values.slice(1);
  const hasMoreItems = remainingItems.length > 0;

  // const [getArtifacts] = useLazyGetActivityArtifactsQuery();

  const handleItemClick = (item: string) => {
    setPreviewOpen(true);
    console.log(item, data);
  };

  return (
    <div className='flex w-full items-center gap-2 overflow-x-scroll [scrollbar-width:none]'>
      {/* First item */}
      <div
        className='bg-GRAY_100 flex w-fit cursor-pointer items-center gap-1.5 rounded px-1.5 py-1'
        onClick={() => handleItemClick(firstItem)}
      >
        <SvgSpriteLoader id='file-02' iconCategory={ICON_SPRITE_TYPES.FILES} size={12} color={COLORS.GRAY_1000} />
        <p className='f-11-400 text-GRAY_1000 max-w-[50px] truncate' title={firstItem}>
          {firstItem}
        </p>
      </div>

      {/* "+X more" dropdown */}
      {hasMoreItems && (
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <p className='f-13-400 text-GRAY_700 hover:text-GRAY_1000 cursor-pointer transition-colors'>
              +{remainingItems.length}
            </p>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' className='w-[168px] space-y-1 rounded-md p-1'>
            {remainingItems.map((item, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => handleItemClick(item)}
                className='bg-GRAY_100 flex w-full cursor-pointer items-center justify-between rounded-md px-1 py-1'
              >
                <TooltipV2 tooltipBody='View' side={SIDE_OPTIONS.BOTTOM}>
                  <div className='bg-GRAY_200 flex cursor-pointer items-center gap-1.5 rounded px-1.5 py-1'>
                    <SvgSpriteLoader
                      id='file-02'
                      iconCategory={ICON_SPRITE_TYPES.FILES}
                      size={12}
                      color={COLORS.GRAY_1000}
                    />
                    <p className='f-11-400 text-GRAY_1000 max-w-[50px] truncate' title={item}>
                      {item}
                    </p>
                  </div>
                </TooltipV2>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {previewOpen && <DocumentPreviewDialog />}
    </div>
  );
};

export default DocumentPill;
