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

      console.log('[useActivitySSE] Handling activity update', { source_id: data.source_id, processId, activityId });
      console.log('[useActivitySSE] Refreshing activity data (logs, artifacts, summary)');

      getActivityLogs({ processId, activityRunId: activityId });
      getArtifacts({ processId, activityRunId: activityId });
      getActivitySummary({ processId, activityRunId: activityId });
    },
    [getActivityLogs, getArtifacts, getActivitySummary, processId, activityId],
  );

  useEffect(() => {
    console.log(`[useActivitySSE] Subscribing to activity log events for activityId: ${activityId}`);
    const sub = eventBus.subscribe(EventType.ACTIVITY_LOG, (data: BaseEventPayload) => {
      console.log('[useActivitySSE] Received activity log event', { source_id: data?.source_id, activityId });
      if (data?.source_id === activityId) {
        console.log('[useActivitySSE] Processing activity log event (source_id matches)', {
          source_id: data.source_id,
        });
        handleUpdate(data);
      } else {
        console.log('[useActivitySSE] Ignoring activity log event (source_id mismatch)', {
          eventSourceId: data?.source_id,
          expectedActivityId: activityId,
        });
      }
    });

    return () => {
      console.log(`[useActivitySSE] Unsubscribing from activity log events for activityId: ${activityId}`);
      sub.unsubscribe();
    };
  }, [activityId, handleUpdate]);

  return {};
}
