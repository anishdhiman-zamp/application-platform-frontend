import { cn } from '@zamp-platform/ui/utils';
import { FC } from 'react';

import { UploadedFileType } from '../../types/block.types';
import FileReferenceItem from './FileReferenceItem';

interface FileReferencesListProps {
  fileReferences: UploadedFileType[];
  onRemove?: (fileId: string) => void;
  isLoading?: boolean;
  className?: string;
}

export const FileReferencesList: FC<FileReferencesListProps> = ({ fileReferences, onRemove, isLoading, className }) => {
  return (
    <>
      {fileReferences?.length > 0 && (
        <div className={cn('flex flex-wrap gap-2', className)}>
          {[...fileReferences].reverse().map((fileReference) => (
            <FileReferenceItem
              key={fileReference.path || fileReference.name}
              fileReference={fileReference}
              onRemove={onRemove}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </>
  );
};
