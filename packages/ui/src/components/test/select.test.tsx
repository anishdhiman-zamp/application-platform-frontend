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
