import { cn } from '@zamp-platform/ui/utils';
import IntegrationHeader from '@/modules/integrations/AllIntegrations/IntegrationHeader';
import IntegrationsGrid from '@/modules/integrations/AllIntegrations/IntegrationsGrid';
import {
  fetchIntegrations,
  filterIntegrations,
  splitIntegrations,
} from '@/modules/integrations/utils/integrations.utils';

interface IntegrationsPageProps {
  searchParams: Promise<{ search?: string }>;
}

const IntegrationsPage = async ({ searchParams }: IntegrationsPageProps) => {
  const integrations = await fetchIntegrations();

  const { search = '' } = await searchParams;

  const filteredIntegrations = filterIntegrations(integrations, search);

  const { enabled, available } = splitIntegrations(filteredIntegrations);

  return (
    <div className='h-full w-full pt-10'>
      <div className='flex h-full w-full flex-col'>
        <div className={cn('sticky top-0 z-10 bg-white pb-8 transition-colors')}>
          <IntegrationHeader />
        </div>
        <div className='flex-1 overflow-y-auto px-10 pb-10 [scrollbar-width:none]'>
          <IntegrationsGrid enabledIntegrations={enabled} availableIntegrations={available} />
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;
