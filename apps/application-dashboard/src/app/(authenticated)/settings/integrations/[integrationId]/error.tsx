'use client';

import { defaultFnType } from 'types/commonTypes';
import { ErrorCardTypes } from '@/components/commonWrapper/commonWrapper.types';
import ErrorCard from '@/components/commonWrapper/ErrorCard';

interface ErrorProps {
  reset: defaultFnType;
}

export default function IntegrationDetailsError({ reset }: ErrorProps) {
  return (
    <div className='h-full w-full pt-10'>
      <ErrorCard
        type={ErrorCardTypes.GENERAL_API_FAIL}
        title='Failed to load integration'
        subtitle={'Unable to fetch integration details. Please try again later.'}
        onClose={reset}
      />
    </div>
  );
}
