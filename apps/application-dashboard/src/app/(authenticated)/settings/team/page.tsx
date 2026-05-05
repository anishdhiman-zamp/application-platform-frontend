import { redirect } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';

export default function SettingsTeamRedirectPage() {
  redirect(ROUTES_PATH.CHAT_SETTINGS_PEOPLE);
}
