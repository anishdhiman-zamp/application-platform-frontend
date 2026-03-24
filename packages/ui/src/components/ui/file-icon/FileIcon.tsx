'use client';

import { CSSProperties, useMemo } from 'react';
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
 * Dark mode: In light mode, the pastel `bg` is used directly. In dark mode, CSS overrides
 * the background to use `--file-icon-primary` at 15% opacity, which adapts naturally to
 * dark surfaces. See globals.css `.dark-mode [data-file-icon]` rule.
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
export const FileIcon = ({ extension, className = 'size-5 rounded-md', iconClassName = 'size-4' }: FileIconProps) => {
  const IconComponent = useMemo(() => getIconForExtension(extension), [extension]);
  const colors = useMemo(() => getColorsForExtension(extension), [extension]);

  const cssVars = {
    '--file-icon-bg': colors.bg,
    '--file-icon-primary': colors.primary,
  } as CSSProperties;

  return (
    <div
      className={cn('flex items-center justify-center', className)}
      style={{ ...cssVars, backgroundColor: 'var(--file-icon-bg)' }}
      data-file-icon
      data-testid='file-icon'
      aria-label={`${extension} file`}
      role='img'
    >
      <IconComponent weight='regular' className={iconClassName} style={{ color: 'var(--file-icon-primary)' }} />
    </div>
  );
};

FileIcon.displayName = 'FileIcon';

export default FileIcon;
