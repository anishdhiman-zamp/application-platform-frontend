'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FolderClosedIcon, Switch, toast } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import AgentTabEmptyState from 'modules/pace/components/agents/components/AgentTabEmptyState';
import { FILE_TYPE } from 'modules/pace/components/files/file-tree.types';
import { useGetAgentFileAccessQuery, useToggleAgentFileAccessMutation } from '@/apis/agents';
import { useListFilesQuery } from '@/apis/filesystem';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { useAppSelector } from '@/hooks/toolkit';
import FolderListSkeleton from '@/modules/pace/components/agents/skeletons/FolderListSkeleton';
import type { RootState } from '@/store';

interface AgentFolderListProps {
  agentId: string;
  agentAvatarSrc?: string;
  isActive?: boolean;
  skipFetch?: boolean;
}

const AgentFolderList = ({ agentId, agentAvatarSrc, isActive = true, skipFetch = false }: AgentFolderListProps) => {
  const hasBeenActiveRef = useRef(isActive);
  const isFirstVisit = !hasBeenActiveRef.current && isActive;

  if (isActive) hasBeenActiveRef.current = true;

  const shouldSkip = !hasBeenActiveRef.current || skipFetch;
  const userId = useAppSelector((state: RootState) => state.user.user?.user_id) ?? '';

  const { data, isLoading, isError, refetch } = useListFilesQuery({ depth: 1 }, { skip: shouldSkip });
  const { data: fileAccessData } = useGetAgentFileAccessQuery({ agentId, userId }, { skip: shouldSkip || !userId });
  const [toggleFileAccess] = useToggleAgentFileAccessMutation();

  // Build access map from API response
  const accessMap = useMemo(() => {
    const map = new Map<string, boolean>();

    fileAccessData?.folders?.forEach((f: { path: string; has_access: boolean }) => {
      map.set(f.path, f.has_access);
    });

    return map;
  }, [fileAccessData]);

  const [enabledPaths, setEnabledPaths] = useState<Set<string>>(new Set());

  const files = useMemo(
    () =>
      (data?.files ?? []).filter(
        (f) => f.type === FILE_TYPE.DIRECTORY && !f.path.includes('/') && !/^agent-[0-9a-f]{12}$/.test(f.name),
      ),
    [data?.files],
  );

  const handleToggle = async (path: string) => {
    const grantAccess = !enabledPaths.has(path);

    // Optimistic update
    setEnabledPaths((prev) => {
      const next = new Set(prev);

      if (grantAccess) {
        next.add(path);
      } else {
        next.delete(path);
      }

      return next;
    });

    try {
      await toggleFileAccess({ agentId, userId, folderPath: path, grantAccess }).unwrap();
      toast.success(grantAccess ? 'Access granted' : 'Access revoked');
    } catch {
      // Revert on failure
      setEnabledPaths((prev) => {
        const next = new Set(prev);

        if (grantAccess) {
          next.delete(path);
        } else {
          next.add(path);
        }

        return next;
      });
      toast.error('Failed to update file access');
    }
  };

  // Sync from API response
  useEffect(() => {
    if (accessMap.size > 0) {
      const enabled = new Set<string>();

      accessMap.forEach((hasAccess, path) => {
        if (hasAccess) enabled.add(path);
      });
      setEnabledPaths(enabled);
    }
  }, [accessMap]);

  useEffect(() => {
    if (isActive && !isFirstVisit && !skipFetch) refetch();
  }, [isActive, skipFetch]);

  return (
    <CommonWrapper
      isLoading={shouldSkip || isLoading}
      isError={isError}
      refetchFunction={refetch}
      isNoData={!isLoading && files?.length === 0}
      noDataBanner={<AgentTabEmptyState agentAvatarSrc={agentAvatarSrc} description='No Files Found' />}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<FolderListSkeleton rowCount={12} />}
      className='flex flex-col'
      disableAnimation
    >
      <p className='text-GRAY_700 f-14-450 mb-4 ml-2.5'>What folders can the agent access?</p>
      <div className='border-GRAY_400 flex flex-col rounded-xl border'>
        {files.map((file, index) => (
          <div
            key={file.path}
            className={cn(
              'flex items-center justify-between px-3.5 py-3.5',
              index < files.length - 1 && 'border-GRAY_400 border-b',
            )}
          >
            <div className='flex items-center gap-3'>
              <FolderClosedIcon size={16} weight='fill' className='text-BLUE_600 shrink-0' />
              <span className='f-14-500 text-GRAY_1000'>{file?.name}</span>
            </div>
            <Switch
              size='medium'
              checked={enabledPaths.has(file.path)}
              onCheckedChange={() => handleToggle(file.path)}
            />
          </div>
        ))}
      </div>
    </CommonWrapper>
  );
};

export default AgentFolderList;
