import { cn } from '@zamp-platform/ui/utils';
import { FC } from 'react';

import { UploadedFileType } from '../../types/block.types';
import FilePreviewCard from './FilePreviewCard';

interface FileReferencesListProps {
  fileReferences: UploadedFileType[];
  onRemove?: (fileId: string) => void;
  isLoading?: boolean;
  className?: string;
  showFilePreview?: boolean;
}

export const FileReferencesList: FC<FileReferencesListProps> = ({
  fileReferences,
  onRemove,
  isLoading,
  className,
  showFilePreview = true,
}) => {
  return (
    <>
      {fileReferences?.length > 0 && (
        <div className={cn('flex flex-wrap gap-2', className)}>
          {[...fileReferences].reverse().map((fileReference) => (
            <FilePreviewCard
              key={fileReference?.id || fileReference?.path}
              fileReference={fileReference}
              onRemove={onRemove}
              isLoading={isLoading}
              showFilePreview={showFilePreview}
            />
          ))}
        </div>
      )}
    </>
  );
};
