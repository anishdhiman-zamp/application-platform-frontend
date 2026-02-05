import { redirect } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';

export default function Settings() {
  redirect(ROUTES_PATH.SETTINGS_PEOPLE);
}
