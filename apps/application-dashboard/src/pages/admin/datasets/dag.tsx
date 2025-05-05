import React, { ReactElement } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import AdminDatasetDag from 'modules/admin/AdminDatasetDag';
import DashboardLayout from 'components/layouts/dashboard-layout';

const AdminDag = () => {
  return (
    <ReactFlowProvider>
      <AdminDatasetDag />
    </ReactFlowProvider>
  );
};

AdminDag.getLayout = function getLayout(page: ReactElement) {
  return (
    <div>
      <DashboardLayout>{page}</DashboardLayout>
    </div>
  );
};

export default AdminDag;
