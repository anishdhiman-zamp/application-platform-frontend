'use client';

import { createContext, ReactNode, useContext, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Process } from '@/app/(authenticated)/resources';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppSelector } from '@/hooks/toolkit';
import { usePersistedPageNavigation } from '@/hooks/useLastVisitedPage';
import { usePagesAndProcessesData } from '@/hooks/usePagesAndProcessesData';

interface PagesAndProcessesContextType {
  pages: ReturnType<typeof usePagesAndProcessesData>['pages'];
  processes: ReturnType<typeof usePagesAndProcessesData>['processes'];
  isLoading: boolean;
  isLoadingPages: boolean;
  isLoadingProcesses: boolean;
  isSuccessPages: boolean;
  isSuccessProcesses: boolean;
  updateProcess: (processId: string, data: Partial<Process>) => void;
  deleteProcess: (processId: string) => void;
}

const PagesAndProcessesContext = createContext<PagesAndProcessesContextType | undefined>(undefined);

export const usePagesAndProcesses = () => {
  const context = useContext(PagesAndProcessesContext);

  if (!context) {
    throw new Error('usePagesAndProcesses must be used within PagesAndProcessesProvider');
  }

  return context;
};

interface PagesAndProcessesProviderProps {
  children: ReactNode;
}

/**
 * Provider that fetches pages and processes data once at the layout level.
 * Also handles navigation logic for routes that need it (e.g., /process page).
 * This ensures the API is only called once, even if multiple components need the data.
 */
export function PagesAndProcessesProvider({ children }: PagesAndProcessesProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isOrgSwitchIsInProgress } = useAppSelector((state) => state.user);

  const {
    pages,
    processes,
    isLoading,
    isLoadingPages,
    isLoadingProcesses,
    isSuccessPages,
    isSuccessProcesses,
    updateProcess,
    deleteProcess,
  } = usePagesAndProcessesData();

  // Get navigation functions
  const { pushToMostRelevantPage, pushToMostRelevantProcess } = usePersistedPageNavigation({
    pagesList: pages ?? [],
    processesList: processes ?? [],
  });

  // Handle navigation logic - only for /process route
  useEffect(() => {
    // Check for org switch in progress and reload if needed
    if (isOrgSwitchIsInProgress) {
      window.location.reload();

      return;
    }

    // Only navigate on /process route
    if (pathname === ROUTES_PATH.PROCESSES && isSuccessPages && isSuccessProcesses) {
      if (processes && processes.length > 0) {
        pushToMostRelevantProcess();
      } else if (pages && pages.length > 0) {
        pushToMostRelevantPage();
      } else {
        // Fallback navigation if no processes or pages
        router.push(ROUTES_PATH.PEOPLE);
      }
    }
  }, [
    pathname,
    pages,
    processes,
    isSuccessPages,
    isSuccessProcesses,
    isOrgSwitchIsInProgress,
    pushToMostRelevantPage,
    pushToMostRelevantProcess,
    router,
  ]);

  return (
    <PagesAndProcessesContext.Provider
      value={{
        pages,
        processes,
        isLoading,
        isLoadingPages,
        isLoadingProcesses,
        isSuccessPages,
        isSuccessProcesses,
        updateProcess,
        deleteProcess,
      }}
    >
      {children}
    </PagesAndProcessesContext.Provider>
  );
}
