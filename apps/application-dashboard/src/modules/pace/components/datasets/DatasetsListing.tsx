'use client';

import { useMemo } from 'react';
import { ChevronRight, Database } from 'lucide-react';
import { LIST_TABLES_QUERY } from 'modules/pace/components/datasets/datasets.constants';
import Link from 'next/link';
import { useAgentDbReadQuery } from '@/apis/agentManagedDb';
import ImageLoader from '@/components/common/loader/ImageLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import EmptyState from '@/components/EmptyState';
import { DONE_EMPTY_STATE, ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { getDatasetDetailRoute } from '@/constants/routeConfig';

const DatasetsListing = () => {
  const { data, isLoading } = useAgentDbReadQuery({ query: LIST_TABLES_QUERY });

  const rows = useMemo(() => {
    if (!data?.rows) return [];

    return data.rows.map((row) => ({
      id: row.table_name as string,
      title: row.table_name as string,
      description: (row.description as string) ?? '',
    }));
  }, [data]);

  return (
    <div className='bg-BG_WHITE flex h-full w-full flex-1 flex-col'>
      <div className='border-GRAY_400 flex items-center border-b px-10 pt-10 pb-8'>
        <h1 className='f-18-500'>Datasets</h1>
      </div>
      <div className='flex-1 overflow-y-auto'>
        <CommonWrapper
          isLoading={isLoading}
          loader={<ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />}
          skeletonType={SkeletonTypes.CUSTOM}
          className='h-full'
          isNoData={!isLoading && rows.length === 0}
          noDataBanner={
            <EmptyState
              imageSrc={DONE_EMPTY_STATE}
              imageAlt='No datasets'
              title='No datasets found'
              description='Datasets will appear here when available.'
            />
          }
        >
          <table className='w-full'>
            <thead>
              <tr className='border-GRAY_400 border-b'>
                <th className='text-GRAY_700 f-11-450 px-10 py-2.5 text-left font-normal'>Datasets</th>
                <th className='text-GRAY_700 f-11-450 px-10 py-2.5 text-left font-normal'>Description</th>
                <th className='w-10' />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className='border-GRAY_400 hover:bg-BG_GRAY_1 group border-b transition-colors'>
                  <td className='px-10 py-4'>
                    <Link href={getDatasetDetailRoute(row.id)} className='f-13-500 flex items-center gap-2.5'>
                      <Database width={16} height={16} className='text-GRAY_700 shrink-0' />
                      {row.title}
                    </Link>
                  </td>
                  <td className='text-GRAY_700 f-12-400 px-10 py-4'>{row.description || '- -'}</td>
                  <td className='pr-6'>
                    <ChevronRight
                      width={14}
                      height={14}
                      className='text-GRAY_700 opacity-0 transition-opacity group-hover:opacity-100'
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CommonWrapper>
      </div>
    </div>
  );
};

export default DatasetsListing;
