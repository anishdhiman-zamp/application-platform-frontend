'use client';

import { ReactNode, useMemo } from 'react';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FolderClosedIcon,
} from '@zamp-platform/ui';
import { useFileTreeNavigation } from '@/modules/pace/context/FileTreeNavigationContext';

const BREADCRUMB_MAX_VISIBLE_FOLDERS = 2;

const PathSeparator = () => (
  <BreadcrumbSeparator className='[&>svg]:hidden'>
    <span className='f-14-450 text-GRAY_500 shrink-0 select-none'>/</span>
  </BreadcrumbSeparator>
);

interface CrumbProps {
  icon: ReactNode;
  name: string;
  onClick?: () => void;
}

const Crumb = ({ icon, name, onClick }: CrumbProps) => (
  <BreadcrumbItem
    onClick={onClick}
    className='hover:bg-GRAY_100 group shrink-0 cursor-pointer gap-x-1 rounded-md px-1.5 py-1 transition-colors'
  >
    {icon}
    <BreadcrumbPage className='f-13-450 text-GRAY_900 group-hover:text-GRAY_1000 whitespace-nowrap transition-colors'>
      {name}
    </BreadcrumbPage>
  </BreadcrumbItem>
);

const FolderIcon = () => <FolderClosedIcon className='text-BLUE_600 size-4 shrink-0' weight='fill' />;

interface FilePathBreadcrumbProps {
  filePath: string;
  fileName: string;
  fileIcon: ReactNode;
}

const FilePathBreadcrumb = ({ filePath, fileName, fileIcon }: FilePathBreadcrumbProps) => {
  const { revealPathInTree } = useFileTreeNavigation();

  const folderSegments = useMemo(() => {
    const parts = filePath.split('/').filter(Boolean);

    return parts.slice(0, -1);
  }, [filePath]);

  const cumulativePaths = useMemo(
    () => folderSegments.map((_, i) => folderSegments.slice(0, i + 1).join('/')),
    [folderSegments],
  );

  const needsCollapse = folderSegments.length > BREADCRUMB_MAX_VISIBLE_FOLDERS;
  const firstSegment = folderSegments[0];
  const firstSegmentPath = cumulativePaths[0];
  const lastFolderIndex = folderSegments.length - 1;
  const lastFolderSegment = needsCollapse ? folderSegments[lastFolderIndex] : null;
  const lastFolderPath = needsCollapse ? cumulativePaths[lastFolderIndex] : null;
  const hiddenSegments = needsCollapse ? folderSegments.slice(1, -1) : [];
  const hiddenPaths = needsCollapse ? cumulativePaths.slice(1, -1) : [];
  const middleSegments = needsCollapse ? [] : folderSegments.slice(1);
  const middlePaths = needsCollapse ? [] : cumulativePaths.slice(1);

  return (
    <Breadcrumb>
      <BreadcrumbList className='gap-x-0.5 sm:gap-x-0.5'>
        {firstSegment && (
          <>
            <Crumb icon={<FolderIcon />} name={firstSegment} onClick={() => revealPathInTree(firstSegmentPath)} />
            <PathSeparator />
          </>
        )}
        {needsCollapse && (
          <>
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type='button'
                    aria-label='Show collapsed folders'
                    className='hover:bg-GRAY_100 focus-visible:ring-ring flex cursor-pointer items-center rounded-md px-1.5 py-1 transition-colors focus-visible:ring-2 focus-visible:outline-hidden'
                  >
                    <BreadcrumbEllipsis className='f-13-550 text-GRAY_700 size-auto'>
                      <span className='select-none'>...</span>
                    </BreadcrumbEllipsis>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='start' className='bg-BG_WHITE flex min-w-[160px] flex-col gap-y-0.5'>
                  {hiddenSegments.map((segment, index) => (
                    <DropdownMenuItem
                      key={`${segment}-${index}`}
                      onClick={() => revealPathInTree(hiddenPaths[index])}
                      className='f-13-450 text-GRAY_1000 hover:bg-GRAY_100 cursor-pointer gap-x-1 rounded-md'
                    >
                      <FolderIcon />
                      <span className='truncate'>{segment}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <PathSeparator />
            {lastFolderSegment && lastFolderPath && (
              <>
                <Crumb
                  icon={<FolderIcon />}
                  name={lastFolderSegment}
                  onClick={() => revealPathInTree(lastFolderPath)}
                />
                <PathSeparator />
              </>
            )}
          </>
        )}
        {middleSegments.map((segment, index) => (
          <span key={`${segment}-${index}`} className='flex items-center gap-x-0.5'>
            <Crumb icon={<FolderIcon />} name={segment} onClick={() => revealPathInTree(middlePaths[index])} />
            <PathSeparator />
          </span>
        ))}
        <Crumb icon={fileIcon} name={fileName} onClick={() => revealPathInTree(filePath)} />
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default FilePathBreadcrumb;
