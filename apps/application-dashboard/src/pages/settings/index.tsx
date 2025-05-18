import React, { ReactElement, useEffect, useState } from 'react';
import PeoplePage from 'modules/team/PeoplePage';
import { useRouter } from 'next/router';
import DualAdminHome from '@/modules/dualAdmin/DualAdminHome';
import { SETTINGS_TABS } from '@/modules/settings/settings.type';
import DashboardLayout from 'components/layouts/dashboard-layout';

const Team = () => {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<SETTINGS_TABS>(SETTINGS_TABS.TEAM);

  useEffect(() => {
    const tab = router.asPath.split('#')[1];

    setCurrentTab(tab as SETTINGS_TABS);
  }, [router]);

  switch (currentTab) {
    case SETTINGS_TABS.DUAL_ADMIN:
      return <DualAdminHome />;
    case SETTINGS_TABS.TEAM:
    default:
      return <PeoplePage />;
  }
};

Team.getLayout = function getLayout(page: ReactElement) {
  return (
    <div>
      <DashboardLayout>{page}</DashboardLayout>
    </div>
  );
};

export default Team;
