import { redirect } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';

export default async function PageDatasetRedirectPage({
  params,
}: {
  params: Promise<{ pageId: string; datasetId: string }>;
}) {
  const { pageId, datasetId } = await params;

  redirect(
    `${ROUTES_PATH.CHAT_SETTINGS_DATASETS}/${encodeURIComponent(datasetId)}?pageId=${encodeURIComponent(pageId)}`,
  );
}
