import React, { useState } from 'react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { Plus, ShieldCheck } from 'lucide-react';
import CreatePolicyDialog from '@/modules/policies/create';
import { PolicyDialogType } from '@/modules/policies/types';

const PaymentActions = () => {
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState<boolean>(false);
  const [policyType, setPolicyType] = useState<PolicyDialogType>('template');

  const handlePolicyDialogOpenChange = (type: PolicyDialogType) => {
    setIsPolicyDialogOpen(true);
    setPolicyType(type);
  };

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
              <Button variant='ghost' size='xxsmall' className='text-GRAY_600 hover:text-GRAY_900'>
                10 policies
              </Button>
              <Button
                variant='ghost'
                size='xxsmall'
                className=''
                onClick={() => handlePolicyDialogOpenChange('template')}
              >
                <Plus className='h-3 w-3' />
              </Button>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem className='flex items-center justify-between'>
            <span>Payout approval</span>
            <div className='flex items-center gap-2'>
              <Button variant='ghost' size='xxsmall' className='text-GRAY_600 hover:text-GRAY_900'>
                10 policies
              </Button>
              <Button variant='ghost' size='xxsmall' onClick={() => handlePolicyDialogOpenChange('payout')}>
                <Plus className='h-3 w-3' />
              </Button>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreatePolicyDialog type={policyType} isOpen={isPolicyDialogOpen} onOpenChange={setIsPolicyDialogOpen} />
    </>
  );
};

export default PaymentActions;
