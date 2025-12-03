import { readFile } from 'fs/promises';
import { join } from 'path';
import { ASSET_PREFIX } from '@/constants/icons';
import type { IntegrationsDataType, IntegrationType } from '@/modules/integrations/integration.types';
import IntegrationsList from '@/modules/integrations/IntegrationsList';

const IntegrationsPage = async () => {
  let integrations: IntegrationType[] = [];

  try {
    const cdnUrl = ASSET_PREFIX;

    if (cdnUrl) {
      // If CDN URL is available, fetch from CDN
      const integrationsUrl = `${cdnUrl}/integrations/integrations.json`;
      const response = await fetch(integrationsUrl, { cache: 'no-store' });

      if (!response.ok) {
        throw new Error(`Failed to fetch from CDN: ${response.status} ${response.statusText}`);
      }

      const data: IntegrationsDataType = await response.json();

      integrations = data.integrations;
    } else {
      // Otherwise, read directly from the public folder filesystem
      const filePath = join(process.cwd(), 'public', 'integrations', 'integrations.json');
      const fileContents = await readFile(filePath, 'utf-8');
      const data: IntegrationsDataType = JSON.parse(fileContents);

      integrations = data.integrations;
    }
  } catch (error) {
    console.error('Failed to load integrations:', error);
  }

  return (
    <div className='h-full w-full pt-10'>
      <IntegrationsList integrations={integrations} />
    </div>
  );
};

export default IntegrationsPage;
