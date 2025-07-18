import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Popover, PopoverAnchor, PopoverContent, PopoverMenuItem, PopoverPortal, PopoverTrigger } from '../ui/popover';

describe('Popover', () => {
  it('renders trigger and opens content on click', async () => {
    render(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover Content</PopoverContent>
      </Popover>,
    );

    expect(screen.queryByText('Popover Content')).not.toBeInTheDocument();
    await userEvent.click(screen.getByText('Open Popover'));
    expect(screen.getByText('Popover Content')).toBeInTheDocument();
  });

  it('applies custom className to content', async () => {
    render(
      <Popover>
        <PopoverTrigger>Trigger</PopoverTrigger>
        <PopoverContent className='custom-class'>Content</PopoverContent>
      </Popover>,
    );

    await userEvent.click(screen.getByText('Trigger'));
    const content = screen.getByText('Content');
    expect(content).toHaveClass('custom-class');
  });

  it('renders PopoverAnchor and PopoverPortal', async () => {
    render(
      <Popover>
        <PopoverTrigger>Open Portal</PopoverTrigger>
        <PopoverAnchor data-testid='anchor'>Anchor</PopoverAnchor>
        <PopoverPortal>
          <PopoverContent>Inside Portal</PopoverContent>
        </PopoverPortal>
      </Popover>,
    );

    expect(screen.getByTestId('anchor')).toBeInTheDocument();
    expect(screen.queryByText('Inside Portal')).not.toBeInTheDocument();
  });

  it('renders PopoverMenuItem with proper styling and attributes', () => {
    render(
      <PopoverMenuItem inset className='test-class'>
        Item
      </PopoverMenuItem>,
    );
    const item = screen.getByText('Item');
    expect(item).toHaveClass('pl-8');
    expect(item).toHaveClass('test-class');
    expect(item).toHaveAttribute('data-slot', 'popover-menu-item');
    expect(item).toHaveClass('cursor-pointer');
    expect(item).toHaveClass('outline-hidden');
  });

  it('matches snapshot of full popover structure', async () => {
    const { container } = render(
      <Popover>
        <PopoverTrigger>Trigger</PopoverTrigger>
        <PopoverAnchor>Anchor</PopoverAnchor>
        <PopoverContent className='custom-class'>
          <PopoverMenuItem>Menu Item</PopoverMenuItem>
        </PopoverContent>
      </Popover>,
    );

    await userEvent.click(screen.getByText('Trigger'));
    expect(container).toMatchSnapshot();
  });
});
