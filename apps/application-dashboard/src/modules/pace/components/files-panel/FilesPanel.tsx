'use client';

import { useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import FilesPanelContent from '@/modules/pace/components/files-panel/FilesPanelContent';
import FilesPanelResizeHandle from '@/modules/pace/components/layout/FilesPanelResizeHandle';
import {
  FILES_PANEL_ENTER_TRANSITION,
  FILES_PANEL_EXIT_TRANSITION,
  FILES_PANEL_SPACER_TRANSITION,
  NO_ANIMATION,
} from '@/modules/pace/pace.animations';
import { FILES_PANEL_MAX_WIDTH } from '@/modules/pace/pace.constants';
import { usePaceContext } from '@/modules/pace/pace.context';

const PORTAL_SELECTORS =
  '[role="menu"], [role="listbox"], [role="dialog"], [data-radix-popper-content-wrapper], [data-radix-menu-content]';
const EDGE_TRIGGER_WIDTH_PX = 6;

const isPortalOpen = () => document.querySelector(PORTAL_SELECTORS) !== null;

const FilesPanel = () => {
  const {
    filesPanelOpen,
    filesPanelPinned,
    filesPanelWidth,
    isFilesPanelResizing,
    toggleFilesPanel,
    scheduleFilesPanelClose,
    cancelFilesPanelClose,
  } = usePaceContext();

  const panelRef = useRef<HTMLDivElement>(null);
  const isInsideZoneRef = useRef(false);
  const isResizingRef = useRef(isFilesPanelResizing);

  isResizingRef.current = isFilesPanelResizing;
  const isFloating = filesPanelOpen && !filesPanelPinned;
  const showEdgeTrigger = !filesPanelOpen && !filesPanelPinned;

  const isInPanelColumn = useCallback((clientX: number) => {
    const panel = panelRef.current;

    if (!panel) return false;

    const rect = panel.getBoundingClientRect();
    const handlePadding = 8;

    return clientX >= rect.left - handlePadding && clientX <= rect.right;
  }, []);

  const handleMouseEnter = () => {
    cancelFilesPanelClose();
  };

  const handleDocumentMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isPortalOpen()) return;

      const inside = isInPanelColumn(e.clientX);

      if (inside && !isInsideZoneRef.current) {
        isInsideZoneRef.current = true;
        cancelFilesPanelClose();
      } else if (!inside && isInsideZoneRef.current) {
        isInsideZoneRef.current = false;
        scheduleFilesPanelClose();
      }
    },
    [isInPanelColumn, cancelFilesPanelClose, scheduleFilesPanelClose],
  );

  const handleEdgeEnter = useCallback(() => {
    if (filesPanelOpen || filesPanelPinned) return;

    toggleFilesPanel();
  }, [filesPanelOpen, filesPanelPinned, toggleFilesPanel]);

  useEffect(() => {
    if (!filesPanelOpen || filesPanelPinned) return;

    document.addEventListener('mousemove', handleDocumentMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      isInsideZoneRef.current = false;
    };
  }, [filesPanelOpen, filesPanelPinned, handleDocumentMouseMove]);

  return (
    <>
      {showEdgeTrigger && (
        <div
          className='fixed top-0 right-0 bottom-0 z-50'
          style={{ width: EDGE_TRIGGER_WIDTH_PX }}
          onMouseEnter={handleEdgeEnter}
        />
      )}
      <AnimatePresence>
        {filesPanelOpen && (
          <motion.div
            ref={panelRef}
            initial={{ x: FILES_PANEL_MAX_WIDTH, opacity: 0, width: filesPanelWidth }}
            animate={{
              x: 0,
              opacity: 1,
              width: filesPanelWidth,
              transition: {
                x: FILES_PANEL_ENTER_TRANSITION,
                opacity: FILES_PANEL_ENTER_TRANSITION,
                width: isFilesPanelResizing ? NO_ANIMATION : FILES_PANEL_SPACER_TRANSITION,
              },
            }}
            exit={{
              x: FILES_PANEL_MAX_WIDTH,
              opacity: 0,
              transition: FILES_PANEL_EXIT_TRANSITION,
            }}
            className='absolute top-[42px] right-2 bottom-0 z-50 flex shrink-0 flex-col'
            onMouseEnter={isFloating ? handleMouseEnter : undefined}
          >
            {isFloating && (
              <div className='absolute top-0 bottom-0 -left-2 z-10 w-2'>
                <FilesPanelResizeHandle />
              </div>
            )}
            <div className='border-GRAY_400 bg-BG_WHITE shadow-side-drawer-inner flex min-w-0 flex-1 flex-col overflow-hidden rounded-t-xl border'>
              <FilesPanelContent />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FilesPanel;
