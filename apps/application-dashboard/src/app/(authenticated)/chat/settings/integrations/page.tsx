import IntegrationGridV2 from '@/modules/integrations/AllIntegrations/IntegrationGridV2';
import IntegrationHeader from '@/modules/integrations/AllIntegrations/IntegrationHeader';

const IntegrationsPage = () => {
  return (
    <div className='bg-BG_WHITE @container h-full w-full'>
      <div className='flex h-full w-full flex-col'>
        <div className='border-GRAY_400 sticky top-0 z-10 border-b pt-10 pb-8 transition-colors'>
          <IntegrationHeader />
        </div>
        <div className='flex-1 overflow-y-auto px-10 py-6 [scrollbar-width:none]'>
          <IntegrationGridV2 />
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;
