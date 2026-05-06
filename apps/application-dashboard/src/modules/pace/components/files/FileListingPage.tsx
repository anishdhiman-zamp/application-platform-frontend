'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LazyFileTreeProvider } from 'modules/pace/context/LazyFileTreeContext';
import { useLazyFileTree } from 'modules/pace/hooks/useLazyFileTree';
import ImageLoader from '@/components/common/loader/ImageLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import PageContainer from '@/components/layouts/PageContainer';
import PageTitleBar from '@/components/layouts/PageTitleBar';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import type { FileItem, SortDirection, SortOption } from '@/modules/pace/components/files/file-tree.types';
import { FILE_TYPE, SORT_DIRECTION, SORT_OPTION } from '@/modules/pace/components/files/file-tree.types';
import FilesEmptyState from '@/modules/pace/components/files/FilesEmptyState';
import FileTree from '@/modules/pace/components/files/FileTree';
import FilesPanelToolbar from '@/modules/pace/components/files-panel/FilesPanelToolbar';
import { SEARCH_DEBOUNCE_MS } from '@/modules/pace/components/tasks/constants/tasks.constants';
import { useFileUploadContext } from '@/modules/pace/context/FileUploadContext';
import { FILES_LISTING_CONVERSATION_ID } from '@/modules/pace/pace.constants';
import { usePaceConversationContext, usePaceLayoutContext } from '@/modules/pace/pace.context';
import { TAB_QUERY_PARAM, TAB_TYPE } from '@/modules/pace/pace.types';
import { defaultFnType } from '@/types/commonTypes';

const FileListingPage = () => {
  const collapseAllRef = useRef<defaultFnType | null>(null);
  const { uploadFiles, uploadFolder, uploadingItems, clearUploadingItems, registerLoadFolder } = useFileUploadContext();
  const { openTab } = useDynamicTabs({ type: TAB_TYPE.FILE });
  const { setTreeSidebarOpen } = usePaceLayoutContext();
  const { setActiveConversationId } = usePaceConversationContext();

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>(SORT_OPTION.NAME);
  const [sortDirection, setSortDirection] = useState<SortDirection>(SORT_DIRECTION.DESC);

  const {
    files,
    searchResults,
    isSearching,
    isInitialLoading,
    isError,
    loadingFolders,
    loadedFolders,
    loadFolder,
    refetch,
    addOptimistic,
    removeOptimistic,
    confirmAddition,
    confirmDeletion,
    pruneServerFiles,
    renameServerFiles,
  } = useLazyFileTree({ uploadingItems, searchQuery: debouncedSearchQuery });

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === SORT_DIRECTION.ASC ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC));
  };

  const handleCollapseAllChange = (collapseAll: defaultFnType) => {
    collapseAllRef.current = collapseAll;
  };

  const handleCollapseAll = () => {
    collapseAllRef.current?.();
  };

  const handleSelectFile = (file: FileItem | null) => {
    if (!file || file.type === FILE_TYPE.DIRECTORY) return;

    setTreeSidebarOpen(false);

    // Stay on /chat/files — open the FilesPanel inline beside the listing instead of
    // navigating away to /chat (the default URL the FILE tab registry would build).
    const filePath = `${ROUTES_PATH.CHAT_FILES}?${TAB_QUERY_PARAM.FILE}=${encodeURIComponent(file.path)}`;

    openTab(file.path, file.name, undefined, filePath);
  };

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
    registerLoadFolder(loadFolder);
  }, [registerLoadFolder, loadFolder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchInput);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (uploadingItems.length === 0) return;

    const allExist = uploadingItems.every((item) => files.some((f) => f.path === item.path && f.owner !== ''));

    if (allExist) {
      clearUploadingItems();
    }
  }, [files, uploadingItems, clearUploadingItems]);

  // Switch the dynamic-tabs slice to the dedicated files-listing bucket so any file
  // tab opened from here is isolated from chat conversations' open files.
  useEffect(() => {
    setActiveConversationId(FILES_LISTING_CONVERSATION_ID);
  }, [setActiveConversationId]);

  return (
    <PageContainer className='min-h-full'>
      <div className='flex min-h-0 flex-1 flex-col'>
        <PageTitleBar title='Files' />
        <FilesPanelToolbar
          variant='page'
          searchQuery={searchInput}
          onSearchChange={setSearchInput}
          onDebouncedSearchChange={setDebouncedSearchQuery}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortDirection={sortDirection}
          onSortToggle={toggleSortDirection}
          onCollapseAll={handleCollapseAll}
        />
        <LazyFileTreeProvider
          onAddOptimistic={addOptimistic}
          onRemoveOptimistic={removeOptimistic}
          onConfirmAddition={confirmAddition}
          onConfirmDeletion={confirmDeletion}
          onLoadFolder={loadFolder}
          onPruneServerFiles={pruneServerFiles}
          onRenameServerFiles={renameServerFiles}
        >
          <CommonWrapper
            isLoading={isInitialLoading}
            isError={isError}
            refetchFunction={refetch}
            isNoData={files.length === 0}
            noDataBanner={<FilesEmptyState />}
            skeletonType={SkeletonTypes.CUSTOM}
            loader={<ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={150} height={150} className='bg-BG_GRAY_2' />}
            className='min-h-0 flex-1 overflow-hidden'
            disableAnimation
          >
            <FileTree
              files={files}
              searchQuery={debouncedSearchQuery}
              searchResults={searchResults}
              isSearching={isSearching}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onUploadFiles={handleUploadFiles}
              onUploadFolder={handleUploadFolder}
              onCollapseAllChange={handleCollapseAllChange}
              onSelectFile={handleSelectFile}
              loadingFolders={loadingFolders}
              loadedFolders={loadedFolders}
              onLoadFolder={loadFolder}
            />
          </CommonWrapper>
        </LazyFileTreeProvider>
      </div>
    </PageContainer>
  );
};

export default FileListingPage;
