import React, { ReactElement } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import AdminDatasetDag from 'modules/admin/AdminDatasetDag';
import DashboardLayout from 'components/layouts/dashboard-layout';

const Admin = () => {
  return (
    <ReactFlowProvider>
      <AdminDatasetDag />
    </ReactFlowProvider>
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
