import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogHeaderTitle } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { cn } from '@zamp-platform/ui/utils';
import PdfArtifact from 'modules/process/artifacts/components/pdf-dataset-artifact/PdfArtifact';
import { ARTIFACT_TYPE } from 'modules/process/process.types';
import { useParams } from 'next/navigation';
import { MapAny, SIDE_OPTIONS } from 'types/commonTypes';
import { useGetActivityArtifactsQuery } from '@/apis/processes';
import TooltipV2 from '@/components/common/TooltipV2';
import { COLORS } from '@/constants/colors';
import {
  ActivityArtifactsItemType,
  PdfArtifactsResponseType,
  PdfDatasetArtifactsResponseType,
} from '@/types/api/processApi.types';
import { formatPlural } from '@/utils/common';

interface DocumentPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFileName: string;
  data: MapAny;
  availableFiles: string[];
}

const DocumentPreviewDialog = ({
  isOpen,
  onClose,
  selectedFileName,
  data,
  availableFiles,
}: DocumentPreviewDialogProps) => {
  const params = useParams();
  const processId = params?.processId as string;
  const activityRunId = data?.activity_run_id;

  const [currentFileName, setCurrentFileName] = useState(selectedFileName);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  // Sync file name and index with props
  useEffect(() => {
    setCurrentFileName(selectedFileName);
    const index = availableFiles.findIndex((file) => file === selectedFileName);

    setCurrentFileIndex(index >= 0 ? index : 0);
  }, [selectedFileName, availableFiles]);

  const { data: artifactsResponse, isLoading: isLoadingArtifacts } = useGetActivityArtifactsQuery(
    {
      processId,
      activityRunId,
    },
    {
      skip: !processId || !activityRunId,
    },
  );

  const currentArtifact = useMemo(() => {
    if (!artifactsResponse?.artifacts || !currentFileName) return null;

    return artifactsResponse.artifacts.find((artifact: ActivityArtifactsItemType) => {
      const artifactData = artifact.artifact_data;

      if (artifact.artifact_type === ARTIFACT_TYPE.PDF || artifact.artifact_type === ARTIFACT_TYPE.PDF_DATASET) {
        const pdfData = artifactData as PdfArtifactsResponseType | PdfDatasetArtifactsResponseType;

        return pdfData?.pdf_file?.file_display_name === currentFileName;
      }

      return false;
    });
  }, [artifactsResponse, currentFileName]);

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
              size={16}
              color={COLORS.GRAY_1000}
              className={cn('cursor-pointer', currentFileIndex === 0 && 'pointer-events-none opacity-50')}
              onClick={() => {
                setCurrentFileIndex((prev) => {
                  const next = prev - 1;

                  if (next >= 0) {
                    setCurrentFileName(availableFiles[next]);

                    return next;
                  }

                  return prev;
                });
              }}
            />
            <SvgSpriteLoader
              id='chevron-right'
              size={16}
              color={COLORS.GRAY_1000}
              className={cn(
                'cursor-pointer',
                currentFileIndex === availableFiles.length - 1 && 'pointer-events-none opacity-50',
              )}
              onClick={() => {
                setCurrentFileIndex((prev) => {
                  const next = prev + 1;

                  if (next < availableFiles.length) {
                    setCurrentFileName(availableFiles[next]);

                    return next;
                  }

                  return prev;
                });
              }}
            />
            <p className='f-13-500 text-GRAY_1000 transition-colors select-none'>
              {currentFileIndex + 1}/{formatPlural(availableFiles.length, 'file', 'files')}
            </p>
          </div>

          {/* File name */}
          <div className='bg-GRAY_100 flex max-w-[150px] min-w-0 items-center gap-1.5 rounded px-1.5 py-1'>
            <SvgSpriteLoader
              id='file-02'
              iconCategory={ICON_SPRITE_TYPES.FILES}
              size={12}
              color={COLORS.GRAY_1000}
              className='flex-shrink-0'
            />
            <p className='f-11-500 text-GRAY_1000 truncate' title={currentFileName}>
              {currentFileName}
            </p>
          </div>

          {/* Actions */}
          <div className='flex flex-shrink-0 items-center gap-x-4.5'>
            <TooltipV2 tooltipBody='Delete' side={SIDE_OPTIONS.BOTTOM}>
              <SvgSpriteLoader id='trash-03' size={14} color={COLORS.GRAY_900} className='cursor-pointer' />
            </TooltipV2>
            <TooltipV2 tooltipBody='Download' side={SIDE_OPTIONS.BOTTOM}>
              <SvgSpriteLoader id='download-02' size={14} color={COLORS.GRAY_900} className='cursor-pointer' />
            </TooltipV2>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className='flex flex-1 overflow-hidden'>
          <div className='flex-1 overflow-hidden'>
            {currentArtifact && processId && (
              <PdfArtifact
                processId={processId}
                artifactId={currentArtifact.id}
                pdfArtifact={
                  currentArtifact.artifact_data as PdfArtifactsResponseType | PdfDatasetArtifactsResponseType
                }
                isArtifactLoading={isLoadingArtifacts}
                className='h-full'
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewDialog;
