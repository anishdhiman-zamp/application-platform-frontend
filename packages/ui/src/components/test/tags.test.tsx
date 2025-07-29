import { render, screen } from '@testing-library/react';
import { Tag } from '../ui/tags';

describe('Tag', () => {
  it('renders children', () => {
    render(<Tag>New</Tag>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('uses default variant (outline)', () => {
    render(<Tag data-testid='tag-default'>Outline</Tag>);
    const tag = screen.getByTestId('tag-default');
    expect(tag.className).toContain('border-gray-400');
  });

  it('applies custom className', () => {
    render(<Tag className='custom-class'>Styled</Tag>);
    expect(screen.getByText('Styled')).toHaveClass('custom-class');
  });

  it.each([
    ['blue', 'bg-blue-150'],
    ['yellow', 'bg-yellow-100'],
    ['orange', 'bg-orange-200'],
    ['green', 'bg-green-150'],
    ['violet', 'bg-violet-100'],
    ['outline', 'border-gray-400'],
    ['ghost', 'bg-transparent'],
    ['pink', 'bg-pink-100'],
    ['gray', 'bg-gray-50 text-gray-900'],
  ] as const)('applies correct class for variant "%s"', (variant, expectedClass) => {
    render(
      <Tag variant={variant} data-testid={`tag-${variant}`}>
        {variant}
      </Tag>,
    );
    expect(screen.getByTestId(`tag-${variant}`)).toHaveClass(expectedClass);
  });
});

const TAG_VARIANTS = ['blue', 'yellow', 'orange', 'green', 'violet', 'outline', 'ghost', 'pink', 'gray'] as const;

describe.each(TAG_VARIANTS)('Tag snapshot variants', (variant) => {
  it(`matches snapshot for variant "${variant}"`, () => {
    const { container } = render(<Tag variant={variant}>Tag {variant}</Tag>);
    expect(container.firstChild).toMatchSnapshot();
  });
});
