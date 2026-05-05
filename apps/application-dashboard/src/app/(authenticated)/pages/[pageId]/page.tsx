import { redirect } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';

export default function PageRedirectPage() {
  redirect(ROUTES_PATH.CHAT);
}
