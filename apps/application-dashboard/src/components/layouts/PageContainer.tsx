import type { ReactNode } from 'react';
import { cn } from '@zamp-platform/ui/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

const PageContainer = ({ children, className }: PageContainerProps) => (
  <div className='h-full w-full overflow-auto'>
    <div className={cn('mx-auto flex w-full max-w-200 flex-col px-12 pt-20 pb-12', className)}>{children}</div>
  </div>
);

export default PageContainer;
