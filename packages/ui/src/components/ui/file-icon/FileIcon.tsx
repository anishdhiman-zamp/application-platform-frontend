'use client';

import React, { useMemo } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { getIconForExtension } from './file-icon.utils';

export interface FileIconProps {
  extension: string;
  className?: string;
}

/**
 * FileIcon renders a Phosphor icon matching the given file extension.
 * Falls back to a generic File icon for unrecognized extensions.
 * Control size via className (e.g. `size-4`, `size-6`, `size-[100px]`).
 *
 * @example
 * ```tsx
 * <FileIcon extension="pdf" className="size-[100px]" />
 * <FileIcon extension=".docx" className="size-6" />
 * <FileIcon extension="unknown" />
 * ```
 */
export const FileIcon: React.FC<FileIconProps> = ({ extension, className }) => {
  const IconComponent = useMemo(() => getIconForExtension(extension), [extension]);

  return (
    <IconComponent
      weight='regular'
      className={cn('shrink-0', className)}
      data-testid='file-icon'
      aria-label={`${extension} file`}
    />
  );
};

FileIcon.displayName = 'FileIcon';

export default FileIcon;
