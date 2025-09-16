'use client';

import { FC, ReactNode, useEffect } from 'react';
import { ENVIRONMENT, ENVIRONMENT_TYPES } from 'constants/common.constants';
import { FEATURE_FLAGS } from 'constants/featureFlags';
import { ROUTES_PATH } from 'constants/routeConfig';
import { useFeatureFlags } from 'hooks/useFeatureFlags';
import { useWindowDimensions } from 'hooks/useWindowDimensions';
import ScreenSupport from 'modules/cards/ScreenSupport';
import { usePathname, useRouter } from 'next/navigation';
import { checkScreenBreakpoint } from 'utils/common';

type AuthGuardPropsType = {
  children: ReactNode;
};

export const RouteGuard: FC<AuthGuardPropsType> = (props) => {
  const router = useRouter();
  const pathname = usePathname() || '';
  const isAdminRoute = pathname.startsWith(ROUTES_PATH.ADMIN);

  const { evaluate, ldClient } = useFeatureFlags();
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    if (isAdminRoute && ldClient) {
      evaluate(FEATURE_FLAGS.ADMIN_PAGE).then((isAdminFeatureEnabled) => {
        if (!isAdminFeatureEnabled) {
          router.push(ROUTES_PATH.NO_ACCESS);
        }
      });
    }
  }, [isAdminRoute, evaluate, ldClient, router, props.children]);

  const breakpoint = checkScreenBreakpoint(width, height);

  if (breakpoint && ENVIRONMENT === ENVIRONMENT_TYPES.PRODUCTION) return <ScreenSupport />;

  return props.children;
};
