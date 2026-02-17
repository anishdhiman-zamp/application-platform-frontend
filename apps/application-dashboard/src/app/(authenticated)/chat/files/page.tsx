import { FilesHeader, FilesHierarchy, FilesPreview } from '@/modules/pace/components/files';

const FilesPage = () => {
  return (
    <div className='mx-auto flex h-full w-full max-w-[1024px] flex-col gap-y-4 pt-15'>
      <FilesHeader />
      <div className='border-GRAY_400 flex h-full overflow-hidden rounded-t-xl border'>
        <FilesHierarchy />
        <FilesPreview />
      </div>
    </div>
  );
};

export default FilesPage;
