import { useCallback, useEffect, useState } from 'react';

/**
 * Hook to check if the current dataset page is in creation mode
 * Returns true when `source=creation` is present in the URL search params
 * This is set when user clicks "Create dataset" and removed after successful creation
 *
 * Reactively updates when URL changes (via popstate, pushState, replaceState)
 */
export const useCheckDatasetCreationEnabled = (): boolean => {
  const getIsCreation = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('source') === 'creation';
  }, []);

  // Always initialize as false to match SSR and avoid hydration mismatch
  const [isCreationMode, setIsCreationMode] = useState(false);

  useEffect(() => {
    // Sync with actual URL on mount
    setIsCreationMode(getIsCreation());

    const handleUrlChange = () => {
      setTimeout(() => {
        setIsCreationMode(getIsCreation());
      }, 0);
    };

    // Listen for browser back/forward
    window.addEventListener('popstate', handleUrlChange);

    // Patch pushState and replaceState to detect programmatic URL changes
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = (...args) => {
      originalPushState(...args);
      handleUrlChange();
    };

    history.replaceState = (...args) => {
      originalReplaceState(...args);
      handleUrlChange();
    };

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [getIsCreation]);

  return isCreationMode;
};
