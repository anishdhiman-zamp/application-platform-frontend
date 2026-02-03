import { act, renderHook } from '@testing-library/react';

import { useAutoFocus } from '../useAutoFocus';

describe('useAutoFocus Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('basic functionality', () => {
    it('should return setRef and elementRef', () => {
      const { result } = renderHook(() => useAutoFocus());

      expect(result.current.setRef).toBeInstanceOf(Function);
      expect(result.current.elementRef).toHaveProperty('current', null);
    });

    it('should focus element when enabled is true', () => {
      const mockInput = document.createElement('input');
      const focusSpy = jest.spyOn(mockInput, 'focus');

      renderHook(() => {
        const { setRef } = useAutoFocus<HTMLInputElement>({ enabled: true });
        // Simulate ref being set during render (like React does)
        setRef(mockInput);
        return { setRef };
      });

      expect(focusSpy).toHaveBeenCalledTimes(1);
    });

    it('should not focus element when enabled is false', () => {
      const mockInput = document.createElement('input');
      const focusSpy = jest.spyOn(mockInput, 'focus');

      renderHook(() => {
        const { setRef } = useAutoFocus<HTMLInputElement>({ enabled: false });
        setRef(mockInput);
        return { setRef };
      });

      expect(focusSpy).not.toHaveBeenCalled();
    });

    it('should focus element when enabled changes from false to true', () => {
      const mockInput = document.createElement('input');
      const focusSpy = jest.spyOn(mockInput, 'focus');

      const { rerender } = renderHook(
        ({ enabled }) => {
          const { setRef } = useAutoFocus<HTMLInputElement>({ enabled });
          setRef(mockInput);
          return { setRef };
        },
        { initialProps: { enabled: false } },
      );

      expect(focusSpy).not.toHaveBeenCalled();

      rerender({ enabled: true });

      expect(focusSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('delay option', () => {
    it('should delay focus when delay option is provided', () => {
      const mockInput = document.createElement('input');
      const focusSpy = jest.spyOn(mockInput, 'focus');

      renderHook(() => {
        const { setRef } = useAutoFocus<HTMLInputElement>({ enabled: true, delay: 100 });
        setRef(mockInput);
        return { setRef };
      });

      expect(focusSpy).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(focusSpy).toHaveBeenCalledTimes(1);
    });

    it('should clear timeout on unmount', () => {
      const mockInput = document.createElement('input');
      const focusSpy = jest.spyOn(mockInput, 'focus');

      const { unmount } = renderHook(() => {
        const { setRef } = useAutoFocus<HTMLInputElement>({ enabled: true, delay: 100 });
        setRef(mockInput);
        return { setRef };
      });

      unmount();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(focusSpy).not.toHaveBeenCalled();
    });
  });

  describe('selectOnFocus option', () => {
    it('should select text in input when selectOnFocus is true', () => {
      const mockInput = document.createElement('input');
      mockInput.value = 'test value';
      const focusSpy = jest.spyOn(mockInput, 'focus');
      const selectSpy = jest.spyOn(mockInput, 'select');

      renderHook(() => {
        const { setRef } = useAutoFocus<HTMLInputElement>({ enabled: true, selectOnFocus: true });
        setRef(mockInput);
        return { setRef };
      });

      expect(focusSpy).toHaveBeenCalledTimes(1);
      expect(selectSpy).toHaveBeenCalledTimes(1);
    });

    it('should select text in textarea when selectOnFocus is true', () => {
      const mockTextarea = document.createElement('textarea');
      mockTextarea.value = 'test value';
      const focusSpy = jest.spyOn(mockTextarea, 'focus');
      const selectSpy = jest.spyOn(mockTextarea, 'select');

      renderHook(() => {
        const { setRef } = useAutoFocus<HTMLTextAreaElement>({ enabled: true, selectOnFocus: true });
        setRef(mockTextarea);
        return { setRef };
      });

      expect(focusSpy).toHaveBeenCalledTimes(1);
      expect(selectSpy).toHaveBeenCalledTimes(1);
    });

    it('should not call select on non-input elements', () => {
      const mockDiv = document.createElement('div');
      const focusSpy = jest.spyOn(mockDiv, 'focus');

      renderHook(() => {
        const { setRef } = useAutoFocus<HTMLDivElement>({ enabled: true, selectOnFocus: true });
        setRef(mockDiv);
        return { setRef };
      });

      expect(focusSpy).toHaveBeenCalledTimes(1);
      // div doesn't have select method, so this should not throw
    });
  });

  describe('focus once behavior', () => {
    it('should only focus once even if enabled remains true', () => {
      const mockInput = document.createElement('input');
      const focusSpy = jest.spyOn(mockInput, 'focus');

      const { rerender } = renderHook(() => {
        const { setRef } = useAutoFocus<HTMLInputElement>({ enabled: true });
        setRef(mockInput);
        return { setRef };
      });

      expect(focusSpy).toHaveBeenCalledTimes(1);

      // Rerender with same props
      rerender();

      expect(focusSpy).toHaveBeenCalledTimes(1);
    });

    it('should reset and focus again when enabled goes false then true', () => {
      const mockInput = document.createElement('input');
      const focusSpy = jest.spyOn(mockInput, 'focus');

      const { rerender } = renderHook(
        ({ enabled }) => {
          const { setRef } = useAutoFocus<HTMLInputElement>({ enabled });
          setRef(mockInput);
          return { setRef };
        },
        { initialProps: { enabled: true } },
      );

      expect(focusSpy).toHaveBeenCalledTimes(1);

      // Disable
      rerender({ enabled: false });

      // Re-enable
      rerender({ enabled: true });

      expect(focusSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('default options', () => {
    it('should use default values when no options provided', () => {
      const mockInput = document.createElement('input');
      const focusSpy = jest.spyOn(mockInput, 'focus');

      renderHook(() => {
        const { setRef } = useAutoFocus<HTMLInputElement>();
        setRef(mockInput);
        return { setRef };
      });

      // enabled defaults to true, so should focus immediately
      expect(focusSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('ref stability', () => {
    it('should maintain stable setRef reference across rerenders', () => {
      const { result, rerender } = renderHook(() => useAutoFocus<HTMLInputElement>({ enabled: true }));

      const initialSetRef = result.current.setRef;

      rerender();

      expect(result.current.setRef).toBe(initialSetRef);
    });
  });
});
