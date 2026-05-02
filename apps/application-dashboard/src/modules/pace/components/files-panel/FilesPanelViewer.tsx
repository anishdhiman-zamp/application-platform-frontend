'use client';

import FileTabsContainer from 'modules/pace/components/file-viewer/FileTabsContainer';
import FilesPanelTabStrip from 'modules/pace/components/files-panel/FilesPanelTabStrip';

const FilesPanelViewer = () => {
  return (
    <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
      <FilesPanelTabStrip />
      <div className='min-h-0 flex-1 overflow-hidden'>
        <FileTabsContainer />
      </div>
    </div>
  );
};

export default FilesPanelViewer;
