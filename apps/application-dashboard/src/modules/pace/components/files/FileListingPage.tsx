'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LazyFileTreeProvider } from 'modules/pace/context/LazyFileTreeContext';
import { useLazyFileTree } from 'modules/pace/hooks/useLazyFileTree';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ImageLoader from '@/components/common/loader/ImageLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { ROUTES_PATH } from '@/constants/routeConfig';
import type { FileItem, SortDirection, SortOption } from '@/modules/pace/components/files/file-tree.types';
import { FILE_TYPE, SORT_DIRECTION, SORT_OPTION } from '@/modules/pace/components/files/file-tree.types';
import FileListingDetailPanel from '@/modules/pace/components/files/FileListingDetailPanel';
import FilesEmptyState from '@/modules/pace/components/files/FilesEmptyState';
import FileTree from '@/modules/pace/components/files/FileTree';
import FilesPanelToolbar from '@/modules/pace/components/files-panel/FilesPanelToolbar';
import { buildFilePanelClosePath } from '@/modules/pace/components/page-side-panel/page-side-panel.utils';
import PageSidePanel from '@/modules/pace/components/page-side-panel/PageSidePanel';
import { SEARCH_DEBOUNCE_MS } from '@/modules/pace/components/tasks/constants/tasks.constants';
import { useFileUploadContext } from '@/modules/pace/context/FileUploadContext';
import { TAB_QUERY_PARAM } from '@/modules/pace/pace.types';
import { defaultFnType } from '@/types/commonTypes';

const FileListingPage = () => {
  const collapseAllRef = useRef<defaultFnType | null>(null);
  const { uploadFiles, uploadFolder, uploadingItems, clearUploadingItems, registerLoadFolder } = useFileUploadContext();
  const router = useRouter();
  const pathname = usePathname() ?? ROUTES_PATH.CHAT_FILES;
  const searchParams = useSearchParams();
  const selectedFilePath = searchParams?.get(TAB_QUERY_PARAM.FILE) ?? '';

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

  const handleOpenFile = useCallback(
    (path: string) => {
      const filePath = `${ROUTES_PATH.CHAT_FILES}?${TAB_QUERY_PARAM.FILE}=${encodeURIComponent(path)}`;

      router.push(filePath);
    },
    [router],
  );

  const handleSelectFile = (file: FileItem | null) => {
    if (!file || file.type === FILE_TYPE.DIRECTORY) return;

    handleOpenFile(file.path);
  };

  const handleCloseFilePanel = useCallback(() => {
    router.push(buildFilePanelClosePath(pathname, searchParams));
  }, [pathname, router, searchParams]);

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

  return (
    <div className='relative h-full min-h-0 w-full overflow-hidden'>
      <div className='bg-BG_WHITE flex h-full min-h-0 w-full flex-col overflow-hidden'>
        <div className='border-GRAY_400 flex h-[54px] shrink-0 items-center border-b px-4'>
          <h1 className='f-14-550 text-GRAY_1000 min-w-0 truncate'>Files</h1>
        </div>
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
              onOpenFile={handleOpenFile}
              loadingFolders={loadingFolders}
              loadedFolders={loadedFolders}
              onLoadFolder={loadFolder}
            />
          </CommonWrapper>
        </LazyFileTreeProvider>
      </div>
      <PageSidePanel
        open={Boolean(selectedFilePath)}
        ariaLabel='File preview'
        onClose={handleCloseFilePanel}
        widthStorageId='files'
        header={<></>}
      >
        {selectedFilePath && <FileListingDetailPanel filePath={selectedFilePath} onClose={handleCloseFilePanel} />}
      </PageSidePanel>
    </div>
  );
};

export default FileListingPage;
