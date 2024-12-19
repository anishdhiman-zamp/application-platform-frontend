import React from 'react';
import { NOTEBOOK_ICON } from 'constants/icons';
import Image from 'next/image';
interface PageNavTabProps {
  label: string;
}

const PageNavTab = ({ label }: PageNavTabProps) => {
  return (
    <div className='flex items-center gap-3 text-GRAY_900 px-1 py-2.5 f-13-500 hover:bg-GRAY_20 rounded-md cursor-pointer select-none'>
      <Image
        width={16}
        height={16}
        alt='page file'
        className='w-[14px] align-middle cursor-pointer'
        src={NOTEBOOK_ICON}
        priority={true}
      />
      <div>{label}</div>
    </div>
  );
};

export default PageNavTab;
