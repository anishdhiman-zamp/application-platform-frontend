import '@testing-library/dom';
import '@testing-library/jest-dom';
import '@testing-library/react';

// Polyfill for TextDecoder and TextEncoder in Jest environment
global.TextDecoder = global.TextDecoder || require('util').TextDecoder;
global.TextEncoder = global.TextEncoder || require('util').TextEncoder;

// Mock react-markdown and its dependencies to avoid ES module parsing issues
jest.mock('react-markdown', () => {
  return function ReactMarkdown({ children }: { children: string }) {
    return children;
  };
});

jest.mock('rehype-slug', () => ({}));
jest.mock('remark-gfm', () => ({}));

// Mock @lottiefiles/react-lottie-player to avoid canvas issues in Jest
jest.mock('@lottiefiles/react-lottie-player', () => ({
  Player: function MockedPlayer() {
    return null;
  },
}));
