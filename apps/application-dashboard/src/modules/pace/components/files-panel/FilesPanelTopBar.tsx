'use client';

import { useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { Maximize2, Minimize2, PanelRightClose } from 'lucide-react';
import FilesPanelAddTabMenu from '@/modules/pace/components/files-panel/FilesPanelAddTabMenu';
import FilesPanelTabStrip from '@/modules/pace/components/files-panel/FilesPanelTabStrip';
import { usePaceContext } from '@/modules/pace/pace.context';

const FilesPanelTopBar = () => {
  const { isFilesPanelExpanded, toggleFilesPanelExpanded, closeFilesPanel } = usePaceContext();

  const [isTabsOverflowing, setIsTabsOverflowing] = useState(false);

  return (
    <div className='border-GRAY_400 bg-BG_WHITE flex h-[54px] shrink-0 items-center justify-between gap-x-2 border-b p-3'>
      <div className='flex min-w-0 flex-1 items-center gap-x-1 overflow-hidden'>
        <FilesPanelTabStrip onOverflowChange={setIsTabsOverflowing} />
      </div>
      <div className='flex shrink-0 items-center gap-x-1'>
        {isTabsOverflowing && <FilesPanelAddTabMenu align='end' />}
        <Button
          variant='ghost'
          size='icon'
          className='text-GRAY_700 hover:text-GRAY_1000 hover:bg-GRAY_100 size-7 rounded p-1.5'
          onClick={toggleFilesPanelExpanded}
          title={isFilesPanelExpanded ? 'Collapse files panel' : 'Expand files panel to full width'}
          aria-label={isFilesPanelExpanded ? 'Collapse files panel' : 'Expand files panel'}
          aria-pressed={isFilesPanelExpanded}
        >
          {isFilesPanelExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='text-GRAY_700 hover:text-GRAY_1000 hover:bg-GRAY_100 size-7 rounded p-1.5'
          onClick={closeFilesPanel}
          title='Hide files panel'
          aria-label='Hide files panel'
        >
          <PanelRightClose size={14} />
        </Button>
      </div>
    </div>
  );
};

export default FilesPanelTopBar;
