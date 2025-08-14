import React from 'react';
import type { IRowNode } from 'ag-grid-community';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useFiltersContextStore } from '@/components/filter/filters.context';
import { getProcessActivityLogsRouteById } from '@/constants/routeConfig';
import type { MapAny } from '@/types/commonTypes';

const selectors = ['.combobox-trigger', '#combobox-content'];

interface ActivityLinkWrapperProps {
  children: React.ReactNode;
  data: MapAny;
  node: IRowNode;
}

const ActivityLinkWrapper = ({ children, data, node }: ActivityLinkWrapperProps) => {
  const params = useParams();
  const {
    state: { selectedFilters, totalRows },
  } = useFiltersContextStore();

  return (
    <Link
      href={getProcessActivityLogsRouteById(
        params?.processId as string,
        data?.id as string,
        data?.status as string,
        encodeURIComponent(JSON.stringify(selectedFilters)),
        node?.rowIndex ?? -1,
        totalRows,
      )}
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
