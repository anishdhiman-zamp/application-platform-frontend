'use client';

import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import AdminDatasetDag from 'modules/admin/AdminDatasetDag';

const AdminDag = () => {
  return (
    <ReactFlowProvider>
      <AdminDatasetDag />
    </ReactFlowProvider>
  );
};

export default AdminDag;
