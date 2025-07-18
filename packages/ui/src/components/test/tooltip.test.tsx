import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

describe('Tooltip', () => {
  it('renders content on hover', async () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button>Hover me</button>
          </TooltipTrigger>
          <TooltipContent data-testid='tooltip'>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    // tooltip should not be in DOM before hover
    expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument();

    await userEvent.hover(screen.getByText('Hover me'));

    expect(await screen.findByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toHaveTextContent('Tooltip text');
  });

  it('matches snapshot when open', async () => {
    const { container } = render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button>Hover me</button>
          </TooltipTrigger>
          <TooltipContent data-testid='tooltip-snap'>Snapshot tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    await userEvent.hover(screen.getByText('Hover me'));
    await waitFor(() => {
      expect(screen.getByTestId('tooltip-snap')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});
