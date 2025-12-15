'use client';

import { type FC, useCallback, useState, useTransition } from 'react';
import { Input } from '@zamp-platform/ui';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const IntegrationSearchInput: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [localValue, setLocalValue] = useState(searchParams?.get('search') ?? '');

  const updateSearchParams = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');

      if (value.trim()) {
        params.set('search', value);
      } else {
        params.delete('search');
      }

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setLocalValue(value);
    updateSearchParams(value);
  };

  return (
    <Input
      placeholder='Search'
      value={localValue}
      onChange={handleChange}
      className='border-GRAY_400 focus:border-GRAY_600 w-[300px] focus:ring-3'
      size='small'
      aria-label='Search integrations'
    />
  );
};

export default IntegrationSearchInput;
