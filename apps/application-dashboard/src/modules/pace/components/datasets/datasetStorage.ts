import { type BlueprintColumn, LEGACY_DATASET_KEY_PREFIXES } from 'modules/pace/components/datasets/datasets.constants';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@/utils/localstorage';

export interface DatasetState {
  blueprint?: BlueprintColumn[];
  final?: string[];
  updatedAt?: number;
}

type DatasetStore = Record<string, Record<string, DatasetState>>;

// Cap stored entries per org so the blob can't grow unboundedly as users visit
// many datasets. When exceeded, the least-recently-updated entries are evicted.
const MAX_TABLES_PER_ORG = 50;

const evictStaleEntries = (orgState: Record<string, DatasetState>): Record<string, DatasetState> => {
  const entries = Object.entries(orgState);

  if (entries.length <= MAX_TABLES_PER_ORG) return orgState;

  return Object.fromEntries(
    entries.sort(([, a], [, b]) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)).slice(0, MAX_TABLES_PER_ORG),
  );
};

const readStore = (): DatasetStore => {
  const raw = getFromLocalStorage(LOCAL_STORAGE_KEYS.ZAMP_DATASETS);

  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);

    return parsed && typeof parsed === 'object' ? (parsed as DatasetStore) : {};
  } catch {
    return {};
  }
};

const writeStore = (store: DatasetStore) => {
  setToLocalStorage(LOCAL_STORAGE_KEYS.ZAMP_DATASETS, JSON.stringify(store));
};

export const getDatasetState = (orgId: string, tableName: string): DatasetState => {
  if (!orgId || !tableName) return {};

  return readStore()[orgId]?.[tableName] ?? {};
};

export const setDatasetState = (orgId: string, tableName: string, patch: DatasetState) => {
  if (!orgId || !tableName) return;
  const store = readStore();
  const orgState = store[orgId] ?? {};
  const current = orgState[tableName] ?? {};
  const next: DatasetState = { ...current };

  // Treat explicit `undefined` in the patch as "remove this key" so callers can
  // merge sets and clears into a single write without a follow-up clear call.
  (Object.keys(patch) as (keyof DatasetState)[]).forEach((key) => {
    const value = patch[key];

    if (value === undefined) delete next[key];
    else (next[key] as DatasetState[typeof key]) = value;
  });
  next.updatedAt = Date.now();
  store[orgId] = evictStaleEntries({ ...orgState, [tableName]: next });
  writeStore(store);
};

export const clearDatasetStateKey = (orgId: string, tableName: string, keys: (keyof DatasetState)[]) => {
  if (!orgId || !tableName) return;
  const store = readStore();
  const orgState = store[orgId];
  const current = orgState?.[tableName];

  if (!orgState || !current) return;
  const next: DatasetState = { ...current };

  for (const key of keys) delete next[key];
  store[orgId] = { ...orgState, [tableName]: next };
  writeStore(store);
};

// Deletes legacy per-dataset localStorage keys that the app no longer reads.
// Idempotent and cheap — runs once per tab load to keep user storage tidy.
let legacyKeysCleaned = false;

export const cleanLegacyDatasetKeys = () => {
  if (typeof window === 'undefined' || legacyKeysCleaned) return;
  legacyKeysCleaned = true;
  try {
    const storage = window.localStorage;

    Object.keys(storage)
      .filter((key) => LEGACY_DATASET_KEY_PREFIXES.some((prefix) => key.startsWith(prefix)))
      .forEach((key) => storage.removeItem(key));
  } catch {
    // ignore — SecurityError in sandboxed iframes, QuotaError on writes, etc.
  }
};
