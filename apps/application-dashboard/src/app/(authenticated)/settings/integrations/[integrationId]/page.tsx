import { redirect } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';

export default async function SettingsIntegrationRedirectPage({
  params,
}: {
  params: Promise<{ integrationId: string }>;
}) {
  const { integrationId } = await params;

  redirect(`${ROUTES_PATH.CHAT_SETTINGS_INTEGRATIONS}/${encodeURIComponent(integrationId)}`);
}
