import { redirect } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';

export default async function DatasetDrilldownRedirectPage({
  params,
}: {
  params: Promise<{ datasetId: string; rowId: string }>;
}) {
  const { datasetId, rowId } = await params;

  redirect(`${ROUTES_PATH.CHAT_SETTINGS_DATASETS}/${encodeURIComponent(datasetId)}?rowId=${encodeURIComponent(rowId)}`);
}
