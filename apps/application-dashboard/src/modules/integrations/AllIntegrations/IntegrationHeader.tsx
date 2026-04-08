'use client';

import { type FC, useCallback, useState } from 'react';
import { SearchInput } from '@zamp-platform/ui';
import { useOptionalIntegrationsContext } from '@/modules/integrations/AllIntegrations/Integrations.context';

const DEBOUNCE_MS = 500;

const IntegrationHeader: FC = () => {
  const ctx = useOptionalIntegrationsContext();
  const setSearchQuery = ctx?.setSearchQuery;

  const [inputValue, setInputValue] = useState(ctx?.searchQuery ?? '');

  const handleChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleDebouncedChange = useCallback(
    (value: string) => {
      setSearchQuery?.(value);
    },
    [setSearchQuery],
  );

  return (
    <div className='flex flex-col items-start gap-y-5'>
      <h1 className='f-20-600 text-GRAY_1000'>Integrations</h1>

      <div className='flex w-full items-center justify-between'>
        <SearchInput
          placeholder='Search'
          value={inputValue}
          onChange={handleChange}
          onDebouncedChange={handleDebouncedChange}
          debounceMs={DEBOUNCE_MS}
          className='w-full max-w-[300px]'
          aria-label='Search integrations'
        />
      </div>
    </div>
  );
};

export default IntegrationHeader;
