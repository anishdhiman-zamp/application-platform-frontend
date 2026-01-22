'use client';

import { FC } from 'react';
import ImageKitImage from '@/components/ImageKitImage';
import { DONE_EMPTY_STATE, TEAM_MEMBERS_EMPTY_STATE } from '@/constants/icons';

interface SkillsEmptyStateProps {
  searchQuery?: string;
}

const SkillsEmptyState: FC<SkillsEmptyStateProps> = ({ searchQuery }) => {
  const hasSearchQuery = Boolean(searchQuery);

  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-y-2'>
      <div className='relative flex h-[150px] w-[190px] items-center justify-center'>
        <ImageKitImage
          src={hasSearchQuery ? TEAM_MEMBERS_EMPTY_STATE : DONE_EMPTY_STATE}
          alt={hasSearchQuery ? 'No skills found' : 'No skills yet'}
          className='h-full w-full object-cover object-center'
          width={hasSearchQuery ? 222 : 190}
          height={hasSearchQuery ? 181 : 150}
        />
      </div>
      <div className='f-14-400 text-GRAY_600 text-center'>
        {hasSearchQuery
          ? `No skills found matching "${searchQuery}"`
          : 'No skills yet. Upload your first skill to get started.'}
      </div>
    </div>
  );
};

export default SkillsEmptyState;
