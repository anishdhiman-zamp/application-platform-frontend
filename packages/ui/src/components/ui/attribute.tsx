import { cn } from '@zamp-platform/ui/utils';
import * as React from 'react';

interface AttributeProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  displayValue: string | React.ReactNode;
  dataContextId?: string;
}

export const Attribute = ({ label, displayValue, dataContextId, ...props }: AttributeProps) => {
  return (
    <button
      data-context-id={dataContextId}
      {...props}
      className={cn(
        'border-GRAY_400 hover:bg-BG_GRAY_2 active:bg-BG_GRAY_2 inline-flex items-center gap-1.5 rounded-md border px-2 py-1',
        props.className,
      )}
    >
      <span className='text-BG_WHITE f-12-400 whitespace-nowrap'>{label}</span>
      <span className='f-12-500 whitespace-nowrap text-black'>{displayValue}</span>
    </button>
  );
};
