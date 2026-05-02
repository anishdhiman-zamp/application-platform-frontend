import { configureStore } from '@reduxjs/toolkit';
import { TAB_TYPE } from '@/modules/pace/pace.types';
import dynamicTabsReducer, {
  dynamicTabsActions,
  selectActiveTab,
  selectActiveTabId,
  selectDynamicTabs,
} from '@/store/slices/dynamic-tabs.slice';

const buildStore = () => configureStore({ reducer: { dynamicTabs: dynamicTabsReducer } });

const fileTab = (id: string) => ({ id, type: TAB_TYPE.FILE, title: id });

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
});
