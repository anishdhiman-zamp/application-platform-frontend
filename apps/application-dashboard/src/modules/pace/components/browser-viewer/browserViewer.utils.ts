const HTTP_PREFIX = 'http://';
const HTTPS_PREFIX = 'https://';
const HTTPS_PROTOCOL = 'https:';

export const coerceIframeSrcForSecurePage = (url: string): string => {
  if (typeof window === 'undefined' || window.location.protocol !== HTTPS_PROTOCOL) {
    return url;
  }
  if (url.startsWith(HTTP_PREFIX)) {
    return `${HTTPS_PREFIX}${url.slice(HTTP_PREFIX.length)}`;
  }

  return url;
};
