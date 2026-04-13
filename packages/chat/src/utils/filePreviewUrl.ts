import { API_DOMAIN } from '@zamp-platform/api';

/**
 * Builds a raw file URL for accessing file content via the API.
 * Each path segment is URL-encoded to handle special characters.
 */
export const getFilePreviewUrl = (path: string): string => {
  const encodedPath = path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `${API_DOMAIN}/files/${encodedPath}?raw=true`;
};
