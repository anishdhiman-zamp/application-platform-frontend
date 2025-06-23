'use client';

import { useState } from 'react';
import { getPageRouteById, getProcessRouteById, ROUTES_PATH } from 'constants/routeConfig';
import { usePathname, useRouter } from 'next/navigation';
import { PageResponseType } from 'types/api/pagesApi.types';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, removeFromLocalStorage, setToLocalStorage } from 'utils/localstorage';
import type { ProcessesResponseType } from '@/types/api/processApi.types';

const getLastVisitedPage = (): string => {
  return getFromLocalStorage(LOCAL_STORAGE_KEYS.LAST_VISITED_PAGE_ID) || '';
};

const getLastVisitedProcess = (): string => {
  return getFromLocalStorage(LOCAL_STORAGE_KEYS.LAST_VISITED_PROCESS_ID) || '';
};

export const persistLastVisitedPage = (pageId: string) => {
  setToLocalStorage(LOCAL_STORAGE_KEYS.LAST_VISITED_PAGE_ID, pageId);
};

export const persistLastVisitedProcess = (processID: string) => {
  setToLocalStorage(LOCAL_STORAGE_KEYS.LAST_VISITED_PROCESS_ID, processID);
};

const clearLastVisited = () => {
  removeFromLocalStorage(LOCAL_STORAGE_KEYS.LAST_VISITED_PAGE_ID);
  removeFromLocalStorage(LOCAL_STORAGE_KEYS.LAST_VISITED_PROCESS_ID);
};

type PersistedPageNavigationProps = {
  pagesList?: PageResponseType[];
  processesList?: ProcessesResponseType[];
};

export const usePersistedPageNavigation = ({ pagesList, processesList }: PersistedPageNavigationProps) => {
  const [firstNavigationDone, setFirstNavigationDone] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const pushToMostRelevantPage = () => {
    // navigate to the most relevant page when the user visits the home page
    if (pathname === ROUTES_PATH.HOME || pathname === ROUTES_PATH.PAGES || pathname === ROUTES_PATH.PROCESSES) {
      // if the user has a last visited page, check if it exists in the pages list and navigate to it
      // if it doesn't exist, clear the last visited page
      const lastVisitedPageId = getLastVisitedPage();

      if (lastVisitedPageId) {
        if (pagesList?.find((page) => page.page_id === lastVisitedPageId)) {
          router.push(getPageRouteById(lastVisitedPageId));

          return;
        } else {
          clearLastVisited();
        }
      }

      // if the user has no last visited page, navigate to the first page in the list if it exists
      if (pagesList && pagesList?.length > 0) {
        router.push(getPageRouteById(pagesList[0].page_id));
      }
    }
  };

  const pushToMostRelevantProcess = () => {
    // navigate to the most relevant page when the user visits the home page
    if (pathname === ROUTES_PATH.HOME || pathname === ROUTES_PATH.PROCESSES) {
      // if the user has a last visited page, check if it exists in the pages list and navigate to it
      // if it doesn't exist, clear the last visited page
      const lastVisitedProcessId = getLastVisitedProcess();

      if (lastVisitedProcessId) {
        if (processesList?.find((process) => process?.id === lastVisitedProcessId)) {
          router.push(getProcessRouteById(lastVisitedProcessId));

          return;
        } else {
          clearLastVisited();
        }
      }

      // if the user has no last visited page, navigate to the first page in the list if it exists
      if (processesList && processesList?.length > 0) {
        router.push(getProcessRouteById(processesList[0].id));
      }
    }
  };

  return {
    pushToMostRelevantPage: () => {
      if (firstNavigationDone) return;
      setFirstNavigationDone(true);
      pushToMostRelevantPage();
    },
    pushToMostRelevantProcess: () => {
      if (firstNavigationDone) return;
      setFirstNavigationDone(true);
      pushToMostRelevantProcess();
    },
    setLastVisitedPage: (pageId: string) => {
      persistLastVisitedPage(pageId);
    },
    setLastVisitedProcess: (processId: string) => {
      persistLastVisitedProcess(processId);
    },
  };
};
