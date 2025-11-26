'use client';

import AdminDatasetByIdV2 from '@/deprecated/modules/admin/AdminDatasetByIdV2';
import { useParams } from 'next/navigation';

const AdminDatasetId = () => {
  const params = useParams();

  return <AdminDatasetByIdV2 id={params?.id as string} />;
};

export default AdminDatasetId;
