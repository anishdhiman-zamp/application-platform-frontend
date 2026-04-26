export const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico'] as const;

export const VIDEO_EXTENSIONS = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv', 'flv', 'm4v'] as const;

/**
 * Extract a file extension (without the leading dot) from a filename.
 * Returns an empty string for dotfiles (`.env`), names without an extension,
 * or names that end with a dot.
 */
export const extensionFromFilename = (name: string): string => {
  const dot = name.lastIndexOf('.');
  if (dot <= 0 || dot === name.length - 1) return '';
  return name.slice(dot + 1);
};
