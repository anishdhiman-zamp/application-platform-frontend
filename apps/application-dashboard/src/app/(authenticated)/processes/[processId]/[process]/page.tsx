'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getProcessRouteById } from '@/constants/routeConfig';
import { useAppDispatch } from '@/hooks/toolkit';
import ProcessById from '@/modules/process/activity-runs/ProcessById';
import { resetBreadcrumb } from '@/store/slices/layout-configs';

const Process = () => {
  const { processId, process } = useParams<{ processId: string; process: string }>() ?? {};
  const appDispatch = useAppDispatch();

  useEffect(() => {
    appDispatch(
      resetBreadcrumb([
        { title: process as string, href: getProcessRouteById(processId as string, process as string) },
      ]),
    );
  }, []);

  return <ProcessById processId={processId as string} />;
};

export default Process;
