import { useCallback, useEffect } from 'react';
import { eventBus } from '@zamp-platform/utils';
import { type BaseEventPayload, EventType } from '@zamp-platform/utils/event-bus/event-bus.types';
import {
  useLazyGetActivityArtifactsQuery,
  useLazyGetActivityLogsQuery,
  useLazyGetActivitySummaryQuery,
} from '@/apis/processes';

interface UseActivitySSEProps {
  activityId: string;
  processId: string;
}

export function useActivitySSE({ activityId, processId }: UseActivitySSEProps) {
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
    const sub = eventBus.subscribe(EventType.ACTIVITY_LOG, (data: BaseEventPayload) => {
      if (data?.source_id === activityId) {
        handleUpdate(data);
      }
    });

    return sub.unsubscribe;
  }, [activityId, handleUpdate]);

  return {};
}
