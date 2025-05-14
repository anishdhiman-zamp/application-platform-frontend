import { useState } from 'react';
import { Popover, PopoverContent, PopoverMenuItem, PopoverTrigger } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { Ellipsis } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PolicyDetailsType } from '@/types/api/paymentApi.types';

const PolicyActionsDropdown = ({ policy }: { policy: PolicyDetailsType }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        asChild
        className='focus-visible:ring-0 focus-visible:ring-offset-0'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='cursor-pointer px-1'>
          <Ellipsis size={14} />
        </div>
      </PopoverTrigger>
      <PopoverContent className='z-[1001] max-h-60 overflow-y-auto' align='end'>
        <PopoverMenuItem
          className='hover:bg-gray-100 rounded-md flex gap-1.5 text-primary flex-1 f-12-500 items-center'
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
            router.push(`/payments/policies/create/${policy.id}`);
          }}
        >
          <SvgSpriteLoader id='edit-03' size={12} />
          <span>Edit</span>
        </PopoverMenuItem>
        <PopoverMenuItem
          className='hover:bg-gray-100 rounded-md flex gap-1.5 text-red-800 flex-1 f-12-500 items-center'
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
            router.push(`/payments/policies/delete/${policy.id}`);
          }}
        >
          <SvgSpriteLoader id='trash-03' size={12} />
          <span>Delete</span>
        </PopoverMenuItem>
      </PopoverContent>
    </Popover>
  );
};

export default PolicyActionsDropdown;
