import React, { FC } from 'react';
import { EmptyStateListingPropsType } from 'modules/team/people.types';

const EmptyStateListing: FC<EmptyStateListingPropsType> = ({ title = 'Nothing to show up' }) => {
  return <span className='f-16-500 text-GRAY_600 flex h-3/5 w-full items-center justify-center'>{title}</span>;
};

export default EmptyStateListing;
