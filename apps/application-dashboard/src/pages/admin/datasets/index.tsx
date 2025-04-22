import { ReactElement } from 'react';
import AdminDatasetListing from 'modules/admin/AdminDatasetListing';
import DashboardLayout from 'components/layouts/dashboard-layout';

const AdminDataset = () => <AdminDatasetListing />;

AdminDataset.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default AdminDataset;
