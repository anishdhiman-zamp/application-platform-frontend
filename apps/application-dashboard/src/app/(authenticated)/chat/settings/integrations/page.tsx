import IntegrationGridV2 from '@/modules/integrations/AllIntegrations/IntegrationGridV2';
import IntegrationHeader from '@/modules/integrations/AllIntegrations/IntegrationHeader';
import { IntegrationsProvider } from '@/modules/integrations/AllIntegrations/Integrations.context';

const IntegrationsPage = () => {
  return (
    <IntegrationsProvider>
      <div className='h-full w-full pt-10'>
        <div className='flex h-full w-full flex-col'>
          <div className='border-GRAY_400 sticky top-0 z-10 border-b bg-white pb-8 transition-colors'>
            <IntegrationHeader />
          </div>
          <div className='flex-1 overflow-y-auto px-10 py-6 [scrollbar-width:none]'>
            <IntegrationGridV2 />
          </div>
        </div>
      </div>
    </IntegrationsProvider>
  );
};

export default IntegrationsPage;
