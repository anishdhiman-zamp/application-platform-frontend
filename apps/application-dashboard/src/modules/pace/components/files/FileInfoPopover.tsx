'use client';

import { FileIcon, FolderClosedIcon, Popover, PopoverAnchor, PopoverContent, PopoverPortal } from '@zamp-platform/ui';
import TooltipV2 from '@/components/common/TooltipV2';
import { FILE_TYPE, type TreeNode } from '@/modules/pace/components/files/file-tree.types';
import { formatDate, formatFileSize, getFileExtension } from '@/modules/pace/components/files/file-tree.utils';
import { SIDE_OPTIONS } from '@/types/commonTypes';

interface Measurable {
  getBoundingClientRect(): DOMRect;
}

interface FileInfoPopoverProps {
  node: TreeNode;
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className='flex w-full items-start gap-3'>
    <p className='f-12-450 text-GRAY_700 w-[100px] shrink-0'>{label}</p>
    <p className='f-12-450 text-GRAY_1000 min-w-0 flex-1 break-words'>{value}</p>
  </div>
);

const FileInfoPopover = ({ node, anchorRef, open, onOpenChange }: FileInfoPopoverProps) => {
  const isFolder = node.type === FILE_TYPE.DIRECTORY;
  const extension = isFolder ? '' : getFileExtension(node.name);
  const sizeLabel = formatFileSize(node.size);
  const modifiedLabel = formatDate(node.mtime_ms);
  const ownerLabel = node.owner || '-';

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor virtualRef={anchorRef as React.RefObject<Measurable>} />
      <PopoverPortal>
        <PopoverContent
          align='start'
          side='bottom'
          sideOffset={6}
          className='border-GRAY_400 bg-BG_WHITE w-[291px] rounded-[8px] border p-4 shadow-[1px_2px_10px_0px_rgba(0,0,0,0.05)]'
          onClick={(e) => e.stopPropagation()}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onFocusOutside={(e) => e.preventDefault()}
        >
          <div className='flex w-full flex-col gap-4'>
            <div className='flex items-center gap-2'>
              <div className='border-GRAY_400 bg-BG_WHITE flex size-8 shrink-0 items-center justify-center rounded-[8px] border-[0.5px]'>
                {isFolder ? (
                  <FolderClosedIcon size={16} weight='fill' className='text-BLUE_600' />
                ) : (
                  <FileIcon extension={extension || 'txt'} className='size-5 rounded-sm' iconClassName='size-4' />
                )}
              </div>
              <div className='flex min-w-0 flex-1 flex-col gap-1'>
                <TooltipV2 tooltipBody={node.name} side={SIDE_OPTIONS.TOP} asChildTrigger>
                  <p className='f-14-500 text-GRAY_1000 truncate'>{node.name}</p>
                </TooltipV2>
                <p className='f-12-450 text-GRAY_700'>{sizeLabel}</p>
              </div>
            </div>
            <div className='flex flex-col gap-3'>
              <InfoRow label='Created by' value={ownerLabel} />
              <InfoRow label='Last modified on' value={modifiedLabel} />
            </div>
          </div>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  );
};

export default FileInfoPopover;
