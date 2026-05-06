import { ROUTES_PATH } from '@/constants/routeConfig';
import {
  buildTabRouteForCurrentSurface,
  getActiveTabIdFromUrl,
  getEmptyDynamicTabsRoute,
  getTabTypeFromUrl,
} from '@/modules/pace/components/dynamic-tabs/tab-type-registry';
import {
  getTaskContentChrome,
  shouldHideFilesPanelTopBar,
  shouldUseSingleViewerMode,
} from '@/modules/pace/components/files-panel/files-panel.utils';
import { SINGLE_VIEWER_TAB_METADATA_KEY } from '@/modules/pace/pace.constants';
import { type DynamicTab, TAB_TYPE } from '@/modules/pace/pace.types';

describe('tab-type-registry', () => {
  const taskTab: DynamicTab = {
    stableKey: 'task-1',
    id: 'task-1',
    name: 'Task',
    path: '/chat?t=task-1',
    type: TAB_TYPE.TASK,
    metadata: { [SINGLE_VIEWER_TAB_METADATA_KEY]: true },
  };

  const fileTab: DynamicTab = {
    stableKey: 'reports/q1.pdf',
    id: 'reports/q1.pdf',
    name: 'q1.pdf',
    path: '/chat/files?f=reports%2Fq1.pdf',
    type: TAB_TYPE.FILE,
    metadata: { [SINGLE_VIEWER_TAB_METADATA_KEY]: true },
  };

  const agentTab: DynamicTab = {
    stableKey: 'agent-1',
    id: 'agent-1',
    name: 'Research agent',
    path: '/chat/agents?a=agent-1',
    type: TAB_TYPE.AGENT,
    metadata: { [SINGLE_VIEWER_TAB_METADATA_KEY]: true },
  };

  it('keeps file tabs on the tasks surface when opened from tasks', () => {
    expect(buildTabRouteForCurrentSurface('reports/q1.pdf', TAB_TYPE.FILE, ROUTES_PATH.CHAT_TASK)).toBe(
      '/chat/task?f=reports%2Fq1.pdf',
    );
  });

  it('keeps agent tabs on the agents surface when opened from agents', () => {
    expect(buildTabRouteForCurrentSurface('agent-1', TAB_TYPE.AGENT, ROUTES_PATH.CHAT_AGENTS)).toBe(
      '/chat/agents?a=agent-1',
    );
  });

  it('recognizes file tabs hosted by the tasks surface', () => {
    expect(getActiveTabIdFromUrl(ROUTES_PATH.CHAT_TASK, '?f=reports%2Fq1.pdf', TAB_TYPE.FILE)).toBe('reports/q1.pdf');
    expect(getTabTypeFromUrl(ROUTES_PATH.CHAT_TASK, '?f=reports%2Fq1.pdf')).toBe(TAB_TYPE.FILE);
  });

  it('recognizes agent tabs hosted by the agents surface', () => {
    expect(getActiveTabIdFromUrl(ROUTES_PATH.CHAT_AGENTS, '?a=agent-1', TAB_TYPE.AGENT)).toBe('agent-1');
    expect(getTabTypeFromUrl(ROUTES_PATH.CHAT_AGENTS, '?a=agent-1')).toBe(TAB_TYPE.AGENT);
  });

  it('falls back to the listing surface after the final tab closes', () => {
    expect(getEmptyDynamicTabsRoute(ROUTES_PATH.CHAT_TASK)).toBe(ROUTES_PATH.CHAT_TASK);
    expect(getEmptyDynamicTabsRoute(ROUTES_PATH.CHAT_FILES)).toBe(ROUTES_PATH.CHAT_FILES);
    expect(getEmptyDynamicTabsRoute(ROUTES_PATH.CHAT_AGENTS)).toBe(ROUTES_PATH.CHAT_AGENTS);
    expect(getEmptyDynamicTabsRoute(ROUTES_PATH.CHAT)).toBe(ROUTES_PATH.CHAT);
  });

  it('keeps chat on the legacy tabbed panel even for single-viewer tabs', () => {
    expect(shouldUseSingleViewerMode(ROUTES_PATH.CHAT, taskTab)).toBe(false);
    expect(shouldUseSingleViewerMode(ROUTES_PATH.CHAT, fileTab)).toBe(false);
    expect(shouldUseSingleViewerMode(ROUTES_PATH.CHAT_TASK, taskTab)).toBe(true);
    expect(shouldUseSingleViewerMode(ROUTES_PATH.CHAT_AGENTS, agentTab)).toBe(true);
  });

  it('uses no task chrome on chat and panel chrome on listing surfaces', () => {
    expect(getTaskContentChrome(ROUTES_PATH.CHAT)).toBe('none');
    expect(getTaskContentChrome(ROUTES_PATH.CHAT_TASK)).toBe('panel');
    expect(getTaskContentChrome(ROUTES_PATH.CHAT_FILES)).toBe('panel');
    expect(getTaskContentChrome(ROUTES_PATH.CHAT_AGENTS)).toBe('panel');
  });

  it('hides files panel top bar only for listing single-viewer tabs', () => {
    expect(shouldHideFilesPanelTopBar(ROUTES_PATH.CHAT, taskTab)).toBe(false);
    expect(shouldHideFilesPanelTopBar(ROUTES_PATH.CHAT, fileTab)).toBe(false);
    expect(shouldHideFilesPanelTopBar(ROUTES_PATH.CHAT_TASK, taskTab)).toBe(true);
    expect(shouldHideFilesPanelTopBar(ROUTES_PATH.CHAT_FILES, fileTab)).toBe(true);
    expect(shouldHideFilesPanelTopBar(ROUTES_PATH.CHAT_AGENTS, agentTab)).toBe(true);
    expect(shouldHideFilesPanelTopBar(ROUTES_PATH.CHAT_FILES, null)).toBe(false);
  });
});
