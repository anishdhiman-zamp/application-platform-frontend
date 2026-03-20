'use client';

import { useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import FilesPanelContent from '@/modules/pace/components/files-panel/FilesPanelContent';
import { COLLAPSED_SIDEBAR_BEZIER } from '@/modules/pace/pace.animations';
import { FILES_PANEL_WIDTH } from '@/modules/pace/pace.constants';
import { usePaceContext } from '@/modules/pace/pace.context';

const PANEL_ANIMATION = {
  initial: { x: FILES_PANEL_WIDTH, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: FILES_PANEL_WIDTH, opacity: 0 },
  transition: COLLAPSED_SIDEBAR_BEZIER,
} as const;

const MOUSE_LEAVE_DELAY_MS = 200;

const PORTAL_SELECTORS =
  '[role="menu"], [role="listbox"], [role="dialog"], [data-radix-popper-content-wrapper], [data-radix-menu-content]';

const FilesPanel = () => {
  const { filesPanelOpen, filesPanelPinned, closeFilesPanel } = usePaceContext();

  const panelRef = useRef<HTMLDivElement>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearLeaveTimer = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  }, []);

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      if (filesPanelPinned) return;

      const relatedTarget = e.relatedTarget as HTMLElement | null;

      if (relatedTarget?.closest?.(PORTAL_SELECTORS)) return;

      leaveTimerRef.current = setTimeout(closeFilesPanel, MOUSE_LEAVE_DELAY_MS);
    },
    [filesPanelPinned, closeFilesPanel],
  );

  const handleMouseEnter = useCallback(() => {
    clearLeaveTimer();
  }, [clearLeaveTimer]);

  useEffect(() => {
    return () => clearLeaveTimer();
  }, [clearLeaveTimer]);

  return (
    <AnimatePresence>
      {filesPanelOpen && (
        <motion.div
          ref={panelRef}
          initial={PANEL_ANIMATION.initial}
          animate={PANEL_ANIMATION.animate}
          exit={PANEL_ANIMATION.exit}
          transition={PANEL_ANIMATION.transition}
          style={{ width: FILES_PANEL_WIDTH }}
          className='border-GRAY_400 bg-BG_WHITE shadow-side-drawer-inner absolute top-[42px] right-2 bottom-0 z-50 flex flex-col overflow-hidden rounded-t-xl border'
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
        >
          <FilesPanelContent />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FilesPanel;
