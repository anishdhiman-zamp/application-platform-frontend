import { render } from '@testing-library/react';
import FilesPanelTabStrip from '@/modules/pace/components/files-panel/FilesPanelTabStrip';
import { type DynamicTab, TAB_TYPE } from '@/modules/pace/pace.types';

const mockNavigateToTab = jest.fn();
const mockCloseTab = jest.fn();
const mockCloseOtherTabs = jest.fn();
const mockCloseTabsToRight = jest.fn();
const mockCloseAllTabs = jest.fn();

let mockTabs: DynamicTab[] = [];
let mockActiveTabId = '';

class MockResizeObserver {
  observe = jest.fn();
  disconnect = jest.fn();
}

jest.mock('@zamp-platform/ui/utils', () => ({
  cn: (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' '),
}));

jest.mock('modules/pace/components/dynamic-tabs/DynamicTabItem', () => ({
  __esModule: true,
  default: ({ tab }: { tab: DynamicTab }) => <button type='button'>{tab.name}</button>,
}));

jest.mock('@/modules/pace/components/files-panel/FilesPanelAddTabMenu', () => ({
  __esModule: true,
  default: () => <button type='button'>Add tab</button>,
}));

jest.mock('modules/pace/components/dynamic-tabs/useDynamicTabs', () => ({
  useDynamicTabs: () => ({
    tabs: mockTabs,
    activeTab: mockTabs.find((tab) => tab.id === mockActiveTabId) ?? null,
    isTabActive: (tab: DynamicTab) => tab.id === mockActiveTabId,
    navigateToTab: mockNavigateToTab,
    closeTab: mockCloseTab,
    closeOtherTabs: mockCloseOtherTabs,
    closeTabsToRight: mockCloseTabsToRight,
    closeAllTabs: mockCloseAllTabs,
  }),
}));

const createTab = (id: string, type = TAB_TYPE.FILE): DynamicTab => ({
  id,
  stableKey: id,
  name: id,
  path: `/chat?f=${id}`,
  type,
});

describe('FilesPanelTabStrip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTabs = [createTab('first'), createTab('second'), createTab('third')];
    mockActiveTabId = 'second';
    global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
  });

  it('uses compact spacers around the active tab instead of preserving divider margins', () => {
    const { container } = render(<FilesPanelTabStrip />);

    const separators = Array.from(container.querySelectorAll('[aria-hidden="true"]'));

    expect(separators).toHaveLength(2);
    separators.forEach((separator) => {
      expect(separator).toHaveClass('w-1.5');
      expect(separator).not.toHaveClass('mx-1.5');
      expect(separator).not.toHaveClass('bg-GRAY_400');
      expect(separator).toBeEmptyDOMElement();
    });
  });

  it('draws the visible divider inside the stable slot between inactive neighboring tabs', () => {
    mockActiveTabId = 'first';

    const { container } = render(<FilesPanelTabStrip />);

    const separators = Array.from(container.querySelectorAll('[aria-hidden="true"]'));

    expect(separators).toHaveLength(2);
    expect(separators[0]).toHaveClass('w-1.5');
    expect(separators[0]).not.toHaveClass('mx-1.5');
    expect(separators[0]).toBeEmptyDOMElement();
    expect(separators[1]).toHaveClass('w-1.5');
    expect(separators[1]).not.toHaveClass('mx-1.5');
    expect(separators[1]).not.toHaveClass('bg-GRAY_400');
    expect(separators[1].firstElementChild).toHaveClass('bg-GRAY_400', 'h-4', 'w-px');
  });

  it('keeps every separator slot width stable as the active tab changes', () => {
    mockTabs = [createTab('first'), createTab('second'), createTab('third'), createTab('fourth')];
    mockActiveTabId = 'first';

    const { container, rerender } = render(<FilesPanelTabStrip />);

    const expectCompactSlots = () => {
      const separators = Array.from(container.querySelectorAll('[aria-hidden="true"]'));

      expect(separators).toHaveLength(3);
      separators.forEach((separator) => {
        expect(separator).toHaveClass('w-1.5');
        expect(separator).not.toHaveClass('mx-1.5');
        expect(separator).not.toHaveClass('w-px');
      });
    };

    expectCompactSlots();

    mockActiveTabId = 'third';
    rerender(<FilesPanelTabStrip />);

    expectCompactSlots();
  });
});
