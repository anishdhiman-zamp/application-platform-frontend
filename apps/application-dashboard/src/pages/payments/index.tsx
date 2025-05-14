import React, { ReactElement, useEffect } from 'react';
import { ROUTES_PATH } from 'constants/routeConfig';
import { useAppDispatch } from 'hooks/toolkit';
import { resetBreadcrumb } from 'store/slices/layout-configs';
import PaymentsLayout from '@/components/layouts/payments-layout';

const Payments = () => {
  const appDispatch = useAppDispatch();

  useEffect(() => {
    appDispatch(resetBreadcrumb([{ title: 'Payments', href: ROUTES_PATH.PAYMENTS }]));
  }, []);

  return null;
};

Payments.getLayout = function getLayout(page: ReactElement) {
  return <PaymentsLayout>{page}</PaymentsLayout>;
};

export default Payments;
