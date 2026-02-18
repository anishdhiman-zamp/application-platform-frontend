'use client';

import { useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { File, Folder } from 'lucide-react';
import type { FileItem, SortDirection, SortOption } from 'modules/pace/components/files/file-tree.types';
import { MOCK_FILES } from 'modules/pace/components/files/files.constants';
import FilesToolbar from 'modules/pace/components/files/FilesToolbar';
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
    <div className='bg-BG_GRAY_2 border-GRAY_400 relative flex w-2/5 flex-col border-r'>
      <FilesToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortDirection={sortDirection}
        onSortDirectionToggle={toggleSortDirection}
      />
      <div className='flex-1 overflow-y-auto pb-20 [scrollbar-width:none]'>
        <FileTree
          files={MOCK_FILES}
          searchQuery={searchQuery}
          sortBy={sortBy}
          sortDirection={sortDirection}
          selectedPath={selectedFile?.path ?? null}
          onSelectFile={onSelectFile}
        />
      </div>

      {/* File and Folder Create */}
      <div className='from-GRAY_200 absolute right-0 bottom-0 left-0 flex w-full items-center justify-center bg-linear-to-t to-transparent px-3 py-4 backdrop-blur-md'>
        <Button
          variant='outline'
          size='medium'
          className='f-12-500 gap-x-2.5 rounded-md bg-white px-3 py-2 hover:bg-white'
          style={{ minWidth: '216px' }}
        >
          <span className='text-GRAY_700'>Create new</span>
          <div className='flex items-center gap-1'>
            <Folder className='text-GRAY_1000 size-3.5' />
            <span className='text-GRAY_1000'>Folder</span>
            <span className='text-GRAY_700 mx-1'>/</span>
            <File className='text-GRAY_1000 size-3.5' />
            <span className='text-GRAY_1000'>File</span>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default FilesHierarchy;
