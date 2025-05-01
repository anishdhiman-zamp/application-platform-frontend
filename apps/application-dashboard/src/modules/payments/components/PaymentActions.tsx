import React, { useEffect, useState } from 'react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { Plus, ShieldCheck } from 'lucide-react';
import PoliciesListSideDrawer from 'modules/payments/components/PoliciesListSideDrawer';
import { useGetPaymentConfigQuery, useLazyGetPoliciesQuery } from '@/apis/payments';
import { toast } from '@/components/common/toast/Toast';
import { TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import CreatePolicyDialog from '@/modules/policies/create';
import { PolicyActionType, PolicyDialogType } from '@/modules/policies/types';
import { ResourceType } from '@/modules/shareResource';
import { PolicyDetailsType } from '@/types/api/paymentApi.types';

const PaymentActions = () => {
  const { data: paymentConfig } = useGetPaymentConfigQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const [getPolicies] = useLazyGetPoliciesQuery();
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState<boolean>(false);
  const [policyType, setPolicyType] = useState<PolicyDialogType>('template');
  const [policies, setPolicies] = useState<PolicyDetailsType[]>([]);
  const [sideDrawerConfig, setSideDrawerConfig] = useState<{
    type: PolicyDialogType;
    policies: PolicyDetailsType[];
  }>();

  const handlePolicyDialogOpenChange = (type: PolicyDialogType) => {
    setIsPolicyDialogOpen(true);
    setPolicyType(type);
  };

  const handlePolicyListClose = () => {
    setSideDrawerConfig(undefined);
  };

  useEffect(() => {
    if (paymentConfig) {
      getPolicies({ resource_id: paymentConfig?.id, resource_type: ResourceType.PAYMENTS })
        .unwrap()
        .then((res) => {
          setPolicies(res?.data);
        })
        .catch(() => {
          toast.error(TOAST_MESSAGES.ERROR_FETCHING_POLICIES);
        });
    }
  }, [paymentConfig, getPolicies]);

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
              <Button
                variant='ghost'
                size='xxsmall'
                className='text-GRAY_600 hover:text-GRAY_900'
                onClick={() =>
                  setSideDrawerConfig({
                    type: 'template',
                    policies: policies?.filter((policy) => policy.action_type === PolicyActionType.CREATE_TEMPLATE),
                  })
                }
                disabled={
                  policies?.filter((policy) => policy.action_type === PolicyActionType.CREATE_TEMPLATE).length === 0
                }
              >
                {policies?.filter((policy) => policy.action_type === PolicyActionType.CREATE_TEMPLATE).length} policies
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
              <Button
                variant='ghost'
                size='xxsmall'
                className='text-GRAY_600 hover:text-GRAY_900'
                disabled={
                  policies?.filter((policy) => policy.action_type === PolicyActionType.CREATE_PAYMENT).length === 0
                }
                onClick={() =>
                  setSideDrawerConfig({
                    type: 'payout',
                    policies: policies?.filter((policy) => policy.action_type === PolicyActionType.CREATE_PAYMENT),
                  })
                }
              >
                {policies?.filter((policy) => policy.action_type === PolicyActionType.CREATE_PAYMENT).length} policies
              </Button>
              <Button variant='ghost' size='xxsmall' onClick={() => handlePolicyDialogOpenChange('payout')}>
                <Plus className='h-3 w-3' />
              </Button>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreatePolicyDialog type={policyType} isOpen={isPolicyDialogOpen} onOpenChange={setIsPolicyDialogOpen} />
      {sideDrawerConfig && (
        <PoliciesListSideDrawer
          isOpen={!!sideDrawerConfig}
          onClose={handlePolicyListClose}
          policies={sideDrawerConfig.policies}
          type={sideDrawerConfig.type}
          handlePolicyDialogOpenChange={handlePolicyDialogOpenChange}
        />
      )}
    </>
  );
};

export default PaymentActions;
