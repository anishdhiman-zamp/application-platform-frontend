import '@testing-library/jest-dom';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { ScrollContainer } from '../ui/scroll-container';
import type { ScrollContainerRef } from '../ui/scroll-container';

describe('ScrollContainer - Rendering', () => {
  it('renders children', () => {
    render(
      <ScrollContainer>
        <div>Test content</div>
      </ScrollContainer>,
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders fade overlay elements by default', () => {
    const { container } = render(
      <ScrollContainer>
        <div>Content</div>
      </ScrollContainer>,
    );
    const overlays = container.querySelectorAll('[aria-hidden="true"]');

    expect(overlays).toHaveLength(2);
  });

  it('hides fade overlays when showFadeOverlay is false', () => {
    const { container } = render(
      <ScrollContainer showFadeOverlay={false}>
        <div>Content</div>
      </ScrollContainer>,
    );
    const overlays = container.querySelectorAll('[aria-hidden="true"]');

    expect(overlays).toHaveLength(0);
  });

  it('hides fade overlays when disableFadeOverlay is true', () => {
    const { container } = render(
      <ScrollContainer disableFadeOverlay>
        <div>Content</div>
      </ScrollContainer>,
    );
    const overlays = container.querySelectorAll('[aria-hidden="true"]');

    expect(overlays).toHaveLength(0);
  });

  it('does not render scroll-to-bottom button by default', () => {
    render(
      <ScrollContainer>
        <div>Content</div>
      </ScrollContainer>,
    );
    expect(screen.queryByLabelText('Scroll to bottom')).not.toBeInTheDocument();
  });

  it('renders scroll-to-bottom button when showScrollToBottom is true', () => {
    render(
      <ScrollContainer showScrollToBottom>
        <div>Content</div>
      </ScrollContainer>,
    );
    expect(screen.getByLabelText('Scroll to bottom')).toBeInTheDocument();
  });

  it('applies custom className to the wrapper', () => {
    const { container } = render(
      <ScrollContainer className='custom-wrapper'>
        <div>Content</div>
      </ScrollContainer>,
    );

    expect(container.firstChild).toHaveClass('custom-wrapper');
  });

  it('applies custom scrollClassName to the scroll container', () => {
    const { container } = render(
      <ScrollContainer scrollClassName='custom-scroll'>
        <div>Content</div>
      </ScrollContainer>,
    );
    const scrollEl = container.querySelector('.custom-scroll');

    expect(scrollEl).toBeInTheDocument();
  });

  it('applies thin scrollbar style by default', () => {
    const { container } = render(
      <ScrollContainer>
        <div>Content</div>
      </ScrollContainer>,
    );
    const scrollEl = container.querySelector('[class*="scrollbar-width"]');

    expect(scrollEl).toBeInTheDocument();
    expect(scrollEl).toHaveClass('[scrollbar-width:thin]');
  });

  it('applies none scrollbar style', () => {
    const { container } = render(
      <ScrollContainer scrollbarStyle='none'>
        <div>Content</div>
      </ScrollContainer>,
    );
    const scrollEl = container.querySelector('[class*="scrollbar-width"]');

    expect(scrollEl).toBeInTheDocument();
    expect(scrollEl).toHaveClass('[scrollbar-width:none]');
  });
});

describe('ScrollContainer - Imperative Ref', () => {
  it('exposes scrollToBottom via ref', () => {
    const ref = createRef<ScrollContainerRef>();

    render(
      <ScrollContainer ref={ref}>
        <div>Content</div>
      </ScrollContainer>,
    );

    expect(ref.current).not.toBeNull();
    expect(typeof ref.current?.scrollToBottom).toBe('function');
  });

  it('exposes scrollToTop via ref', () => {
    const ref = createRef<ScrollContainerRef>();

    render(
      <ScrollContainer ref={ref}>
        <div>Content</div>
      </ScrollContainer>,
    );

    expect(typeof ref.current?.scrollToTop).toBe('function');
  });

  it('exposes isAtBottom via ref', () => {
    const ref = createRef<ScrollContainerRef>();

    render(
      <ScrollContainer ref={ref}>
        <div>Content</div>
      </ScrollContainer>,
    );

    expect(typeof ref.current?.isAtBottom).toBe('function');
    expect(ref.current?.isAtBottom()).toBe(true);
  });

  it('exposes getScrollElement via ref', () => {
    const ref = createRef<ScrollContainerRef>();

    render(
      <ScrollContainer ref={ref}>
        <div>Content</div>
      </ScrollContainer>,
    );

    const el = ref.current?.getScrollElement();

    expect(el).toBeInstanceOf(HTMLDivElement);
  });
});

describe('ScrollContainer - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(
      <ScrollContainer>
        <div>Default content</div>
      </ScrollContainer>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with all features enabled', () => {
    const { container } = render(
      <ScrollContainer showFadeOverlay showScrollToBottom scrollbarStyle='none'>
        <div>Full-featured content</div>
      </ScrollContainer>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with overlays disabled', () => {
    const { container } = render(
      <ScrollContainer showFadeOverlay={false} showScrollToBottom>
        <div>No overlays content</div>
      </ScrollContainer>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
