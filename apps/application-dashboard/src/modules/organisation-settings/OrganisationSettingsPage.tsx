import DangerZone from '@/modules/organisation-settings/components/DangerZone';
import OrgDetails from '@/modules/organisation-settings/components/OrgDetails';
import SecurityConfiguration from '@/modules/organisation-settings/components/SecurityConfiguration';

const OrganisationSettingsPage = () => {
  return (
    <div className='bg-BG_WHITE h-full w-full overflow-auto p-10'>
      <div className='flex h-full w-full flex-col'>
        <OrgDetails />
        <SecurityConfiguration />
        <DangerZone />
      </div>
    </div>
  );
};

export default OrganisationSettingsPage;
