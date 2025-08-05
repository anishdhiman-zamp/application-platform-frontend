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
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  if (!value) return <span className='f-13-450 text-GRAY_500'>N/A</span>;

  const values = Array.isArray(value) ? value : [value];
  const firstItem = values[0];
  const remainingItems = values.slice(1);
  const hasMoreItems = remainingItems.length > 0;

  const handleItemClick = (item: string) => {
    setSelectedFileName(item);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setSelectedFileName('');
  };

  return (
    <div className='flex max-w-full items-center gap-2'>
      {/* First item */}
      <div
        className='bg-GRAY_100 flex max-w-[150px] min-w-0 cursor-pointer items-center gap-1.5 rounded px-1.5 py-1'
        onClick={() => handleItemClick(firstItem)}
      >
        <SvgSpriteLoader
          id='file-02'
          iconCategory={ICON_SPRITE_TYPES.FILES}
          size={12}
          color={COLORS.GRAY_1000}
          className='flex-shrink-0'
        />
        <p className='f-11-400 text-GRAY_1000 truncate' title={firstItem}>
          {firstItem}
        </p>
      </div>

      {/* "+X more" dropdown */}
      {hasMoreItems && (
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <p className='f-13-400 text-GRAY_700 hover:text-GRAY_1000 flex-shrink-0 cursor-pointer transition-colors'>
              +{remainingItems.length}
            </p>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' className='w-[168px] space-y-1 rounded-md p-1'>
            {remainingItems.map((item, index) => (
              <DropdownMenuItem
                key={index}
                className='bg-GRAY_100 flex w-full items-center justify-between gap-x-6 rounded-md px-1 py-1'
              >
                <TooltipV2 tooltipBody='View' side={SIDE_OPTIONS.BOTTOM}>
                  <div
                    className='bg-GRAY_200 flex max-w-[100px] min-w-0 cursor-pointer items-center gap-1.5 rounded px-1.5 py-1'
                    onClick={() => handleItemClick(item)}
                  >
                    <SvgSpriteLoader
                      id='file-02'
                      iconCategory={ICON_SPRITE_TYPES.FILES}
                      size={12}
                      color={COLORS.GRAY_1000}
                      className='flex-shrink-0'
                    />
                    <p className='f-11-400 text-GRAY_1000 truncate' title={item}>
                      {item}
                    </p>
                  </div>
                </TooltipV2>
                <TooltipV2 tooltipBody='Download' side={SIDE_OPTIONS.BOTTOM}>
                  <div className='hover:bg-GRAY_200 flex items-center rounded p-1'>
                    <SvgSpriteLoader id='download-02' size={12} className='shrink-0 cursor-pointer' />
                  </div>
                </TooltipV2>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {previewOpen && (
        <DocumentPreviewDialog
          isOpen={previewOpen}
          onClose={handleClosePreview}
          selectedFileName={selectedFileName}
          data={data}
          availableFiles={values}
        />
      )}
    </div>
  );
};

export default DocumentPill;
