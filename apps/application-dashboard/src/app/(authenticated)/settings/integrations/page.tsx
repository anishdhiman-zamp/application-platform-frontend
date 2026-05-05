import { redirect } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';

export default function SettingsIntegrationsRedirectPage() {
  redirect(ROUTES_PATH.CHAT_SETTINGS_INTEGRATIONS);
}
