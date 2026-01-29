'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getProcessRouteById } from '@/constants/routeConfig';
import type { ProcessesResponseType } from '@/types/api/processApi.types';

type UseRedirectToFirstProcessAfterOrgSwitchParams = {
  processId: string | undefined;
  isOrgSwitchIsInProgress: boolean;
  isSuccessProcesses: boolean;
  processes: ProcessesResponseType[] | undefined;
};

/**
 * After org switch, if the current processId in the URL is not in the processes list,
 * redirects to the first process in the list.
 */
export function useRedirectToFirstProcessAfterOrgSwitch({
  processId,
  isOrgSwitchIsInProgress,
  isSuccessProcesses,
  processes,
}: UseRedirectToFirstProcessAfterOrgSwitchParams) {
  const router = useRouter();
  const hasCheckedProcessAfterOrgSwitch = useRef(false);

  useEffect(() => {
    if (isOrgSwitchIsInProgress) {
      hasCheckedProcessAfterOrgSwitch.current = false;

      return;
    }

    if (
      !isOrgSwitchIsInProgress &&
      isSuccessProcesses &&
      processes &&
      processes.length > 0 &&
      processId &&
      !hasCheckedProcessAfterOrgSwitch.current
    ) {
      const isValidProcess = processes.some((process) => process.id === processId);

      if (!isValidProcess) {
        hasCheckedProcessAfterOrgSwitch.current = true;
        router.push(getProcessRouteById(processes[0].id));

        return;
      }
      hasCheckedProcessAfterOrgSwitch.current = true;
    }
  }, [processId, processes, isSuccessProcesses, isOrgSwitchIsInProgress, router]);
}
