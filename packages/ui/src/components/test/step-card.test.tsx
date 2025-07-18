import { fireEvent, render, screen } from '@testing-library/react';
import { StepCard } from '../ui/step-card';

describe('StepCard', () => {
  it('renders the step number and children', () => {
    render(
      <StepCard stepNumber={2}>
        <p>Step content</p>
      </StepCard>,
    );

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Step content')).toBeInTheDocument();
  });

  it('does not render remove (X) button if onRemove is not passed', () => {
    render(
      <StepCard stepNumber={1}>
        <p>No remove</p>
      </StepCard>,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('remove-icon')).not.toBeInTheDocument();
  });

  it('renders and triggers onRemove when remove button is clicked', () => {
    const onRemove = jest.fn();
    render(
      <StepCard stepNumber={3} onRemove={onRemove}>
        <p>Removable step</p>
      </StepCard>,
    );

    const closeButton = screen.getByTestId('remove-button');
    fireEvent.click(closeButton);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('applies custom className and additional props', () => {
    render(
      <StepCard stepNumber={4} className='custom-class' data-testid='step-card' aria-label='step-card-label'>
        <p>With props</p>
      </StepCard>,
    );

    const el = screen.getByTestId('step-card');
    expect(el).toHaveClass('custom-class');
    expect(el).toHaveAttribute('aria-label', 'step-card-label');
  });

  it('matches snapshot with default layout', () => {
    const { container } = render(
      <StepCard stepNumber={1}>
        <p>Snapshot content</p>
      </StepCard>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with remove button and custom class', () => {
    const { container } = render(
      <StepCard stepNumber={5} onRemove={jest.fn()} className='extra-padding'>
        <div>More content</div>
      </StepCard>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
