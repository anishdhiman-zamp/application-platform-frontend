import ImageKitImage from '@/components/ImageKitImage';
import { NEEDS_ATTENTION_EMPTY_STATE } from '@/constants/icons';

interface ContentErrorStateProps {
  title: string;
  description: string;
}

const ContentErrorState = ({ title, description }: ContentErrorStateProps) => (
  <div className='flex flex-1 flex-col items-center justify-center gap-y-4'>
    <ImageKitImage src={NEEDS_ATTENTION_EMPTY_STATE} alt={title} className='object-contain' width={160} height={120} />
    <div className='flex flex-col items-center gap-y-2'>
      <p className='f-14-500 text-GRAY_700'>{title}</p>
      <p className='f-12-400 text-GRAY_600 max-w-[300px] text-center'>{description}</p>
    </div>
  </div>
);

export default ContentErrorState;
