'use client';

import { useEffect, useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { File, Folder } from 'lucide-react';
import CreateItemModal from 'modules/pace/components/files/CreateItemModal';
import type {
  CreateItemType,
  FileItem,
  SortDirection,
  SortOption,
} from 'modules/pace/components/files/file-tree.types';
import { CREATE_ITEM_TYPE, SORT_DIRECTION, SORT_OPTION } from 'modules/pace/components/files/file-tree.types';
import { MOCK_FILES } from 'modules/pace/components/files/files.constants';
import FilesToolbar from 'modules/pace/components/files/FilesToolbar';
import FileTree from 'modules/pace/components/files/FileTree';

const SEARCH_DEBOUNCE_MS = 300;

interface FilesHierarchyProps {
  onSelectFile?: (file: FileItem | null) => void;
  selectedFile?: FileItem | null;
}

const FilesHierarchy = ({ onSelectFile, selectedFile }: FilesHierarchyProps) => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>(SORT_OPTION.DATE_MODIFIED);
  const [sortDirection, setSortDirection] = useState<SortDirection>(SORT_DIRECTION.DESC);
  const [createModalType, setCreateModalType] = useState<CreateItemType | null>(null);

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === SORT_DIRECTION.ASC ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC));
  };

  const handleCreate = (name: string, path: string, type?: string) => {
    // TODO: Implement API call to create folder/file
    void name;
    void path;
    void type;
  };

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
      />
      <div className='flex-1 overflow-y-auto pb-20 [scrollbar-width:none]'>
        <FileTree
          files={MOCK_FILES}
          searchQuery={debouncedSearchQuery}
          sortBy={sortBy}
          sortDirection={sortDirection}
          selectedPath={selectedFile?.path ?? null}
          onSelectFile={onSelectFile}
        />
      </div>

      {/* File and Folder Create */}
      <div
        className='pointer-events-none absolute right-0 bottom-0 left-0 flex w-full items-center justify-center px-3 pt-12 pb-4'
        style={{
          background:
            'linear-gradient(to top, rgba(234, 234, 234, 1) 0%, rgba(234, 234, 234, 0.95) 30%, rgba(234, 234, 234, 0.7) 50%, rgba(234, 234, 234, 0.3) 70%, rgba(234, 234, 234, 0) 100%)',
        }}
      >
        <div className='pointer-events-auto flex items-center'>
          <Button
            variant='outline'
            size='medium'
            className='f-12-500 gap-x-1 rounded-r-none border-r-0 bg-white px-2 py-2 hover:bg-white'
            onClick={() => setCreateModalType(CREATE_ITEM_TYPE.FOLDER)}
          >
            <span className='text-GRAY_700 mr-1.5'>Create new</span>
            <Folder className='text-GRAY_1000 size-3.5' />
            <span className='text-GRAY_1000'>Folder</span>
          </Button>
          <span className='border-GRAY_400 text-GRAY_700 f-12-500 flex h-8 items-center border-y bg-white'>/</span>
          <Button
            variant='outline'
            size='medium'
            className='f-12-500 gap-x-1 rounded-l-none border-l-0 bg-white px-2 py-2 hover:bg-white'
            onClick={() => setCreateModalType(CREATE_ITEM_TYPE.FILE)}
          >
            <File className='text-GRAY_1000 size-3.5' />
            <span className='text-GRAY_1000'>File</span>
          </Button>
        </div>
      </div>

      {createModalType && (
        <CreateItemModal
          isOpen={!!createModalType}
          onOpenChange={(open) => !open && setCreateModalType(null)}
          itemType={createModalType}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
};

export default FilesHierarchy;
