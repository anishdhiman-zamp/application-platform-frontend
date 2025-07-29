import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Combobox } from '../ui/combobox';

const mockOptions = [
  { id: '1', value: 'option1', label: 'Option 1' },
  { id: '2', value: 'option2', label: 'Option 2' },
  { id: '3', value: 'option3', label: 'Option 3' },
];

const mockOptionsWithIcons = [
  { id: '1', value: 'option1', label: 'Option 1', icon: <span data-testid='icon1'>🔍</span> },
  { id: '2', value: 'option2', label: 'Option 2', icon: <span data-testid='icon2'>📁</span> },
];

describe('Combobox Component - Core Functional Tests', () => {
  it('renders options when open and handles selection', () => {
    const onSelect = jest.fn();
    render(
      <Combobox options={mockOptions} onSelect={onSelect} open={true} onOpenChange={() => {}}>
        <button>Open</button>
      </Combobox>,
    );

    fireEvent.click(screen.getByText('Option 1'));
    expect(onSelect).toHaveBeenCalledWith(mockOptions[0]);
  });

  it('filters options based on search input', async () => {
    render(
      <Combobox options={mockOptions} onSelect={jest.fn()} open={true} onOpenChange={jest.fn()}>
        <button>Open</button>
      </Combobox>,
    );
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'Option 1' } });

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
    });
  });

  it('shows empty text when no results match', async () => {
    render(
      <Combobox options={mockOptions} onSelect={jest.fn()} open={true} onOpenChange={jest.fn()} emptyText='No matches'>
        <button>Open</button>
      </Combobox>,
    );
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'nomatch' } });

    await waitFor(() => {
      expect(screen.getByText('No matches')).toBeInTheDocument();
    });
  });

  it('renders loading skeletons', () => {
    render(
      <Combobox options={mockOptions} onSelect={jest.fn()} open={true} onOpenChange={jest.fn()} optionsLoading={true}>
        <button>Open</button>
      </Combobox>,
    );
    expect(screen.getAllByTestId('skeleton')).toHaveLength(10);
  });

  it('renders icons with options', () => {
    render(
      <Combobox options={mockOptionsWithIcons} onSelect={jest.fn()} open={true} onOpenChange={jest.fn()}>
        <button>Open</button>
      </Combobox>,
    );
    expect(screen.getByTestId('icon1')).toBeInTheDocument();
    expect(screen.getByTestId('icon2')).toBeInTheDocument();
  });

  it('renders overlay content when provided', () => {
    render(
      <Combobox
        options={mockOptions}
        onSelect={jest.fn()}
        open={true}
        onOpenChange={jest.fn()}
        overLayContent={<div data-testid='overlay' />}
      >
        <button>Open</button>
      </Combobox>,
    );
    expect(screen.getByTestId('overlay')).toBeInTheDocument();
  });

  it('truncates long option labels gracefully', () => {
    const onSelect = jest.fn();
    const onOpenChange = jest.fn();
    const longLabel = 'This is a very long label that should be truncated in the UI when it overflows';

    render(
      <Combobox
        options={[{ id: '1', value: 'long', label: longLabel }]}
        onSelect={onSelect}
        open={true}
        onOpenChange={onOpenChange}
        labelClassName='truncate'
      >
        <button>Open Combobox</button>
      </Combobox>,
    );

    const item = screen.getByText(longLabel);
    expect(item).toHaveClass('truncate');
  });
});

describe('Combobox Component - Structural and Accessibility Tests', () => {
  it('renders with portal when enabled', () => {
    render(
      <Combobox options={mockOptions} onSelect={() => {}} open={true} onOpenChange={() => {}} isPortalNeeded>
        <button>Open</button>
      </Combobox>,
    );
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('applies ARIA and dialog attributes', () => {
    render(
      <Combobox options={mockOptions} onSelect={() => {}} open={true} onOpenChange={() => {}}>
        <button>Open</button>
      </Combobox>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('id', 'combobox-content');
  });
});

describe('Combobox Component - Snapshot', () => {
  it('matches snapshot for open state with options', () => {
    const { container } = render(
      <Combobox
        options={mockOptionsWithIcons}
        onSelect={() => {}}
        open={true}
        onOpenChange={() => {}}
        overLayContent={<div>Extra</div>}
      >
        <button>Open</button>
      </Combobox>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
