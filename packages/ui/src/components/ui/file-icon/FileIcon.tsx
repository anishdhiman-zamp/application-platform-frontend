'use client';

import React, { useMemo } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { getIconForExtension, getColorsForExtension } from './file-icon.utils';

export interface FileIconProps {
  extension: string;
  className?: string;
  iconClassName?: string;
}

/**
 * FileIcon renders a colored chip with a Phosphor icon matching the given file extension.
 * Each file type has a unique background color and icon color.
 * Falls back to a generic File icon with neutral colors for unrecognized extensions.
 *
 * Control size via className (e.g. `size-4`, `size-6`, `size-9`).
 * Control border-radius via className (e.g. `rounded-lg` for 8px).
 *
 * @example
 * ```tsx
 * <FileIcon extension="pdf" className="size-9 rounded-lg" />
 * <FileIcon extension=".docx" className="size-6 rounded" />
 * <FileIcon extension="unknown" className="size-4 rounded-lg" />
 * ```
 */
export const FileIcon: React.FC<FileIconProps> = ({ extension, className, iconClassName }) => {
  const IconComponent = useMemo(() => getIconForExtension(extension), [extension]);
  const colors = useMemo(() => getColorsForExtension(extension), [extension]);

  return (
    <div
      className={cn('flex shrink-0 items-center justify-center', className)}
      style={{ backgroundColor: colors.bg }}
      data-testid='file-icon'
      aria-label={`${extension} file`}
      role='img'
    >
      <IconComponent weight='regular' className={iconClassName} style={{ color: colors.primary }} />
    </div>
  );
};

FileIcon.displayName = 'FileIcon';

export default FileIcon;
