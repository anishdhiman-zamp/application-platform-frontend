import type { BaseEventPayload } from '../event-bus/event-bus.types';

type MapAny = Record<string, unknown>;

interface TaskUpdateFieldsType {
  taskId: string | undefined;
  status: string | undefined;
  sourceId: string | undefined;
}

/**
 * Extracts task_id, status, and source_id from a TASK_UPDATE SSE event.
 * The backend may send these fields at the top level or nested inside `payload`,
 * so this utility normalises both shapes into a single interface.
 */
export const extractTaskUpdateFields = (data: BaseEventPayload): TaskUpdateFieldsType => {
  const raw = data as unknown as MapAny;
  const payload = data.payload as MapAny | undefined;

  const taskId = (raw.task_id as string) || (payload?.task_id as string | undefined);
  const status =
    ((raw.updated_fields as MapAny)?.status as string | undefined) ||
    ((payload?.updated_fields as MapAny)?.status as string | undefined);

  return { taskId, status, sourceId: data.source_id };
};
