import { render, screen } from '@testing-library/react';
import { ListCard } from '../ui/list-card';

describe('ListCard', () => {
  it('renders header and children content', () => {
    render(
      <ListCard header='Header Title' data-testid='list-card'>
        <p>Body Content</p>
      </ListCard>,
    );

    const card = screen.getByTestId('list-card');
    expect(screen.getByText('Header Title')).toBeInTheDocument();
    expect(screen.getByText('Body Content')).toBeInTheDocument();
    expect(card).toBeInTheDocument();
  });

  it('renders rightComponent if provided', () => {
    render(
      <ListCard
        header='Header'
        rightComponent={<span data-testid='right-comp'>Right Side</span>}
        data-testid='list-card'
      >
        <div>Body</div>
      </ListCard>,
    );

    expect(screen.getByTestId('right-comp')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(
      <ListCard header='Header' className='custom-border' data-testid='list-card'>
        Content
      </ListCard>,
    );

    const card = screen.getByTestId('list-card');
    expect(card).toHaveClass('custom-border');
  });

  it('matches snapshot with all props', () => {
    const { container } = render(
      <ListCard
        header={<strong>Snapshot Header</strong>}
        rightComponent={<span>Right</span>}
        className='extra-style'
        data-testid='list-card'
      >
        <div>Snapshot Body</div>
      </ListCard>,
    );

    expect(container).toMatchSnapshot();
  });
});
