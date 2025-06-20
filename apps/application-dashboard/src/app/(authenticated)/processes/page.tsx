'use client';

import { useSearchParams } from 'next/navigation';
import ProcessById from '@/modules/process/activity-runs/ProcessById';

const Process = () => {
  const searchParams = useSearchParams();

  const processId = searchParams?.get('processId') as string;
  const status = searchParams?.get('status') as string;

  return <ProcessById key={processId} processId={processId as string} status={status} />;
};

export default Process;
