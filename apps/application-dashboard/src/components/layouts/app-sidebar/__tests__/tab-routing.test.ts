import { defaultRouteForTab, routeToTab } from 'components/layouts/app-sidebar/utils/tab-routing';

describe('routeToTab', () => {
  it('returns null for null pathname', () => {
    expect(routeToTab(null)).toBeNull();
  });

  it('maps /chat with no conversation to chat:new', () => {
    expect(routeToTab('/chat')).toEqual({ tabId: 'chat:new', kind: 'chat', instanceId: undefined });
  });

  it('maps /chat?s=abc to chat:abc', () => {
    const params = new URLSearchParams('s=abc');

    expect(routeToTab('/chat', params)).toEqual({ tabId: 'chat:abc', kind: 'chat', instanceId: 'abc' });
  });

  it('maps /chat/task to tasks tab', () => {
    expect(routeToTab('/chat/task')).toEqual({ tabId: 'tasks', kind: 'tasks' });
  });

  it('maps /chat/agents and sub-routes to agents tab', () => {
    expect(routeToTab('/chat/agents')).toEqual({ tabId: 'agents', kind: 'agents' });
    expect(routeToTab('/chat/agents/agent-123')).toEqual({ tabId: 'agents', kind: 'agents' });
  });

  it('maps /chat/apps to apps tab', () => {
    expect(routeToTab('/chat/apps')).toEqual({ tabId: 'apps', kind: 'apps' });
  });

  it('maps /chat/settings/general to settings:general', () => {
    expect(routeToTab('/chat/settings/general')).toEqual({
      tabId: 'settings:general',
      kind: 'settings',
      instanceId: 'general',
    });
  });

  it('maps /chat/settings/design-system to settings:design-system', () => {
    expect(routeToTab('/chat/settings/design-system')).toEqual({
      tabId: 'settings:design-system',
      kind: 'settings',
      instanceId: 'design-system',
    });
  });

  it('returns null for non-chat routes', () => {
    expect(routeToTab('/datasets')).toBeNull();
    expect(routeToTab('/people')).toBeNull();
    expect(routeToTab('/login')).toBeNull();
  });
});

describe('defaultRouteForTab', () => {
  it('returns /chat for chat:new', () => {
    expect(defaultRouteForTab('chat:new')).toBe('/chat');
  });

  it('returns /chat?s=abc for chat:abc', () => {
    expect(defaultRouteForTab('chat:abc')).toBe('/chat?s=abc');
  });

  it('returns task route for tasks tab', () => {
    expect(defaultRouteForTab('tasks')).toBe('/chat/task');
  });

  it('returns settings route per section', () => {
    expect(defaultRouteForTab('settings:general')).toBe('/chat/settings/general');
    expect(defaultRouteForTab('settings:design-system')).toBe('/chat/settings/design-system');
  });

  it('falls back to /chat for unknown tabs', () => {
    expect(defaultRouteForTab('mystery')).toBe('/chat');
  });
});
