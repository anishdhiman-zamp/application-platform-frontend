import PageContainer from '@/components/layouts/PageContainer';
import { getIntegrations } from '@/constants/integrations.constants';
import IntegrationHeader from '@/modules/integrations/AllIntegrations/IntegrationHeader';
import IntegrationsGrid from '@/modules/integrations/AllIntegrations/IntegrationsGrid';
import { filterIntegrations, splitIntegrations } from '@/modules/integrations/utils/integrations.utils';

interface IntegrationsPageProps {
  searchParams: Promise<{ search?: string }>;
}

const IntegrationsPage = async ({ searchParams }: IntegrationsPageProps) => {
  const integrations = getIntegrations();

  const { search = '' } = await searchParams;

  const filteredIntegrations = filterIntegrations(integrations, search);

  const { enabled, available } = splitIntegrations(filteredIntegrations);

  return (
    <PageContainer>
      <div className='mb-6'>
        <IntegrationHeader />
      </div>
      <IntegrationsGrid enabledIntegrations={enabled} availableIntegrations={available} />
    </PageContainer>
  );
};

export default IntegrationsPage;
