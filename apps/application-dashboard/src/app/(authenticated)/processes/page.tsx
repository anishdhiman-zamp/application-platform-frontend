'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProcessRouteById } from '@/constants/routeConfig';
import { useAppDispatch } from '@/hooks/toolkit';
import ProcessById from '@/modules/process/activity-runs/ProcessById';
import { resetBreadcrumb } from '@/store/slices/layout-configs';

const Process = () => {
  const searchParams = useSearchParams();

  const processId = searchParams?.get('processId') as string;
  const process = searchParams?.get('process') as string;
  const status = searchParams?.get('status') as string;

  const appDispatch = useAppDispatch();

  useEffect(() => {
    appDispatch(
      resetBreadcrumb([
        {
          title: process as string,
          href: getProcessRouteById(processId as string, process as string, status as string),
        },
      ]),
    );
  }, [status]);

  return <ProcessById processId={processId as string} status={status} />;
};

export default Process;
