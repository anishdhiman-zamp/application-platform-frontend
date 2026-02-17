/**
 * Custom event utilities for cross-component communication.
 * Uses browser CustomEvents to enable communication between React components
 * and non-React code (e.g., resource definitions, external libraries).
 */

// Navigation Events
export const NAVIGATION_EVENT = 'app:navigate';

export interface NavigationEventDetail {
  path: string;
  replace?: boolean;
}

/**
 * Triggers a soft navigation to the specified path.
 * Must be used with the useNavigationListener hook in a React component.
 */
export const navigateTo = (path: string, options?: { replace?: boolean }) => {
  window.dispatchEvent(
    new CustomEvent<NavigationEventDetail>(NAVIGATION_EVENT, {
      detail: { path, replace: options?.replace },
    }),
  );
};

// Process Events
export const PROCESS_CREATED_EVENT = 'app:process-created';

export interface ProcessCreatedEventDetail {
  processId: string;
}

/**
 * Dispatches an event when a process is successfully created.
 * Components can listen for this event to react to process creation.
 */
export const dispatchProcessCreated = (processId: string) => {
  window.dispatchEvent(
    new CustomEvent<ProcessCreatedEventDetail>(PROCESS_CREATED_EVENT, {
      detail: { processId },
    }),
  );
};

// Dataset Events
export const DATASET_CREATED_EVENT = 'app:dataset-created';
export const DATASET_UPDATED_EVENT = 'app:dataset-updated';

export interface DatasetCreatedEventDetail {
  datasetId: string;
}

export interface DatasetUpdatedEventDetail {
  datasetId: string;
}

/* Dispatches an event when a dataset is successfully created. */
export const dispatchDatasetCreated = (datasetId: string) => {
  window.dispatchEvent(
    new CustomEvent<DatasetCreatedEventDetail>(DATASET_CREATED_EVENT, {
      detail: { datasetId },
    }),
  );
};

export const dispatchDatasetUpdated = (datasetId: string) => {
  window.dispatchEvent(
    new CustomEvent<DatasetUpdatedEventDetail>(DATASET_UPDATED_EVENT, {
      detail: { datasetId },
    }),
  );
};
