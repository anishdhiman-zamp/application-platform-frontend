'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import AdminDatasetByIdV2 from '@/modules/admin/AdminDatasetByIdV2';

const AdminDatasetId = () => {
  const params = useParams();

  return <AdminDatasetByIdV2 id={params?.id as string} />;
};

export default AdminDatasetId;
