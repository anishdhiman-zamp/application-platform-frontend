import React, { ReactElement, useEffect } from 'react';
import { ROUTES_PATH } from 'constants/routeConfig';
import { useAppDispatch } from 'hooks/toolkit';
import { useRouter } from 'next/router';
import { resetBreadcrumb } from 'store/slices/layout-configs';
import PaymentsLayout from '@/components/layouts/payments-layout';

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

Payments.getLayout = function getLayout(page: ReactElement) {
  return <PaymentsLayout>{page}</PaymentsLayout>;
};

export default Payments;
