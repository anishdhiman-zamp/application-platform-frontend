'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { API_DOMAIN } from '@zamp-platform/api';
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
import Logs from '@/modules/process/activity-logs/ActivityLogs';
import Summary from '@/modules/process/activity-summary/SummarySection';
import Artifacts from '@/modules/process/artifacts/Artifacts';
import { ARTIFACT_TAB_MAPPING, DEFAULT_ARTIFACT_TAB, RESIZABLE_PANEL_ID } from '@/modules/process/process.constant';
import {
  ARTIFACT_TYPE,
  type EmitHITLActionPayload,
  type HandleShowArtifactsProps,
  PDF_DATASET_TAB,
} from '@/modules/process/process.types';
import type { OtherArtifactsResponseType } from '@/types/api/processApi.types';
import type { MapAny } from '@/types/commonTypes';
import { cn } from '@/utils/common';

const Activity = () => {
  const params = useParams();
  const searchParams = useSearchParams();

  const processId = params?.processId as string;
  const activityId = params?.activityId as string;

  const artifactIdFromUrl = searchParams?.get('artifactId');
  const artifactTypeFromUrl = searchParams?.get('artifactType');

  const panelRef = useRef<ImperativePanelHandle>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSummary, setShowSummary] = useState(artifactIdFromUrl ? false : true);
  const [activeTab, setActiveTab] = useState<PDF_DATASET_TAB>(PDF_DATASET_TAB.DATASET);
  const [artifactType, setArtifactType] = useState<ARTIFACT_TYPE>(
    (artifactTypeFromUrl as ARTIFACT_TYPE) ?? ARTIFACT_TYPE.PDF_DATASET,
  );
  const [artifactId, setArtifactId] = useState<string>(artifactIdFromUrl as string);
  const [filters, setFilters] = useState<MapAny>({});
  const [missingFields, setMissingFields] = useState<MapAny>({});
  const [emitHITLActionPayload, setEmitHITLActionPayload] = useState<EmitHITLActionPayload>({
    logGroupId: '',
    hitlRequestId: '',
    ctaActionId: '',
    ctaValue: '',
  });

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

  const handleGetArtifacts = useCallback(
    (artifactId: string) => {
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
    },
    [getArtifact, processId, activityId],
  );

  const handleShowArtifacts = useCallback(
    ({
      artifactType,
      artifactId,
      action,
      filters,
      ctaConfig,
      logGroupId,
      hitlRequestId,
      ctaActionId,
      ctaValue,
    }: HandleShowArtifactsProps) => {
      if (artifactType === ARTIFACT_TYPE.EXTERNAL_LINK) {
        handleGetArtifacts(artifactId);

        return;
      }

      setShowSummary(false);
      panelRef.current?.resize(50);

      setArtifactId(artifactId);
      setArtifactType(artifactType);
      setFilters(filters ?? {});
      setMissingFields(ctaConfig?.dataset_to_missing_fields_map ?? {});
      setEmitHITLActionPayload({
        logGroupId,
        hitlRequestId,
        ctaActionId,
        ctaValue,
      });

      if (artifactType === ARTIFACT_TYPE.PDF_DATASET) {
        setActiveTab(action ? ARTIFACT_TAB_MAPPING[action as keyof typeof ARTIFACT_TAB_MAPPING] : DEFAULT_ARTIFACT_TAB);
      }
    },
    [panelRef, handleGetArtifacts],
  );

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
  });

  useEffect(() => {
    if (!isExpanded) {
      if (showSummary) {
        panelRef.current?.resize(70);
      } else {
        panelRef.current?.resize(50);
      }
    }
  }, [isExpanded, showSummary]);

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
        disabled={isExpanded}
        onDragging={handleDragging}
        className={cn('group cursor-col-resize', {
          'cursor-default': isExpanded,
          'bg-black': isDragging && !isExpanded,
          'opacity-0': isExpanded && !isDragging,
          'opacity-100': !isExpanded && !isDragging,
          'transition-opacity duration-300 ease-in-out': !isDragging,
        })}
        handleClassName={cn('bg-white', {
          'bg-black border-black': isDragging,
          'opacity-0 group-hover:opacity-100': showSummary && !isDragging,
        })}
        onDoubleClick={() => toggleExpand()}
      />

      <ResizablePanel
        id={showSummary ? RESIZABLE_PANEL_ID.SUMMARY : RESIZABLE_PANEL_ID.ARTIFACTS}
        order={2}
        defaultSize={showSummary ? 30 : isExpanded ? 100 : 50}
        minSize={isExpanded ? 100 : 30}
        maxSize={isExpanded ? 100 : 70}
        className={cn('transition-all duration-300 ease-in-out', {
          'transition-none!': isDragging,
        })}
      >
        {showSummary ? (
          <Summary handleShowArtifacts={handleShowArtifacts} isExpanded={isExpanded} onExpand={toggleExpand} />
        ) : (
          <Artifacts
            onClose={closeArtifacts}
            onExpand={toggleExpand}
            isExpanded={isExpanded}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            artifactType={artifactType}
            artifactId={artifactId}
            filters={filters}
            onArtifactClick={handleShowArtifacts}
            missingFields={missingFields}
            emitHITLActionPayload={emitHITLActionPayload}
          />
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default Activity;
