import { Suspense } from 'react';
import AdminDatasetListing from 'modules/admin/AdminDatasetListing';
import { Loader } from '@/components/common/loader/Loader';

const AdminDataset = () => (
  <Suspense fallback={<Loader />}>
    <AdminDatasetListing />
  </Suspense>
);

export default AdminDataset;
