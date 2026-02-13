import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@zamp-platform/utils';

// ============================================================================
// Org-scoped Column Config Helpers
// Structure: { orgId: { datasetId: { dataset_name, columns } } }
// ============================================================================

/**
 * Get the current organization ID from localStorage
 */
const getOrgId = (): string => {
  return getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID) || '';
};

/**
 * Get the full parsed COLUMN_ORDERING_VISIBILITY data
 */
const getParsedColumnConfig = (): Record<string, unknown> => {
  try {
    const storedData = getFromLocalStorage(LOCAL_STORAGE_KEYS.COLUMN_ORDERING_VISIBILITY);
    if (!storedData) return {};

    const parsed = JSON.parse(storedData);

    // Validate that parsed data is a plain object (not null, array, or other types)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      console.warn('[getParsedColumnConfig] Invalid data structure in localStorage, resetting');
      return {};
    }

    return parsed;
  } catch (error) {
    console.error('[getParsedColumnConfig] Failed to parse localStorage data:', error);
    return {};
  }
};

/**
 * Save the full COLUMN_ORDERING_VISIBILITY data
 */
const saveParsedColumnConfig = (data: Record<string, unknown>): void => {
  setToLocalStorage(LOCAL_STORAGE_KEYS.COLUMN_ORDERING_VISIBILITY, JSON.stringify(data));
};

/**
 * Get the org-scoped data object (all datasets for the current org)
 */
export const getOrgColumnConfigs = (): Record<string, unknown> => {
  const parsedData = getParsedColumnConfig();
  const orgId = getOrgId();
  if (!orgId) return parsedData;
  return (parsedData[orgId] as Record<string, unknown>) || {};
};

/**
 * Get column config for a specific dataset, scoped by organization
 * Falls back to old flat format for backward compatibility
 */
export const getColumnConfigForDataset = (datasetId: string): Record<string, unknown> | null => {
  if (!datasetId) return null;
  try {
    const parsedData = getParsedColumnConfig();
    const orgId = getOrgId();

    // New org-scoped format
    if (orgId) {
      const orgData = parsedData[orgId] as Record<string, unknown> | undefined;
      if (orgData?.[datasetId]) {
        return orgData[datasetId] as Record<string, unknown>;
      }
    }

    // Fallback to old flat format for backward compatibility
    const flatData = parsedData[datasetId];
    if (flatData && typeof flatData === 'object' && !Array.isArray(flatData)) {
      // Check if it looks like dataset data (not an org object)
      if (
        'dataset_name' in (flatData as Record<string, unknown>) ||
        'columns' in (flatData as Record<string, unknown>)
      ) {
        return flatData as Record<string, unknown>;
      }
    }
    // Old array format
    if (Array.isArray(flatData)) {
      return flatData as unknown as Record<string, unknown>;
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Set column config for a specific dataset, scoped by organization
 */
export const setColumnConfigForDataset = (datasetId: string, data: unknown): void => {
  if (!datasetId) return;
  try {
    const parsedData = getParsedColumnConfig();
    const orgId = getOrgId();

    if (orgId) {
      if (!parsedData[orgId]) parsedData[orgId] = {};
      (parsedData[orgId] as Record<string, unknown>)[datasetId] = data;
    } else {
      parsedData[datasetId] = data;
    }

    saveParsedColumnConfig(parsedData);
  } catch (error) {
    console.error('[setColumnConfigForDataset] Error:', error);
  }
};

/**
 * Delete column config for a specific dataset, scoped by organization
 */
export const deleteColumnConfigForDataset = (datasetId: string): void => {
  if (!datasetId) return;
  try {
    const parsedData = getParsedColumnConfig();
    const orgId = getOrgId();

    if (orgId && parsedData[orgId]) {
      delete (parsedData[orgId] as Record<string, unknown>)[datasetId];
    }
    // Also clean up old flat format
    delete parsedData[datasetId];

    saveParsedColumnConfig(parsedData);
  } catch (error) {
    console.error('[deleteColumnConfigForDataset] Error:', error);
  }
};

/**
 * Set the full org-scoped data (replaces all dataset configs for the current org)
 */
export const setAllOrgColumnConfigs = (orgData: Record<string, unknown>): void => {
  try {
    const parsedData = getParsedColumnConfig();
    const orgId = getOrgId();

    if (orgId) {
      parsedData[orgId] = orgData;
    } else {
      // Without org, just merge at top level
      Object.assign(parsedData, orgData);
    }

    saveParsedColumnConfig(parsedData);
  } catch (error) {
    console.error('[setAllOrgColumnConfigs] Error:', error);
  }
};
