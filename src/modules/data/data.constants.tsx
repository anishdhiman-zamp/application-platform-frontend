import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { COLORS } from 'constants/colors';
import CustomAmountRenderer from 'components/common/table/CustomCellRenderers/CustomAmountRenderer';
import CustomDateTimeRenderer from 'components/common/table/CustomCellRenderers/CustomDateTimeRenderer';
import CustomTagRenderer from 'components/common/table/CustomCellRenderers/CustomTagRenderer';
import { CUSTOM_COLUMNS_TYPE } from 'components/common/table/table.types';

export const LISTING_COLUMNS: ColDef[] = [
  {
    field: 'title',
    headerName: 'Name',
  },
  {
    field: 'description',
    headerName: 'Description',
  },
  {
    field: 'updated_at',
    headerName: 'Last Updated',
  },
];

export const CustomColumnsMapping: Record<CUSTOM_COLUMNS_TYPE, (props: ICellRendererParams) => JSX.Element> = {
  [CUSTOM_COLUMNS_TYPE.AMOUNT]: CustomAmountRenderer,
  [CUSTOM_COLUMNS_TYPE.DATE_TIME]: CustomDateTimeRenderer,
  [CUSTOM_COLUMNS_TYPE.TAG]: CustomTagRenderer,
};

export enum TEAM_OPTIONS {
  ENGG = 'engg',
  DESIGN = 'design',
  SALES_MARKETING = 'sales_marketing',
  PRODUCT = 'product',
  HIRING = 'hiring',
}

export const TEAM_OPTIONS_LIST = [
  {
    label: 'Engg',
    value: TEAM_OPTIONS.ENGG,
    color: COLORS.ORANGE_200,
  },
  {
    label: 'Design',
    value: TEAM_OPTIONS.DESIGN,
    color: COLORS.BLUE_150,
  },
  {
    label: 'Sales/Marketing',
    value: TEAM_OPTIONS.SALES_MARKETING,
    color: COLORS.VIOLET_100,
  },
  {
    label: 'Product',
    value: TEAM_OPTIONS.PRODUCT,
    color: COLORS.BLUE_150,
  },
  {
    label: 'Hiring',
    value: TEAM_OPTIONS.HIRING,
    color: COLORS.RED_250,
  },
];

export enum DATASET_ACCESS_PRIVILEGES {
  SYSTEM_ADMIN = 'system_admin',
  MEMBER = 'member',
}

export const DATASET_ACCESS_PRIVILEGES_LIST = [
  {
    label: 'System Admin',
    value: DATASET_ACCESS_PRIVILEGES.SYSTEM_ADMIN,
  },
  {
    label: 'Member',
    value: DATASET_ACCESS_PRIVILEGES.MEMBER,
  },
];
