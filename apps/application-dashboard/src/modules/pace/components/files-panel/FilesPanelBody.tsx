'use client';

import { FileText } from 'lucide-react';
import AgentTabsContainer from '@/modules/pace/components/agents/components/AgentTabsContainer';
import FileTabsContainer from '@/modules/pace/components/file-viewer/FileTabsContainer';
import { usePaceContext } from '@/modules/pace/pace.context';

const FilesPanelBody = () => {
  const { hasActiveFileTab, hasActiveAgentTab } = usePaceContext();

  if (hasActiveAgentTab) {
    return (
      <div className='min-h-0 flex-1 overflow-hidden'>
        <AgentTabsContainer />
      </div>
    );
  }

  if (!hasActiveFileTab) {
    return (
      <div className='bg-BG_WHITE flex h-full flex-col items-center justify-center gap-y-2 p-6 text-center'>
        <FileText className='text-GRAY_400 size-8' />
        <p className='text-GRAY_700 f-13-500'>No file selected</p>
        <p className='text-GRAY_500 f-12-400'>Pick a file from the tree on the right to start viewing.</p>
      </div>
    );
  }

  return (
    <div className='min-h-0 flex-1 overflow-hidden'>
      <FileTabsContainer />
    </div>
  );
};

export default FilesPanelBody;
