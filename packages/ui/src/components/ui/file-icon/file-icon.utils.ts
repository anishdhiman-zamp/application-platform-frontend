import { FILE_EXTENSION_COLORS, DEFAULT_FILE_COLOR } from './file-icon.constants';

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
 * Gets the color for a file extension, falling back to default if not found
 */
export const getExtensionColor = (extension: string): string => {
  const normalized = normalizeExtension(extension);
  return FILE_EXTENSION_COLORS[normalized] ?? DEFAULT_FILE_COLOR;
};

/**
 * Formats the extension text for display (uppercase, truncated if needed)
 */
export const formatExtensionText = (extension: string, maxLength = 5): string => {
  const normalized = normalizeExtension(extension);
  const text = normalized.toUpperCase();
  return text.length > maxLength ? text.slice(0, maxLength) : text;
};
