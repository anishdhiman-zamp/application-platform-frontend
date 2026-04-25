import type { TaskStatus } from '@zamp-platform/chat';
import type { AgentTaskApiItem } from '@/modules/pace/components/agents/types/agents.types';
import type { TaskListItem } from '@/modules/pace/components/tasks/types/tasks.types';

export const formatCompactNumber = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }

  return String(count);
};

export const mapAgentTask = (t: AgentTaskApiItem): TaskListItem => ({
  id: t.id,
  title: t.title,
  description: t.description,
  status: t.status as TaskStatus,
  subtasks: (t.subtasks ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    status: s.status as TaskStatus,
  })),
  skills_invoked_count: 0,
  created_by: { id: 'agent', name: 'Agent' },
  created_at: t.created_at,
});
