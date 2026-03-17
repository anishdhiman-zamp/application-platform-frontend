'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@zamp-platform/ui/utils';

export function CopyToClipboard({
  text,
  tooltipText = 'Click to copy',
  children,
}: {
  text: string;
  tooltipText?: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [label, setLabel] = React.useState(tooltipText);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  const triggerRef = React.useRef<HTMLSpanElement>(null);
  const isCopyingRef = React.useRef(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const labelTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (labelTimeoutRef.current) {
        clearTimeout(labelTimeoutRef.current);
      }
    };
  }, []);

  const openTooltip = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    setPosition({
      top: rect.top - 8,
      left: rect.left + rect.width / 2,
    });

    setMounted(true);
    setVisible(false);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setVisible(true);
      });
    });
  };

  const closeTooltip = () => {
    if (!isCopyingRef.current) {
      setVisible(false);
      setTimeout(() => setMounted(false), 200);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(text);

    isCopyingRef.current = true;
    setLabel('Copied!');

    openTooltip();

    timeoutRef.current = setTimeout(() => {
      isCopyingRef.current = false;
      setVisible(false);

      // Reset label AFTER tooltip is hidden
      labelTimeoutRef.current = setTimeout(() => {
        setLabel(tooltipText);
        setMounted(false);
      }, 200);
    }, 1000);
  };

  return (
    <>
      <span
        ref={triggerRef}
        className='inline-flex cursor-pointer'
        onMouseEnter={() => !isCopyingRef.current && openTooltip()}
        onMouseLeave={closeTooltip}
        onClick={copy}
        aria-label='Copy to clipboard'
      >
        {children}
      </span>

      {mounted &&
        createPortal(
          <span
            role='tooltip'
            style={{
              position: 'fixed',
              top: position.top,
              left: position.left,
              transform: 'translate(-50%, -100%)',
            }}
            className={cn(
              'pointer-events-none z-[9999] overflow-hidden rounded-md px-3 py-1.5 text-xs',
              'bg-GRAY_1000 text-BG_WHITE',
              'transition-all duration-200 ease-out',
              visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-1 scale-95 opacity-0',
            )}
          >
            {label}
          </span>,
          document.body,
        )}
    </>
  );
}
