import { ROUTES_PATH } from '@/constants/routeConfig';
import { ProductMode } from '@/types/api/auth.types';
import { getCookie, LAST_VISITED_PRODUCT_MODE_COOKIE } from '@/utils/cookie';

export function getLandingRoute(product?: ProductMode): string {
  return product === ProductMode.MACS ? ROUTES_PATH.CHAT : ROUTES_PATH.PROCESSES;
}

export function getProductModeFromPath(pathname: string): ProductMode {
  if (pathname === ROUTES_PATH.CHAT || pathname.startsWith(ROUTES_PATH.CHAT + ROUTES_PATH.HOME)) {
    return ProductMode.MACS;
  }

  return ProductMode.CLASSIC;
}

export function getLastVisitedLandingRoute(): string {
  const savedMode = getCookie(LAST_VISITED_PRODUCT_MODE_COOKIE);

  if (savedMode === ProductMode.MACS) {
    return ROUTES_PATH.CHAT;
  }

  return ROUTES_PATH.PROCESSES;
}
