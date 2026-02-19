import React, { useMemo } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { FILE_ICON_SIZES } from './file-icon.constants';
import { getExtensionColor, formatExtensionText } from './file-icon.utils';

/**
 * Available size variants for the FileIcon component
 */
export type FileIconSize = keyof typeof FILE_ICON_SIZES;

/**
 * Props for the FileIcon component
 */
export interface FileIconProps {
  extension: string;
  size?: FileIconSize;
  className?: string;
  baseSvgPath?: string;
}

/**
 * FileIcon component renders a document-style icon with a colored ribbon
 * showing the file extension.
 *
 * Uses the exact BaseSvg design from base.svg and overlays an HTML ribbon
 * with dynamic background color and extension text.
 *
 * @example
 * ```tsx
 * <FileIcon extension="pdf" size="lg" />
 * <FileIcon extension=".docx" size="sm" />
 * <FileIcon extension="unknown" /> // Falls back to gray
 * ```
 */
export const FileIcon: React.FC<FileIconProps> = ({
  extension,
  size = 'sm',
  className,
  baseSvgPath = '/icons/file-icon-base.svg',
}) => {
  const sizeConfig = FILE_ICON_SIZES[size];
  const { width, height, fontSize, borderRadius } = sizeConfig;

  const color = useMemo(() => getExtensionColor(extension), [extension]);
  const displayText = useMemo(() => formatExtensionText(extension), [extension]);

  // Calculate ribbon position and size based on the 24x24 viewBox ratio
  // Position ribbon lower on the document icon
  const scale = width / 24;
  const ribbonTop = 14 * scale;
  const ribbonHeight = 10 * scale;

  return (
    <div
      className={cn('relative inline-flex shrink-0', className)}
      style={{ width, height }}
      data-testid='file-icon'
      role='img'
      aria-label={`${displayText} file`}
    >
      {/* Base document SVG */}
      <img src={baseSvgPath} alt='' width={width} height={height} className='absolute inset-0' aria-hidden='true' />

      {/* Ribbon overlay with dynamic color and text */}
      <div
        className='absolute right-0 left-0 flex items-center justify-center'
        style={{
          top: ribbonTop,
          height: ribbonHeight,
          backgroundColor: color,
          borderRadius: borderRadius,
        }}
        data-testid='file-icon-ribbon'
      >
        <span
          className='leading-none font-semibold text-white'
          style={{
            fontSize: fontSize,
          }}
        >
          {displayText}
        </span>
      </div>
    </div>
  );
};

FileIcon.displayName = 'FileIcon';

export default FileIcon;
