'use client';

import { useCallback, useMemo, useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { useUserIdentity } from 'hooks/useUserIdentity';
import { ChevronRight, Database, Pencil, Plus } from 'lucide-react';
import { LIST_TABLES_QUERY } from 'modules/pace/components/datasets/datasets.constants';
import EditDatasetDialog from 'modules/pace/components/datasets/EditDatasetDialog';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type AgentDbQueryRequest, useAgentDbReadQuery, useGetDatasetRolesQuery } from '@/apis/agentManagedDb';
import ImageLoader from '@/components/common/loader/ImageLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import EmptyState from '@/components/EmptyState';
import { DONE_EMPTY_STATE, ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { getDatasetDetailRoute, ROUTES_PATH } from '@/constants/routeConfig';

const LISTING_QUERY_ARG: AgentDbQueryRequest = { query: LIST_TABLES_QUERY };

const DatasetsListing = () => {
  const router = useRouter();
  const { data, isLoading } = useAgentDbReadQuery(LISTING_QUERY_ARG);
  const { data: rolesData } = useGetDatasetRolesQuery({});
  const { userId, isSystemAdmin } = useUserIdentity();

  const [editTarget, setEditTarget] = useState<{ tableName: string; description: string } | null>(null);

  const editableTableNames = useMemo(() => {
    if (isSystemAdmin) return null;
    if (!rolesData?.roles || !userId) return new Set<string>();

    const editable = new Set<string>();

    for (const role of rolesData.roles) {
      if (role.user_id === userId && role.role === 'admin') {
        editable.add(role.table_name);
      }
    }

    return editable;
  }, [rolesData, userId, isSystemAdmin]);

  const canEdit = useCallback(
    (tableName: string) => {
      if (editableTableNames === null) return true;

      return editableTableNames.has(tableName);
    },
    [editableTableNames],
  );

  const rows = useMemo(() => {
    if (!data?.rows) return [];

    return data.rows.map((row) => ({
      id: row.table_name as string,
      title: row.table_name as string,
      description: (row.description as string) ?? '',
    }));
  }, [data]);

  const existingTableNames = useMemo(() => new Set(rows.map((r) => r.id.toLowerCase())), [rows]);

  const handleEditSuccess = useCallback(() => {
    setEditTarget(null);
  }, []);

  return (
    <div className='bg-BG_WHITE flex h-full w-full flex-1 flex-col'>
      <div className='border-GRAY_400 flex items-center border-b px-10 pt-10 pb-8'>
        <h1 className='f-18-500 flex-1'>Datasets</h1>
        <Link href={ROUTES_PATH.CHAT_SETTINGS_DATASETS_NEW}>
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
                <th className='text-GRAY_700 f-11-450 px-10 py-2.5 text-left font-normal'>Datasets</th>
                <th className='text-GRAY_700 f-11-450 px-10 py-2.5 text-left font-normal'>Description</th>
                <th className='w-[108px]' />
                <th className='w-[108px]' />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className='border-GRAY_400 hover:bg-BG_GRAY_1 group cursor-pointer border-b transition-colors'
                  onClick={() => router.push(getDatasetDetailRoute(row.id))}
                >
                  <td className='px-10 py-4'>
                    <span className='f-13-500 flex items-center gap-2.5'>
                      <Database width={16} height={16} className='text-GRAY_700 shrink-0' />
                      {row.title}
                    </span>
                  </td>
                  <td className='text-GRAY_700 f-12-400 px-10 py-4'>{row.description || '- -'}</td>
                  <td className='w-[108px] px-6'>
                    {canEdit(row.id) && (
                      <div className='opacity-0 transition-opacity group-hover:opacity-100'>
                        <button
                          type='button'
                          className='text-GRAY_700 hover:text-GRAY_1000 cursor-pointer transition-colors'
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditTarget({ tableName: row.id, description: row.description });
                          }}
                        >
                          <Pencil width={14} height={14} />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className='w-[108px] px-6'>
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

      {editTarget && (
        <EditDatasetDialog
          isOpen
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
          tableName={editTarget.tableName}
          description={editTarget.description}
          existingTableNames={existingTableNames}
          listingQueryArg={LISTING_QUERY_ARG}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default DatasetsListing;
