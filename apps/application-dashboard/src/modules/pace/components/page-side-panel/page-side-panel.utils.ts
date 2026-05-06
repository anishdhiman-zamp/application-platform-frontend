import { TASK_QUERY_PARAMS } from '@/constants/routeConfig';
import { TAB_QUERY_PARAM } from '@/modules/pace/pace.types';

const AGENT_PANEL_PARAMS = [TAB_QUERY_PARAM.AGENT, 'title', 'description', 'avatarKey'] as const;

const TASK_PANEL_PARAMS = [
  TAB_QUERY_PARAM.TASK,
  'title',
  'status',
  'currentIndex',
  'totalRows',
  TASK_QUERY_PARAMS.PARENT_TASKS,
  TASK_QUERY_PARAMS.SIBLINGS,
  TASK_QUERY_PARAMS.REFERRER,
] as const;

const FILE_PANEL_PARAMS = [TAB_QUERY_PARAM.FILE] as const;

const removeParams = (search: string | URLSearchParams | null | undefined, paramsToRemove: readonly string[]) => {
  const params = new URLSearchParams(typeof search === 'string' ? search : (search?.toString() ?? ''));

  paramsToRemove.forEach((param) => params.delete(param));

  return params;
};

export const buildPathWithParams = (pathname: string, params: URLSearchParams): string => {
  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
};

export const buildAgentPanelClosePath = (pathname: string, search: string | URLSearchParams | null | undefined) =>
  buildPathWithParams(pathname, removeParams(search, AGENT_PANEL_PARAMS));

export const buildTaskPanelClosePath = (pathname: string, search: string | URLSearchParams | null | undefined) =>
  buildPathWithParams(pathname, removeParams(search, TASK_PANEL_PARAMS));

export const buildFilePanelClosePath = (pathname: string, search: string | URLSearchParams | null | undefined) =>
  buildPathWithParams(pathname, removeParams(search, FILE_PANEL_PARAMS));
