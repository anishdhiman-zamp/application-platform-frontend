export const PREV_ROUTE_COOKIE = 'zamp_prev_route';
export const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

export const setCookie = (name: string, value: string, maxAge = COOKIE_MAX_AGE) => {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; samesite=lax`;
};

export const getCookie = (name: string) => {
  const cookie = document.cookie.split(';').find((c) => c.trim().startsWith(`${name}=`));

  return cookie ? cookie.split('=')[1] : null;
};
