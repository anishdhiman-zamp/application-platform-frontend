import { useCallback, useEffect } from 'react';
import { eventBus } from '@zamp-platform/utils';
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
    (event: MessageEvent) => {
      const data = event?.data;

      if (!data) return;

      getActivityLogs({ processId, activityRunId: activityId });
      getArtifacts({ processId, activityRunId: activityId });
      getActivitySummary({ processId, activityRunId: activityId });
    },
    [getActivityLogs, getArtifacts, getActivitySummary, processId, activityId],
  );

  useEffect(() => {
    const sub = eventBus.subscribe('activity_log', (evt: MessageEvent) => {
      const data = JSON.parse(evt.data);

      if (data.source_id === activityId) {
        handleUpdate(evt);
      }
    });

    return sub.unsubscribe;
  }, [activityId]);

  return {};
}
