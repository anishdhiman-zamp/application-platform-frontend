'use client';

import { useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import FilesPanelContent from '@/modules/pace/components/files-panel/FilesPanelContent';
import { FILES_PANEL_ENTER_TRANSITION, FILES_PANEL_EXIT_TRANSITION } from '@/modules/pace/pace.animations';
import { FILES_PANEL_WIDTH } from '@/modules/pace/pace.constants';
import { usePaceContext } from '@/modules/pace/pace.context';

const PANEL_ANIMATION = {
  initial: { x: FILES_PANEL_WIDTH, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: FILES_PANEL_ENTER_TRANSITION,
  },
  exit: {
    x: FILES_PANEL_WIDTH,
    opacity: 0,
    transition: FILES_PANEL_EXIT_TRANSITION,
  },
} as const;

const PORTAL_SELECTORS =
  '[role="menu"], [role="listbox"], [role="dialog"], [data-radix-popper-content-wrapper], [data-radix-menu-content]';

const isPortalOpen = () => document.querySelector(PORTAL_SELECTORS) !== null;

const FilesPanel = () => {
  const { filesPanelOpen, filesPanelPinned, scheduleFilesPanelClose, cancelFilesPanelClose } = usePaceContext();

  const panelRef = useRef<HTMLDivElement>(null);
  const isInsideZoneRef = useRef(false);

  const isInPanelColumn = useCallback((clientX: number) => {
    const panel = panelRef.current;

    if (!panel) return false;

    const rect = panel.getBoundingClientRect();

    return clientX >= rect.left && clientX <= rect.right;
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

  useEffect(() => {
    if (!filesPanelOpen || filesPanelPinned) return;

    document.addEventListener('mousemove', handleDocumentMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      isInsideZoneRef.current = false;
    };
  }, [filesPanelOpen, filesPanelPinned, handleDocumentMouseMove]);

  return (
    <AnimatePresence>
      {filesPanelOpen && (
        <motion.div
          ref={panelRef}
          initial={PANEL_ANIMATION.initial}
          animate={PANEL_ANIMATION.animate}
          exit={PANEL_ANIMATION.exit}
          style={{ width: FILES_PANEL_WIDTH }}
          className='border-GRAY_400 bg-BG_WHITE shadow-side-drawer-inner absolute top-[42px] right-2 bottom-0 z-50 flex flex-col overflow-hidden rounded-t-xl border'
          onMouseEnter={handleMouseEnter}
        >
          <FilesPanelContent />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FilesPanel;
