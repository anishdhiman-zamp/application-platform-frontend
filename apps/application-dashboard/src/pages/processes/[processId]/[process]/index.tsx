import { type ReactElement, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { getProcessRouteById } from '@/constants/routeConfig';
import { useAppDispatch } from '@/hooks/toolkit';
import ProcessById from '@/modules/process/activity-runs/ProcessById';
import { resetBreadcrumb } from '@/store/slices/layout-configs';

const Process = () => {
  const router = useRouter();
  const { processId, process } = router.query;
  const status = router.query.status as string;
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

Process.getLayout = function getLayout(page: ReactElement) {
  return (
    <div className='h-full'>
      <DashboardLayout>{page}</DashboardLayout>
    </div>
  );
};

export default Process;
