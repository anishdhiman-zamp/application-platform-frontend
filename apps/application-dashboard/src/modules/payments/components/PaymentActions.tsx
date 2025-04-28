import React, { useState } from 'react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { Plus, ShieldCheck } from 'lucide-react';
import CreatePolicyDialog from '@/modules/policies/create';

const PaymentActions = () => {
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 text-GRAY_900 focus-visible:ring-0 focus-visible:ring-offset-0 hover:text-GRAY_900 data-[state=open]:bg-GRAY_300'
          >
            <ShieldCheck className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='z-[1000]' sideOffset={5}>
          <DropdownMenuItem className='flex items-center justify-between'>
            <span>Template creation approval</span>
            <div className='flex items-center gap-2'>
              <Button variant='ghost' size='xxs' className='text-GRAY_600 hover:text-GRAY_900'>
                10 policies
              </Button>
              <Button variant='ghost' size='xxs' className=''>
                <Plus className='h-3 w-3' />
              </Button>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem className='flex items-center justify-between'>
            <span>Payout approval</span>
            <div className='flex items-center gap-2'>
              <Button variant='ghost' size='xxs' className='text-GRAY_600 hover:text-GRAY_900'>
                10 policies
              </Button>
              <Button variant='ghost' size='xxs' onClick={() => setIsPolicyDialogOpen(true)}>
                <Plus className='h-3 w-3' />
              </Button>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreatePolicyDialog isOpen={isPolicyDialogOpen} onOpenChange={setIsPolicyDialogOpen} />
    </>
  );
};

export default PaymentActions;
