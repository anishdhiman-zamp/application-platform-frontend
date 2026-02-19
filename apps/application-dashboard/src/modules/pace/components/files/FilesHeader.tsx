import { Button } from '@zamp-platform/ui';
import { PlusIcon } from 'lucide-react';

const FilesHeader = () => {
  return (
    <div className='flex items-center justify-between'>
      <h1 className='f-20-500 text-GRAY_1000 shrink-0'>Files</h1>
      <Button
        size='small'
        leadingIcon={<PlusIcon className='size-4' />}
        className='f-12-500 w-[84px]! min-w-[84px]! justify-between rounded-md px-3! py-1.5!'
      >
        Upload
      </Button>
    </div>
  );
};

export default FilesHeader;
