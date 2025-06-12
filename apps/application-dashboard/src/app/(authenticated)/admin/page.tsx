'use client';

import Link from 'next/link';
import { Button } from '@/components/common/button/Button';
import { ROUTES_PATH } from '@/constants/routeConfig';

const Admin = () => {
  return (
    <div className='flex h-full w-full items-center justify-center gap-x-4'>
      <Link href={ROUTES_PATH.ADMIN_DATASETS_DAG}>
        <Button id='admin-dataset-dag'>SHOW DAG</Button>
      </Link>
      <Link href={ROUTES_PATH.ADMIN_ASSETS}>
        <Button id='admin-assets'>MANAGE ASSETS</Button>
      </Link>
    </div>
  );
};

export default Admin;
