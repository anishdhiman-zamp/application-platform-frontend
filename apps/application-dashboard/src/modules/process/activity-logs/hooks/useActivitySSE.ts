import { useCallback, useEffect } from 'react';
import { type BaseEventPayload, EventType } from '@zamp-platform/utils/event-bus/event-bus.types';
import {
  useLazyGetActivityArtifactsQuery,
  useLazyGetActivityLogsQuery,
  useLazyGetActivitySummaryQuery,
} from '@/apis/processes';
import { useEventBus } from '@/app/_providers/sse-provider';

interface UseActivitySSEProps {
  activityId: string;
  processId: string;
}

export function useActivitySSE({ activityId, processId }: UseActivitySSEProps) {
  const { sseEventBus } = useEventBus();
  const [getActivityLogs] = useLazyGetActivityLogsQuery();
  const [getArtifacts] = useLazyGetActivityArtifactsQuery();
  const [getActivitySummary] = useLazyGetActivitySummaryQuery();

  const handleUpdate = useCallback(
    (data: BaseEventPayload) => {
      if (!data) return;

      getActivityLogs({ processId, activityRunId: activityId });
      getArtifacts({ processId, activityRunId: activityId });
      getActivitySummary({ processId, activityRunId: activityId });
    },
    [getActivityLogs, getArtifacts, getActivitySummary, processId, activityId],
  );

  useEffect(() => {
    console.log(`[useActivitySSE] Subscribing to activity log events for activityId: ${activityId}`);
    const sub = sseEventBus.subscribe(EventType.ACTIVITY_LOG, (data: BaseEventPayload) => {
      if (data?.source_id === activityId) {
        handleUpdate(data);
      }
    });

    return () => {
      console.log(`[useActivitySSE] Unsubscribing from activity log events for activityId: ${activityId}`);
      sub.unsubscribe();
    };
  }, [activityId, handleUpdate]);

  return {};
}
