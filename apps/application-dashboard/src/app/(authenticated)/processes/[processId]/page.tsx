import { redirect } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';

export default async function ProcessRedirectPage({ params }: { params: Promise<{ processId: string }> }) {
  const { processId } = await params;

  redirect(`${ROUTES_PATH.CHAT_TASK}?processId=${encodeURIComponent(processId)}`);
}
