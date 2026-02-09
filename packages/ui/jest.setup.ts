import '@testing-library/dom';
import '@testing-library/jest-dom';
import '@testing-library/react';
import { createElement } from 'react';

// Mock Next.js Image component (filter props that are invalid on native img)
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { fill, priority, sizes, ...imgProps } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return createElement('img', { ...imgProps, alt: (props.alt as string) || '' });
  },
}));

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
};

// Mock scrollIntoView for all elements
global.HTMLElement.prototype.scrollIntoView = jest.fn();
