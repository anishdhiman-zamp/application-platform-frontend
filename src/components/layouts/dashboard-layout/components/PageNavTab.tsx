import React from 'react';
import { NOTEBOOK_ICON } from 'constants/icons';
import { ROUTES_PATH } from 'constants/routeConfig';
import Image from 'next/image';
import { useRouter } from 'next/router';

interface PageNavTabProps {
  label: string;
  pageId: string;
}

const PageNavTab = ({ label, pageId }: PageNavTabProps) => {
  const router = useRouter();

  return (
    <div className='flex items-center gap-3 text-GRAY_900 px-1 py-2.5 f-13-500 hover:bg-GRAY_20 rounded-md cursor-pointer select-none'
      onClick={() => router.push(`${ROUTES_PATH.PAGE}/${pageId}`)}>
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
