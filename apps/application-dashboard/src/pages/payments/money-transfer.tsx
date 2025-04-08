import { ReactElement } from 'react';
import MoveMoneyHome from 'modules/payments/move-money/MoveMoneyHome';
import DashboardLayout from 'components/layouts/dashboard-layout';

const SingleTransfer = () => {
  return <MoveMoneyHome />;
};

SingleTransfer.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default SingleTransfer;
