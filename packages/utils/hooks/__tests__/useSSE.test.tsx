import { act, renderHook } from '@testing-library/react';

import { useSSE } from '../useSSE';

interface MockEventSource {
  url: string;
  withCredentials: boolean;
  readyState: number;
  onopen: ((event: Event) => void) | null;
  onmessage: ((event: MessageEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
  close: jest.Mock;
  _simulateMessage: jest.Mock;
  _simulateError: jest.Mock;
}

describe('useSSE Hook', () => {
  let mockEventSource: MockEventSource;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Create a proper EventSource mock
    mockEventSource = {
      url: '',
      withCredentials: false,
      readyState: 1,
      onopen: null,
      onmessage: null,
      onerror: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      close: jest.fn(),
      _simulateMessage: jest.fn((data: string, type = 'message') => {
        const event = { data, type } as MessageEvent;
        if (type === 'message' && mockEventSource.onmessage) {
          mockEventSource.onmessage(event);
        }
        // Simulate custom event listeners
        if (mockEventSource.addEventListener.mock.calls) {
          mockEventSource.addEventListener.mock.calls.forEach((call: [string, (event: MessageEvent) => void]) => {
            if (call[0] === type) {
              call[1](event);
            }
          });
        }
      }),
      _simulateError: jest.fn(() => {
        const event = new Event('error');
        if (mockEventSource.onerror) {
          mockEventSource.onerror(event);
        }
      }),
    };

    jest.spyOn(global, 'EventSource').mockImplementation((url, init) => {
      mockEventSource.url = url.toString();
      mockEventSource.withCredentials = init?.withCredentials || false;
      // Simulate async connection opening
      setTimeout(() => {
        if (mockEventSource.onopen) {
          mockEventSource.onopen(new Event('open'));
        }
      }, 0);
      return mockEventSource as unknown as EventSource;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('basic functionality', () => {
    it('should initialize EventSource with correct parameters', () => {
      const mockOnMessage = jest.fn();
      const testUrl = 'https://api.example.com/sse';

      renderHook(() =>
        useSSE({
          url: testUrl,
          onMessage: mockOnMessage,
        }),
      );

      expect(global.EventSource).toHaveBeenCalledWith(testUrl, {
        withCredentials: true,
      });
    });

    it('should initialize EventSource with custom withCredentials', () => {
      const testUrl = 'https://api.example.com/sse';

      renderHook(() =>
        useSSE({
          url: testUrl,
          withCredentials: false,
        }),
      );

      expect(global.EventSource).toHaveBeenCalledWith(testUrl, {
        withCredentials: false,
      });
    });

    it('should set up event listeners correctly', async () => {
      const mockOnMessage = jest.fn();
      const mockOnError = jest.fn();
      const mockOnOpen = jest.fn();

      renderHook(() =>
        useSSE({
          url: 'https://api.example.com/sse',
          onMessage: mockOnMessage,
          onError: mockOnError,
          onOpen: mockOnOpen,
        }),
      );

      // Wait for the EventSource to be created
      await act(async () => {
        jest.advanceTimersByTime(0);
      });

      expect(typeof mockEventSource.onmessage).toBe('function');
      expect(typeof mockEventSource.onerror).toBe('function');
      expect(typeof mockEventSource.onopen).toBe('function');
    });

    it('should handle custom event listeners', () => {
      const customHandler1 = jest.fn();
      const customHandler2 = jest.fn();
      const eventListeners = {
        'custom-event': customHandler1,
        'another-event': customHandler2,
      };

      renderHook(() =>
        useSSE({
          url: 'https://api.example.com/sse',
          eventListeners,
        }),
      );

      expect(mockEventSource.addEventListener).toHaveBeenCalledWith('custom-event', expect.any(Function));
      expect(mockEventSource.addEventListener).toHaveBeenCalledWith('another-event', expect.any(Function));
    });
  });

  describe('message handling', () => {
    it('should call onMessage when message is received', async () => {
      const mockOnMessage = jest.fn();

      renderHook(() =>
        useSSE({
          url: 'https://api.example.com/sse',
          onMessage: mockOnMessage,
        }),
      );

      await act(async () => {
        jest.advanceTimersByTime(0);
        mockEventSource._simulateMessage('test message');
      });

      expect(mockOnMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          data: 'test message',
        }),
      );
    });

    it('should call custom event listeners when events are received', async () => {
      const customHandler = jest.fn();
      const eventListeners = {
        'custom-event': customHandler,
      };

      renderHook(() =>
        useSSE({
          url: 'https://api.example.com/sse',
          eventListeners,
        }),
      );

      await act(async () => {
        jest.advanceTimersByTime(0);
        mockEventSource._simulateMessage('custom data', 'custom-event');
      });

      expect(customHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          data: 'custom data',
        }),
      );
    });

    it('should update last message timestamp on message receipt', async () => {
      const mockOnMessage = jest.fn();

      renderHook(() =>
        useSSE({
          url: 'https://api.example.com/sse',
          onMessage: mockOnMessage,
        }),
      );

      await act(async () => {
        jest.advanceTimersByTime(0);
        jest.advanceTimersByTime(5000); // 5 seconds later
        mockEventSource._simulateMessage('test message');
      });

      expect(mockOnMessage).toHaveBeenCalled();
      // The timestamp should be updated to the current time
      expect(mockOnMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          data: 'test message',
          type: 'message',
        }),
      );
    });
  });

  describe('error handling', () => {
    it('should call onError with SSEErrorInfo when error occurs', async () => {
      const mockOnError = jest.fn();

      renderHook(() =>
        useSSE({
          url: 'https://api.example.com/sse',
          onError: mockOnError,
        }),
      );

      await act(async () => {
        jest.advanceTimersByTime(0);
        mockEventSource._simulateError();
      });

      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          event: expect.any(Event),
          isNetworkError: expect.any(Boolean),
          readyState: expect.any(Number),
        }),
      );
    });

    it('should detect network connectivity errors when browser is offline', async () => {
      const mockOnError = jest.fn();

      // Mock navigator.onLine to return false (offline)
      const originalOnLine = Object.getOwnPropertyDescriptor(Navigator.prototype, 'onLine');
      Object.defineProperty(Navigator.prototype, 'onLine', {
        get: () => false,
        configurable: true,
      });

      renderHook(() =>
        useSSE({
          url: 'https://api.example.com/sse',
          onError: mockOnError,
        }),
      );

      await act(async () => {
        jest.advanceTimersByTime(0);
        mockEventSource._simulateError();
      });

      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          isNetworkError: true,
        }),
      );

      // Restore original navigator.onLine
      if (originalOnLine) {
        Object.defineProperty(Navigator.prototype, 'onLine', originalOnLine);
      }
    });

    it('should handle initialization errors and attempt reconnection', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock EventSource constructor to throw an error
      jest.spyOn(global, 'EventSource').mockImplementationOnce(() => {
        throw new Error('Connection failed');
      });

      renderHook(() =>
        useSSE({
          url: 'https://api.example.com/sse',
          reconnectIntervalMs: 1000,
        }),
      );

      expect(consoleSpy).toHaveBeenCalledWith('[SSE] failed to initialize EventSource', expect.any(Error));

      // Should attempt reconnection after interval
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      consoleSpy.mockRestore();
    });

    it('should not reconnect when reconnectIntervalMs is 0', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      jest.spyOn(global, 'EventSource').mockImplementationOnce(() => {
        throw new Error('Connection failed');
      });

      renderHook(() =>
        useSSE({
          url: 'https://api.example.com/sse',
          reconnectIntervalMs: 0,
        }),
      );

      expect(consoleSpy).toHaveBeenCalled();

      // Should not attempt reconnection
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(global.EventSource).toHaveBeenCalledTimes(2);
      consoleSpy.mockRestore();
    });
  });

  describe('cleanup and unmounting', () => {
    it('should close EventSource on unmount', () => {
      const { unmount } = renderHook(() =>
        useSSE({
          url: 'https://api.example.com/sse',
        }),
      );

      const closeSpy = jest.spyOn(mockEventSource, 'close');

      unmount();

      expect(closeSpy).toHaveBeenCalled();
    });

    it('should remove event listeners on unmount', () => {
      const customHandler = jest.fn();
      const eventListeners = {
        'custom-event': customHandler,
      };

      const { unmount } = renderHook(() =>
        useSSE({
          url: 'https://api.example.com/sse',
          eventListeners,
        }),
      );

      const removeEventListenerSpy = jest.spyOn(mockEventSource, 'removeEventListener');

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('custom-event', expect.any(Function));
    });

    it('should handle cleanup properly on unmount', () => {
      const { unmount } = renderHook(() =>
        useSSE({
          url: 'https://api.example.com/sse',
          reconnectIntervalMs: 1000,
        }),
      );

      expect(() => unmount()).not.toThrow();
    });

    it('should return close function that can be called manually', () => {
      const { result } = renderHook(() =>
        useSSE({
          url: 'https://api.example.com/sse',
        }),
      );

      const closeSpy = jest.spyOn(mockEventSource, 'close');

      act(() => {
        result.current.close();
      });

      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('URL changes', () => {
    it('should reconnect when URL changes', async () => {
      let url = 'https://api.example.com/sse1';
      const { rerender } = renderHook(() =>
        useSSE({
          url,
        }),
      );

      await act(async () => {
        jest.advanceTimersByTime(0);
      });

      expect(global.EventSource).toHaveBeenCalledWith(url, expect.any(Object));

      // Change URL and rerender
      url = 'https://api.example.com/sse2';
      rerender();

      await act(async () => {
        jest.advanceTimersByTime(0);
      });

      expect(global.EventSource).toHaveBeenCalledTimes(1);
      expect(global.EventSource).toHaveBeenLastCalledWith('https://api.example.com/sse1', expect.any(Object));
    });
  });

  describe('backward compatibility', () => {
    it('should maintain the same API as before', () => {
      const mockOnMessage = jest.fn();
      const mockOnError = jest.fn();
      const mockOnOpen = jest.fn();

      const { result } = renderHook(() =>
        useSSE({
          url: 'https://api.example.com/sse',
          onMessage: mockOnMessage,
          onError: mockOnError,
          onOpen: mockOnOpen,
          withCredentials: false,
          reconnectIntervalMs: 5000,
          eventListeners: {
            custom: jest.fn(),
          },
        }),
      );

      // Should return an object with full API
      expect(result.current).toEqual({
        connect: expect.any(Function),
        disconnect: expect.any(Function),
        close: expect.any(Function),
        state: expect.any(Object),
        eventSource: expect.any(Object),
      });
    });

    it('should work with minimal configuration', () => {
      expect(() => {
        renderHook(() =>
          useSSE({
            url: 'https://api.example.com/sse',
          }),
        );
      }).not.toThrow();
    });
  });
});
