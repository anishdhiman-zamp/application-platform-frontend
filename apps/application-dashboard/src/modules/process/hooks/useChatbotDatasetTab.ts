import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getChatbotDatasetTabId } from '@/modules/process/process.utils';

interface Dataset {
  dataset_id: string;
  dataset_name?: string;
}

/**
 * Custom hook to handle chatbot deep linking for dataset tab selection
 * Preserves current tab state when chatbot params are removed
 */
export const useChatbotDatasetTab = (datasets: Dataset[]) => {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>('');
  const tabInitialized = useRef(false);

  useEffect(() => {
    if (datasets?.length > 0) {
      const datasetIdFromUrl = getChatbotDatasetTabId(searchParams);

      // If chatbot params indicate a specific dataset field, select that dataset
      if (datasetIdFromUrl) {
        const datasetExists = datasets.some((ds) => ds.dataset_id === datasetIdFromUrl);

        if (datasetExists) {
          setActiveTab(datasetIdFromUrl);
          tabInitialized.current = true;

          return;
        }
      }

      // If current active tab is no longer valid (e.g., due to filtering), reset to first dataset
      if (activeTab && !datasets.some((ds) => ds.dataset_id === activeTab)) {
        setActiveTab(datasets[0]?.dataset_id);
        tabInitialized.current = true;

        return;
      }

      // Only set default tab if it hasn't been initialized yet (preserve state when chatbot params are removed)
      if (!tabInitialized.current) {
        setActiveTab(datasets[0]?.dataset_id);
        tabInitialized.current = true;
      }
    }
  }, [datasets, searchParams, activeTab]);

  return {
    activeTab,
    setActiveTab,
  };
};
