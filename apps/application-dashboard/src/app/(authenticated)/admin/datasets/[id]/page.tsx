'use client';

import React from 'react';
import AdminDatasetById from 'modules/admin/AdminDatasetById';
import { useParams } from 'next/navigation';

const AdminDatasetId = () => {
  const params = useParams();

  return <AdminDatasetById id={params?.id as string} />;
};

export default AdminDatasetId;
