'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useListFilesQuery } from '@/apis/filesystem';
import ImageLoader from '@/components/common/loader/ImageLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import type { FileItem, SortDirection, SortOption } from '@/modules/pace/components/files/file-tree.types';
import { FILE_TYPE, SORT_DIRECTION, SORT_OPTION } from '@/modules/pace/components/files/file-tree.types';
import FilesEmptyState from '@/modules/pace/components/files/FilesEmptyState';
import FileTree from '@/modules/pace/components/files/FileTree';
import FilesPanelToolbar from '@/modules/pace/components/files-panel/FilesPanelToolbar';
import { useFileUploadContext } from '@/modules/pace/context/FileUploadContext';
import { useFilesystemStatus } from '@/modules/pace/hooks/useFilesystemStatus';
import { TAB_TYPE } from '@/modules/pace/pace.types';
import { defaultFnType } from '@/types/commonTypes';

const FilesPanelContent = () => {
  const collapseAllRef = useRef<defaultFnType | null>(null);
  const { uploadFiles, uploadFolder, uploadingItems, clearUploadingItems } = useFileUploadContext();
  const { openTab } = useDynamicTabs({ type: TAB_TYPE.FILE });
  const {
    isFilesystemActive,
    isFilesystemStatusLoading,
    isFilesystemError,
    refetch: refetchStatus,
  } = useFilesystemStatus();

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>(SORT_OPTION.NAME);
  const [sortDirection, setSortDirection] = useState<SortDirection>(SORT_DIRECTION.DESC);

  const {
    data: files,
    isLoading: isLoadingFiles,
    isError: isErrorFiles,
    refetch: refetchFiles,
  } = useListFilesQuery({ depth: -1 }, { refetchOnMountOrArgChange: false });

  const filesWithUploading = useMemo(() => {
    const fileList = files?.files ?? [];

    if (uploadingItems?.length === 0) {
      return fileList;
    }

    const existingPaths = new Set(fileList.map((f) => f.path));
    const newItems = uploadingItems.filter((item) => !existingPaths.has(item.path));

    if (newItems.length === 0) {
      return fileList;
    }

    return [...fileList, ...newItems];
  }, [files?.files, uploadingItems]);

  const toggleSortDirection = useCallback(() => {
    setSortDirection((prev) => (prev === SORT_DIRECTION.ASC ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC));
  }, []);

  const handleCollapseAllChange = useCallback((collapseAll: () => void) => {
    collapseAllRef.current = collapseAll;
  }, []);

  const handleCollapseAll = useCallback(() => {
    collapseAllRef.current?.();
  }, []);

  const handleSelectFile = useCallback(
    (file: FileItem | null) => {
      if (!file || file.type === FILE_TYPE.DIRECTORY) return;

      openTab(file.path, file.name);
    },
    [openTab],
  );

  const handleUploadFiles = useCallback(
    (fileList: FileList, targetPath: string) => {
      uploadFiles(fileList, targetPath);
    },
    [uploadFiles],
  );

  const handleUploadFolder = useCallback(
    (fileList: FileList, targetPath: string) => {
      uploadFolder(fileList, targetPath);
    },
    [uploadFolder],
  );

  useEffect(() => {
    if (uploadingItems.length === 0) return;

    const allExist = uploadingItems.every((item) => files?.files?.some((f) => f.path === item.path));

    if (allExist) {
      clearUploadingItems();
    }
  }, [files?.files, uploadingItems, clearUploadingItems]);

  if (isFilesystemStatusLoading || (!isFilesystemActive && !isFilesystemError)) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={100} height={100} />
      </div>
    );
  }

  if (isFilesystemError) {
    return (
      <div className='flex flex-1 items-center justify-center p-4'>
        <CommonWrapper
          isError
          refetchFunction={refetchStatus}
          skeletonType={SkeletonTypes.CUSTOM}
          loader={null}
          className='flex-1'
          disableAnimation
        >
          {null}
        </CommonWrapper>
      </div>
    );
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <FilesPanelToolbar
        searchQuery={searchInput}
        onSearchChange={setSearchInput}
        onDebouncedSearchChange={setDebouncedSearchQuery}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortDirection={sortDirection}
        onSortToggle={toggleSortDirection}
        onCollapseAll={handleCollapseAll}
      />
      <CommonWrapper
        isLoading={isLoadingFiles}
        isError={isErrorFiles}
        refetchFunction={refetchFiles}
        isNoData={filesWithUploading.length === 0}
        noDataBanner={<FilesEmptyState />}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={100} height={100} className='bg-white' />}
        className='flex-1 overflow-y-auto px-3 pt-1.5 pb-3 [scrollbar-width:none]'
        disableAnimation
      >
        <FileTree
          files={filesWithUploading}
          searchQuery={debouncedSearchQuery}
          sortBy={sortBy}
          sortDirection={sortDirection}
          selectedPath={null}
          onSelectFile={handleSelectFile}
          onUploadFiles={handleUploadFiles}
          onUploadFolder={handleUploadFolder}
          onCollapseAllChange={handleCollapseAllChange}
        />
      </CommonWrapper>
    </div>
  );
};

export default FilesPanelContent;
