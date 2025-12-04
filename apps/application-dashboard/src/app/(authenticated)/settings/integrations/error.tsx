'use client';

import { ErrorCardTypes } from '@/components/commonWrapper/commonWrapper.types';
import ErrorCard from '@/components/commonWrapper/ErrorCard';

interface ErrorProps {
  reset: () => void;
}

export default function IntegrationsError({ reset }: ErrorProps) {
  return (
    <div className='h-full w-full pt-10'>
      <ErrorCard
        type={ErrorCardTypes.GENERAL_API_FAIL}
        title='Failed to load integrations'
        subtitle={'Unable to fetch integrations. Please try again later.'}
        onClose={reset}
      />
    </div>
  );
}
