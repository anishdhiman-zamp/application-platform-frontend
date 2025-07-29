import '@testing-library/dom';
import '@testing-library/jest-dom';
import '@testing-library/react';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
};

// Mock scrollIntoView for all elements
global.HTMLElement.prototype.scrollIntoView = jest.fn();
