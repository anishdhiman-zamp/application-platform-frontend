import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { COLORS } from 'constants/colors';
import { DATASET_ICON } from 'constants/icons';
import { DATASET_ACTION_TYPE } from 'modules/data/data.types';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from 'utils/common';
import BankNameCell from '@/components/common/table/CustomCellRenderers/BankNameCell';
import CustomChipRenderer from '@/components/common/table/CustomCellRenderers/CustomChipsRenderer';
import DescriptionWithTooltip from '@/components/common/table/CustomCellRenderers/DescriptionWithTooltip';
import EditNameDescription from '@/components/common/table/CustomCellRenderers/EditNameDescription';
import PaymentsAccountStatusCell from '@/components/common/table/CustomCellRenderers/PaymentsAccountStatus';
import RecipientNameCell from '@/components/common/table/CustomCellRenderers/RecipientNameCell';
import StatusBadgeCell from '@/components/common/table/CustomCellRenderers/StatusBadgeCell';
import {
  RuleDeletionMessages,
  TaggingMessages,
  UpdateMissingFieldsMessages,
} from '@/components/common/toast/toast.constants';
import { getDatasetRouteById } from '@/constants/routeConfig';
import ActivityCurrentStatus from '@/modules/process/activity-runs/components/ActivityCurrentStatus';
import ActivityDocument from '@/modules/process/activity-runs/components/ActivityDocument';
import ActivityStatus from '@/modules/process/activity-runs/components/ActivityStatus';
import DocumentPill from '@/modules/process/activity-runs/components/DocumentPill';
import CustomTagRenderer from 'components/common/table/CustomCellRenderers/CustomTagRenderer';
import { DATA_TABLE_CONFIG } from 'components/common/table/table.constants';
import { CUSTOM_COLUMNS_TYPE } from 'components/common/table/table.types';

export const LISTING_COLUMNS: ColDef[] = [
  {
    field: 'title',
    headerName: 'Datasets',
    headerClass: 'px-6!',
    cellRenderer: (params: ICellRendererParams) => {
      return (
        <Link href={getDatasetRouteById(params.data.id)} className='flex h-full w-full items-center px-6!'>
          <div className='f-13-500 flex items-center gap-2.5'>
            <Image src={DATASET_ICON} alt='dataset' width={20} height={20} />
            {params.value}
          </div>
        </Link>
      );
    },
  },
  {
    field: 'description',
    headerName: 'Description',
    headerClass: 'px-7.5!',
    cellRenderer: (params: ICellRendererParams) => {
      return (
        <Link href={getDatasetRouteById(params.data.id)} className='flex h-full w-full items-center px-6!'>
          <DescriptionWithTooltip {...params} />
        </Link>
      );
    },
  },
  {
    field: '',
    headerName: '',
    headerClass: 'px-6!',
    cellRenderer: (params: ICellRendererParams) => {
      return (
        <div className='flex h-full w-full items-center'>
          <EditNameDescription {...params} />
        </div>
      );
    },
    width: 108,
    flex: 0,
    minWidth: 108,
    cellClass: cn(DATA_TABLE_CONFIG.cellClass, 'hidden-cell px-6!'),
    sortable: false,
  },
  {
    field: '',
    headerName: '',
    headerClass: 'px-6!',
    cellRenderer: (params: ICellRendererParams) => {
      return (
        <Link href={getDatasetRouteById(params.data.id)} className='flex h-full w-full items-center px-6!'>
          <SvgSpriteLoader id='arrow-narrow-right' width={14} height={14} color={COLORS.GRAY_900} />
        </Link>
      );
    },
    width: 108,
    flex: 0,
    minWidth: 108,
    cellClass: cn(DATA_TABLE_CONFIG.cellClass, 'hidden-cell'),
    sortable: false,
  },
];

export const CustomColumnsMapping: Record<CUSTOM_COLUMNS_TYPE, (props: ICellRendererParams) => React.JSX.Element> = {
  [CUSTOM_COLUMNS_TYPE.TAG]: CustomTagRenderer,
  [CUSTOM_COLUMNS_TYPE.CHIP]: CustomChipRenderer,
  [CUSTOM_COLUMNS_TYPE.STATUS_BADGE]: StatusBadgeCell,
  [CUSTOM_COLUMNS_TYPE.USER_AVATAR]: RecipientNameCell,
  [CUSTOM_COLUMNS_TYPE.ACTIVITY_DOCUMENT]: ActivityDocument,
  [CUSTOM_COLUMNS_TYPE.ACTIVITY_CURRENT_STATUS]: ActivityCurrentStatus,
  [CUSTOM_COLUMNS_TYPE.ACTIVITY_STATUS]: ActivityStatus,
  [CUSTOM_COLUMNS_TYPE.BANK_NAME]: BankNameCell,
  [CUSTOM_COLUMNS_TYPE.PAYMENTS_ACCOUNT_STATUS]: PaymentsAccountStatusCell,
  [CUSTOM_COLUMNS_TYPE.DOCUMENT]: DocumentPill,
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
export const DatasetActionMessages = {
  [DATASET_ACTION_TYPE.TAGGING]: TaggingMessages,
  [DATASET_ACTION_TYPE.RULE_DELETION]: RuleDeletionMessages,
  [DATASET_ACTION_TYPE.UPDATE_MISSING_FIELD]: UpdateMissingFieldsMessages,
};

export const COLUMN_WIDTHS = {
  ACTIVITY_ARTIFACT: 800,
  ACTIVITY_STATUS: 44,
  ACTIVITY_DOCUMENT: 200,
  BASE: 150,
  EXTRA_CHAR_WIDTH: 7,
  CHAR_THRESHOLD: 17,
} as const;

export const COLUMN_TYPE_WIDTH_MAP = {
  [CUSTOM_COLUMNS_TYPE.ACTIVITY_CURRENT_STATUS]: COLUMN_WIDTHS.ACTIVITY_ARTIFACT,
  [CUSTOM_COLUMNS_TYPE.ACTIVITY_STATUS]: COLUMN_WIDTHS.ACTIVITY_STATUS,
  [CUSTOM_COLUMNS_TYPE.ACTIVITY_DOCUMENT]: COLUMN_WIDTHS.ACTIVITY_DOCUMENT,
} as const;

export const enum ColumnType {
  ID = 'id',
  _ZAMP_ID = '_zamp_id',
}

export const enum SourceType {
  EDIT = 'edit',
  API = 'api',
}
