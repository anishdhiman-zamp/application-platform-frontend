import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@zamp-platform/utils';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { ProductMode } from '@/types/api/auth.types';

export function getLandingRoute(product?: ProductMode): string {
  return product === ProductMode.MACS ? ROUTES_PATH.CHAT_SETTINGS_GENERAL : ROUTES_PATH.PROCESSES;
}

export function getProductModeFromPath(pathname: string): ProductMode {
  if (pathname === ROUTES_PATH.CHAT || pathname.startsWith(ROUTES_PATH.CHAT + '/')) {
    return ProductMode.MACS;
  }

  return ProductMode.CLASSIC;
}

export function saveLastVisitedProductMode(pathname: string): void {
  const mode = getProductModeFromPath(pathname);

  setToLocalStorage(LOCAL_STORAGE_KEYS.LAST_VISITED_PRODUCT_MODE, mode);
}

export function getLastVisitedLandingRoute(): string {
  const savedMode = getFromLocalStorage(LOCAL_STORAGE_KEYS.LAST_VISITED_PRODUCT_MODE);

  if (savedMode === ProductMode.MACS) {
    return ROUTES_PATH.CHAT_SETTINGS_GENERAL;
  }

  if (savedMode === ProductMode.CLASSIC) {
    return ROUTES_PATH.PROCESSES;
  }

  return ROUTES_PATH.PROCESSES;
}
