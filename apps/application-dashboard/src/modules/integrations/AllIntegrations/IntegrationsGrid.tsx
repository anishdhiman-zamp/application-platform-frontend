import type { FC } from 'react';
import IntegrationCard from '@/modules/integrations/AllIntegrations/IntegrationCard';
import type { IntegrationType } from '@/modules/integrations/types/integrations.types';

interface IntegrationsGridProps {
  enabledIntegrations: IntegrationType[];
  availableIntegrations: IntegrationType[];
}

const IntegrationsGrid: FC<IntegrationsGridProps> = ({ enabledIntegrations, availableIntegrations }) => {
  return (
    <div className='flex flex-col gap-y-8'>
      {/* Enabled Section */}
      <section className='flex flex-col gap-y-2.5'>
        <h2 className='f-11-500 text-GRAY_700 tracking-wider uppercase'>Enabled</h2>
        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4'>
          {enabledIntegrations.map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} isEnabled={true} />
          ))}
        </div>
      </section>

      {/* Available Section */}
      <section className='flex flex-col gap-y-2.5'>
        <h2 className='f-11-500 text-GRAY_700 tracking-wider uppercase'>Available</h2>
        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4'>
          {availableIntegrations.map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default IntegrationsGrid;
