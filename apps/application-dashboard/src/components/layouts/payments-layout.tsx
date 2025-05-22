import React, { ReactElement } from 'react';
import PaymentsHome from '@/modules/payments/PaymentsHome';
import DashboardLayout from 'components/layouts/dashboard-layout';

type PaymentsLayoutProps = {
  children: ReactElement;
};

const PaymentsLayout = ({ children }: PaymentsLayoutProps) => {
  return (
    <DashboardLayout>
      <PaymentsHome />
      {children}
    </DashboardLayout>
  );
};

export default PaymentsLayout;
