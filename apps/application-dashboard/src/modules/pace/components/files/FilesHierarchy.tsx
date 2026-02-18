'use client';

import { useState } from 'react';
import type { FileItem } from 'modules/pace/components/files/file-tree.types';
import { MOCK_FILES } from 'modules/pace/components/files/files.constants';
import FilesToolbar, { SortDirection, SortOption } from 'modules/pace/components/files/FilesToolbar';
import FileTree from 'modules/pace/components/files/FileTree';

interface FilesHierarchyProps {
  onSelectFile?: (file: FileItem | null) => void;
  selectedFile?: FileItem | null;
}

const FilesHierarchy = ({ onSelectFile, selectedFile }: FilesHierarchyProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date_modified');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div className='bg-BG_GRAY_2 border-GRAY_400 w-2/5 overflow-y-auto border-r'>
      <FilesToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortDirection={sortDirection}
        onSortDirectionToggle={toggleSortDirection}
      />

      <FileTree
        files={MOCK_FILES}
        searchQuery={searchQuery}
        sortBy={sortBy}
        sortDirection={sortDirection}
        selectedPath={selectedFile?.path ?? null}
        onSelectFile={onSelectFile}
      />
    </div>
  );
};

export default FilesHierarchy;
