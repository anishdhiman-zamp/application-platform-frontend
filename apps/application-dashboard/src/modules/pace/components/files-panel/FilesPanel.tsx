'use client';

import { AnimatePresence, motion } from 'framer-motion';
import FilesPanelContent from '@/modules/pace/components/files-panel/FilesPanelContent';
import FilesPanelInternalResizeHandle from '@/modules/pace/components/files-panel/FilesPanelInternalResizeHandle';
import FilesPanelViewer from '@/modules/pace/components/files-panel/FilesPanelViewer';
import {
  FILES_PANEL_ENTER_TRANSITION,
  FILES_PANEL_EXIT_TRANSITION,
  FILES_PANEL_SPACER_TRANSITION,
  NO_ANIMATION,
} from '@/modules/pace/pace.animations';
import { FILES_PANEL_MAX_WIDTH } from '@/modules/pace/pace.constants';
import { usePaceContext } from '@/modules/pace/pace.context';

const FilesPanel = () => {
  const {
    filesPanelOpen,
    filesPanelWidth,
    isFilesPanelResizing,
    isFilesPanelHydrated,
    hasActiveFileTab,
    treeColumnWidth,
    isTreeColumnResizing,
  } = usePaceContext();

  const totalPanelWidth = hasActiveFileTab ? treeColumnWidth + 8 + filesPanelWidth : filesPanelWidth;
  const isResizingAny = isFilesPanelResizing || isTreeColumnResizing;

  return (
    <AnimatePresence>
      {filesPanelOpen && (
        <motion.div
          initial={isFilesPanelHydrated ? { x: FILES_PANEL_MAX_WIDTH, opacity: 0, width: totalPanelWidth } : false}
          animate={{
            x: 0,
            opacity: 1,
            width: totalPanelWidth,
            transition: {
              x: FILES_PANEL_ENTER_TRANSITION,
              opacity: FILES_PANEL_ENTER_TRANSITION,
              width: isResizingAny ? NO_ANIMATION : FILES_PANEL_SPACER_TRANSITION,
            },
          }}
          exit={{
            x: FILES_PANEL_MAX_WIDTH,
            opacity: 0,
            transition: FILES_PANEL_EXIT_TRANSITION,
          }}
          className='flex shrink-0 flex-col overflow-hidden'
        >
          <div className='border-GRAY_400 bg-BG_WHITE shadow-side-drawer-inner flex min-w-0 flex-1 overflow-hidden border'>
            {hasActiveFileTab ? (
              <>
                <div style={{ width: treeColumnWidth }} className='flex shrink-0 flex-col'>
                  <FilesPanelContent />
                </div>
                <FilesPanelInternalResizeHandle />
                <FilesPanelViewer />
              </>
            ) : (
              <div className='flex min-w-0 flex-1 flex-col'>
                <FilesPanelContent />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FilesPanel;
