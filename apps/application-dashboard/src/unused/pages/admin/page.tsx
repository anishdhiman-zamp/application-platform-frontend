'use client';

import Link from 'next/link';
import { Button } from '@/components/common/button/Button';
import { ROUTES_PATH } from '@/constants/routeConfig';

const Admin = () => {
  return (
    <div className='flex h-full w-full items-center justify-center gap-x-4'>
      <Link href={ROUTES_PATH.ADMIN_DATASETS}>
        <Button id='admin-datasets'>MANAGE DATASETS</Button>
      </Link>
    </div>
  );
};

export default Admin;
