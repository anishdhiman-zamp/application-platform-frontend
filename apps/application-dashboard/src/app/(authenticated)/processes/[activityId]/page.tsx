'use client';

import { useEffect, useRef, useState } from 'react';
import { captureException } from '@sentry/browser';
import { type ImperativePanelHandle, ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@zamp-platform/ui';
import { useSSE } from '@zamp-platform/utils';
import { useParams, useSearchParams } from 'next/navigation';
import {
  useLazyGetActivityArtifactsQuery,
  useLazyGetActivityLogsQuery,
  useLazyGetActivitySummaryQuery,
  useLazyGetArtifactsByArtifactIdQuery,
} from '@/apis/processes';
import { toast } from '@/components/common/toast/Toast';
import { API_DOMAIN } from '@/constants/api.constants';
import { getProcessActivityLogsRouteById, getProcessRouteById } from '@/constants/routeConfig';
import { useAppDispatch } from '@/hooks/toolkit';
import Logs from '@/modules/process/activity-logs/ActivityLogs';
import Summary from '@/modules/process/activity-summary/SummarySection';
import Artifacts from '@/modules/process/artifacts/Artifacts';
import { ARTIFACT_TAB_MAPPING, DEFAULT_ARTIFACT_TAB, RESIZABLE_PANEL_ID } from '@/modules/process/process.constant';
import { ARTIFACT_TYPE, CTA_ACTION, PDF_DATASET_TAB } from '@/modules/process/process.types';
import { resetBreadcrumb } from '@/store/slices/layout-configs';
import type { OtherArtifactsResponseType } from '@/types/api/processApi.types';
import { cn } from '@/utils/common';

const Activity = () => {
  const searchParams = useSearchParams();

  const processId = searchParams?.get('processId') as string;
  const process = searchParams?.get('process') as string;
  const activityId = useParams()?.activityId as string;

  const artifactIdFromUrl = searchParams?.get('artifactId');
  const artifactTypeFromUrl = searchParams?.get('artifactType');
  const status = searchParams?.get('status') as string;

  const panelRef = useRef<ImperativePanelHandle>(null);
  const appDispatch = useAppDispatch();

  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSummary, setShowSummary] = useState(artifactIdFromUrl ? false : true);
  const [activeTab, setActiveTab] = useState<PDF_DATASET_TAB>(PDF_DATASET_TAB.DATASET);
  const [artifactType, setArtifactType] = useState<ARTIFACT_TYPE>(
    (artifactTypeFromUrl as ARTIFACT_TYPE) ?? ARTIFACT_TYPE.PDF_DATASET,
  );
  const [artifactId, setArtifactId] = useState<string>(artifactIdFromUrl as string);

  const [getActivityLogs] = useLazyGetActivityLogsQuery();
  const [getArtifacts] = useLazyGetActivityArtifactsQuery();
  const [getActivitySummary] = useLazyGetActivitySummaryQuery();
  const [getArtifact, { isFetching: isLoadingArtifact }] = useLazyGetArtifactsByArtifactIdQuery();

  const handleDragging = (dragging: boolean) => setIsDragging(dragging);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const closeArtifacts = () => {
    setShowSummary(true);
    setIsExpanded(false);
    panelRef.current?.resize(70);
  };

  const handleGetArtifacts = (artifactId: string) => {
    if (!artifactId) return;

    getArtifact({
      processId: processId as string,
      activityRunId: activityId as string,
      artifact_ids: artifactId,
    })
      .unwrap()
      .then((res) => {
        const artifactData = res?.artifacts?.[0]?.artifact_data as OtherArtifactsResponseType;

        if (artifactData?.url) {
          window.open(artifactData?.url, '_blank');
        }
      })
      .catch((err) => {
        toast.error(err?.data?.message ?? 'Failed to redirect');
      });
  };

  const handleShowArtifacts = (artifactType: ARTIFACT_TYPE, artifactId: string, action?: CTA_ACTION) => {
    if (artifactType === ARTIFACT_TYPE.EXTERNAL_LINK) {
      handleGetArtifacts(artifactId);

      return;
    }

    setShowSummary(false);
    panelRef.current?.resize(50);

    setArtifactId(artifactId);
    setArtifactType(artifactType);
    if (artifactType === ARTIFACT_TYPE.PDF_DATASET) {
      setActiveTab(action ? ARTIFACT_TAB_MAPPING[action as keyof typeof ARTIFACT_TAB_MAPPING] : DEFAULT_ARTIFACT_TAB);
    }
  };

  const handleUpdate = (event: MessageEvent) => {
    const data = event?.data;

    if (!data) return;

    getActivityLogs({ processId: processId as string, activityRunId: activityId as string });
    getArtifacts({ processId: processId as string, activityRunId: activityId as string });
    getActivitySummary({ processId: processId as string, activityRunId: activityId as string });
  };

  const { close: closeSSE } = useSSE({
    url: `${API_DOMAIN}/processes/events/${activityId}`,
    eventListeners: {
      update: handleUpdate,
    },
    onError: (error) => {
      captureException(error);
    },
  });

  useEffect(() => {
    appDispatch(
      resetBreadcrumb([
        {
          title: process as string,
          href: getProcessRouteById(processId as string, process as string, status as string),
        },
        {
          title: 'Activity Logs',
          href: getProcessActivityLogsRouteById(processId as string, process as string, activityId as string),
        },
      ]),
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

  useEffect(() => {
    if (isLoadingArtifact) {
      toast.loading('Redirecting...', {
        id: 'redirecting',
      });
    } else {
      toast.dismiss('redirecting');
    }
  }, [isLoadingArtifact]);

  return (
    <ResizablePanelGroup direction='horizontal' className='h-full w-full'>
      <ResizablePanel
        id={RESIZABLE_PANEL_ID.LOGS}
        order={1}
        defaultSize={showSummary ? 70 : isExpanded ? 0 : 50}
        minSize={isExpanded ? 0 : 30}
        maxSize={isExpanded ? 0 : 70}
        className={cn('transition-all duration-300 ease-in-out', {
          'transition-none!': isDragging,
        })}
        ref={panelRef}
      >
        <Logs
          processId={processId as string}
          activityId={activityId as string}
          handleShowArtifacts={handleShowArtifacts}
          className={cn('', {
            'opacity-0': isExpanded,
            'opacity-100 transition-opacity duration-1000 ease-in-out': !isExpanded,
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
        onDoubleClick={() => toggleExpand()}
      />

      <ResizablePanel
        id={showSummary ? RESIZABLE_PANEL_ID.SUMMARY : RESIZABLE_PANEL_ID.ARTIFACTS}
        order={2}
        defaultSize={showSummary ? 30 : isExpanded ? 100 : 50}
        minSize={showSummary ? 30 : isExpanded ? 100 : 30}
        maxSize={showSummary ? 30 : isExpanded ? 100 : 70}
        className={cn('transition-all duration-300 ease-in-out', {
          'transition-none!': isDragging,
        })}
      >
        {showSummary ? (
          <Summary handleShowArtifacts={handleShowArtifacts} />
        ) : (
          <Artifacts
            onClose={closeArtifacts}
            onExpand={toggleExpand}
            isExpanded={isExpanded}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            artifactType={artifactType}
            artifactId={artifactId}
            onArtifactClick={handleShowArtifacts}
          />
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default Activity;
