import ImageKitImage from '@/components/ImageKitImage';
import { TEAM_MEMBERS_EMPTY_STATE } from '@/constants/icons';

interface FileTreeEmptyStateProps {
  message?: string;
}

const FileTreeEmptyState = ({ message = 'No files match your search' }: FileTreeEmptyStateProps) => {
  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-y-2 py-8'>
      <div className='relative flex h-[150px] w-[190px] items-center justify-center'>
        <ImageKitImage
          src={TEAM_MEMBERS_EMPTY_STATE}
          alt='No files found'
          className='h-full w-full object-cover object-center'
          width={222}
          height={181}
        />
      </div>
      <p className='f-14-400 text-GRAY_600 text-center'>{message}</p>
    </div>
  );
};

export default FileTreeEmptyState;
