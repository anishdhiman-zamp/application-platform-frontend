import { THEME_CSS_CLASSES, THEME_MODE } from '@/modules/general/constants/general.constants';
import { THEME_COOKIE } from '@/utils/cookie';
import { LOCAL_STORAGE_KEYS } from '@/utils/localstorage';

export { THEME_CSS_CLASSES };

export const COLOR_SCHEME_HEADER = 'Sec-CH-Prefers-Color-Scheme';

/**
 * Inline script that runs before first paint to apply the correct theme classes.
 * Only /chat (MACS) routes support dark mode — reads THEME_COOKIE/localStorage.
 * All other (Classic) routes always render light mode.
 * Keeps the page flash-free even for cached/static pages where the server couldn't set classes.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var isMacs=/^\\/chat(\\/|$)/.test(location.pathname);var t=isMacs?((document.cookie.match(/(?:^|;\\s*)${THEME_COOKIE}=([^;]*)/)||[])[1]||localStorage.getItem('${LOCAL_STORAGE_KEYS.THEME}')||'${THEME_MODE.LIGHT}'):'${THEME_MODE.LIGHT}';var r=t==='${THEME_MODE.SYSTEM}'?window.matchMedia('(prefers-color-scheme:dark)').matches?'${THEME_MODE.DARK}':'${THEME_MODE.LIGHT}':t;if(r==='${THEME_MODE.DARK}'){document.documentElement.classList.add('dark');document.body.classList.add('dark-mode');document.body.classList.remove('light-mode')}else{document.documentElement.classList.remove('dark');document.body.classList.add('light-mode');document.body.classList.remove('dark-mode')}}catch(e){}})()`;

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
