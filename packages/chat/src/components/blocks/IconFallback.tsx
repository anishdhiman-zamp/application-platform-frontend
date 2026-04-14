import { FileIcon } from '@zamp-platform/ui';

interface IconFallbackProps {
  fileName: string;
}

const IconFallback = ({ fileName }: IconFallbackProps) => (
  <div className='bg-GRAY_50 flex size-full items-center justify-center'>
    <FileIcon extension={fileName || 'txt'} className='size-10 rounded-lg' iconClassName='size-6' />
  </div>
);

IconFallback.displayName = 'IconFallback';

export default IconFallback;
