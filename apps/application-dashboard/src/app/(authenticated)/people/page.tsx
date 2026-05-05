import { redirect } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';

export default function PeopleRedirectPage() {
  redirect(ROUTES_PATH.CHAT_SETTINGS_PEOPLE);
}
