import '@testing-library/dom';
import '@testing-library/jest-dom';
import '@testing-library/react';

// Polyfill for TextDecoder and TextEncoder in Jest environment
global.TextDecoder = global.TextDecoder || require('util').TextDecoder;
global.TextEncoder = global.TextEncoder || require('util').TextEncoder;
