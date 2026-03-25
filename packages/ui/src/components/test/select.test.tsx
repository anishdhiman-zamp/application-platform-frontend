import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import { Select, SelectOption } from '../ui/select';

const mockOptions: SelectOption[] = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
];

describe('Select component', () => {
  it('renders with label and placeholder', () => {
    render(<Select options={mockOptions} label='My Label' placeholder='Select an option' />);
    expect(screen.getByText('My Label')).toBeInTheDocument();
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('shows options when clicked and selects one', async () => {
    const onValueChange = jest.fn();
    render(<Select options={mockOptions} onValueChange={onValueChange} placeholder='Choose...' />);

    fireEvent.click(screen.getByTestId('select-trigger'));

    await waitFor(() => {
      expect(screen.getByText('Option A')).toBeInTheDocument();
      expect(screen.getByText('Option B')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Option A'));

    expect(onValueChange).toHaveBeenCalledWith('a');
    expect(screen.getByText('Option A')).toBeInTheDocument();
  });

  it('fetches options on open when fetchOptions is provided', async () => {
    const fetchOptions = jest.fn().mockResolvedValue({
      options: [{ label: 'Remote Option', value: 'remote' }],
      hasMore: false,
    });

    render(<Select options={[]} fetchOptions={fetchOptions} />);

    fireEvent.click(screen.getByTestId('select-trigger'));

    await waitFor(() => {
      expect(fetchOptions).toHaveBeenCalled();
      expect(screen.getByText('Remote Option')).toBeInTheDocument();
    });
  });

  it('clears dynamic options on `clearOptions` trigger', async () => {
    const fetchOptions = jest.fn().mockResolvedValue({
      options: [{ label: 'Fetched', value: 'fetched' }],
      hasMore: false,
    });

    const Wrapper = () => {
      const [clearOptions, setClearOptions] = React.useState(false);

      return (
        <>
          <button data-testid='clear-btn' onClick={() => setClearOptions(true)}>
            Clear
          </button>
          <Select
            options={[]}
            fetchOptions={fetchOptions}
            clearOptions={clearOptions}
            setShouldClearOptions={setClearOptions}
          />
        </>
      );
    };

    render(<Wrapper />);
    fireEvent.click(screen.getByTestId('select-trigger'));

    await waitFor(() => {
      expect(screen.getByText('Fetched')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('clear-btn'));
    fireEvent.click(screen.getByTestId('select-trigger'));

    await waitFor(() => {
      expect(screen.queryByText('Fetched')).not.toBeInTheDocument();
      expect(fetchOptions).toHaveBeenCalledTimes(1);
    });
  });

  it('renders all chat feedback issue type options including "Know a better approach?"', async () => {
    const ISSUE_TYPE_OPTIONS = [
      { label: 'UI bug', value: 'UI_BUG' },
      { label: 'Overactive refusal', value: 'OVERACTIVE_REFUSAL' },
      { label: 'Did not fully follow my request', value: 'DID_NOT_FOLLOW_REQUEST' },
      { label: 'Not factually correct', value: 'NOT_FACTUALLY_CORRECT' },
      { label: 'Incomplete response', value: 'INCOMPLETE_RESPONSE' },
      { label: 'Should have searched the web', value: 'SHOULD_HAVE_SEARCHED_WEB' },
      { label: 'Memory not applied', value: 'MEMORY_NOT_APPLIED' },
      { label: 'Know a better approach?', value: 'KNOW_BETTER_APPROACH' },
      { label: 'Report content', value: 'REPORT_CONTENT' },
      { label: 'Other', value: 'OTHER' },
    ];

    render(<Select options={ISSUE_TYPE_OPTIONS} placeholder='Select...' />);
    fireEvent.click(screen.getByTestId('select-trigger'));

    await waitFor(() => {
      expect(screen.getByText('Know a better approach?')).toBeInTheDocument();
    });
  });

  it('calls onValueChange with KNOW_BETTER_APPROACH when that option is selected', async () => {
    const ISSUE_TYPE_OPTIONS = [
      { label: 'Know a better approach?', value: 'KNOW_BETTER_APPROACH' },
      { label: 'Other', value: 'OTHER' },
    ];
    const onValueChange = jest.fn();

    render(<Select options={ISSUE_TYPE_OPTIONS} onValueChange={onValueChange} placeholder='Select...' />);
    fireEvent.click(screen.getByTestId('select-trigger'));

    await waitFor(() => {
      expect(screen.getByText('Know a better approach?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Know a better approach?'));
    expect(onValueChange).toHaveBeenCalledWith('KNOW_BETTER_APPROACH');
  });

  // Critical snapshots that could break component usage
  it('matches snapshot for default select', () => {
    const { container } = render(<Select options={mockOptions} placeholder='Snap' />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for select with label', () => {
    const { container } = render(<Select options={mockOptions} label='Test Label' placeholder='Snap' />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for select with custom className', () => {
    const { container } = render(<Select options={mockOptions} className='custom-class' placeholder='Custom Class' />);
    expect(container).toMatchSnapshot();
  });
});
