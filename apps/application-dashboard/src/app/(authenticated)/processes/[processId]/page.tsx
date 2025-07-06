'use client';

import { useParams, useSearchParams } from 'next/navigation';
import ProcessById from '@/modules/process/activity-runs/ProcessById';

const Process = () => {
  const params = useParams();
  const searchParams = useSearchParams();

  return (
    <ProcessById
      key={params?.processId as string}
      processId={params?.processId as string}
      status={searchParams?.get('status') as string}
    />
  );
};

export default Process;
