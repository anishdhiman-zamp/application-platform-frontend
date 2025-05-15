import { cn } from '@zamp-platform/ui/lib/utils';

const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('animate-pulse rounded-md bg-gray-100', className)} {...props} />;
};

export { Skeleton };
