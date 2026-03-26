'use client';

import { useEffect, useMemo } from 'react';
import { LIST_TABLES_QUERY, PACE_DATASETS_LISTING_COLUMNS } from 'modules/pace/datasets/paceDatasets.constants';
import { useExecuteAgentDbQueryMutation } from '@/apis/agentManagedDb';
import ImageLoader from '@/components/common/loader/ImageLoader';
import DataTable from '@/components/common/table/DataTable';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';

const PaceDatasetsListing = () => {
  const [executeQuery, { data, isLoading }] = useExecuteAgentDbQueryMutation();
  const columns = useMemo(() => PACE_DATASETS_LISTING_COLUMNS, []);

  useEffect(() => {
    executeQuery({ query: LIST_TABLES_QUERY });
  }, [executeQuery]);

  const rows = useMemo(() => {
    if (!data?.rows) return [];

    return data.rows.map((row) => ({
      id: row.table_name,
      title: row.table_name,
      description: row.description ?? '',
    }));
  }, [data]);

  return (
    <div className='flex h-full w-full flex-1 flex-col'>
      <div className='border-GRAY_400 flex items-center border-b px-10 pt-10 pb-8'>
        <h1 className='f-18-500'>Datasets</h1>
      </div>
      <div className='flex-1 overflow-hidden'>
        <CommonWrapper
          isLoading={isLoading}
          loader={<ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />}
          skeletonType={SkeletonTypes.CUSTOM}
          className='h-full'
        >
          <div className='h-full overflow-hidden' id='full-height-cell-table'>
            <DataTable
              columns={columns}
              rows={rows}
              overrideThemeParams={{ cellHorizontalPadding: 0 }}
              gridStyle={{ height: '100%', width: '100%' }}
              suppressScrollOnNewData
            />
          </div>
        </CommonWrapper>
      </div>
    </div>
  );
};

export default PaceDatasetsListing;
