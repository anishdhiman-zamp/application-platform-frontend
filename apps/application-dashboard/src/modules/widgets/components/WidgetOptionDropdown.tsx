import { RefObject } from 'react';
import { OptionsType } from 'types/commonTypes';
import { cn } from 'utils/common';
interface DropdownProps {
  options: OptionsType[];
  onSelect: (widgetId: string) => void;
  activeWidget: string;
  className?: string;
  dropdownRef: RefObject<HTMLDivElement>;
}

export const WidgetOptionDropdown = ({ options, onSelect, activeWidget, className, dropdownRef }: DropdownProps) => {
  return (
    <div
      ref={dropdownRef}
      className={cn(
        'border-GRAY_400 shadow-table-filter-menu absolute z-40 flex max-h-[330px] w-[200px] flex-col gap-2 rounded-md border bg-white pb-1 pt-2',
        className,
      )}
    >
      <div className='custom-scroll-bar-common flex h-full select-none flex-col overflow-y-auto px-1'>
        {options.map((option) => (
          <div
            key={option.value}
            onClick={() => onSelect(option.value as string)}
            className={cn('hover:bg-GRAY_100 cursor-pointer select-none rounded px-2.5 py-2', {
              'bg-GRAY_100': activeWidget === option.value,
            })}
          >
            <div className='f-12-400 text-GRAY_1000'>{option.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
