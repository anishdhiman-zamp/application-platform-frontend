import { THEME_CSS_CLASSES, THEME_MODE } from '@/modules/general/constants/general.constants';

export { THEME_CSS_CLASSES };

export const COLOR_SCHEME_HEADER = 'Sec-CH-Prefers-Color-Scheme';

/**
 * Resolves theme preference to CSS classes for SSR.
 * `osHint` is read from the `Sec-CH-Prefers-Color-Scheme` client hint header to resolve
 * the "system" value server-side. Falls back to light when the hint is unavailable.
 */
export function getThemeClasses(themePreference: THEME_MODE, osHint?: string) {
  const resolved =
    themePreference === THEME_MODE.SYSTEM
      ? osHint === THEME_MODE.DARK
        ? THEME_MODE.DARK
        : THEME_MODE.LIGHT
      : themePreference;

  const isDark = resolved === THEME_MODE.DARK;

  return {
    html: isDark ? THEME_CSS_CLASSES.HTML_DARK : '',
    body: isDark ? THEME_CSS_CLASSES.BODY_DARK : THEME_CSS_CLASSES.BODY_LIGHT,
  };
}
