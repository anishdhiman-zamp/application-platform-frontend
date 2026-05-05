import { redirect } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';

export default function ProcessesRedirectPage() {
  redirect(ROUTES_PATH.CHAT_TASK);
}
