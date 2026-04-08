'use client';

import { useMemo } from 'react';
import { Button } from '@zamp-platform/ui';
import { ChevronRight, Database, Plus } from 'lucide-react';
import { DATASETS_POLL_INTERVAL_MS, LIST_TABLES_QUERY } from 'modules/pace/components/datasets/datasets.constants';
import { preserveSidebarParam } from 'modules/pace/pace.utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { snakeCaseToSentenceCase } from 'utils/common';
import { type AgentDbQueryRequest, useAgentDbReadQuery } from '@/apis/agentManagedDb';
import ImageLoader from '@/components/common/loader/ImageLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import EmptyState from '@/components/EmptyState';
import { DONE_EMPTY_STATE, ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { getDatasetDetailRoute, ROUTES_PATH } from '@/constants/routeConfig';

const LISTING_QUERY_ARG: AgentDbQueryRequest = { query: LIST_TABLES_QUERY };

const DatasetsListing = () => {
  const router = useRouter();
  const { data, isLoading } = useAgentDbReadQuery(LISTING_QUERY_ARG, {
    pollingInterval: DATASETS_POLL_INTERVAL_MS,
    skipPollingIfUnfocused: true,
  });

  const rows = useMemo(() => {
    if (!data?.rows) return [];

    return data.rows.map((row) => ({
      id: row.table_name as string,
      title: row.table_name ? snakeCaseToSentenceCase(row.table_name as string) : '',
    }));
  }, [data]);

  return (
    <div className='flex h-full w-full flex-1 flex-col'>
      <div className='border-GRAY_400 flex items-center border-b pb-8'>
        <h1 className='f-18-500 flex-1'>Datasets</h1>
        <Link href={preserveSidebarParam(ROUTES_PATH.CHAT_SETTINGS_DATASETS_NEW)}>
          <Button size='medium' className='flex items-center gap-1.5'>
            <Plus className='h-4 w-4' />
            Create dataset
          </Button>
        </Link>
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
                <th className='text-GRAY_700 f-11-450 px-6 py-2.5 text-left font-normal'>Datasets</th>
                <th className='w-27' />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className='border-GRAY_400 hover:bg-BG_GRAY_1 group cursor-pointer border-b transition-colors'
                  onClick={() => router.push(preserveSidebarParam(getDatasetDetailRoute(row.id)))}
                >
                  <td className='px-6 py-4'>
                    <span className='f-13-500 flex items-center gap-2.5'>
                      <Database width={16} height={16} className='text-GRAY_700 shrink-0' />
                      {row.title}
                    </span>
                  </td>
                  <td className='w-27 px-6'>
                    <div className='opacity-0 transition-opacity group-hover:opacity-100'>
                      <ChevronRight width={14} height={14} className='text-GRAY_700' />
                    </div>
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
