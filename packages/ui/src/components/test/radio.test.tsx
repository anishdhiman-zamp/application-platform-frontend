import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Radio, RadioGroup } from '../ui/radio';

describe('RadioGroup Component - Functional Tests', () => {
  it('renders radio options and allows selection with proper accessibility attributes and interactions', async () => {
    render(
      <RadioGroup defaultValue='option-1' data-testid='radio-group'>
        <Radio value='option-1' data-testid='radio-1' />
        <Radio value='option-2' data-testid='radio-2' />
      </RadioGroup>,
    );

    const radio1 = screen.getByTestId('radio-1');
    const radio2 = screen.getByTestId('radio-2');

    expect(radio1).toBeChecked();
    expect(radio2).not.toBeChecked();
    expect(radio1).toHaveAttribute('role', 'radio');
    expect(radio1).toHaveAttribute('aria-checked', 'true');
    expect(radio2).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(radio2);

    expect(radio1).not.toBeChecked();
    expect(radio2).toBeChecked();
    expect(radio1).toHaveAttribute('aria-checked', 'false');
    expect(radio2).toHaveAttribute('aria-checked', 'true');
  });

  it('merges custom className for RadioGroup and Radio', () => {
    render(
      <RadioGroup className='custom-group' data-testid='radio-group'>
        <Radio value='test' className='custom-radio' data-testid='radio' />
      </RadioGroup>,
    );

    const group = screen.getByTestId('radio-group');
    const radio = screen.getByTestId('radio');

    expect(group).toHaveClass('custom-group');
    expect(radio).toHaveClass('custom-radio');
  });

  it('renders radio indicator with icon when selected', () => {
    render(
      <RadioGroup defaultValue='x'>
        <Radio value='x' data-testid='radio' />
      </RadioGroup>,
    );

    const svg = screen.getByTestId('radio').querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('does not render radio indicator icon when unselected', () => {
    render(
      <RadioGroup defaultValue='x'>
        <Radio value='x' data-testid='radio-selected' />
        <Radio value='y' data-testid='radio-unselected' />
      </RadioGroup>,
    );

    const selectedRadio = screen.getByTestId('radio-selected');
    const unselectedRadio = screen.getByTestId('radio-unselected');

    // Selected radio should have icon
    const selectedSvg = selectedRadio.querySelector('svg');
    expect(selectedSvg).toBeInTheDocument();

    // Unselected radio should not have icon
    const unselectedSvg = unselectedRadio.querySelector('svg');
    expect(unselectedSvg).not.toBeInTheDocument();
  });

  // Critical snapshots that could break component usage
  it('matches snapshot for default radio group', () => {
    const { container } = render(
      <RadioGroup defaultValue='1'>
        <Radio value='1' />
        <Radio value='2' />
      </RadioGroup>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for radio group with custom classes', () => {
    const { container } = render(
      <RadioGroup defaultValue='1' className='custom-group'>
        <Radio value='1' className='custom-radio' />
        <Radio value='2' />
      </RadioGroup>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for disabled radio group', () => {
    const { container } = render(
      <RadioGroup defaultValue='1' disabled>
        <Radio value='1' />
        <Radio value='2' />
      </RadioGroup>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for radio group with selected state', () => {
    const { container } = render(
      <RadioGroup defaultValue='2'>
        <Radio value='1' />
        <Radio value='2' />
        <Radio value='3' />
      </RadioGroup>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
