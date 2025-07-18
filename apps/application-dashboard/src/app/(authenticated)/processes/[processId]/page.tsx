'use client';

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useGetProcessesQuery } from '@/apis/pages';
import { ROUTES_PATH } from '@/constants/routeConfig';
import ProcessById from '@/modules/process/activity-runs/ProcessById';

const Process = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: processes } = useGetProcessesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const checkValidProcess = () => {
    if (params?.processId && processes) {
      const processId = params?.processId as string;
      const isValidProcessId = processes?.some((process) => process.id === processId);

      if (!isValidProcessId) {
        router.push(ROUTES_PATH.HOME);
      }
    }
  };

  useEffect(() => {
    checkValidProcess();
  }, [processes]);

  return (
    <ProcessById
      key={params?.processId as string}
      processId={params?.processId as string}
      status={searchParams?.get('status') as string}
    />
  );
};

export default Process;
