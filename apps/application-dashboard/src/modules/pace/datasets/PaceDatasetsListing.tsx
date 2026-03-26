'use client';

import { useEffect, useMemo } from 'react';
import { ChevronRight, Database } from 'lucide-react';
import { LIST_TABLES_QUERY } from 'modules/pace/datasets/paceDatasets.constants';
import Link from 'next/link';
import { useExecuteAgentDbQueryMutation } from '@/apis/agentManagedDb';
import ImageLoader from '@/components/common/loader/ImageLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { getChatDatasetDetailRoute } from '@/constants/routeConfig';

const PaceDatasetsListing = () => {
  const [executeQuery, { data, isLoading }] = useExecuteAgentDbQueryMutation();

  useEffect(() => {
    executeQuery({ query: LIST_TABLES_QUERY });
  }, [executeQuery]);

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
                    <Link href={getChatDatasetDetailRoute(row.id)} className='f-13-500 flex items-center gap-2.5'>
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

export default PaceDatasetsListing;
