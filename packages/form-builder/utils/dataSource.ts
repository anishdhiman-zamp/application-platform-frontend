import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from '@zamp-platform/utils';

import { DataSource, FormField } from '../types';
import { processTemplateVariables } from './formContext';

const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT;

const API_DOMAIN = () => {
  switch (ENVIRONMENT) {
    case 'production':
      return 'https://api.zamp.ai';
    case 'staging':
      return 'https://api-stg.zamp.ai';
    case 'development':
      return 'https://api-dev.zamp.ai';
    default:
      return 'http://localhost:8080';
  }
};

export interface DataSourceResult<T = unknown> {
  data: T[];
  error: string | null;
}

export interface DataSourceOptions {
  fieldValues: Record<string, unknown>;
  onLoadingChange?: (loading: boolean) => void;
}

export const fetchDataSource = async <T = unknown>(
  dataSource: DataSource,
  options: DataSourceOptions,
): Promise<DataSourceResult<T>> => {
  const { fieldValues, onLoadingChange } = options;

  try {
    onLoadingChange?.(true);

    const { endpoint, method, params = {}, body } = dataSource;

    const processedParams = Object.entries(params || {}).reduce(
      (acc, [key, value]) => {
        acc[key] = processTemplateVariables(value, fieldValues) as string;
        return acc;
      },
      {} as Record<string, string>,
    );

    const queryParams = new URLSearchParams(processedParams).toString();
    const url = `${API_DOMAIN()}/${endpoint}?${queryParams}`;

    const response = await fetch(url, {
      method,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        [LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID]: getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID) || '',
      },
      body: method === 'POST' ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      console.log('in try response not okay');
      return { data: [], error: 'Failed to fetch data' };
    }

    const json: unknown = await response.json();

    let data: T[] = [];
    if (Array.isArray(json)) {
      data = json as T[];
    } else if (typeof json === 'object' && json !== null && Array.isArray((json as { data?: unknown }).data)) {
      data = (json as { data: unknown[] }).data as T[];
    }

    return { data, error: null };
  } catch (err) {
    throw err;
  } finally {
    onLoadingChange?.(false);
  }
};

export const transformDataSourceToOptions = <T extends { value?: string; id?: string; label?: string; name?: string }>(
  data: T[],
): Array<{ value: string; label: string }> => {
  return data.map((item) => ({
    value: item.value || item.id || '',
    label: item.label || item.name || '',
  }));
};

export const shouldFetchDataSource = (field: FormField, fieldValues: Record<string, unknown>): boolean => {
  if (!field.data_source?.triggers) return true;

  const dependentFields = field.data_source.triggers.map((trigger) => trigger.field);
  const values = dependentFields.map((fieldName) => fieldValues[fieldName]);

  return values.every((value) => !!value);
};
