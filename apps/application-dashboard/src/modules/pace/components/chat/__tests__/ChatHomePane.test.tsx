import { render, screen } from '@testing-library/react';
import ChatHomePane from '@/modules/pace/components/chat/ChatHomePane';
import { type DynamicTab, TAB_TYPE } from '@/modules/pace/pace.types';

let mockActiveTab: DynamicTab | null = null;

jest.mock('@/hooks/toolkit', () => ({
  useAppSelector: () => mockActiveTab,
}));

jest.mock('@/modules/pace/components/browser-viewer/BrowserTabsContainer', () => ({
  __esModule: true,
  default: () => <div data-testid='browser-tabs' />,
}));

jest.mock('@/modules/pace/components/chat/ChatHomePage', () => ({
  __esModule: true,
  default: () => <div data-testid='chat-home-page' />,
}));

describe('ChatHomePane', () => {
  beforeEach(() => {
    mockActiveTab = null;
  });

  it('renders the homepage when an agent tab is open without a conversation', () => {
    mockActiveTab = {
      stableKey: 'agent-1',
      id: 'agent-1',
      type: TAB_TYPE.AGENT,
      name: 'Slack Digest',
      path: '/chat?a=agent-1',
    };

    render(<ChatHomePane />);

    expect(screen.getByTestId('chat-home-page')).toBeInTheDocument();
  });

  it('keeps non-home panel surfaces out of the route body', () => {
    mockActiveTab = {
      stableKey: 'task-1',
      id: 'task-1',
      type: TAB_TYPE.TASK,
      name: 'Review task',
      path: '/chat?task=task-1',
    };

    const { container } = render(<ChatHomePane />);

    expect(container).toBeEmptyDOMElement();
  });
});
