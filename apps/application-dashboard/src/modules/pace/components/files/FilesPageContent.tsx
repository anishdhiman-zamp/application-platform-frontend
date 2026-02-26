'use client';

import { useCallback, useRef, useState } from 'react';
import FileTabsContainer from 'modules/pace/components/file-viewer/FileTabsContainer';
import type { FileItem } from '@/modules/pace/components/files/file-tree.types';
import FilesHeader from '@/modules/pace/components/files/FilesHeader';
import FilesHierarchy from '@/modules/pace/components/files/FilesHierarchy';
import FilesPreview from '@/modules/pace/components/files/FilesPreview';

interface FilesPageContentProps {
  filePath: string | null;
}

const FilesPageContent = ({ filePath }: FilesPageContentProps) => {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const selectedFileRef = useRef<FileItem | null>(null);

  selectedFileRef.current = selectedFile;

  const handleFileMoved = useCallback((oldPath: string, newFile: FileItem) => {
    const currentSelected = selectedFileRef.current;

    if (currentSelected?.path === oldPath) {
      setSelectedFile(newFile);
    } else if (currentSelected?.path.startsWith(oldPath + '/')) {
      const relativePath = currentSelected.path.slice(oldPath.length);

      setSelectedFile({
        ...currentSelected,
        path: newFile.path + relativePath,
        mtime_ms: Date.now(),
      });
    }
  }, []);

  const handleFileDeleted = useCallback((deletedPath: string) => {
    const currentSelected = selectedFileRef.current;

    if (currentSelected?.path === deletedPath || currentSelected?.path.startsWith(deletedPath + '/')) {
      setSelectedFile(null);
    }
  }, []);

  const handleFileCreated = useCallback((newFile: FileItem) => {
    setSelectedFile(newFile);
  }, []);

  if (filePath) {
    return <FileTabsContainer currentFilePath={filePath} />;
  }

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

export default FilesPageContent;
