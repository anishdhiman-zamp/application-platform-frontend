import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import FileListingDetailPanel from '@/modules/pace/components/files/FileListingDetailPanel';
import { FILE_CATEGORY } from '@/modules/pace/components/files/files.constants';
import { CHAT_SIDEBAR_STATE } from '@/modules/pace/pace.types';

const mockPush = jest.fn();
const mockSetNewChatDraft = jest.fn();
const mockSetActiveFileInfo = jest.fn();
const mockSetChatSidebarState = jest.fn();
const mockRequestInstantFilesPanelTransition = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@sentry/browser', () => ({
  captureException: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock('@zamp-platform/ui', () => ({
  Button: ({
    children,
    leadingIcon,
    variant: _variant,
    size: _size,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    leadingIcon?: React.ReactNode;
    variant?: string;
    size?: string;
  }) => (
    <button {...props}>
      {leadingIcon}
      {children}
    </button>
  ),
  FileIcon: () => <span data-testid='file-icon' />,
}));

jest.mock('@/modules/pace/components/chat/ChatButtonZampLogo', () => ({
  __esModule: true,
  default: () => <span data-testid='chat-button-logo' />,
}));

jest.mock('@/modules/pace/components/file-viewer/FilePathBreadcrumb', () => ({
  __esModule: true,
  default: ({ fileName }: { fileName: string }) => <span>{fileName}</span>,
}));

jest.mock('@/modules/pace/components/file-viewer/FileViewerContent', () => ({
  __esModule: true,
  default: () => <div data-testid='file-viewer-content' />,
}));

jest.mock('@/modules/pace/components/file-viewer/FileViewerError', () => ({
  __esModule: true,
  default: () => <div data-testid='file-viewer-error' />,
}));

jest.mock('@/modules/pace/hooks/useChatDraftInput', () => ({
  setNewChatDraft: (content: string) => mockSetNewChatDraft(content),
}));

jest.mock('@/modules/pace/hooks/useFileViewer', () => ({
  __esModule: true,
  default: () => ({
    content: '# Population',
    isLoading: false,
    isFileNotFound: false,
    fileCategory: FILE_CATEGORY.MARKDOWN,
    fileExtension: 'md',
    isEditable: true,
    updateContent: jest.fn(),
    mediaUrl: '',
  }),
}));

jest.mock('@/modules/pace/pace.context', () => ({
  usePaceConversationContext: () => ({
    setActiveFileInfo: mockSetActiveFileInfo,
  }),
  usePaceLayoutContext: () => ({
    setChatSidebarState: mockSetChatSidebarState,
    requestInstantFilesPanelTransition: mockRequestInstantFilesPanelTransition,
  }),
}));

describe('FileListingDetailPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hands off to chat with the selected file open in the right panel', () => {
    render(<FileListingDetailPanel filePath='reports/top5 countries.md' onClose={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Chat with File' }));

    expect(mockSetNewChatDraft).toHaveBeenCalledWith("Let's discuss top5 countries.md ");
    expect(mockSetActiveFileInfo).toHaveBeenCalledWith({
      path: 'reports/top5 countries.md',
      name: 'top5 countries.md',
    });
    expect(mockSetChatSidebarState).toHaveBeenCalledWith(CHAT_SIDEBAR_STATE.SIDEBAR);
    expect(mockRequestInstantFilesPanelTransition).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/chat?f=reports%2Ftop5%20countries.md');
  });
});
