import AdminDatasetListing from 'modules/admin/AdminDatasetListing';
import DashboardLayout from 'components/layouts/dashboard-layout';

const AdminDataset = () => <AdminDatasetListing />;

AdminDataset.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default AdminDataset;
