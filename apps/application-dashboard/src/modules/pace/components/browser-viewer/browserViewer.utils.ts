export const coerceIframeSrcForSecurePage = (url: string): string => {
  if (typeof window === 'undefined' || window.location.protocol !== 'https:') {
    return url;
  }
  if (url.startsWith('http://')) {
    return `https://${url.slice('http://'.length)}`;
  }

  return url;
};
