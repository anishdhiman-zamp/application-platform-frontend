import React, { useRef, useState } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { WORKSPACE_ITEMS } from 'constants/dummyData';
import { useOnClickOutside } from 'hooks';
import { cn } from 'utils/common';
// import PageNavTab from 'components/layouts/dashboard-layout/components/PageNavTab';
import WorkspaceTab from 'components/layouts/dashboard-layout/components/WorkspaceTab';

interface WorkspaceType {
  workspace_id: string;
  label: string;
  color: string;
}

const WorkspaceSwitcher = () => {
  const [isWorkspacePopoverOpen, setIsWorkspacePopoverOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceType>(WORKSPACE_ITEMS[0]);
  const ref = useRef(null);

  useOnClickOutside(ref, () => {
    setIsWorkspacePopoverOpen(false);
  });

  const handleWorkspaceClick = (workspace: WorkspaceType) => {
    setSelectedWorkspace(workspace);
    setIsWorkspacePopoverOpen(false);
  };

  return (
    <div className='px-2' ref={ref}>
      <div className='relative hidden'>
        <div
          className='f-13-500 flex cursor-pointer items-center gap-1 px-2 py-2.5 select-none'
          onClick={() => setIsWorkspacePopoverOpen((prev) => !prev)}
        >
          <WorkspaceTab label={selectedWorkspace.label} className='pr-0' color={selectedWorkspace.color} />
          <SvgSpriteLoader
            iconCategory={ICON_SPRITE_TYPES.ARROWS}
            id='chevron-down'
            className={cn('-mb-0.5 transition-transform duration-300', isWorkspacePopoverOpen ? '-rotate-180' : '')}
          />
        </div>
        {isWorkspacePopoverOpen && (
          <div className='border-GRAY_400 absolute top-[90%] left-0 z-10 w-[264px] rounded-md border bg-white px-2 py-3'>
            {WORKSPACE_ITEMS.map((workspace) => (
              <WorkspaceTab
                key={workspace.workspace_id}
                label={workspace.label}
                onClick={() => handleWorkspaceClick(workspace)}
                isSelected={selectedWorkspace.workspace_id === workspace.workspace_id}
                color={workspace.color}
                className='gap-0.5'
              />
            ))}
          </div>
        )}
      </div>
      <div className='px-1 py-2.5'>
        <div className='f-11-600 text-GRAY_700 px-1.5 py-2'>Pages</div>
        {/* {PAGES_ITEMS.map((item) => (
          <PageNavTab key={item.label} label={item.label} />
        ))} */}
      </div>
    </div>
  );
};

export default WorkspaceSwitcher;
