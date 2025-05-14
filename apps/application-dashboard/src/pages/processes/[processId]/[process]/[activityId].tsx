import { type ReactElement, useEffect, useRef, useState } from 'react';
import { type ImperativePanelHandle, ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@zamp-platform/ui';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { useAppDispatch } from '@/hooks/toolkit';
import Logs from '@/modules/process/activity-logs/ActivityLogs';
import Summary from '@/modules/process/activity-summary/Summary';
import Artifacts from '@/modules/process/artifacts/Artifacts';
import { RESIZABLE_PANEL_ID } from '@/modules/process/process.constant';
import { addBreadcrumb } from '@/store/slices/layout-configs';
import { cn } from '@/utils/common';

const Activity = () => {
  const { processId, process, rowid } = useParams();
  const panelRef = useRef<ImperativePanelHandle>(null);
  const appDispatch = useAppDispatch();

  console.log('processId', processId, process, rowid);

  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSummary, setShowSummary] = useState(true);

  const handleDragging = (dragging: boolean) => setIsDragging(dragging);

  const toggleExpand = () => setIsExpanded((prev) => !prev);

  const closeArtifacts = () => {
    setShowSummary(true);
    setIsExpanded(false);
  };

  useEffect(() => {
    appDispatch(
      addBreadcrumb({
        title: 'Activity Logs',
      }),
    );
  }, []);

  useEffect(() => {
    if (!isExpanded) {
      panelRef.current?.resize(50);
    }
  }, [isExpanded]);

  return (
    <ResizablePanelGroup direction='horizontal' className='h-full w-full'>
      <ResizablePanel
        id={RESIZABLE_PANEL_ID.LOGS}
        order={1}
        defaultSize={showSummary ? 70 : isExpanded ? 0 : 50}
        minSize={isExpanded ? 0 : 30}
        maxSize={isExpanded ? 0 : 70}
        className={cn('transition-all duration-300 ease-in-out', {
          '!transition-none': isDragging,
        })}
        ref={panelRef}
      >
        <Logs setShowSummary={setShowSummary} />
      </ResizablePanel>

      <ResizableHandle
        withHandle
        disabled={showSummary}
        onDragging={handleDragging}
        className={cn('cursor-col-resize', {
          'cursor-default': showSummary,
          'bg-black': isDragging && !showSummary,
          'opacity-0': isExpanded && !isDragging,
          'opacity-100': !isExpanded && !isDragging,
          'transition-opacity duration-300 ease-in-out': !isDragging,
        })}
        handleClassName={cn('bg-white', {
          'bg-black border-black': isDragging,
        })}
      />

      {!showSummary && (
        <ResizablePanel
          id={RESIZABLE_PANEL_ID.ARTIFACTS}
          order={2}
          defaultSize={50}
          className={cn('transition-all duration-300 ease-in-out', {
            '!transition-none': isDragging,
          })}
        >
          <Artifacts onClose={closeArtifacts} onExpand={toggleExpand} />
        </ResizablePanel>
      )}

      {showSummary && (
        <ResizablePanel
          id={RESIZABLE_PANEL_ID.SUMMARY}
          order={3}
          defaultSize={30}
          minSize={30}
          maxSize={30}
          className={cn('transition-all duration-300 ease-in-out', {
            '!transition-none': isDragging,
          })}
        >
          <Summary />
        </ResizablePanel>
      )}
    </ResizablePanelGroup>
  );
};

Activity.getLayout = (page: ReactElement) => (
  <div className='h-full'>
    <DashboardLayout>{page}</DashboardLayout>
  </div>
);

export default Activity;
