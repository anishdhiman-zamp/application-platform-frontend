import { redirect } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';

export default async function ProcessActivityRedirectPage({
  params,
}: {
  params: Promise<{ processId: string; activityId: string }>;
}) {
  const { processId, activityId } = await params;

  redirect(`${ROUTES_PATH.CHAT_TASK}?t=${encodeURIComponent(activityId)}&processId=${encodeURIComponent(processId)}`);
}
