import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { cn } from '@zamp-platform/ui/utils';
import { ICellRendererParams } from 'ag-grid-community';
import DocumentPreviewDialog from 'modules/process/activity-runs/components/DocumentPreviewDialog';
import type { DocumentItemType } from 'modules/process/process.types';
import { SIDE_OPTIONS } from 'types/commonTypes';
import TooltipV2 from '@/components/common/TooltipV2';
import { COLORS } from '@/constants/colors';

interface DocumentPillProps extends ICellRendererParams {
  value: DocumentItemType[];
}

interface DocumentItemPillProps {
  item: DocumentItemType;
  onClick: () => void;
  maxWidth?: string;
}

const DocumentItemPill = ({ item, onClick, maxWidth = '100%' }: DocumentItemPillProps) => (
  <div
    className={`bg-GRAY_100 flex min-w-0 cursor-pointer items-center gap-1.5 rounded px-1.5 py-1`}
    style={{ maxWidth: maxWidth }}
    onClick={onClick}
  >
    <SvgSpriteLoader
      id='file-02'
      iconCategory={ICON_SPRITE_TYPES.FILES}
      size={12}
      color={COLORS.GRAY_1000}
      className='flex-shrink-0'
    />
    <p className='f-11-400 text-GRAY_1000 truncate' title={item.name}>
      {item.name}
    </p>
  </div>
);

const DocumentPill = ({ value }: DocumentPillProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DocumentItemType | null>(null);

  if (!Array.isArray(value) || value.length === 0) {
    return (
      <span className={cn('f-11-400', { 'text-GRAY_1000': value, 'text-GRAY_500': !value })}>
        {value ? String(value) : 'N/A'}
      </span>
    );
  }

  const [firstItem, ...remainingItems] = value;
  const hasMoreItems = remainingItems.length > 0;

  const openPreview = (item: DocumentItemType) => {
    setSelectedFile(item);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setSelectedFile(null);
  };

  return (
    <div className='flex max-w-full items-center gap-2'>
      {/* First document */}
      <DocumentItemPill item={firstItem} onClick={() => openPreview(firstItem)} />

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
                key={`${item.name}-${index}`}
                className='bg-GRAY_100 flex w-full items-center justify-between gap-x-6 rounded-md px-1 py-1'
              >
                <TooltipV2 tooltipBody='View' side={SIDE_OPTIONS.BOTTOM}>
                  <DocumentItemPill item={item} onClick={() => openPreview(item)} maxWidth='100px' />
                </TooltipV2>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Document preview dialog */}
      {previewOpen && selectedFile && (
        <DocumentPreviewDialog
          isOpen={previewOpen}
          onClose={closePreview}
          selectedFile={selectedFile}
          availableFiles={value}
        />
      )}
    </div>
  );
};

export default DocumentPill;
