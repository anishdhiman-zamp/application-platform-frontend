'use client';

import FilesPageContent from '@/modules/pace/components/files/FilesPageContent';
import { useSyncedUrlParam } from '@/modules/pace/hooks/useSyncedSearchParam';

const FilesPage = () => {
  const filePath = useSyncedUrlParam('f');

  return <FilesPageContent filePath={filePath} />;
};

export default FilesPage;
