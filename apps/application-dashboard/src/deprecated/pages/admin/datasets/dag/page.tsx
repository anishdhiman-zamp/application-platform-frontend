'use client';

import AdminDatasetDag from '@/deprecated/modules/admin/AdminDatasetDag';
import { ReactFlowProvider } from '@xyflow/react';

const AdminDag = () => {
  return (
    <ReactFlowProvider>
      <AdminDatasetDag />
    </ReactFlowProvider>
  );
};

export default AdminDag;
