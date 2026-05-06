'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { NO_ANIMATION } from '@/modules/pace/pace.animations';
import { SIDEBAR_TOGGLE_TRANSITION } from '@/utils/animations/sidebar.animations';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@/utils/localstorage';

interface PageSidePanelProps {
  open: boolean;
  title?: string;
  ariaLabel?: string;
  header?: ReactNode;
  children: ReactNode;
  onClose: () => void;
  resizable?: boolean;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  widthStorageId?: string;
  className?: string;
  contentClassName?: string;
}

const DEFAULT_PANEL_WIDTH = 800;
const PANEL_MIN_WIDTH = 360;
const PANEL_MAX_WIDTH = 1200;
const PANEL_VIEWPORT_GUTTER = 56;
const RESIZE_STEP = 24;
const RESIZE_LARGE_STEP = 80;
const DEFAULT_WIDTH_STORAGE_ID = 'default';

const getEffectiveMaxWidth = (maxWidth: number) => {
  if (typeof window === 'undefined') return maxWidth;

  return Math.min(maxWidth, Math.max(0, window.innerWidth - PANEL_VIEWPORT_GUTTER));
};

const clampPanelWidth = (width: number, minWidth: number, maxWidth: number) => {
  const effectiveMax = getEffectiveMaxWidth(maxWidth);
  const effectiveMin = Math.min(minWidth, effectiveMax);

  return Math.min(effectiveMax, Math.max(effectiveMin, width));
};

const parseStoredPanelWidths = (): Record<string, number> => {
  try {
    const stored = getFromLocalStorage(LOCAL_STORAGE_KEYS.PACE_PAGE_SIDE_PANEL_WIDTHS);

    if (!stored) return {};

    const parsed = JSON.parse(stored) as Record<string, unknown>;

    if (!parsed || typeof parsed !== 'object') return {};

    return Object.entries(parsed).reduce<Record<string, number>>((result, [key, value]) => {
      const width = Number(value);

      if (Number.isFinite(width) && width > 0) {
        result[key] = width;
      }

      return result;
    }, {});
  } catch {
    return {};
  }
};

const getStoredPanelWidth = (widthStorageId: string) => {
  const storedWidths = parseStoredPanelWidths();

  if (storedWidths[widthStorageId]) return storedWidths[widthStorageId];

  if (widthStorageId === DEFAULT_WIDTH_STORAGE_ID) {
    const legacyWidth = Number(getFromLocalStorage(LOCAL_STORAGE_KEYS.PACE_PAGE_SIDE_PANEL_WIDTH));

    return Number.isFinite(legacyWidth) && legacyWidth > 0 ? legacyWidth : null;
  }

  return null;
};

const setStoredPanelWidth = (widthStorageId: string, width: number) => {
  const storedWidths = parseStoredPanelWidths();

  setToLocalStorage(
    LOCAL_STORAGE_KEYS.PACE_PAGE_SIDE_PANEL_WIDTHS,
    JSON.stringify({
      ...storedWidths,
      [widthStorageId]: Math.round(width),
    }),
  );
};

const getInitialPanelWidth = (defaultWidth: number, minWidth: number, maxWidth: number, widthStorageId: string) => {
  const storedWidth = getStoredPanelWidth(widthStorageId);
  const initialWidth = storedWidth ?? defaultWidth;

  return clampPanelWidth(initialWidth, minWidth, maxWidth);
};

