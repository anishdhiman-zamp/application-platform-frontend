'use client';

import { useSearchParams } from 'next/navigation';
import FilesPageContent from '@/modules/pace/components/files/FilesPageContent';

const FilesPage = () => {
  const searchParams = useSearchParams();
  const filePath = searchParams?.get('f') ?? null;

  return <FilesPageContent filePath={filePath} />;
};

export default FilesPage;
