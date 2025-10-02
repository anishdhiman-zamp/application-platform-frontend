import { SelectOption } from '@zamp-platform/ui';
import { DataType } from 'modules/sheets/CreateEditFilter/types';
import { FILTER_TYPES } from '@/components/filter/filter.types';
import { WidgetDataValueType } from '@/modules/widgets/widgets.constant';

export const DatatypeOptions: SelectOption[] = [
  {
    label: 'Date & time',
    value: DataType.TIMESTAMP,
  },
  {
    label: 'Number',
    value: DataType.NUMBER,
  },
  {
    label: 'String',
    value: DataType.STRING,
  },
  {
    label: 'Tags',
    value: DataType.TAGS,
  },
];

export const NUMBER_COLUMN_TYPES = [
  WidgetDataValueType.DECIMAL,
  WidgetDataValueType.NUMBER,
  WidgetDataValueType.BIGINT,
  WidgetDataValueType.DOUBLE,
  WidgetDataValueType.FLOAT,
  WidgetDataValueType.SMALLINT,
  WidgetDataValueType.TINYINT,
  WidgetDataValueType.INT,
  WidgetDataValueType.LONG,
  WidgetDataValueType.INTEGER,
];

export const STRING_COLUMN_TYPES = [WidgetDataValueType.STRING, WidgetDataValueType.BOOLEAN];

export const TIMESTAMP_COLUMN_TYPES = [
  WidgetDataValueType.TIMESTAMP,
  WidgetDataValueType.DATETIME,
  WidgetDataValueType.TIME,
  WidgetDataValueType.DATE,
  WidgetDataValueType.TIMESTAMP_NTZ,
];

export const DATA_TYPE_TO_FILTER_TYPE: Record<DataType, FILTER_TYPES> = {
  [DataType.STRING]: FILTER_TYPES.MULTI_SELECT,
  [DataType.NUMBER]: FILTER_TYPES.AMOUNT_RANGE,
  [DataType.TIMESTAMP]: FILTER_TYPES.DATE_RANGE,
  [DataType.TAGS]: FILTER_TYPES.TAGS,
};

export const MINIMUM_FILTER_NAME_WIDTH = 190;

export const TOOLTIP_TEXT = {
  SELECT_DATASET: 'Select a Dataset',
  SELECT_AT_LEAST_ONE_COLUMN: 'Select at least one column for each dataset',
};
