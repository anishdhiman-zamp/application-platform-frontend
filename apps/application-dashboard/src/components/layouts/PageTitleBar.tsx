import type { ReactNode } from 'react';
import { cn } from '@zamp-platform/ui/utils';

interface PageTitleBarProps {
  title: string;
  action?: ReactNode;
  className?: string;
}

const PageTitleBar = ({ title, action, className }: PageTitleBarProps) => (
  <div className={cn('mb-4 flex shrink-0 items-center justify-between gap-3', className)}>
    <h1 className='text-GRAY_1000 f-20-500 min-w-0 truncate'>{title}</h1>
    {action && <div className='shrink-0'>{action}</div>}
  </div>
);

export default PageTitleBar;