const PageSidePanel = ({
  open,
  title,
  ariaLabel,
  header,
  children,
  onClose,
  resizable = true,
  defaultWidth = DEFAULT_PANEL_WIDTH,
  minWidth = PANEL_MIN_WIDTH,
  maxWidth = PANEL_MAX_WIDTH,
  widthStorageId = DEFAULT_WIDTH_STORAGE_ID,
  className,
  contentClassName,
}: PageSidePanelProps) => {
  const shouldReduceMotion = useReducedMotion();
  const transition = shouldReduceMotion ? NO_ANIMATION : SIDEBAR_TOGGLE_TRANSITION;
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(defaultWidth);
  const effectiveMaxWidthRef = useRef(getEffectiveMaxWidth(maxWidth));
  const [panelWidth, setPanelWidth] = useState(() =>
    getInitialPanelWidth(defaultWidth, minWidth, maxWidth, widthStorageId),
  );
  const [isResizing, setIsResizing] = useState(false);

  const setClampedPanelWidth = useCallback(
    (width: number) => {
      const clamped = clampPanelWidth(width, minWidth, maxWidth);

      setPanelWidth(clamped);

      return clamped;
    },
    [maxWidth, minWidth],
  );

  const persistPanelWidth = useCallback(
    (width: number) => {
      setStoredPanelWidth(widthStorageId, width);
    },
    [widthStorageId],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!resizable) return;

      event.preventDefault();
      dragStartXRef.current = event.clientX;
      dragStartWidthRef.current = panelWidth;
      effectiveMaxWidthRef.current = getEffectiveMaxWidth(maxWidth);
      setIsResizing(true);
    },
    [maxWidth, panelWidth, resizable],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!resizable) return;

      const step = event.shiftKey ? RESIZE_LARGE_STEP : RESIZE_STEP;
      let nextWidth: number | null = null;

      if (event.key === 'ArrowLeft') {
        nextWidth = panelWidth + step;
      } else if (event.key === 'ArrowRight') {
        nextWidth = panelWidth - step;
      } else if (event.key === 'Home') {
        nextWidth = minWidth;
      } else if (event.key === 'End') {
        nextWidth = maxWidth;
      }

      if (nextWidth === null) return;

      event.preventDefault();
      const clamped = setClampedPanelWidth(nextWidth);

      persistPanelWidth(clamped);
    },
    [maxWidth, minWidth, panelWidth, persistPanelWidth, resizable, setClampedPanelWidth],
  );

  useEffect(() => {
    if (!isResizing) return;

    const handlePointerMove = (event: PointerEvent) => {
      const delta = event.clientX - dragStartXRef.current;
      const nextWidth = Math.min(
        effectiveMaxWidthRef.current,
        Math.max(Math.min(minWidth, effectiveMaxWidthRef.current), dragStartWidthRef.current - delta),
      );

      setPanelWidth(nextWidth);
    };

    const handlePointerUp = (event: PointerEvent) => {
      const delta = event.clientX - dragStartXRef.current;
      const finalWidth = Math.min(
        effectiveMaxWidthRef.current,
        Math.max(Math.min(minWidth, effectiveMaxWidthRef.current), dragStartWidthRef.current - delta),
      );

      setPanelWidth(finalWidth);
      persistPanelWidth(finalWidth);
      setIsResizing(false);
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isResizing, minWidth, persistPanelWidth]);

  useEffect(() => {
    if (!open) {
      setIsResizing(false);

      return;
    }

    const handleWindowResize = () => {
      setPanelWidth((currentWidth) => clampPanelWidth(currentWidth, minWidth, maxWidth));
    };

    handleWindowResize();
    window.addEventListener('resize', handleWindowResize);

    return () => window.removeEventListener('resize', handleWindowResize);
  }, [maxWidth, minWidth, open]);

  const effectiveMaxWidth = getEffectiveMaxWidth(maxWidth);

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside
          role='dialog'
          aria-modal='false'
          aria-label={ariaLabel ?? title ?? 'Details'}
          initial={shouldReduceMotion ? false : { transform: 'translateX(100%)', opacity: 0 }}
          animate={{ transform: 'translateX(0%)', opacity: 1 }}
          exit={{ transform: 'translateX(100%)', opacity: 0, transition }}
          transition={transition}
          style={{
            width: panelWidth,
            maxWidth: `calc(100% - ${PANEL_VIEWPORT_GUTTER}px)`,
            willChange: 'transform, opacity',
          }}
          className={cn(
            'border-GRAY_400 bg-BG_WHITE shadow-side-drawer-inner-left absolute inset-y-0 right-0 z-20 flex min-h-0 max-w-full flex-col overflow-hidden border-l',
            className,
          )}
        >
          {isResizing && <div className='absolute inset-0 z-[9] cursor-col-resize' />}
          {resizable && (
            <div
              role='separator'
              aria-label='Resize details panel'
              aria-orientation='vertical'
              aria-valuemin={Math.min(minWidth, effectiveMaxWidth)}
              aria-valuemax={effectiveMaxWidth}
              aria-valuenow={Math.round(panelWidth)}
              tabIndex={0}
              onPointerDown={handlePointerDown}
              onKeyDown={handleKeyDown}
              className='group absolute inset-y-0 left-0 z-10 -ml-1.5 flex w-3 cursor-col-resize touch-none items-center justify-center select-none focus-visible:outline-none'
            >
              <div
                className={cn(
                  'h-12 w-0.5 rounded-full transition-[height,background-color] duration-150',
                  isResizing
                    ? 'bg-GRAY_500 h-16'
                    : 'group-hover:bg-GRAY_400 group-focus-visible:bg-GRAY_500 bg-transparent',
                )}
              />
            </div>
          )}
          {header ?? (
            <div className='border-GRAY_300 flex h-[54px] shrink-0 items-center justify-between gap-4 border-b px-4'>
              <h2 className='text-GRAY_1000 f-14-500 min-w-0 truncate'>{title ?? 'Details'}</h2>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={onClose}
                aria-label='Close panel'
                className='text-GRAY_1000 hover:bg-GRAY_100 size-8 shrink-0 rounded-md'
              >
                <X size={16} />
              </Button>
            </div>
          )}
          <div className={cn('min-h-0 flex-1 overflow-hidden', contentClassName)}>{children}</div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default PageSidePanel;
