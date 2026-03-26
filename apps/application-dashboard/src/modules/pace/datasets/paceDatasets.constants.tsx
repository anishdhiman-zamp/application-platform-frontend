import { ColDef, ICellRendererParams } from 'ag-grid-community';
import Image from 'next/image';
import DescriptionWithTooltip from '@/components/common/table/CustomCellRenderers/DescriptionWithTooltip';
import { DATASET_ICON } from '@/constants/icons';

export const LIST_TABLES_QUERY = `
SELECT t.table_name,
       pg_catalog.obj_description(c.oid, 'pg_class') AS description
FROM information_schema.tables t
LEFT JOIN pg_catalog.pg_class c ON c.relname = t.table_name
  AND c.relnamespace = (SELECT oid FROM pg_catalog.pg_namespace WHERE nspname = t.table_schema)
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name
`.trim();

export const PACE_DATASETS_LISTING_COLUMNS: ColDef[] = [
  {
    field: 'title',
    headerName: 'Datasets',
    headerClass: 'px-6!',
    cellRenderer: (params: ICellRendererParams) => {
      return (
        <div className='flex h-full w-full items-center px-6!'>
          <div className='f-13-500 flex items-center gap-2.5'>
            <Image src={DATASET_ICON} alt='dataset' width={20} height={20} />
            {params.value}
          </div>
        </div>
      );
    },
  },
  {
    field: 'description',
    headerName: 'Description',
    headerClass: 'px-7.5!',
    cellRenderer: (params: ICellRendererParams) => {
      return (
        <div className='flex h-full w-full items-center px-6!'>
          <DescriptionWithTooltip {...params} />
        </div>
      );
    },
  },
];
