'use client';

import { useState } from 'react';
import FilesToolbar, { SortDirection, SortOption } from 'modules/pace/components/files/FilesToolbar';

const FilesHierarchy = () => {
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

      {/* File tree will go here */}
    </div>
  );
};

export default FilesHierarchy;
