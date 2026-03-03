import { notFound } from 'next/navigation';
import { getIntegrations } from '@/constants/integrations.constants';
import IntegrationDetailPage from '@/modules/integrations/IntegrationDetail/IntegrationDetailPage';

interface IntegrationDetailPageProps {
  params: Promise<{ integrationId: string }>;
}

const Page = async ({ params }: IntegrationDetailPageProps) => {
  const { integrationId } = await params;
  const integrations = getIntegrations();
  const integration = integrations.find((int) => int.id === integrationId);

  if (!integration) {
    notFound();
  }

  return <IntegrationDetailPage integration={integration} />;
};

export default Page;
