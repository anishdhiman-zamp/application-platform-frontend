import { FILE_EXTENSION_COLORS, DEFAULT_FILE_COLOR } from './file-icon.constants';

/**
 * Normalizes a file extension by removing leading dots and converting to lowercase
 */
export const normalizeExtension = (extension: string): string => {
  return extension.replace(/^\./, '').toLowerCase().trim();
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
