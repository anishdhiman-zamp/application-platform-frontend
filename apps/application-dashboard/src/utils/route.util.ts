import { ROUTES_PATH } from '@/constants/routeConfig';
import { ProductMode } from '@/types/api/auth.types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getLandingRoute(_product?: ProductMode): string {
  return ROUTES_PATH.CHAT;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getProductModeFromPath(_pathname: string): ProductMode {
  return ProductMode.MACS;
}

export function getLastVisitedLandingRoute(): string {
  return ROUTES_PATH.CHAT;
}
