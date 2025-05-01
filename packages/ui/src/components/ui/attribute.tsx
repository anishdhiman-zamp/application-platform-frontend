import * as React from 'react';

interface AttributeProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  displayValue: string | React.ReactNode;
}

export const Attribute = ({ label, displayValue, ...props }: AttributeProps) => {
  return (
    <button
      {...props}
      className='inline-flex items-center gap-1.5 rounded-md border border-GRAY_400 px-2 py-1 hover:bg-BG_GRAY_2 active:bg-BG_GRAY_2'
    >
      <span className='text-secondary-400 f-12-400 whitespace-nowrap'>{label}</span>
      <span className='text-black f-12-500 whitespace-nowrap'>{displayValue}</span>
    </button>
  );
};
