import ImageKitImage from '@/components/ImageKitImage';
import { NEEDS_ATTENTION_EMPTY_STATE } from '@/constants/icons';

const EmptyState = () => {
  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-y-2'>
      <div className='relative flex h-[150px] w-[190px] items-center justify-center'>
        <ImageKitImage
          src={NEEDS_ATTENTION_EMPTY_STATE}
          alt='Your processes will appear here once you get started'
          className='h-full w-full object-cover object-center'
          width={190}
          height={150}
        />
      </div>
      <p className='f-14-400 text-GRAY_700 max-w-[260px] text-center text-wrap wrap-break-word'>
        Your processes will appear here once you get started
      </p>
    </div>
  );
};

export default EmptyState;
