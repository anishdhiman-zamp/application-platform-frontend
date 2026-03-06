'use client';

import { type FC, useCallback, useMemo, useState } from 'react';
import { Button, Input } from '@zamp-platform/ui';
import { X } from 'lucide-react';
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

  const handleClear = useCallback(() => {
    setInputValue('');
    setSearchQuery?.('');
  }, [setSearchQuery]);

  return (
    <div className='bg-BG_WHITE flex flex-col items-start gap-y-5 px-10'>
      <h1 className='f-20-600 text-GRAY_1000'>Integrations</h1>

      <div className='flex w-full items-center justify-between'>
        <div className='relative'>
          <Input
            placeholder='Search'
            value={inputValue}
            onChange={handleChange}
            className='border-GRAY_400 focus:border-GRAY_600 bg-BG_WHITE w-[300px] focus:ring-3'
            size='small'
            aria-label='Search integrations'
          />
          {inputValue && (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 hover:bg-transparent'
              onClick={handleClear}
              aria-label='Clear search'
            >
              <X size={16} className='text-GRAY_700' />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntegrationHeader;
