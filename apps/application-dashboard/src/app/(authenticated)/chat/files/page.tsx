'use client';

import { useCallback, useState } from 'react';
import type { FileItem } from '@/modules/pace/components/files/file-tree.types';
import FilesHeader from '@/modules/pace/components/files/FilesHeader';
import FilesHierarchy from '@/modules/pace/components/files/FilesHierarchy';
import FilesPreview from '@/modules/pace/components/files/FilesPreview';

const FilesPage = () => {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const handleFileMoved = useCallback(
    (oldPath: string, newFile: FileItem) => {
      if (selectedFile?.path === oldPath) {
        setSelectedFile(newFile);
      } else if (selectedFile?.path.startsWith(oldPath + '/')) {
        const relativePath = selectedFile.path.slice(oldPath.length);

        setSelectedFile({
          ...selectedFile,
          path: newFile.path + relativePath,
          mtime_ms: Date.now(),
        });
      }
    },
    [selectedFile],
  );

  const handleFileDeleted = useCallback(
    (deletedPath: string) => {
      if (selectedFile?.path === deletedPath || selectedFile?.path.startsWith(deletedPath + '/')) {
        setSelectedFile(null);
      }
    },
    [selectedFile],
  );

  const handleFileCreated = useCallback((newFile: FileItem) => {
    setSelectedFile(newFile);
  }, []);

  return (
    <div className='mx-auto flex h-full w-full max-w-[1024px] flex-col gap-y-4 pt-15'>
      <FilesHeader />
      <div className='border-GRAY_400 flex h-full overflow-hidden rounded-t-xl border'>
        <FilesHierarchy
          selectedFile={selectedFile}
          onSelectFile={setSelectedFile}
          onFileMoved={handleFileMoved}
          onFileDeleted={handleFileDeleted}
          onFileCreated={handleFileCreated}
        />
        <FilesPreview selectedFile={selectedFile} />
      </div>
    </div>
  );
};

export default FilesPage;
