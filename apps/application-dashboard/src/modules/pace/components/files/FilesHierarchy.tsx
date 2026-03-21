'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ImageLoader from '@/components/common/loader/ImageLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import type { FileItem, SortDirection, SortOption } from '@/modules/pace/components/files/file-tree.types';
import { SORT_DIRECTION, SORT_OPTION } from '@/modules/pace/components/files/file-tree.types';
import FilesEmptyState from '@/modules/pace/components/files/FilesEmptyState';
import FilesToolbar from '@/modules/pace/components/files/FilesToolbar';
import FileTree from '@/modules/pace/components/files/FileTree';
import { useFileUploadContext } from '@/modules/pace/context/FileUploadContext';
import { LazyFileTreeProvider } from '@/modules/pace/context/LazyFileTreeContext';
import { useLazyFileTree } from '@/modules/pace/hooks/useLazyFileTree';
import { defaultFnType } from '@/types/commonTypes';

const SEARCH_DEBOUNCE_MS = 300;

interface FilesHierarchyProps {
  onSelectFile?: (file: FileItem | null) => void;
  selectedFile?: FileItem | null;
  onFileMoved?: (oldPath: string, newFile: FileItem) => void;
  onFileDeleted?: (deletedPath: string) => void;
  onFileCreated?: (newFile: FileItem) => void;
}

const FilesHierarchy = ({
  onSelectFile,
  selectedFile,
  onFileMoved,
  onFileDeleted,
  onFileCreated,
}: FilesHierarchyProps) => {
  // State
  const collapseAllRef = useRef<defaultFnType | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>(SORT_OPTION.NAME);
  const [sortDirection, setSortDirection] = useState<SortDirection>(SORT_DIRECTION.DESC);

  // Hooks
  const { uploadFiles, uploadFolder, uploadingItems, clearUploadingItems, registerLoadFolder } = useFileUploadContext();

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
  } = useLazyFileTree({ uploadingItems, searchQuery: debouncedSearchQuery });

  const toggleSortDirection = useCallback(() => {
    setSortDirection((prev) => (prev === SORT_DIRECTION.ASC ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC));
  }, []);

  const handleCollapseAllChange = useCallback((collapseAll: () => void) => {
    collapseAllRef.current = collapseAll;
  }, []);

  const handleCollapseAll = useCallback(() => {
    collapseAllRef.current?.();
  }, []);

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
    if (!selectedFile || files.length === 0 || !onSelectFile) return;

    const updatedFile = files.find((f) => f.path === selectedFile.path);

    if (updatedFile && updatedFile.mtime_ms !== selectedFile.mtime_ms) {
      onSelectFile(updatedFile);
    }
  }, [files, selectedFile, onSelectFile]);

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
    <div className='bg-BG_GRAY_2 border-GRAY_400 relative flex w-2/5 flex-col border-r'>
      <FilesToolbar
        searchQuery={searchInput}
        onSearchChange={setSearchInput}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortDirection={sortDirection}
        onSortDirectionToggle={toggleSortDirection}
        onCollapseAll={handleCollapseAll}
      />
      <CommonWrapper
        isLoading={isInitialLoading}
        isError={isError}
        refetchFunction={refetch}
        isNoData={files.length === 0}
        noDataBanner={<FilesEmptyState />}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={150} height={150} className='bg-BG_GRAY_2' />}
        className='flex-1 overflow-y-auto [scrollbar-width:none]'
        disableAnimation
      >
        <LazyFileTreeProvider
          addOptimistic={addOptimistic}
          removeOptimistic={removeOptimistic}
          confirmAddition={confirmAddition}
          confirmDeletion={confirmDeletion}
          loadFolder={loadFolder}
        >
          <FileTree
            files={files}
            searchQuery={debouncedSearchQuery}
            searchResults={searchResults}
            isSearching={isSearching}
            sortBy={sortBy}
            sortDirection={sortDirection}
            selectedPath={selectedFile?.path ?? null}
            onSelectFile={onSelectFile}
            onFileMoved={onFileMoved}
            onFileDeleted={onFileDeleted}
            onFileCreated={onFileCreated}
            onUploadFiles={handleUploadFiles}
            onUploadFolder={handleUploadFolder}
            onCollapseAllChange={handleCollapseAllChange}
            loadingFolders={loadingFolders}
            loadedFolders={loadedFolders}
            loadFolder={loadFolder}
          />
        </LazyFileTreeProvider>
      </CommonWrapper>
    </div>
  );
};

export default FilesHierarchy;
