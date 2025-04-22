import React, { ReactElement } from 'react';
import Link from 'next/link';
import { Button } from '@/components/common/button/Button';
import { ROUTES_PATH } from '@/constants/routeConfig';
import DashboardLayout from 'components/layouts/dashboard-layout';

const Admin = () => {
  return (
    <div className='flex h-full w-full items-center justify-center'>
      <Link href={ROUTES_PATH.ADMIN_DATASETS_DAG}>
        <Button id='admin-dataset-dag'>SHOW DAG</Button>
      </Link>
    </div>
  );
};

Admin.getLayout = function getLayout(page: ReactElement) {
  return (
    <div>
      <DashboardLayout>{page}</DashboardLayout>
    </div>
  );
};

export default Admin;
