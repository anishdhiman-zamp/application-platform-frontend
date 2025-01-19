import { ColDef, ICellRendererParams } from 'ag-grid-community';
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
