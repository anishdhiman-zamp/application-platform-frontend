'use client';

import { ReactFlowProvider } from '@xyflow/react';
import AdminDatasetDag from '@/unused/modules/admin/AdminDatasetDag';

const AdminDag = () => {
  return (
    <ReactFlowProvider>
      <AdminDatasetDag />
    </ReactFlowProvider>
  );
};

export default AdminDag;
