import { ScrollContainer } from '@zamp-platform/ui';
import IntegrationGridV2 from '@/modules/integrations/AllIntegrations/IntegrationGridV2';
import IntegrationHeader from '@/modules/integrations/AllIntegrations/IntegrationHeader';

const IntegrationsPage = () => {
  return (
    <div className='@container flex h-full w-full flex-1 flex-col pl-[3px]'>
      <div className='flex h-full w-full flex-col'>
        <div className='sticky top-0 z-10 pb-8'>
          <IntegrationHeader />
        </div>
        <ScrollContainer className='flex-1' scrollClassName='pb-6' scrollbarStyle='none'>
          <IntegrationGridV2 />
        </ScrollContainer>
      </div>
    </div>
  );
};

export default IntegrationsPage;
