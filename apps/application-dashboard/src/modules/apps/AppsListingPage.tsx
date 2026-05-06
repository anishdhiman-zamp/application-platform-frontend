'use client';

import { useMemo, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button, SearchInput } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Plus } from 'lucide-react';
import { useGetAppsQuery } from '@/apis/apps';
import PageWithTopbar from '@/components/layouts/PageWithTopbar';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { APP_FILTER_TAB, type AppFilterTab } from '@/modules/apps/apps.types';
import AppEmptyState from '@/modules/apps/components/AppEmptyState';
import AppRow from '@/modules/apps/components/AppRow';
import CreateAppModal from '@/modules/apps/components/CreateAppModal';
import ServiceCard from '@/modules/apps/components/ServiceCard';

const TAB_CONFIG = [
  { id: APP_FILTER_TAB.ALL, label: 'All' },
  { id: APP_FILTER_TAB.MY_APPS, label: 'My apps' },
] as const;

const AppsListingPage = () => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<AppFilterTab>(APP_FILTER_TAB.ALL);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Hooks
  const { data, isLoading, isError, refetch } = useGetAppsQuery();
  const { userId } = useUserIdentity();

  // Derived State
  const hasNoApps = !isLoading && !isError && (data?.apps?.length ?? 0) === 0;

  const filteredApps = useMemo(() => {
    const apps = data?.apps ?? [];

    let filtered = apps;

    if (activeTab === APP_FILTER_TAB.MY_APPS) {
      filtered = filtered.filter((app) => app.created_by === userId);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();

      filtered = filtered.filter(
        (app) => app.name.toLowerCase().includes(q) || app.description?.toLowerCase().includes(q),
      );
    }

    return filtered;
  }, [data?.apps, activeTab, searchTerm, userId]);

  // Handlers
  const handleOpenCreateModal = () => setIsCreateModalOpen(true);

  // Render
  if (hasNoApps) {
    return (
      <>
        <div className='bg-BG_WHITE h-full w-full'>
          <AppEmptyState onNewApp={handleOpenCreateModal} />
        </div>
        <CreateAppModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
      </>
    );
  }

  return (
    <>
      <PageWithTopbar
        title='Apps'
        contentClassName='min-h-full'
        action={
          <Button size='small' className='gap-1 rounded-md px-3 py-1.5' onClick={handleOpenCreateModal}>
            <Plus size={14} />
            <span className='f-12-500'>New App</span>
          </Button>
        }
      >
        <div className='mb-3 flex h-8 items-center gap-1'>
          <SearchInput
            placeholder='Search'
            value={searchTerm}
            onChange={setSearchTerm}
            allowClear={false}
            size='small'
            autoFocus
            className='bg-BG_WHITE h-7 flex-1 border-none px-0 outline-none focus:ring-0'
            testId='apps-listing-search-input'
          />
        </div>
        <div className='mb-3 flex items-center gap-1.5'>
          {TAB_CONFIG.map((tab) => (
            <Button
              key={tab.id}
              variant='ghost'
              size='small'
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'f-12-500 h-7 cursor-pointer rounded-md px-2.5 py-1.5',
                activeTab === tab.id
                  ? 'bg-GRAY_100 text-GRAY_1000'
                  : 'bg-BG_WHITE text-GRAY_900 hover:bg-GRAY_100 hover:text-GRAY_1000',
              )}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {isError ? (
          <div className='text-GRAY_700 flex h-[calc(100vh-250px)] flex-col items-center justify-center gap-2 text-sm'>
            <span>Failed to load apps</span>
            <Button size='small' variant='ghost' onClick={refetch}>
              Retry
            </Button>
          </div>
        ) : !data ? null : filteredApps.length === 0 ? (
          <div className='text-GRAY_700 flex h-[calc(100vh-250px)] items-center justify-center text-sm'>
            No apps found
          </div>
        ) : (
          <Accordion type='single' collapsible>
            <div className='flex flex-col gap-2'>
              {filteredApps.map((app) => (
                <AccordionItem key={app.id} value={app.id} className='border-none'>
                  <AccordionTrigger className='border-GRAY_400 bg-BG_WHITE hover:bg-BG_GRAY_2 rounded-xl border p-0 pr-3 [&[data-state=open]]:rounded-b-none [&[data-state=open]]:border-b-0'>
                    <AppRow app={app} />
                  </AccordionTrigger>
                  <AccordionContent disableAnimation className='p-0'>
                    {app.services.length > 0 ? (
                      <div className='bg-BG_GRAY_1 border-GRAY_400 grid grid-cols-3 gap-3 rounded-b-xl border-x border-b p-4'>
                        {app.services.map((svc) => (
                          <ServiceCard key={svc.id} service={svc} />
                        ))}
                      </div>
                    ) : (
                      <div className='bg-BG_GRAY_1 border-GRAY_400 rounded-b-xl border-x border-b px-4 py-6 text-center'>
                        <p className='text-GRAY_700 text-xs'>No services yet. Ask the agent to create one.</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </div>
          </Accordion>
        )}
      </PageWithTopbar>

      <CreateAppModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </>
  );
};

export default AppsListingPage;
