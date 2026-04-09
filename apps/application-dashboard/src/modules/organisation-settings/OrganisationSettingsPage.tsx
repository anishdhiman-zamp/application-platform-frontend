import DangerZone from '@/modules/organisation-settings/components/DangerZone';
import OrgDetails from '@/modules/organisation-settings/components/OrgDetails';
import SecurityConfiguration from '@/modules/organisation-settings/components/SecurityConfiguration';

const OrganisationSettingsPage = () => {
  return (
    <div className='h-full w-full overflow-auto'>
      <div className='flex w-full flex-col gap-6'>
        <OrgDetails />
        <SecurityConfiguration />
        <DangerZone />
      </div>
    </div>
  );
};

export default OrganisationSettingsPage;
