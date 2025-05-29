import React, { ReactElement, useEffect } from 'react';
import { ROUTES_PATH } from 'constants/routeConfig';
import { useAppDispatch } from 'hooks/toolkit';
import { useRouter } from 'next/router';
import { resetBreadcrumb } from 'store/slices/layout-configs';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import PaymentsHome from '@/modules/payments/PaymentsHome';

const Payments = () => {
  const appDispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    appDispatch(resetBreadcrumb([{ title: 'Payments', href: ROUTES_PATH.PAYMENTS }]));

    // Prefetch policies routes
    router.prefetch('/payments/policies/create');
  }, []);

  return <PaymentsHome />;
};

Payments.getLayout = function getLayout(page: ReactElement) {
  return (
    <div>
      <DashboardLayout>{page}</DashboardLayout>
    </div>
  );
};

export default Payments;
