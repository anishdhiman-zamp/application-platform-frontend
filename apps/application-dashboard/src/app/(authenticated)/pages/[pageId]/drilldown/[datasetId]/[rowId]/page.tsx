import { redirect } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';

export default async function PageDatasetDrilldownRedirectPage({
  params,
}: {
  params: Promise<{ pageId: string; datasetId: string; rowId: string }>;
}) {
  const { pageId, datasetId, rowId } = await params;

  redirect(
    `${ROUTES_PATH.CHAT_SETTINGS_DATASETS}/${encodeURIComponent(datasetId)}?pageId=${encodeURIComponent(pageId)}&rowId=${encodeURIComponent(rowId)}`,
  );
}
