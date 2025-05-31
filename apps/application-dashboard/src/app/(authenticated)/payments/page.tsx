'use client';

import { useEffect } from 'react';
import { ROUTES_PATH } from 'constants/routeConfig';
import { useAppDispatch } from 'hooks/toolkit';
import { useRouter } from 'next/navigation';
import { resetBreadcrumb } from 'store/slices/layout-configs';

const Payments = () => {
  const appDispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    appDispatch(resetBreadcrumb([{ title: 'Payments', href: ROUTES_PATH.PAYMENTS }]));

    // Prefetch policies routes
    router.prefetch('/payments/policies/create');
  }, []);

  return null;
};

export default Payments;
