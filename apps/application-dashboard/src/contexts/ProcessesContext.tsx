'use client';

import { createContext, ReactNode, useContext, useEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { Process } from '@/app/(authenticated)/resources';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppSelector } from '@/hooks/toolkit';
import { usePersistedPageNavigation } from '@/hooks/useLastVisitedPage';
import { useProcessesData } from '@/hooks/useProcessesData';
import { useRedirectToFirstProcessAfterOrgSwitch } from '@/hooks/useRedirectToFirstProcessAfterOrgSwitch';
import { ProcessResponseType } from '@/types/api/processApi.types';

interface ProcessesContextType {
  processes: ProcessResponseType[];
  isLoadingProcesses: boolean;
  isSuccessProcesses: boolean;
  updateProcess: (processId: string, data: Partial<Process>) => void;
  deleteProcess: (processId: string) => void;
}

const ProcessesContext = createContext<ProcessesContextType | undefined>(undefined);

export const useProcesses = () => {
  const context = useContext(ProcessesContext);

  if (!context) {
    throw new Error('useProcesses must be used within ProcessesProvider');
  }

  return context;
};

interface ProcessesProviderProps {
  children: ReactNode;
}

/**
 * Provider that fetches pages and processes data once at the layout level.
 * Also handles navigation logic for routes that need it (e.g., /process page).
 * This ensures the API is only called once, even if multiple components need the data.
 */
export function ProcessesProvider({ children }: ProcessesProviderProps) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { isOrgSwitchIsInProgress } = useAppSelector((state) => state.user);

  const { processes, isLoadingProcesses, isSuccessProcesses, updateProcess, deleteProcess } = useProcessesData();

  // Get navigation functions
  const { pushToMostRelevantProcess } = usePersistedPageNavigation({
    processesList: processes ?? [],
  });

  // After org switch, redirect to first process if current processId is not in the list
  useRedirectToFirstProcessAfterOrgSwitch({
    processId: params?.processId as string | undefined,
    isOrgSwitchIsInProgress: isOrgSwitchIsInProgress ?? false,
    isSuccessProcesses: isSuccessProcesses ?? false,
    processes: processes ?? undefined,
  });

  // Handle navigation logic - only for /process route
  useEffect(() => {
    // Check for org switch in progress and reload if needed
    if (isOrgSwitchIsInProgress) {
      window.location.reload();

      return;
    }

    // Only navigate on /process route
    if (pathname === ROUTES_PATH.PROCESSES && isSuccessProcesses) {
      if (processes && processes.length > 0) {
        pushToMostRelevantProcess();
      } else {
        router.push(ROUTES_PATH.PEOPLE);
      }
    }
  }, [pathname, processes, isSuccessProcesses, isOrgSwitchIsInProgress, pushToMostRelevantProcess, router]);

  return (
    <ProcessesContext.Provider
      value={{
        processes: processes ?? [],
        isLoadingProcesses,
        isSuccessProcesses,
        updateProcess,
        deleteProcess,
      }}
    >
      {children}
    </ProcessesContext.Provider>
  );
}
