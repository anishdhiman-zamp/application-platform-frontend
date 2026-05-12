import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import FileViewerHeader from '@/modules/pace/components/file-viewer/FileViewerHeader';
import { CHAT_SIDEBAR_STATE } from '@/modules/pace/pace.types';

const mockPush = jest.fn();
const mockSetNewChatDraft = jest.fn();
const mockSetActiveFileInfo = jest.fn();
const mockSetChatSidebarState = jest.fn();
const mockRequestInstantFilesPanelTransition = jest.fn();
const mockCloseAllTabs = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => '/chat/files',
  useRouter: () => ({ push: mockPush }),
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
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@zamp-platform/ui/utils', () => ({
  cn: (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' '),
}));

jest.mock('@/modules/pace/components/chat/ChatButtonZampLogo', () => ({
  __esModule: true,
  default: () => <span data-testid='chat-button-logo' />,
}));

jest.mock('@/modules/pace/components/dynamic-tabs/useDynamicTabs', () => ({
  useDynamicTabs: () => ({
    closeAllTabs: mockCloseAllTabs,
  }),
}));

jest.mock('@/modules/pace/components/file-viewer/FilePathBreadcrumb', () => ({
  __esModule: true,
  default: ({ fileName }: { fileName: string }) => <span>{fileName}</span>,
}));

jest.mock('@/modules/pace/components/file-viewer/FileViewerHeaderMenu', () => ({
  __esModule: true,
  default: () => <button type='button'>More</button>,
  ViewModeMenuSection: () => null,
}));

jest.mock('@/modules/pace/components/file-viewer/RenameFileDialog', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/modules/pace/components/files/DeleteConfirmationDialog', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/modules/pace/hooks/useChatDraftInput', () => ({
  setNewChatDraft: (content: string) => mockSetNewChatDraft(content),
}));

jest.mock('@/modules/pace/hooks/useFileViewerHeaderActions', () => ({
  useFileViewerHeaderActions: () => ({
    handleActionClick: jest.fn(),
    isDeleting: false,
    deleteConfirmation: {
      isOpen: false,
      onOpenChange: jest.fn(),
      onConfirm: jest.fn(),
    },
  }),
}));

jest.mock('@/modules/pace/hooks/useFileViewerHeaderRename', () => ({
  useFileViewerHeaderRename: () => ({
    isRenameDialogOpen: false,
    isRenameLoading: false,
    siblingNames: [],
    openRenameDialog: jest.fn(),
    setRenameDialogOpen: jest.fn(),
    handleRenameSubmit: jest.fn(),
  }),
}));

jest.mock('@/modules/pace/pace.context', () => ({
  usePaceConversationContext: () => ({
    setActiveFileInfo: mockSetActiveFileInfo,
  }),
  usePaceLayoutContext: () => ({
    wordWrapEnabled: false,
    toggleWordWrap: jest.fn(),
    toggleTreeSidebar: jest.fn(),
    isTreeSidebarOpen: false,
    setChatSidebarState: mockSetChatSidebarState,
    requestInstantFilesPanelTransition: mockRequestInstantFilesPanelTransition,
  }),
}));

describe('FileViewerHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hands off to chat with the selected file open in the right panel', () => {
    render(<FileViewerHeader filePath='reports/top5 countries.md' fileName='top5 countries.md' />);

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
