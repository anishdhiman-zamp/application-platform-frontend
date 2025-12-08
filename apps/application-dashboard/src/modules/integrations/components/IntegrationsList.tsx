'use client';

import { type FC, useMemo, useState } from 'react';
import { cn } from 'utils/common';
import { useScrollDetection } from '@/hooks/useScrollDetection';
import IntegrationCard from '@/modules/integrations/components/IntegrationCard';
import IntegrationHeader from '@/modules/integrations/components/IntegrationHeader';
import type { IntegrationType } from '@/modules/integrations/integrations.types';

interface IntegrationsListProps {
  integrations: IntegrationType[];
}

const IntegrationsList: FC<IntegrationsListProps> = ({ integrations }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { ref: scrollContainerRef, isScrolled } = useScrollDetection();

  const filteredIntegrations = useMemo(() => {
    if (!searchQuery.trim()) return integrations;

    const query = searchQuery.toLowerCase();

    return integrations.filter(
      (integration) =>
        integration.display_name.toLowerCase().includes(query) ||
        integration.what_possible.some((action) => action.toLowerCase().includes(query)),
    );
  }, [integrations, searchQuery]);

  return (
    <div className='flex h-full w-full flex-col'>
      <div
        className={cn(
          'sticky top-0 z-10 bg-white pb-8 transition-colors',
          isScrolled ? 'border-GRAY_400 border-b' : '',
        )}
      >
        <IntegrationHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      </div>

      {/* Integrations Cards Section */}
      <div ref={scrollContainerRef} className='flex-1 overflow-y-auto px-10 pb-10 [scrollbar-width:none]'>
        <div className='flex flex-col gap-y-8'>
          <div className='flex flex-col gap-y-2.5'>
            <span className='f-11-500 text-GRAY_700 tracking-wider uppercase'>Enabled</span>
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4'>
              {filteredIntegrations?.slice(0, 4).map((integration) => (
                <IntegrationCard key={integration.id} integration={integration} isEnabled={true} />
              ))}
            </div>
          </div>

          <div className='flex flex-col gap-y-2.5'>
            <span className='f-11-500 text-GRAY_700 tracking-wider uppercase'>Available</span>
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4'>
              {filteredIntegrations?.slice(4).map((integration) => (
                <IntegrationCard key={integration.id} integration={integration} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsList;
