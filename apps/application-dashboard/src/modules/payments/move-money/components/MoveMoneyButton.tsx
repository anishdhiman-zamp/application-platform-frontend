import { useState } from 'react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import DropdownToggle from 'modules/payments/move-money/components/DropdownToggle';
import { MOVE_MONEY_ACTION_ITEMS } from 'modules/payments/payments.constant';
import { useRouter } from 'next/router';
import type { MapAny } from '@/types/commonTypes';

const MoveMoneyButton = () => {
  const router = useRouter();

  const [isMoveMoneyActionMenuOpen, setIsMoveMoneyActionMenuOpen] = useState(false);

  return (
    <DropdownMenu onOpenChange={setIsMoveMoneyActionMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          className='focus-visible:outline-none !ring-0 !ring-offset-0 select-none flex items-center gap-1'
          size='small'
        >
          Move Money
          <DropdownToggle isShowMenu={isMoveMoneyActionMenuOpen} setIsShowMenu={setIsMoveMoneyActionMenuOpen} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='z-[9999] !min-w-[180px]  max-h-[300px] overflow-y-auto'
        sideOffset={5}
      >
        {MOVE_MONEY_ACTION_ITEMS.map((item: MapAny) => (
          <DropdownMenuItem
            onClick={() => {
              router.push(item?.url);
            }}
            key={item?.value}
            className='cursor-default hover:!bg-GRAY_50 text-GRAY_1000 f-12-500 rounded px-2.5 py-2'
          >
            <div className='flex items-center gap-1.5 w-full cursor-pointer f-12-500'>
              <SvgSpriteLoader id={item?.icon?.id} size={12} />
              <div>{item?.label}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MoveMoneyButton;
