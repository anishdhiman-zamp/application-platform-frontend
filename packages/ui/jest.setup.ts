import '@testing-library/dom';
import '@testing-library/jest-dom';
import '@testing-library/react';
import { createElement } from 'react';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return createElement('img', { ...props, alt: props.alt || '' });
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
