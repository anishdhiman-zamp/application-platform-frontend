import type { ReactNode } from 'react';
import { cn } from '@zamp-platform/ui/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  outerClassName?: string;
}

const PageContainer = ({ children, className, outerClassName }: PageContainerProps) => (
  <div className={cn('h-full w-full overflow-auto', outerClassName)}>
    <div className={cn('mx-auto flex w-full max-w-200 flex-col px-12 pt-20 pb-12', className)}>{children}</div>
  </div>
);

export default PageContainer;
