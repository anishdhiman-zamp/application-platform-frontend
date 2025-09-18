import { ComboboxOption } from '@zamp-platform/ui';
import { CUSTOM_COLUMNS_TYPE } from '@/components/common/table/table.types';
import { FILTER_TYPES, FilterConfigType } from '@/components/filter/filter.types';
import { SheetFilterType } from '@/types/api/pagesApi.types';
import { MapAny } from '@/types/commonTypes';

export interface CreateEditFilterContextType {
  formData: FormDataType;
  setFormData: (data: Partial<FormDataType>) => void;
  datasetIdAndWidgetsMapping: Record<string, string[]>;
  datasetOptions: ComboboxOption[];
  setDatasetOptions: (options: ComboboxOption[]) => void;
  existingFiltersFormData: FormDataType[];
  setExistingFiltersFormData: (data: FormDataType[]) => void;
  isSearchFilter: boolean;
  setIsSearchFilter: (isSearchFilter: boolean) => void;
}

export interface ColumnAndDatasetListType {
  datasetId: string;
  columns: string[];
  filterType?: FILTER_TYPES;
  options?: string[];
}

export enum DataType {
  STRING = 'string',
  NUMBER = 'number',
  TIMESTAMP = 'timestamp',
  TAGS = 'tags',
}

export interface FormDataType {
  name: string;
  columnAndDatasetList: ColumnAndDatasetListType[];
  id?: string;
  datatype: DataType;
}

export interface IsDatatypeMatchParams {
  datatype: string;
  datatypeToMatch: DataType;
  customType?: CUSTOM_COLUMNS_TYPE | FILTER_TYPES;
}

export interface FormatFormDataForCreateParamsType {
  formData: FormDataType;
  datasetIdAndWidgetsMapping: Record<string, string[]>;
  selectedFilters: MapAny;
  filtersConfig?: FilterConfigType[] | null;
  isSearchFilter?: boolean;
}

export interface FormatFormDataForCreateOutputType {
  payload: SheetFilterType;
  filterId: string;
}

export interface FormatEditFilterDataToFormDataOutputType {
  editFormData: FormDataType;
  selectedDatasetIds: string[];
  filtersConfig: FilterConfigType[];
  selectedFilters: MapAny;
}
