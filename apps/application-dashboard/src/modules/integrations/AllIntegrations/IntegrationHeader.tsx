'use client';

import { type FC, useCallback, useState } from 'react';
import { SearchInput } from '@zamp-platform/ui';
import { useOptionalIntegrationsContext } from '@/modules/integrations/AllIntegrations/Integrations.context';
import type { IntegrationHeaderPropsType } from '@/modules/integrations/types/integrations.types';

const DEBOUNCE_MS = 500;

const IntegrationHeader: FC<IntegrationHeaderPropsType> = ({ title = 'Integrations' }) => {
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
    <div className='flex w-full items-center justify-between gap-5'>
      <h1 className='f-20-600 text-GRAY_1000'>{title}</h1>
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
  );
};

export default IntegrationHeader;
