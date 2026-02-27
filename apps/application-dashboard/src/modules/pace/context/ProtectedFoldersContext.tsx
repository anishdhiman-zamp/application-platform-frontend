'use client';

import { createContext, type ReactNode, useContext, useMemo } from 'react';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from '@zamp-platform/utils';
import { useAppSelector } from '@/hooks/toolkit';
import { isInvalidCrossProtectedMove, isProtectedRootFolder } from '@/modules/pace/components/files/file-tree.utils';
import type { RootState } from '@/store';

interface ProtectedFoldersContextValue {
  orgSlug: string;
  username: string;
  isProtectedRoot: (path: string) => boolean;
  isInvalidCrossMove: (sourcePath: string, destinationPath: string) => boolean;
}

const ProtectedFoldersContext = createContext<ProtectedFoldersContextValue | null>(null);

interface ProtectedFoldersProviderProps {
  children: ReactNode;
}

export const ProtectedFoldersProvider = ({ children }: ProtectedFoldersProviderProps) => {
  const orgs = useAppSelector((state: RootState) => state.user.user?.orgs) ?? [];
  const username = useAppSelector((state: RootState) => state.user.user?.username) ?? '';
  const orgId = getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID);

  const orgSlug = useMemo(() => {
    const currentOrg = orgs.find((org) => org.organization_id === orgId);

    return currentOrg?.slug ?? '';
  }, [orgs, orgId]);

  const value = useMemo<ProtectedFoldersContextValue>(
    () => ({
      orgSlug,
      username,
      isProtectedRoot: (path: string) => isProtectedRootFolder(path, orgSlug, username),
      isInvalidCrossMove: (sourcePath: string, destinationPath: string) =>
        isInvalidCrossProtectedMove(sourcePath, destinationPath, orgSlug, username),
    }),
    [orgSlug, username],
  );

  return <ProtectedFoldersContext.Provider value={value}>{children}</ProtectedFoldersContext.Provider>;
};

export const useProtectedFolders = (): ProtectedFoldersContextValue => {
  const context = useContext(ProtectedFoldersContext);

  if (!context) {
    throw new Error('useProtectedFolders must be used within a ProtectedFoldersProvider');
  }

  return context;
};
