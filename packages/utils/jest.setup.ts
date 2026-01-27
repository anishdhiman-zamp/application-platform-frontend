import '@testing-library/dom';
import '@testing-library/jest-dom';
import '@testing-library/react';

// Mock EventSource for SSE tests
global.EventSource = class EventSource {
  url: string;
  withCredentials: boolean;
  readyState: number;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  private listeners: Map<string, ((event: MessageEvent) => void)[]> = new Map();

  constructor(url: string, eventSourceInitDict?: EventSourceInit) {
    this.url = url;
    this.withCredentials = eventSourceInitDict?.withCredentials || false;
    this.readyState = 0; // CONNECTING

    // Simulate connection opening
    setTimeout(() => {
      this.readyState = 1; // OPEN
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 0);
  }

  addEventListener(type: string, listener: (event: MessageEvent) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);
  }

  removeEventListener(type: string, listener: (event: MessageEvent) => void) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  close() {
    this.readyState = 2; // CLOSED
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dispatchEvent(_event: Event): boolean {
    return true;
  }

  // Helper method for tests to simulate incoming messages
  _simulateMessage(data: string, type = 'message') {
    const event = new MessageEvent(type, { data });
    if (type === 'message' && this.onmessage) {
      this.onmessage(event);
    }
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach((listener) => listener(event));
    }
  }

  // Helper method for tests to simulate errors
  _simulateError() {
    const event = new Event('error');
    if (this.onerror) {
      this.onerror(event);
    }
  }

  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSED = 2;
} as unknown as typeof EventSource;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock TextDecoder for blob utilities
if (!global.TextDecoder) {
  global.TextDecoder = class TextDecoder {
    encoding = 'utf-8';
    fatal = false;
    ignoreBOM = false;

    constructor() {}

    decode(input?: BufferSource): string {
      if (!input) return '';
      return Buffer.from(input as ArrayBuffer).toString('utf-8');
    }
  };
}

if (!global.TextEncoder) {
  global.TextEncoder = class TextEncoder {
    encoding = 'utf-8';

    constructor() {}

    encode(input: string = ''): Uint8Array {
      return new Uint8Array(Buffer.from(input, 'utf-8'));
    }

    encodeInto() {
      return { read: 0, written: 0 };
    }
  } as unknown as typeof TextEncoder;
}

// Mock IDBKeyRange for IndexedDB tests
if (!global.IDBKeyRange) {
  global.IDBKeyRange = class IDBKeyRange {
    lower: unknown;
    upper: unknown;
    lowerOpen: boolean;
    upperOpen: boolean;

    constructor() {
      this.lower = undefined;
      this.upper = undefined;
      this.lowerOpen = false;
      this.upperOpen = false;
    }

    static upperBound(upper: unknown, open = false): IDBKeyRange {
      const range = new IDBKeyRange();
      range.upper = upper;
      range.upperOpen = open;
      return range;
    }

    static lowerBound(lower: unknown, open = false): IDBKeyRange {
      const range = new IDBKeyRange();
      range.lower = lower;
      range.lowerOpen = open;
      return range;
    }

    static bound(lower: unknown, upper: unknown, lowerOpen = false, upperOpen = false): IDBKeyRange {
      const range = new IDBKeyRange();
      range.lower = lower;
      range.upper = upper;
      range.lowerOpen = lowerOpen;
      range.upperOpen = upperOpen;
      return range;
    }

    static only(value: unknown): IDBKeyRange {
      const range = new IDBKeyRange();
      range.lower = value;
      range.upper = value;
      return range;
    }
  } as typeof IDBKeyRange;
}

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});
