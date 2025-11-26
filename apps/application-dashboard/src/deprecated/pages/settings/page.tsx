'use client';

import DualAdminHome from '@/deprecated/modules/dualAdmin/DualAdminHome';
import { useHash } from '@/hooks/useHash';
import { SETTINGS_TABS } from '@/modules/settings/settings.type';
import PeoplePage from 'modules/team/PeoplePage';
import { useEffect, useState } from 'react';

const Settings = () => {
  const path = useHash();
  const [currentTab, setCurrentTab] = useState<SETTINGS_TABS>(SETTINGS_TABS.TEAM);

  useEffect(() => {
    const tab = path.split('#')[1];

    setCurrentTab(tab as SETTINGS_TABS);
  }, [path]);

  switch (currentTab) {
    case SETTINGS_TABS.DUAL_ADMIN:
      return <DualAdminHome />;
    case SETTINGS_TABS.TEAM:
    default:
      return <PeoplePage />;
  }
};

export default Settings;
