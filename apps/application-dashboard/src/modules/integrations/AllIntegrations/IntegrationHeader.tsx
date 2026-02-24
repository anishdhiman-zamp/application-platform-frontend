'use client';

import { type FC, useMemo, useState } from 'react';
import { Input } from '@zamp-platform/ui';
import { debounce } from 'utils/common';
import { useOptionalIntegrationsContext } from '@/modules/integrations/AllIntegrations/Integrations.context';

const DEBOUNCE_MS = 500;

const IntegrationHeader: FC = () => {
  const ctx = useOptionalIntegrationsContext();

  // Extract the stable callback so `useMemo` doesn't depend on the whole context object
  const setSearchQuery = ctx?.setSearchQuery;

  const [inputValue, setInputValue] = useState('');

  const debouncedSearch = useMemo(
    () => debounce((value: string) => setSearchQuery?.(value), DEBOUNCE_MS),
    [setSearchQuery],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setInputValue(value);
    debouncedSearch(value);
  };

  return (
    <div className='flex flex-col items-start gap-y-4 px-10'>
      <h1 className='f-20-600 text-GRAY_1000'>Integrations</h1>

      <div className='flex w-full items-center justify-between'>
        <Input
          placeholder='Search'
          value={inputValue}
          onChange={handleChange}
          className='border-GRAY_400 focus:border-GRAY_600 w-[300px] focus:ring-3'
          size='small'
          aria-label='Search integrations'
        />
      </div>
    </div>
  );
};

export default IntegrationHeader;
