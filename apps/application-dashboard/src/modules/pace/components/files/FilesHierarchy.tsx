'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useListFilesQuery } from '@/apis/filesystem';
import ImageLoader from '@/components/common/loader/ImageLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import type { FileItem, SortDirection, SortOption } from '@/modules/pace/components/files/file-tree.types';
import { SORT_DIRECTION, SORT_OPTION } from '@/modules/pace/components/files/file-tree.types';
import FilesEmptyState from '@/modules/pace/components/files/FilesEmptyState';
import FilesToolbar from '@/modules/pace/components/files/FilesToolbar';
import FileTree from '@/modules/pace/components/files/FileTree';
import { useFileUploadContext } from '@/modules/pace/hooks/useFileUploadContext';

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
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>(SORT_OPTION.NAME);
  const [sortDirection, setSortDirection] = useState<SortDirection>(SORT_DIRECTION.DESC);

  const collapseAllRef = useRef<(() => void) | null>(null);

  const {
    data: files,
    isLoading: isLoadingFiles,
    isError: isErrorFiles,
    refetch: refetchFiles,
  } = useListFilesQuery({
    recursive: true,
  });
  const { uploadFiles, uploadFolder, uploadingItem, clearUploadingItem } = useFileUploadContext();

  const filesWithUploading = useMemo(() => {
    const fileList = files?.files ?? [];

    if (!uploadingItem) {
      return fileList;
    }

    const existsInList = fileList.some((f) => f.path === uploadingItem.path);

    if (existsInList) {
      return fileList;
    }

    return [...fileList, uploadingItem];
  }, [files?.files, uploadingItem]);

  useEffect(() => {
    if (!uploadingItem) return;

    const existsInList = files?.files?.some((f) => f.path === uploadingItem.path);

    if (existsInList) {
      clearUploadingItem();
    }
  }, [files?.files, uploadingItem, clearUploadingItem]);

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
    if (!selectedFile || !files?.files || !onSelectFile) return;

    const updatedFile = files.files.find((f) => f.path === selectedFile.path);

    if (updatedFile && updatedFile.mtime_ms !== selectedFile.mtime_ms) {
      onSelectFile(updatedFile);
    }
  }, [files?.files, selectedFile, onSelectFile]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchInput);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

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
        isLoading={isLoadingFiles}
        isError={isErrorFiles}
        refetchFunction={refetchFiles}
        isNoData={filesWithUploading.length === 0}
        noDataBanner={<FilesEmptyState />}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={150} height={150} className='bg-BG_GRAY_2' />}
        className='flex-1 overflow-y-auto [scrollbar-width:none]'
        disableAnimation
      >
        <FileTree
          files={filesWithUploading}
          searchQuery={debouncedSearchQuery}
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
        />
      </CommonWrapper>
    </div>
  );
};

export default FilesHierarchy;
