import { ReactNode } from 'react';
import { Button, Skeleton } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { defaultFnType } from '@/types/commonTypes';

type SettingsRowProps = {
  label: string;
  value?: string;
  className?: string;
  actionNode?: ReactNode;
  action?: {
    text: string;
    onClick?: defaultFnType;
    variant?: 'outline' | 'destructive' | 'destructive-outline';
    className?: string;
  };
};

export const SettingsRow = ({ label, value, action, actionNode, className }: SettingsRowProps) => (
  <div className={cn('border-GRAY_400 flex items-center justify-between gap-4 border-b px-6 py-4', className)}>
    <div className='flex min-w-0 flex-col gap-3'>
      <span className='f-12-400 text-GRAY_700'>{label}</span>
      {value ? (
        <span className='f-12-500 text-GRAY_1000 wrap-break-word'>{value}</span>
      ) : (
        <Skeleton className='h-3.5 w-40' />
      )}
    </div>
    <div className='shrink-0'>
      {actionNode ??
        (action && (
          <Button
            variant={action.variant ?? 'outline'}
            size='small'
            onClick={action.onClick}
            className={action.className}
          >
            {action.text}
          </Button>
        ))}
    </div>
  </div>
);
