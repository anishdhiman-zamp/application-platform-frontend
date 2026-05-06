import workspaceTabsReducer, {
  selectActiveTabKind,
  selectActiveTabRecord,
  selectRightPanel,
  stripPanelParamsFromRoute,
  workspaceTabsActions,
} from 'store/slices/workspace-tabs.slice';
import type { WorkspaceTabsStateType } from '@/types/workspace-tabs.types';

const emptyState = (): WorkspaceTabsStateType => ({ activeTabId: null, byTab: {} });

describe('workspaceTabs reducer', () => {
  it('setActiveTab creates a record and marks it active', () => {
    const next = workspaceTabsReducer(
      emptyState(),
      workspaceTabsActions.setActiveTab({ tabId: 'tasks', kind: 'tasks' }),
    );

    expect(next.activeTabId).toBe('tasks');
    expect(next.byTab.tasks).toBeDefined();
    expect(next.byTab.tasks.kind).toBe('tasks');
  });

  it('setActiveTab(null) clears active', () => {
    const seeded = workspaceTabsReducer(
      emptyState(),
      workspaceTabsActions.setActiveTab({ tabId: 'apps', kind: 'apps' }),
    );

    const next = workspaceTabsReducer(seeded, workspaceTabsActions.setActiveTab(null));

    expect(next.activeTabId).toBeNull();
    expect(next.byTab.apps).toBeDefined();
  });

  it('setLastSubRoute updates the record', () => {
    const seeded = workspaceTabsReducer(
      emptyState(),
      workspaceTabsActions.setActiveTab({ tabId: 'tasks', kind: 'tasks' }),
    );

    const next = workspaceTabsReducer(
      seeded,
      workspaceTabsActions.setLastSubRoute({ tabId: 'tasks', subRoute: '/chat/task?status=open' }),
    );

    expect(next.byTab.tasks.lastSubRoute).toBe('/chat/task?status=open');
  });

  it('patchTabUiState merges patches', () => {
    const seeded = workspaceTabsReducer(
      emptyState(),
      workspaceTabsActions.setActiveTab({ tabId: 'tasks', kind: 'tasks' }),
    );

    const a = workspaceTabsReducer(
      seeded,
      workspaceTabsActions.patchTabUiState({ tabId: 'tasks', patch: { filter: 'open' } }),
    );

    const b = workspaceTabsReducer(
      a,
      workspaceTabsActions.patchTabUiState({ tabId: 'tasks', patch: { sort: 'desc' } }),
    );

    expect(b.byTab.tasks.uiState).toEqual({ filter: 'open', sort: 'desc' });
  });

  it('setRightPanel stores panel state per tab', () => {
    const seeded = workspaceTabsReducer(
      emptyState(),
      workspaceTabsActions.setActiveTab({ tabId: 'chat:abc', kind: 'chat', instanceId: 'abc' }),
    );

    const next = workspaceTabsReducer(
      seeded,
      workspaceTabsActions.setRightPanel({ tabId: 'chat:abc', panel: { isOpen: true, panelId: 'files' } }),
    );

    expect(next.byTab['chat:abc'].rightPanel).toEqual({ isOpen: true, panelId: 'files' });
  });

  it('clearTab removes the record and clears active if matched', () => {
    const seeded = workspaceTabsReducer(
      emptyState(),
      workspaceTabsActions.setActiveTab({ tabId: 'agents', kind: 'agents' }),
    );

    const next = workspaceTabsReducer(seeded, workspaceTabsActions.clearTab('agents'));

    expect(next.byTab.agents).toBeUndefined();
    expect(next.activeTabId).toBeNull();
  });

  it('clearTabsByKind removes all matching kind', () => {
    let state = emptyState();

    state = workspaceTabsReducer(
      state,
      workspaceTabsActions.setActiveTab({ tabId: 'chat:a', kind: 'chat', instanceId: 'a' }),
    );
    state = workspaceTabsReducer(
      state,
      workspaceTabsActions.setActiveTab({ tabId: 'chat:b', kind: 'chat', instanceId: 'b' }),
    );
    state = workspaceTabsReducer(state, workspaceTabsActions.setActiveTab({ tabId: 'apps', kind: 'apps' }));

    const next = workspaceTabsReducer(state, workspaceTabsActions.clearTabsByKind('chat'));

    expect(next.byTab['chat:a']).toBeUndefined();
    expect(next.byTab['chat:b']).toBeUndefined();
    expect(next.byTab.apps).toBeDefined();
  });
});

describe('workspaceTabs selectors', () => {
  const buildState = (slice: WorkspaceTabsStateType) => ({ workspaceTabs: slice });

  it('selectActiveTabKind returns null when no active', () => {
    expect(selectActiveTabKind(buildState(emptyState()))).toBeNull();
  });

  it('selectActiveTabKind returns kind for active tab', () => {
    const slice = workspaceTabsReducer(
      emptyState(),
      workspaceTabsActions.setActiveTab({ tabId: 'tasks', kind: 'tasks' }),
    );

    expect(selectActiveTabKind(buildState(slice))).toBe('tasks');
  });

  it('selectActiveTabRecord returns the active record', () => {
    const slice = workspaceTabsReducer(
      emptyState(),
      workspaceTabsActions.setActiveTab({ tabId: 'apps', kind: 'apps' }),
    );

    expect(selectActiveTabRecord(buildState(slice))?.kind).toBe('apps');
  });

  it('selectRightPanel returns null when no panel set', () => {
    const slice = workspaceTabsReducer(
      emptyState(),
      workspaceTabsActions.setActiveTab({ tabId: 'tasks', kind: 'tasks' }),
    );

    expect(selectRightPanel('tasks')(buildState(slice))).toBeNull();
  });
});

describe('stripPanelParamsFromRoute', () => {
  it('removes listing detail panel params while preserving unrelated query params', () => {
    expect(stripPanelParamsFromRoute('/chat/files?f=docs%2Freadme.md&sort=name')).toBe('/chat/files?sort=name');
    expect(stripPanelParamsFromRoute('/chat/task?t=task-1&title=Task&status=open&tab=mine')).toBe(
      '/chat/task?tab=mine',
    );
    expect(stripPanelParamsFromRoute('/chat/agents?a=agent-1&title=Agent&description=Test&avatarKey=agent_1')).toBe(
      '/chat/agents',
    );
  });

  it('leaves routes without panel params unchanged', () => {
    expect(stripPanelParamsFromRoute('/chat/apps?category=connected')).toBe('/chat/apps?category=connected');
  });
});
