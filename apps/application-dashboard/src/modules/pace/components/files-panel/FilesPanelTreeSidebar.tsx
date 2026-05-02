'use client';

import FilesPanelContent from '@/modules/pace/components/files-panel/FilesPanelContent';

const FilesPanelTreeSidebar = () => {
  return (
    <div className='border-GRAY_400 bg-BG_WHITE flex h-full min-h-0 flex-col border-l'>
      <FilesPanelContent />
    </div>
  );
};

export default FilesPanelTreeSidebar;
