import type { ReactNode } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import PageContainer from '@/components/layouts/PageContainer';
import PageTopbar from '@/components/layouts/PageTopbar';

interface PageWithTopbarProps {
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  scrollClassName?: string;
  leading?: ReactNode;
  titleTrailingAction?: ReactNode;
}

const PageWithTopbar = ({
  title,
  action,
  children,
  className,
  contentClassName,
  scrollClassName,
  leading,
  titleTrailingAction,
}: PageWithTopbarProps) => (
  <div className={cn('bg-BG_WHITE flex h-full min-h-0 w-full flex-col overflow-hidden', className)}>
    <PageTopbar title={title} action={action} leading={leading} titleTrailingAction={titleTrailingAction} />
    <PageContainer
      outerClassName={cn('h-auto min-h-0 flex-1', scrollClassName)}
      className={cn('pt-8', contentClassName)}
    >
      {children}
    </PageContainer>
  </div>
);

export default PageWithTopbar;
