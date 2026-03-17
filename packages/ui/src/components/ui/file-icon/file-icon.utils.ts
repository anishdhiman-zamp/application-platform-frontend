'use client';

import type { Icon } from '@phosphor-icons/react';
import { FILE_EXTENSION_ICON_MAP, DEFAULT_FILE_ICON } from './file-icon.constants';
import { FILE_TYPE_COLORS, DEFAULT_FILE_COLORS, type FileTypeColors } from './file-icon-colors.constants';

/**
 * Normalizes a file extension by extracting from filename if needed and converting to lowercase
 * @example normalizeExtension('.pdf') // 'pdf'
 * @example normalizeExtension('document.pdf') // 'pdf'
 * @example normalizeExtension('PDF') // 'pdf'
 */
export const normalizeExtension = (extension: string): string => {
  const lastDot = extension.lastIndexOf('.');
  const ext = lastDot !== -1 ? extension.slice(lastDot + 1) : extension;
  return ext.toLowerCase().trim();
};

/**
 * Returns the Phosphor icon component for a given file extension
 */
export const getIconForExtension = (extension: string): Icon => {
  const normalized = normalizeExtension(extension);
  return FILE_EXTENSION_ICON_MAP[normalized] ?? DEFAULT_FILE_ICON;
};

/**
 * Returns the color pair (bg and primary) for a given file extension
 * @example getColorsForExtension('pdf') // { bg: '#FAEAEA', primary: '#C0392B' }
 * @example getColorsForExtension('.docx') // { bg: '#E8F0FE', primary: '#2B5FBF' }
 */
export const getColorsForExtension = (extension: string): FileTypeColors => {
  const normalized = normalizeExtension(extension);
  return FILE_TYPE_COLORS[normalized] ?? DEFAULT_FILE_COLORS;
};
