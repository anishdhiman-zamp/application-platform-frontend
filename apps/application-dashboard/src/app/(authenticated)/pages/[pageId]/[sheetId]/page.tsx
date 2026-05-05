import { redirect } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';

export default function PageSheetRedirectPage() {
  redirect(ROUTES_PATH.CHAT);
}
