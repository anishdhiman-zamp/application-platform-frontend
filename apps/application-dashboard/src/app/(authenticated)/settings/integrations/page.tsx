import { IMAGE_PREFIX } from '@/constants/icons';
import type { IntegrationsDataType, IntegrationType } from '@/modules/integrations/integration.types';
import IntegrationsList from '@/modules/integrations/IntegrationsList';

const IntegrationsPage = async () => {
  const cdnUrl = IMAGE_PREFIX;

  if (!cdnUrl) {
    throw new Error('CDN URL is not configured');
  }

  // If CDN URL is available, fetch from CDN
  const integrationsUrl = `${cdnUrl}/integrations/integrations.json`;
  const response = await fetch(integrationsUrl, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to fetch from CDN: ${response.status} ${response.statusText}`);
  }

  const data: IntegrationsDataType = await response.json();
  const integrations: IntegrationType[] = data.integrations;

  return (
    <div className='h-full w-full pt-10'>
      <IntegrationsList integrations={integrations} />
    </div>
  );
};

export default IntegrationsPage;
