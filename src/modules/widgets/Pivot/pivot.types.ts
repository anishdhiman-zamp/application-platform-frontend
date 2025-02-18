export type PivotColumnMetadata =
  | {
      kind: 'group';
      name: string;
      dataType: 'string' | 'number' | 'date';
      sourceName: string;
      mappingName: string;
      heirarchy: number;
      hasChildren: boolean;
      maxHeirarchy: number;
    }
  | {
      kind: 'pivot';
      name: string;
      dataType: 'string' | 'number' | 'date';
      sourceName: string;
      mappingName: string;
    }
  | {
      kind: 'aggregate';
      name: string;
      dataType: 'string' | 'number' | 'date';
      aggregation: string;
      sourceName: string;
      mappingName: string;
    };

export enum PIVOT_DATA_TYPES {
  STRING = 'string',
  NUMBER = 'number',
  DATE = 'date',
  STATUS = 'status',
  TIMESTAMP = 'timestamp',
  COUNTRY = 'country',
  BANK = 'bank',
  TAG = 'tag',
  BOOLEAN = 'boolean',
  AMOUNT = 'amount',
}

export type MappingDetails = {
  column?: string;
  drilldown_filter_type?: string;
  drilldown_filter_operator?: string;
};

export type ParentMappingDetail = {
  key: string;
  mappingDetails: MappingDetails | null;
};

export type FilterConfig = {
  filterType?: string;
  type?: string;
  values?: string[];
  dateFrom?: string;
  dateTo?: string;
};

export type ParentFilters = Record<string, FilterConfig>;
