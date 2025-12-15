import { notFound } from 'next/navigation';
import IntegrationDetailPage from '@/modules/integrations/IntegrationDetail/IntegrationDetailPage';
import { fetchIntegrations } from '@/modules/integrations/utils/integrations.utils';

interface IntegrationDetailPageProps {
  params: Promise<{ integrationId: string }>;
}

const Page = async ({ params }: IntegrationDetailPageProps) => {
  const { integrationId } = await params;
  const integrations = await fetchIntegrations();
  const integration = integrations.find((int) => int.id === integrationId);

  if (!integration) {
    notFound();
  }

  return <IntegrationDetailPage integration={integration} />;
};

export default Page;
