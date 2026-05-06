import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@zamp-platform/ui/utils';

interface PageTopbarProps {
  title: ReactNode;
  action?: ReactNode;
  leading?: ReactNode;
  titleTrailingAction?: ReactNode;
  className?: string;
  titleClassName?: string;
  style?: CSSProperties;
}

const PageTopbar = ({
  title,
  action,
  leading,
  titleTrailingAction,
  className,
  titleClassName,
  style,
}: PageTopbarProps) => (
  <div
    className={cn(
      'bg-BG_WHITE border-GRAY_400 flex h-[54px] shrink-0 items-center justify-between gap-x-3 border-b px-3',
      className,
    )}
    style={style}
  >
    <div className='flex min-w-0 flex-1 items-center gap-x-1'>
      {leading}
      <span className={cn('relative block min-w-0 overflow-hidden pr-1', leading && 'pl-1')}>
        {typeof title === 'string' ? (
          <span className={cn('f-14-550 text-GRAY_1000 block truncate first-letter:uppercase', titleClassName)}>
            {title}
          </span>
        ) : (
          title
        )}
      </span>
      {titleTrailingAction}
    </div>
    {action && <div className='flex shrink-0 items-center gap-1.5'>{action}</div>}
  </div>
);

export default PageTopbar;
