'use client';

import { type FC, useEffect, useMemo, useRef } from 'react';
import IntegrationCardSkeletonV2 from 'modules/integrations/AllIntegrations/IntegrationCardSkeletonV2';
import IntegrationCardV2 from 'modules/integrations/AllIntegrations/IntegrationCardV2';
import { useIntegrationsContext } from '@/modules/integrations/AllIntegrations/Integrations.context';
import ProcessEmptyState from '@/modules/process/activity-runs/components/ProcessEmptyState';

const SKELETON_COUNT = 12;
const GRID_CLASSES = 'grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4';

const SectionTitle: FC<{ title: string }> = ({ title }) => (
  <h3 className='text-GRAY_700 f-11-500 uppercase'>{title}</h3>
);

const IntegrationGridV2: FC = () => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const {
    items: availableItems,
    enabledItems,
    searchQuery,
    isFetching,
    hasMore,
    isInitialised,
    loadNextPage,
  } = useIntegrationsContext();

  const isFetchingRef = useRef(isFetching);

  const enabledNames = useMemo(() => new Set(enabledItems.map((item) => item.name)), [enabledItems]);

  const filteredAvailableItems = useMemo(
    () => availableItems.filter((item) => !enabledNames.has(item.name)),
    [availableItems, enabledNames],
  );

  const showEmptyState = useMemo(
    () => isInitialised && !isFetching && !hasMore && filteredAvailableItems.length === 0,
    [isInitialised, isFetching, hasMore, filteredAvailableItems.length],
  );

  isFetchingRef.current = isFetching;

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingRef.current) {
          loadNextPage();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [loadNextPage, hasMore]);

  return (
    <div className='flex flex-col gap-y-8'>
      {!searchQuery.length && enabledItems.length > 0 && (
        <div className='flex flex-col gap-y-2.5'>
          <SectionTitle title='Connected' />
          {enabledItems.length > 0 && (
            <div className={GRID_CLASSES}>
              {enabledItems.map((item) => (
                <IntegrationCardV2 key={item.name} integrationItem={item} enabled />
              ))}
            </div>
          )}
        </div>
      )}

      <div className='flex flex-col gap-y-2.5'>
        <SectionTitle title='Available' />
        {filteredAvailableItems.length > 0 && (
          <div className={GRID_CLASSES}>
            {filteredAvailableItems.map((item) => (
              <IntegrationCardV2 key={item.name} integrationItem={item} />
            ))}
          </div>
        )}

        {hasMore && <div ref={sentinelRef} className='h-1' />}

        {showEmptyState && <ProcessEmptyState title='No integrations found' description='' />}

        {isFetching && (
          <div className={GRID_CLASSES}>
            {Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <IntegrationCardSkeletonV2 key={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationGridV2;
