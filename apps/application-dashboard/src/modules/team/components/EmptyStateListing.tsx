import { FC } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { EmptyStateListingPropsType } from 'modules/team/people.types';
import ImageKitImage from '@/components/ImageKitImage';
import { TEAM_MEMBERS_EMPTY_STATE } from '@/constants/icons';

const EmptyStateListing: FC<EmptyStateListingPropsType> = ({ title = 'Nothing to show up', className }) => {
  return (
    <div className={cn('flex h-3/5 w-full items-center justify-center', className)}>
      <div className='flex flex-col items-center justify-center gap-y-3'>
        <ImageKitImage src={TEAM_MEMBERS_EMPTY_STATE} alt='No team members were added' width={222} height={181} />
        <span className='f-16-500 text-GRAY_600 flex h-3/5 w-full items-center justify-center'>{title}</span>
      </div>
    </div>
  );
};

export default EmptyStateListing;
