import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getProcessActivityLogsRouteById } from '@/constants/routeConfig';

const selectors = ['.combobox-trigger', '#combobox-content'];

const ActivityLinkWrapper = ({ children, data }: { children: React.ReactNode; data: any; selectors: string[] }) => {
  const params = useParams();

  return (
    <Link
      href={getProcessActivityLogsRouteById(params?.processId as string, data?.id as string, data?.status as string)}
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
        const target = e.target as HTMLElement;

        if (selectors.some((selector) => target.closest(selector))) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      className='flex h-full w-full items-center px-4 py-1'
    >
      <div className='min-w-0 flex-1 truncate'>{children}</div>
    </Link>
  );
};

export default ActivityLinkWrapper;
