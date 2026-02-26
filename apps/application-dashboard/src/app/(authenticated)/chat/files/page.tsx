import FilesPageContent from '@/modules/pace/components/files/FilesPageContent';

interface FilesPageProps {
  searchParams: Promise<{ f?: string }>;
}

const FilesPage = async ({ searchParams }: FilesPageProps) => {
  const { f: filePath = null } = await searchParams;

  return <FilesPageContent filePath={filePath} />;
};

export default FilesPage;
