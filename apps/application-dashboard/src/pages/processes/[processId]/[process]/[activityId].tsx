import type { ReactElement } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';

const ActivityLogs = () => {
  const { processId, process, rowid } = useParams();

  console.log(processId, process, rowid);

  return <div>ActivityLogs</div>;
};

ActivityLogs.getLayout = function getLayout(page: ReactElement) {
  return (
    <div className='h-full'>
      <DashboardLayout>{page}</DashboardLayout>
    </div>
  );
};

export default ActivityLogs;
