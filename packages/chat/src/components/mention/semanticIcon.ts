import { Activity, Database, type LucideIcon } from 'lucide-react';

const SEMANTIC_ICON_MAP: Record<string, LucideIcon> = {
  activity: Activity,
  database: Database,
  task: Activity,
};

export const resolveSemanticIcon = (hint: string | null | undefined): LucideIcon => {
  const key = (hint ?? '').toLowerCase().trim();
  return SEMANTIC_ICON_MAP[key] ?? Database;
};
