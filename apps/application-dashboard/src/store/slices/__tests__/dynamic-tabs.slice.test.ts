import { configureStore } from '@reduxjs/toolkit';
import { TAB_TYPE } from '@/modules/pace/pace.types';
import dynamicTabsReducer, {
  dynamicTabsActions,
  selectActiveConversationPanelState,
  selectActiveTab,
  selectActiveTabId,
  selectConversationActiveTabId,
  selectDynamicTabs,
} from '@/store/slices/dynamic-tabs.slice';

const buildStore = () => configureStore({ reducer: { dynamicTabs: dynamicTabsReducer } });

const fileTab = (id: string) => ({ id, name: id, path: `/chat?f=${encodeURIComponent(id)}`, type: TAB_TYPE.FILE });

describe('dynamicTabs slice — conversation-keyed', () => {
  it('returns empty selections when no active conversation is set', () => {
    const store = buildStore();

    expect(selectDynamicTabs(store.getState())).toEqual([]);
    expect(selectActiveTabId(store.getState())).toBeNull();
    expect(selectActiveTab(store.getState())).toBeNull();
  });

  it('ignores mutations when no active conversation is set', () => {
    const store = buildStore();

    store.dispatch(dynamicTabsActions.openTab(fileTab('a.md')));

    expect(selectDynamicTabs(store.getState())).toEqual([]);
  });

  it('isolates tabs across two conversations', () => {
    const store = buildStore();

    store.dispatch(dynamicTabsActions.setActiveConversation('conv-a'));
    store.dispatch(dynamicTabsActions.openTab(fileTab('a1.md')));
    store.dispatch(dynamicTabsActions.openTab(fileTab('a2.md')));

    store.dispatch(dynamicTabsActions.setActiveConversation('conv-b'));
    expect(selectDynamicTabs(store.getState())).toEqual([]);
    expect(selectActiveTabId(store.getState())).toBeNull();

    store.dispatch(dynamicTabsActions.openTab(fileTab('b1.md')));
    expect(selectDynamicTabs(store.getState()).map((t) => t.id)).toEqual(['b1.md']);

    store.dispatch(dynamicTabsActions.setActiveConversation('conv-a'));
    expect(selectDynamicTabs(store.getState()).map((t) => t.id)).toEqual(['a1.md', 'a2.md']);
    expect(selectActiveTabId(store.getState())).toBe('a2.md');
  });

  it('preserves the active tab id when switching conversations and back', () => {
    const store = buildStore();

    store.dispatch(dynamicTabsActions.setActiveConversation('conv-a'));
    store.dispatch(dynamicTabsActions.openTab(fileTab('a1.md')));
    store.dispatch(dynamicTabsActions.openTab(fileTab('a2.md')));
    store.dispatch(dynamicTabsActions.setActiveTab('a1.md'));

    store.dispatch(dynamicTabsActions.setActiveConversation('conv-b'));
    store.dispatch(dynamicTabsActions.setActiveConversation('conv-a'));

    expect(selectActiveTabId(store.getState())).toBe('a1.md');
    expect(selectActiveTab(store.getState())?.id).toBe('a1.md');
  });

  it('can read a target conversation active tab without switching to it', () => {
    const store = buildStore();

    store.dispatch(dynamicTabsActions.setActiveConversation('conv-a'));
    store.dispatch(dynamicTabsActions.openTab(fileTab('a1.md')));

    store.dispatch(dynamicTabsActions.setActiveConversation('conv-b'));

    expect(selectConversationActiveTabId(store.getState(), 'conv-a')).toBe('a1.md');
    expect(selectConversationActiveTabId(store.getState(), 'conv-b')).toBeNull();
  });

  it('opens background tabs without changing the active tab', () => {
    const store = buildStore();

    store.dispatch(dynamicTabsActions.setActiveConversation('conv-a'));
    store.dispatch(dynamicTabsActions.openTab(fileTab('a1.md')));
    store.dispatch(dynamicTabsActions.openTabInBackground(fileTab('agent.md')));

    expect(selectDynamicTabs(store.getState()).map((t) => t.id)).toEqual(['a1.md', 'agent.md']);
    expect(selectActiveTabId(store.getState())).toBe('a1.md');
  });

  it('does not create an active tab when a background tab is the first tab', () => {
    const store = buildStore();

    store.dispatch(dynamicTabsActions.setActiveConversation('conv-a'));
    store.dispatch(dynamicTabsActions.openTabInBackground(fileTab('agent.md')));

    expect(selectDynamicTabs(store.getState()).map((t) => t.id)).toEqual(['agent.md']);
    expect(selectActiveTabId(store.getState())).toBeNull();
    expect(selectActiveTab(store.getState())).toBeNull();
  });

  it('closeTab only affects the active conversation bucket', () => {
    const store = buildStore();

    store.dispatch(dynamicTabsActions.setActiveConversation('conv-a'));
    store.dispatch(dynamicTabsActions.openTab(fileTab('shared.md')));

    store.dispatch(dynamicTabsActions.setActiveConversation('conv-b'));
    store.dispatch(dynamicTabsActions.openTab(fileTab('shared.md')));
    store.dispatch(dynamicTabsActions.closeTab('shared.md'));
    expect(selectDynamicTabs(store.getState())).toEqual([]);

    store.dispatch(dynamicTabsActions.setActiveConversation('conv-a'));
    expect(selectDynamicTabs(store.getState()).map((t) => t.id)).toEqual(['shared.md']);
  });

  it('initializes a new conversation bucket on first selection', () => {
    const store = buildStore();

    store.dispatch(dynamicTabsActions.setActiveConversation('fresh-conv'));

    expect(selectDynamicTabs(store.getState())).toEqual([]);
    expect(selectActiveTabId(store.getState())).toBeNull();
  });

  it('isolates right panel UI state across conversations', () => {
    const store = buildStore();

    store.dispatch(dynamicTabsActions.setActiveConversation('conv-a'));
    store.dispatch(
      dynamicTabsActions.patchActiveConversationPanelState({
        isFilesPanelExpanded: true,
        isTreeSidebarOpen: false,
        filesPanelWidth: 900,
      }),
    );

    store.dispatch(dynamicTabsActions.setActiveConversation('conv-b'));
    expect(selectActiveConversationPanelState(store.getState())).toMatchObject({
      isFilesPanelExpanded: false,
      isTreeSidebarOpen: false,
    });

    store.dispatch(dynamicTabsActions.patchActiveConversationPanelState({ filesPanelWidth: 420 }));
    expect(selectActiveConversationPanelState(store.getState()).filesPanelWidth).toBe(420);

    store.dispatch(dynamicTabsActions.setActiveConversation('conv-a'));
    expect(selectActiveConversationPanelState(store.getState())).toMatchObject({
      isFilesPanelExpanded: true,
      isTreeSidebarOpen: false,
      filesPanelWidth: 900,
    });
  });

  it('toggles panel state against the currently active conversation', () => {
    const store = buildStore();

    store.dispatch(dynamicTabsActions.setActiveConversation('conv-a'));
    store.dispatch(dynamicTabsActions.patchActiveConversationPanelState({ isTreeSidebarOpen: true }));

    store.dispatch(dynamicTabsActions.setActiveConversation('conv-b'));
    store.dispatch(dynamicTabsActions.toggleActiveConversationPanelState('isTreeSidebarOpen'));

    expect(selectActiveConversationPanelState(store.getState()).isTreeSidebarOpen).toBe(true);

    store.dispatch(dynamicTabsActions.setActiveConversation('conv-a'));
    expect(selectActiveConversationPanelState(store.getState()).isTreeSidebarOpen).toBe(true);
  });
});
