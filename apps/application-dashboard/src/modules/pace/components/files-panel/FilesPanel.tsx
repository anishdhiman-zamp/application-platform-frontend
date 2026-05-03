'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import FilesPanelBody from '@/modules/pace/components/files-panel/FilesPanelBody';
import { FilesPanelHeaderSlotProvider } from '@/modules/pace/components/files-panel/FilesPanelHeaderSlot';
import FilesPanelInternalResizeHandle from '@/modules/pace/components/files-panel/FilesPanelInternalResizeHandle';
import FilesPanelTopBar from '@/modules/pace/components/files-panel/FilesPanelTopBar';
import FilesPanelTreeSidebar from '@/modules/pace/components/files-panel/FilesPanelTreeSidebar';
import { NO_ANIMATION } from '@/modules/pace/pace.animations';
import { usePaceContext } from '@/modules/pace/pace.context';
import { SIDEBAR_TOGGLE_TRANSITION } from '@/utils/animations/sidebar.animations';

const FILES_PANEL_TRANSITION = SIDEBAR_TOGGLE_TRANSITION;

const FilesPanel = () => {
  const {
    filesPanelOpen,
    filesPanelWidth,
    isFilesPanelResizing,
    isFilesPanelHydrated,
    treeColumnWidth,
    isTreeColumnResizing,
    isTreeSidebarOpen,
    isFilesPanelExpanded,
    hasActivePanelTab,
    activeConversationId,
  } = usePaceContext();

  const prevConversationIdRef = useRef(activeConversationId);
  const isConversationSwitch = prevConversationIdRef.current !== activeConversationId;
  const shouldReduceMotion = useReducedMotion();
  const animatedWidth = isFilesPanelExpanded ? '100%' : filesPanelWidth;
  const baseTransition = shouldReduceMotion || isConversationSwitch ? NO_ANIMATION : FILES_PANEL_TRANSITION;
  const widthTransition = isFilesPanelResizing ? NO_ANIMATION : baseTransition;
  const treeTransition = isTreeColumnResizing ? NO_ANIMATION : baseTransition;
  const exitTransition =
    hasActivePanelTab && !shouldReduceMotion && !isConversationSwitch ? FILES_PANEL_TRANSITION : NO_ANIMATION;

  useEffect(() => {
    prevConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  return (
    <AnimatePresence>
      {filesPanelOpen && (
        <motion.div
          initial={isFilesPanelHydrated ? { width: 0 } : false}
          animate={{ width: animatedWidth }}
          exit={{ width: 0, transition: exitTransition }}
          transition={widthTransition}
          className={cn(
            'shadow-side-drawer-inner-left relative overflow-hidden',
            isFilesPanelExpanded ? 'min-w-0 flex-1' : 'shrink-0',
          )}
        >
          <motion.div
            initial={isFilesPanelHydrated ? { x: '100%', opacity: 0 } : false}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0, transition: exitTransition }}
            transition={baseTransition}
            style={{ willChange: 'transform, opacity' }}
            className='border-GRAY_400 bg-BG_WHITE absolute inset-0 flex min-h-0 flex-col overflow-hidden border-x border-b'
          >
            <FilesPanelTopBar />
            <FilesPanelHeaderSlotProvider>
              <div className='relative flex min-h-0 flex-1 overflow-hidden'>
                <motion.div
                  animate={{ paddingRight: isTreeSidebarOpen ? treeColumnWidth : 0 }}
                  transition={treeTransition}
                  className='flex min-w-0 flex-1 flex-col overflow-hidden'
                >
                  <FilesPanelBody key={activeConversationId ?? '__none__'} />
                </motion.div>
                <AnimatePresence>
                  {isTreeSidebarOpen && (
                    <motion.div
                      initial={{ x: '100%', opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: '100%', opacity: 0 }}
                      transition={treeTransition}
                      style={{ width: treeColumnWidth, willChange: 'transform, opacity' }}
                      className='border-GRAY_400 bg-BG_WHITE shadow-side-drawer-inner absolute inset-y-0 right-0 z-10 flex flex-row border-l'
                    >
                      <FilesPanelInternalResizeHandle />
                      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
                        <FilesPanelTreeSidebar />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FilesPanelHeaderSlotProvider>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FilesPanel;
