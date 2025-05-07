import { type ReactElement, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { getProcessRouteById } from '@/constants/routeConfig';
import { useAppDispatch } from '@/hooks/toolkit';
import ProcessById from '@/modules/process/ProcessById';
import { resetBreadcrumb } from '@/store/slices/layout-configs';

const Process = () => {
  const { processId, process } = useParams();
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

Process.getLayout = function getLayout(page: ReactElement) {
  return (
    <div>
      <DashboardLayout>{page}</DashboardLayout>
    </div>
  );
};

export default Process;
