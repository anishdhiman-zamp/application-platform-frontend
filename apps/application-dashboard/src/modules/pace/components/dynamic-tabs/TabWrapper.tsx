import { memo } from 'react';
import { cn } from '@zamp-platform/ui/utils';

interface TabWrapperProps {
  isActive: boolean;
  children: React.ReactNode;
}

const TabWrapper = memo(({ isActive, children }: TabWrapperProps) => (
  <div
    className={cn(
      'absolute inset-0',
      isActive ? 'pointer-events-auto visible z-1' : 'pointer-events-none invisible z-0',
    )}
  >
    {children}
  </div>
));

TabWrapper.displayName = 'TabWrapper';

export default TabWrapper;
