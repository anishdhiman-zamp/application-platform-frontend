import IntegrationsList from '@/modules/integrations/components/IntegrationsList';
import { fetchIntegrations } from '@/modules/integrations/integrations.utils';

const IntegrationsPage = async () => {
  const integrations = await fetchIntegrations();

  return (
    <div className='h-full w-full pt-10'>
      <IntegrationsList integrations={integrations} />
    </div>
  );
};

export default IntegrationsPage;
