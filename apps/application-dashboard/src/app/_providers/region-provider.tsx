'use client';

import React, { FC, ReactNode, useEffect } from 'react';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from '@zamp-platform/utils';
import { getApiDomainByRegion, reinitializeApiDomain } from '@/constants/api.constants';

interface RegionProviderProps {
  children: ReactNode;
}

export const RegionProvider: FC<RegionProviderProps> = ({ children }) => {
  useEffect(() => {
    const initializeRegion = async () => {
      try {
        // Check if region is already stored
        const existingRegion = getFromLocalStorage(LOCAL_STORAGE_KEYS.ORG_REGION);

        if (existingRegion) {
          // Region already exists, reinitialize API domain
          reinitializeApiDomain();

          return;
        }

        // Get the last logged in email to use for region detection
        const lastLoggedInEmail = getFromLocalStorage(LOCAL_STORAGE_KEYS.LAST_LOGGED_IN_OIDC_EMAIL);

        if (lastLoggedInEmail) {
          // Use the existing function to determine region
          await getApiDomainByRegion(lastLoggedInEmail);
        }
      } catch (error) {
        console.error('Failed to initialize region:', error);
        // Even if region initialization fails, we should still proceed
        // The app will use the default region
      }
    };

    initializeRegion();
  }, []);

  // Show children immediately - region detection happens in background
  return <>{children}</>;
};
