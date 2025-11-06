'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LocationType } from '@zamp-platform/chat';
import { type ImperativePanelHandle, ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@zamp-platform/ui';
import { useParams, useSearchParams } from 'next/navigation';
import { useGetActivityArtifactsQuery, useLazyGetArtifactsByArtifactIdQuery } from '@/apis/processes';
import { toast } from '@/components/common/toast/Toast';
import { useAppDispatch } from '@/hooks/toolkit';
import Logs from '@/modules/process/activity-logs/ActivityLogs';
import { useActivitySSE } from '@/modules/process/activity-logs/hooks/useActivitySSE';
import Summary from '@/modules/process/activity-summary/SummarySection';
import Artifacts from '@/modules/process/artifacts/Artifacts';
import {
  artifactContextActions,
  ArtifactStateProvider,
  useArtifactContextStore,
} from '@/modules/process/artifacts/context/artifact.context';
import { RESIZABLE_PANEL_ID } from '@/modules/process/process.constant';
import {
  ARTIFACT_TYPE,
  type EmitHITLActionPayload,
  type HandleShowArtifactsProps,
} from '@/modules/process/process.types';
import { closeSidebar, openSidebar } from '@/store/slices/layout-configs';
import type { OtherArtifactsResponseType } from '@/types/api/processApi.types';
import type { MapAny } from '@/types/commonTypes';
import { cn } from '@/utils/common';

const Activity = () => {
  const params = useParams();
  const searchParams = useSearchParams();

  const processId = params?.processId as string;
  const activityId = params?.activityId as string;

  const panelRef = useRef<ImperativePanelHandle>(null);
  const dispatch = useAppDispatch();

  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [filters, setFilters] = useState<MapAny>({});
  const [missingFields, setMissingFields] = useState<MapAny>({});
  const [emitHITLActionPayload, setEmitHITLActionPayload] = useState<EmitHITLActionPayload>({
    logGroupId: '',
    hitlRequestId: '',
    ctaActionId: '',
    ctaValue: '',
  });

  const [getArtifact, { isFetching: isLoadingArtifact }] = useLazyGetArtifactsByArtifactIdQuery();

  // Fetch artifacts to get artifact IDs for dataset fields
  const { data: allArtifacts } = useGetActivityArtifactsQuery(
    { processId, activityRunId: activityId },
    { skip: !processId || !activityId, refetchOnMountOrArgChange: false },
  );

  useActivitySSE({ activityId, processId });
  const { dispatch: artifactTypeDispatch } = useArtifactContextStore();

  // Handle chatbot URL params to auto-open artifacts
  useEffect(() => {
    const chatbotType = searchParams?.get('chatbot_annotation_location_type');
    const datasetId = searchParams?.get('chatbot_dataset_id');

    // Only auto-open for dataset field chatbots
    if (chatbotType === LocationType.DATASET_FIELD && datasetId && allArtifacts?.artifacts) {
      // Find the artifact that contains this dataset
      const artifact = allArtifacts.artifacts.find((art) => {
        if (art.artifact_type === ARTIFACT_TYPE.PDF_DATASET || art.artifact_type === ARTIFACT_TYPE.DATASET) {
          const artifactData = art.artifact_data as any;
          const datasets = artifactData?.datasets || [];

          return datasets.some((ds: MapAny) => ds.dataset_id === datasetId);
        }

        return false;
      });

      if (artifact) {
        // Auto-open the artifact
        handleShowArtifacts({
          artifactType: artifact.artifact_type,
          artifactId: artifact.id,
        });
      }
    }
  }, [searchParams, allArtifacts]);

  const handleDragging = (dragging: boolean) => setIsDragging(dragging);

  const onToggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const onCloseArtifacts = () => {
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
      panelRef.current?.resize(35);

      artifactTypeDispatch({
        type: artifactContextActions.SET_ARTIFACT_ID,
        payload: { artifactId },
      });

      artifactTypeDispatch({
        type: artifactContextActions.SET_ARTIFACT_TYPE,
        payload: { artifactType },
      });
      setFilters(filters ?? {});

      setMissingFields(ctaConfig?.dataset_to_missing_fields_map ?? {});
      setEmitHITLActionPayload({
        logGroupId,
        hitlRequestId,
        ctaActionId,
        ctaValue,
      });
    },
    [panelRef, handleGetArtifacts],
  );

  useEffect(() => {
    if (!isExpanded) {
      if (showSummary) {
        panelRef.current?.resize(70);
      } else {
        panelRef.current?.resize(35);
      }
    }
  }, [isExpanded, showSummary]);

  useEffect(() => {
    if (isLoadingArtifact) {
      toast.loading('Redirecting...', {
        id: 'redirecting',
      });
    } else {
      toast.dismiss('redirecting');
    }
  }, [isLoadingArtifact]);

  useEffect(() => {
    dispatch(closeSidebar());

    setTimeout(() => {
      dispatch(closeSidebar());
    }, 300);

    return () => {
      dispatch(openSidebar());
    };
  }, [dispatch]);

  return (
    <ResizablePanelGroup direction='horizontal' className='h-full w-full'>
      <ResizablePanel
        id={RESIZABLE_PANEL_ID.LOGS}
        order={1}
        defaultSize={showSummary ? 70 : isExpanded ? 0 : 35}
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
        onDoubleClick={() => onToggleExpand()}
      />

      <ResizablePanel
        id={showSummary ? RESIZABLE_PANEL_ID.SUMMARY : RESIZABLE_PANEL_ID.ARTIFACTS}
        order={2}
        defaultSize={showSummary ? 30 : isExpanded ? 100 : 65}
        minSize={isExpanded ? 100 : 30}
        maxSize={isExpanded ? 100 : 70}
        className={cn('transition-all duration-300 ease-in-out', {
          'transition-none!': isDragging,
        })}
      >
        {showSummary ? (
          <Summary handleShowArtifacts={handleShowArtifacts} isExpanded={isExpanded} onExpand={onToggleExpand} />
        ) : (
          <Artifacts
            onCloseArtifacts={onCloseArtifacts}
            onExpandArtifacts={onToggleExpand}
            isExpanded={isExpanded}
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

const ActivityPage = () => {
  return (
    <ArtifactStateProvider>
      <Activity />
    </ArtifactStateProvider>
  );
};

export default ActivityPage;
