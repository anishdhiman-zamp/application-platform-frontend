'use client';

import React, { useEffect } from 'react';
import { ROUTES_PATH } from 'constants/routeConfig';
import { useAppDispatch } from 'hooks/toolkit';
import DualAdminHome from 'modules/dualAdmin/DualAdminHome';
import { resetBreadcrumb } from 'store/slices/layout-configs';

const DualAdmin = () => {
  const appDispatch = useAppDispatch();

  useEffect(() => {
    appDispatch(resetBreadcrumb([{ title: 'Dual Admin', href: ROUTES_PATH.POLICIES }]));
  }, []);

  return <DualAdminHome />;
};

export default DualAdmin;
