import { cn } from '@zamp-platform/ui/utils';
import * as React from 'react';
import { Textarea } from './textarea';

interface AutoSizeTextareaProps extends React.ComponentProps<typeof Textarea> {
  minRows?: number;
  maxHeight?: number | string; // accepts px or % or rem etc.
}

export const AutoSizeTextarea = React.forwardRef<HTMLTextAreaElement, AutoSizeTextareaProps>(
  ({ className, minRows = 1, maxHeight, style, ...props }, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null);
    const combinedRef = React.useMemo(() => {
      if (typeof ref === 'function') {
        return (node: HTMLTextAreaElement | null) => {
          ref(node);
          (internalRef as React.RefObject<HTMLTextAreaElement | null>).current = node;
        };
      }
      return ref || internalRef;
    }, [ref]);

    const resize = React.useCallback(() => {
      const textarea = (combinedRef as React.RefObject<HTMLTextAreaElement>)?.current;
      if (textarea) {
        textarea.style.height = 'auto';
        const lineHeight =
          typeof window !== 'undefined' ? parseInt(window.getComputedStyle(textarea).lineHeight || '20', 10) : 20;
        const padding = textarea.offsetHeight - textarea.clientHeight;
        const minHeight = minRows * lineHeight + padding;

        textarea.style.height = `${Math.max(textarea.scrollHeight, minHeight)}px`;

        if (maxHeight) {
          const maxPx = typeof maxHeight === 'number' ? maxHeight : parseInt(maxHeight.toString(), 10);
          if (textarea.scrollHeight > maxPx) {
            textarea.style.height = `${maxPx}px`;
            textarea.style.overflowY = 'auto';
          } else {
            textarea.style.overflowY = 'hidden';
          }
        }
      }
    }, [combinedRef, minRows, maxHeight]);

    React.useEffect(() => {
      resize();
    }, [props.value, resize]);

    return (
      <Textarea
        {...props}
        ref={combinedRef}
        onInput={(e) => {
          resize();
          props.onInput?.(e);
        }}
        className={cn('resize-none', className)}
        style={{
          overflow: 'hidden',
          maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
          ...style,
        }}
        rows={minRows}
      />
    );
  },
);

AutoSizeTextarea.displayName = 'AutoSizeTextarea';
