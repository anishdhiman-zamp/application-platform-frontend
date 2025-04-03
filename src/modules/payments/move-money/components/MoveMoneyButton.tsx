import { useRef, useState } from 'react';
import { useOnClickOutside } from 'hooks';
import { MOVE_MONEY_ACTION_ITEMS } from 'modules/payments/payments.constant';
import Link from 'next/link';
import { SIZE_TYPES } from 'types/common/components';
import { cn } from 'utils/common';
import { Button } from 'components/common/button/Button';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

const MoveMoneyButton = () => {
  const moveMoneyActionMenuRef = useRef<HTMLDivElement>(null);
  const [isMoveMoneyActionMenuOpen, setIsMoveMoneyActionMenuOpen] = useState(false);

  useOnClickOutside(moveMoneyActionMenuRef, () => setIsMoveMoneyActionMenuOpen(false));

  return (
    <div ref={moveMoneyActionMenuRef} className='relative z-50'>
      <Button
        id='export-dataset'
        onClick={() => setIsMoveMoneyActionMenuOpen(!isMoveMoneyActionMenuOpen)}
        className='!px-3'
        iconProps={{
          id: 'chevron-down',
          className: cn(isMoveMoneyActionMenuOpen && 'rotate-180', 'transition-transform duration-200'),
          size: 14,
        }}
        size={SIZE_TYPES.XSMALL}
      >
        Move money
      </Button>
      {isMoveMoneyActionMenuOpen && (
        <div className='absolute top-full right-0 p-1 rounded-md border border-GRAY_500 bg-white mt-1 animate-opacity select-none'>
          {MOVE_MONEY_ACTION_ITEMS.map((item) => (
            <Link
              href={item.url}
              key={item.id}
              className='flex items-center gap-1.5 p-2.5 hover:bg-GRAY_100 rounded-md cursor-pointer'
            >
              <SvgSpriteLoader size={12} id={item?.icon?.id} />
              <div className='text-sm whitespace-nowrap'>{item?.label}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MoveMoneyButton;
