import { redirect } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';

export default async function DatasetRedirectPage({ params }: { params: Promise<{ datasetId: string }> }) {
  const { datasetId } = await params;

  redirect(`${ROUTES_PATH.CHAT_SETTINGS_DATASETS}/${encodeURIComponent(datasetId)}`);
}
