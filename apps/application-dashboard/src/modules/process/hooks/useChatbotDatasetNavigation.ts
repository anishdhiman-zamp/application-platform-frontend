import { useEffect, useRef } from 'react';
import type { GridApi } from 'ag-grid-community';
import { useSearchParams } from 'next/navigation';
import { DATASET_VIEW_TYPE } from '@/modules/process/process.types';
import { getChatbotDatasetFieldParams, shouldPerformChatbotDatasetNavigation } from '@/modules/process/process.utils';

interface UseChatbotDatasetNavigationProps {
  datasetId: string;
  gridReady: boolean;
  isInitialDataLoaded: boolean;
  gridApi: GridApi | null;
  setActiveTab: (tab: DATASET_VIEW_TYPE) => void;
  scrollToCell: (rowId: string, columnId: string) => void;
}

/**
 * Custom hook to handle chatbot deep linking navigation for dataset fields
 * Switches to Table View and scrolls to the specified cell when chatbot params are present
 */
export const useChatbotDatasetNavigation = ({
  datasetId,
  gridReady,
  isInitialDataLoaded,
  gridApi,
  setActiveTab,
  scrollToCell,
}: UseChatbotDatasetNavigationProps) => {
  const searchParams = useSearchParams();
  const chatbotNavigationHandled = useRef(false);

  useEffect(() => {
    if (!gridReady || !isInitialDataLoaded || !gridApi || chatbotNavigationHandled.current) return;

    if (shouldPerformChatbotDatasetNavigation(searchParams, datasetId)) {
      const params = getChatbotDatasetFieldParams(searchParams);

      if (params) {
        chatbotNavigationHandled.current = true;

        // Switch to Table View (GRID)
        setActiveTab(DATASET_VIEW_TYPE.GRID);

        // Scroll to the specific cell after a short delay to ensure view has switched
        requestAnimationFrame(() => {
          setTimeout(() => {
            scrollToCell(params.rowId, params.fieldId);
          }, 100);
        });
      }
    }
  }, [gridReady, isInitialDataLoaded, gridApi, searchParams, datasetId, setActiveTab, scrollToCell]);
};
