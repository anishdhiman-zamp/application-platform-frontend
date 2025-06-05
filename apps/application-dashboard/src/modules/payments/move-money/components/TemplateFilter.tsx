import { FC, useRef, useState } from 'react';
import { useOnClickOutside } from 'hooks';
import DropdownToggle from 'modules/payments/move-money/components/DropdownToggle';
import { MOVE_MONEY_TEMPLATE_FILTER_ITEMS } from 'modules/payments/payments.constant';
import { cn } from 'utils/common';
import { MenuItem } from '@/types/common/components';

type TemplateFilterProps = {
  selectedFilter: MenuItem;
  setSelectedFilter: (filter: MenuItem) => void;
};

const TemplateFilter: FC<TemplateFilterProps> = ({ selectedFilter, setSelectedFilter }) => {
  const moveMoneyActionMenuRef = useRef<HTMLDivElement>(null);
  const [isMoveMoneyActionMenuOpen, setIsMoveMoneyActionMenuOpen] = useState(false);

  useOnClickOutside(moveMoneyActionMenuRef, () => setIsMoveMoneyActionMenuOpen(false));

  const handleFilterClick = (item: any) => {
    setSelectedFilter(item);
    setIsMoveMoneyActionMenuOpen(false);
  };

  return (
    <div ref={moveMoneyActionMenuRef} className='relative z-50 flex items-center'>
      <div
        onClick={() => setIsMoveMoneyActionMenuOpen(!isMoveMoneyActionMenuOpen)}
        className='f-12-400 flex cursor-pointer items-center gap-1.5'
      >
        {selectedFilter?.label}
        <DropdownToggle
          isShowMenu={isMoveMoneyActionMenuOpen}
          setIsShowMenu={() => setIsMoveMoneyActionMenuOpen(!isMoveMoneyActionMenuOpen)}
        />
      </div>
      {isMoveMoneyActionMenuOpen && (
        <div className='border-GRAY_500 animate-opacity absolute top-full right-0 mt-1 min-w-[165px] rounded-md border bg-white p-1 select-none'>
          {MOVE_MONEY_TEMPLATE_FILTER_ITEMS.map((item) => (
            <div
              key={item.value}
              onClick={() => handleFilterClick(item)}
              className={cn(
                'hover:bg-GRAY_100 f-12-500 cursor-pointer rounded-md px-2.5 py-2',
                selectedFilter?.value === item.value ? 'text-GRAY_1000 bg-GRAY_100' : 'text-GRAY_900',
              )}
            >
              <div className='text-sm whitespace-nowrap'>{item?.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateFilter;
