'use client';

import React, { useEffect } from 'react';
import { ROUTES_PATH } from 'constants/routeConfig';
import { useAppDispatch } from 'hooks/toolkit';
import PeoplePage from 'modules/team/PeoplePage';
import { resetBreadcrumb } from 'store/slices/layout-configs';

const Team = () => {
  const appDispatch = useAppDispatch();

  useEffect(() => {
    appDispatch(resetBreadcrumb([{ title: 'Team', href: ROUTES_PATH.TEAM }]));
  }, []);

  return <PeoplePage />;
};

export default Team;
