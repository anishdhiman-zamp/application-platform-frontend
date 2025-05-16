import { type ReactElement, useEffect, useRef, useState } from 'react';
import { type ImperativePanelHandle, ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@zamp-platform/ui';
import { useSSE } from '@zamp-platform/utils';
import { useParams, useSearchParams } from 'next/navigation';
import { useLazyGetActivityArtifactsQuery, useLazyGetActivityLogsQuery } from '@/apis/processes';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { API_DOMAIN } from '@/constants/api.constants';
import { useAppDispatch } from '@/hooks/toolkit';
import Logs from '@/modules/process/activity-logs/ActivityLogs';
import Summary from '@/modules/process/activity-summary/SummarySection';
import Artifacts from '@/modules/process/artifacts/Artifacts';
import { RESIZABLE_PANEL_ID } from '@/modules/process/process.constant';
import { addBreadcrumb } from '@/store/slices/layout-configs';
import { cn } from '@/utils/common';

const Activity = () => {
  const { processId, activityId } = useParams();
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const panelRef = useRef<ImperativePanelHandle>(null);
  const appDispatch = useAppDispatch();

  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSummary, setShowSummary] = useState(true);

  const [getActivityLogs] = useLazyGetActivityLogsQuery();
  const [getActivityArtifacts] = useLazyGetActivityArtifactsQuery();

  const handleDragging = (dragging: boolean) => setIsDragging(dragging);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const closeArtifacts = () => {
    setShowSummary(true);
    setIsExpanded(false);
    panelRef.current?.resize(70);
  };

  const handleShowArtifacts = () => {
    setShowSummary(false);
    panelRef.current?.resize(50);
  };

  const handleUpdate = (event: MessageEvent) => {
    const data = event?.data;

    if (!data) return;

    getActivityLogs({ processId: processId as string, activityRunId: activityId as string });
    getActivityArtifacts({ processId: processId as string, activityRunId: activityId as string });
  };

  const { close: closeSSE } = useSSE({
    url: `${API_DOMAIN}/processes/events/${activityId}`,
    reconnectIntervalMs: 2000,
    idleTimeoutMs: 30000,
    eventListeners: {
      update: handleUpdate,
    },
    onError: (err) => console.error('SSE error:', err),
    onOpen: () => console.log('SSE connection opened'),
  });

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

  useEffect(() => {
    return () => {
      closeSSE();
    };
  }, []);

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
        <Logs
          processId={processId as string}
          activityId={activityId as string}
          status={status as string}
          handleShowArtifacts={handleShowArtifacts}
          className={cn('', {
            'opacity-0': isExpanded,
            'animate-fade-in': !isExpanded,
          })}
        />
      </ResizablePanel>

      <ResizableHandle
        withHandle
        disabled={showSummary || isExpanded}
        onDragging={handleDragging}
        className={cn('cursor-col-resize', {
          'cursor-default': showSummary || isExpanded,
          'bg-black': isDragging && !showSummary && !isExpanded,
          'opacity-0': isExpanded && !isDragging,
          'opacity-100': !isExpanded && !isDragging,
          'transition-opacity duration-300 ease-in-out': !isDragging,
        })}
        handleClassName={cn('bg-white', {
          'bg-black border-black': isDragging,
        })}
      />

      <ResizablePanel
        id={showSummary ? RESIZABLE_PANEL_ID.SUMMARY : RESIZABLE_PANEL_ID.ARTIFACTS}
        order={2}
        defaultSize={showSummary ? 30 : isExpanded ? 100 : 50}
        minSize={showSummary ? 30 : isExpanded ? 100 : 30}
        maxSize={showSummary ? 30 : isExpanded ? 100 : 70}
        className={cn('transition-all duration-300 ease-in-out', {
          '!transition-none': isDragging,
        })}
      >
        {showSummary ? (
          <Summary
            processId={processId as string}
            activityId={activityId as string}
            handleShowArtifacts={handleShowArtifacts}
          />
        ) : (
          <Artifacts onClose={closeArtifacts} onExpand={toggleExpand} isExpanded={isExpanded} />
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

Activity.getLayout = (page: ReactElement) => (
  <div className='h-full'>
    <DashboardLayout>{page}</DashboardLayout>
  </div>
);

export default Activity;
