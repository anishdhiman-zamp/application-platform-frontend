import { ROUTES_PATH } from '@/constants/routeConfig';
import { ProductMode } from '@/types/api/auth.types';

export function getLandingRoute(product?: ProductMode): string {
  return product === ProductMode.MACS ? ROUTES_PATH.CHAT : ROUTES_PATH.PROCESSES;
}
