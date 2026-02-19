'use client';

import { useState } from 'react';
import type { FileItem } from '@/modules/pace/components/files/file-tree.types';
import FilesHeader from '@/modules/pace/components/files/FilesHeader';
import FilesHierarchy from '@/modules/pace/components/files/FilesHierarchy';
import FilesPreview from '@/modules/pace/components/files/FilesPreview';

const FilesPage = () => {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  return (
    <div className='mx-auto flex h-full w-full max-w-[1024px] flex-col gap-y-4 pt-15'>
      <FilesHeader />
      <div className='border-GRAY_400 flex h-full overflow-hidden rounded-t-xl border'>
        <FilesHierarchy selectedFile={selectedFile} onSelectFile={setSelectedFile} />
        <FilesPreview selectedFile={selectedFile} />
      </div>
    </div>
  );
};

export default FilesPage;
