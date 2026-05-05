import { redirect } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';

export default async function CreateKnowledgebaseRedirectPage({ params }: { params: Promise<{ processId: string }> }) {
  const { processId } = await params;

  redirect(`${ROUTES_PATH.CHAT_TASK}?processId=${encodeURIComponent(processId)}&source=create-knowledgebase`);
}
