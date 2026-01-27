'use client';

import { Slot } from '@radix-ui/react-slot';
import { cn } from '@zamp-platform/ui/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import {
  ButtonHTMLAttributes,
  MouseEvent,
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

const buttonVariants = cva(
  'cursor-pointer  inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 ',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-secondary hover:bg-primary/90 active:bg-GRAY_950 disabled:bg-GRAY_100 disabled:text-GRAY_700 disabled:cursor-not-allowed ',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 ',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:bg-GRAY_100 disabled:text-GRAY_700 disabled:cursor-not-allowed',
        secondary:
          'bg-transparent text-primary border border-gray-400 hover:bg-secondary/80 disabled:bg-GRAY_100 disabled:text-GRAY_700 disabled:!cursor-not-allowed',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        'destructive-outline':
          'border bg-background border-red-700 text-red-700 hover:border-red-800 hover:text-red-800',
      },
      size: {
        default: 'h-10 py-3 px-4 f-14-500',
        large: 'h-10 py-3 px-4 f-14-500',
        medium: 'h-8 px-2 py-2 f-13-500',
        small: 'h-7 px-3 f-12-500',
        xsmall: 'h-[26px] rounded-md px-2.5 py-1.5 f-11-500',
        xxsmall: 'h-5 rounded-sm px-0.5 py-1 f-11-500',
        icon: 'h-10 w-10',
        xlarge: 'h-14 py-4 px-6 gap-1.5 f-16-400',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const ICON_SIZE_MAP = {
  xlarge: 22,
  large: 16,
  default: 16,
  medium: 16,
  small: 14,
  xsmall: 12,
  xxsmall: 12,
  icon: 16,
} as const;

type IconSize = keyof typeof ICON_SIZE_MAP;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  ref?: RefObject<HTMLButtonElement | null>;
  /** Custom leading icon (left side) */
  leadingIcon?: ReactNode;
  /** Custom trailing icon (right side) */
  trailingIcon?: ReactNode;
  /** Debounce click handler in milliseconds. Set to 0 to disable. */
  debounceMs?: number;
  /** Custom loader component */
  loader?: ReactNode;
  /** Button ID for data-testid attribute (will be prefixed with "btn-") */
  testId?: string;
}

/* eslint-disable no-unused-vars */
function useDebounce<T extends (...args: any[]) => void>(callback: T, delay: number): (...args: Parameters<T>) => void {
  /* eslint-enable no-unused-vars */
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (delay === 0) {
        callbackRef.current(...args);
        return;
      }

      if (!timeoutRef.current) {
        callbackRef.current(...args);
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
      }, delay);
    },
    [delay],
  );
}

const ButtonIcon = ({ icon, size }: { icon: ReactNode; size: number }) => {
  return (
    <span className='inline-flex shrink-0' style={{ width: size, height: size }}>
      {icon}
    </span>
  );
};

function Button({
  ref,
  className,
  variant,
  size,
  asChild = false,
  isLoading = false,
  children,
  leadingIcon,
  trailingIcon,
  debounceMs = 0,
  loader,
  onClick,
  disabled,
  testId,
  style,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  const internalRef = useRef<HTMLButtonElement>(null);
  const buttonRef = ref ?? internalRef;
  const [minWidth, setMinWidth] = useState<number | undefined>(undefined);

  const iconSize = ICON_SIZE_MAP[(size as IconSize) ?? 'default'];

  const debouncedClick = useDebounce((e: MouseEvent<HTMLButtonElement>) => {
    if (!isLoading && !disabled) {
      onClick?.(e);
    }
  }, debounceMs);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (debounceMs > 0) {
      debouncedClick(e);
    } else if (!isLoading && !disabled) {
      onClick?.(e);
    }
  };

  // Capture button width on mount and when children change (but not during loading)
  useLayoutEffect(() => {
    if (buttonRef && 'current' in buttonRef && buttonRef.current && !isLoading) {
      const width = buttonRef.current.offsetWidth;
      if (width > 0) {
        setMinWidth(width);
      }
    }
  }, [children, leadingIcon, trailingIcon, size, buttonRef, isLoading]);

  const renderContent = () => {
    if (isLoading) {
      if (loader) {
        return loader;
      }
      return (
        <div className='flex w-full items-center justify-center'>
          <Loader2 className='animate-spin' style={{ width: iconSize, height: iconSize }} />
        </div>
      );
    }

    return (
      <>
        {leadingIcon && <ButtonIcon icon={leadingIcon} size={iconSize} />}
        {children && <>{children}</>}
        {trailingIcon && <ButtonIcon icon={trailingIcon} size={iconSize} />}
      </>
    );
  };

  return (
    <Comp
      ref={buttonRef}
      className={cn(
        buttonVariants({ variant, size, className }),
        isLoading && '!bg-primary/90 cursor-not-allowed',
        (leadingIcon || trailingIcon) && 'gap-1.5',
      )}
      style={{ minWidth: minWidth ? `${minWidth}px` : undefined, ...style }}
      disabled={disabled || isLoading}
      onClick={handleClick}
      data-testid={testId ? `btn-${testId}` : undefined}
      {...props}
    >
      {renderContent()}
    </Comp>
  );
}

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;
export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>;

export { Button, buttonVariants };
