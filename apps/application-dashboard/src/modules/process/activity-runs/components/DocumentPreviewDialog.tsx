import { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogHeaderTitle } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { cn } from '@zamp-platform/ui/utils';
import ArtifactLoader from 'modules/process/artifacts/components/ArtifactLoader';
import type { DocumentItemType } from 'modules/process/process.types';
import dynamic from 'next/dynamic';
import { SIDE_OPTIONS } from 'types/commonTypes';
import TooltipV2 from '@/components/common/TooltipV2';
import { COLORS } from '@/constants/colors';
import { formatPlural } from '@/utils/common';

const PdfArtifact = dynamic(() => import('@/modules/process/artifacts/components/pdf-dataset-artifact/PdfArtifact'), {
  ssr: false,
  loading: () => <ArtifactLoader />,
});

interface DocumentPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFile: DocumentItemType;
  availableFiles: DocumentItemType[];
}

const DocumentPreviewDialog = ({ isOpen, onClose, selectedFile, availableFiles }: DocumentPreviewDialogProps) => {
  const [currentFile, setCurrentFile] = useState<DocumentItemType>(selectedFile);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  const handleNextFile = useCallback(() => {
    setCurrentFileIndex((prev) => {
      const next = prev + 1;

      if (next < availableFiles.length) {
        setCurrentFile(availableFiles[next]);

        return next;
      }

      return prev;
    });
  }, [availableFiles]);

  const handlePreviousFile = useCallback(() => {
    setCurrentFileIndex((prev) => {
      const next = prev - 1;

      if (next >= 0) {
        setCurrentFile(availableFiles[next]);

        return next;
      }

      return prev;
    });
  }, [availableFiles]);

  useEffect(() => {
    setCurrentFile(selectedFile);
    const index = availableFiles.findIndex(
      (file) => file?.artifacts_details?.file_id === selectedFile?.artifacts_details?.file_id,
    );

    setCurrentFileIndex(index >= 0 ? index : 0);
  }, [selectedFile, availableFiles]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        size='large'
        className='flex h-[90vh] max-h-[90vh] max-w-[50vw] flex-col p-0'
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogHeaderTitle className='f-14-500 text-GRAY_1000'>Files and Documents</DialogHeaderTitle>
          <DialogClose asChild>
            <SvgSpriteLoader
              id='x-close'
              iconCategory={ICON_SPRITE_TYPES.GENERAL}
              size={16}
              color={COLORS.GRAY_1000}
              className='cursor-pointer'
            />
          </DialogClose>
        </DialogHeader>

        {/* Toolbar */}
        <div className='border-GRAY_200 flex items-center justify-between gap-4 border-b p-4'>
          {/* Navigation */}
          <div className='flex flex-shrink-0 items-center gap-x-1'>
            <SvgSpriteLoader
              id='chevron-left'
              size={12}
              color={COLORS.GRAY_1000}
              className={cn('cursor-pointer', currentFileIndex === 0 && 'pointer-events-none opacity-50')}
              onClick={handlePreviousFile}
            />
            <SvgSpriteLoader
              id='chevron-right'
              size={12}
              color={COLORS.GRAY_1000}
              className={cn(
                'cursor-pointer',
                currentFileIndex === availableFiles.length - 1 && 'pointer-events-none opacity-50',
              )}
              onClick={handleNextFile}
            />
            <p className='f-11-400 text-GRAY_1000 transition-colors select-none'>
              {currentFileIndex + 1}/{formatPlural(availableFiles.length, 'file', 'files')}
            </p>
          </div>

          {/* File name */}
          <div className='bg-GRAY_100 flex max-w-full min-w-0 items-center gap-1.5 rounded px-1.5 py-1'>
            <SvgSpriteLoader id='file-02' size={12} color={COLORS.GRAY_1000} className='flex-shrink-0' />
            <p className='f-11-500 text-GRAY_1000 truncate' title={currentFile?.name}>
              {currentFile?.name}
            </p>
          </div>

          {/* Actions */}
          <div className='flex flex-shrink-0 items-center gap-x-4.5'>
            <TooltipV2 tooltipBody='Delete' side={SIDE_OPTIONS.BOTTOM}>
              <SvgSpriteLoader
                id='trash-03'
                size={16}
                color={COLORS.GRAY_900}
                className='cursor-not-allowed opacity-50'
              />
            </TooltipV2>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className='flex flex-1 overflow-hidden'>
          <div className='flex-1 overflow-hidden'>
            {currentFile && (
              <PdfArtifact
                processId={currentFile?.artifacts_details?.process_id}
                artifactId={currentFile?.artifacts_details?.artifact_id}
                fileId={currentFile?.artifacts_details?.file_id}
                isArtifactLoading={false}
                className='h-full'
                toolBarClassName='bottom-5'
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewDialog;
