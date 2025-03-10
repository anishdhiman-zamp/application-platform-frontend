import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from 'hooks/toolkit';
import ConnectAccount from 'modules/payments/connect-account/ConnectAccount';
import { resetBreadcrumb } from 'store/slices/layout-configs';
import DashboardLayout from 'components/layouts/dashboard-layout';
const Payments = () => {
  const appDispatch = useAppDispatch();

  useEffect(() => {
    appDispatch(resetBreadcrumb(['Payments']));
  }, []);

  return <ConnectAccount />;
};

Payments.getLayout = function getLayout(page: ReactElement) {
  return (
    <div>
      <DashboardLayout>{page}</DashboardLayout>
    </div>
  );
};

export default Payments;
